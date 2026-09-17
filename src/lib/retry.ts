/**
 * Auto-retry with exponential backoff + circuit breaker.
 *
 * Usage:
 *   import { withRetry } from "@/lib/retry";
 *   const result = await withRetry(() => fetchExternalAPI(), {
 *     maxRetries: 3,
 *     baseDelay: 1000,
 *     circuitBreakerKey: "external-api",
 *   });
 *
 * Circuit breaker:
 * - If 5 failures occur within 1 minute, the circuit "opens" (stops trying) for 5 minutes.
 * - After the cooldown, the circuit "half-opens" (allows 1 test request).
 * - If the test succeeds, the circuit "closes" (resumes normal operation).
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number; // ms, doubles each retry
  maxDelay?: number; // ms, cap
  circuitBreakerKey?: string;
  timeoutMs?: number;
}

interface CircuitState {
  failures: number;
  firstFailureAt: number;
  openUntil: number; // timestamp when circuit closes again
}

const circuits = new Map<string, CircuitState>();
const CIRCUIT_FAILURE_THRESHOLD = 5;
const CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 min
const CIRCUIT_WINDOW_MS = 60 * 1000; // 1 min

function isCircuitOpen(key: string): boolean {
  const state = circuits.get(key);
  if (!state) return false;
  if (state.openUntil > Date.now()) return true;
  // Circuit half-open: allow the request through
  return false;
}

function recordSuccess(key: string) {
  circuits.delete(key);
}

function recordFailure(key: string) {
  const now = Date.now();
  let state = circuits.get(key);
  if (!state) {
    state = { failures: 0, firstFailureAt: now, openUntil: 0 };
    circuits.set(key, state);
  }
  // Reset if outside the window
  if (now - state.firstFailureAt > CIRCUIT_WINDOW_MS) {
    state.failures = 0;
    state.firstFailureAt = now;
  }
  state.failures++;
  if (state.failures >= CIRCUIT_FAILURE_THRESHOLD) {
    state.openUntil = now + CIRCUIT_COOLDOWN_MS;
  }
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 8000,
    circuitBreakerKey,
    timeoutMs,
  } = opts;

  // Check circuit breaker
  if (circuitBreakerKey && isCircuitOpen(circuitBreakerKey)) {
    throw new Error(`Circuit breaker open for ${circuitBreakerKey} — skipping retries`);
  }

  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      let result: T;
      if (timeoutMs) {
        // Race the operation against a timeout
        result = await Promise.race([
          fn(),
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);
      } else {
        result = await fn();
      }

      // Success — record it
      if (circuitBreakerKey) recordSuccess(circuitBreakerKey);
      return result;
    } catch (error: any) {
      lastError = error;
      if (attempt < maxRetries) {
        // Exponential backoff with jitter
        const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        const jitter = Math.random() * 300; // 0-300ms jitter
        await new Promise((r) => setTimeout(r, delay + jitter));
      }
    }
  }

  // All retries failed — record circuit breaker failure
  if (circuitBreakerKey) recordFailure(circuitBreakerKey);
  throw lastError;
}

/**
 * Get circuit breaker status (for admin dashboard).
 */
export function getCircuitBreakerStatus(): Record<string, { open: boolean; failures: number; openUntil?: number }> {
  const status: Record<string, any> = {};
  for (const [key, state] of circuits.entries()) {
    status[key] = {
      open: state.openUntil > Date.now(),
      failures: state.failures,
      openUntil: state.openUntil > Date.now() ? state.openUntil : undefined,
    };
  }
  return status;
}

/**
 * Reset a circuit breaker (for admin "reset" button).
 */
export function resetCircuitBreaker(key?: string) {
  if (key) {
    circuits.delete(key);
  } else {
    circuits.clear();
  }
}
