import { NextRequest, NextResponse } from "next/server";

/**
 * API Error Handler Wrapper
 *
 * Wraps any API route handler in a try-catch that:
 * 1. Catches all errors (DB failures, null references, etc.)
 * 2. Returns a proper JSON error response (not a 500 HTML page)
 * 3. Logs the error to the console with context
 * 4. Includes the error message in development mode
 *
 * Usage:
 *   export const GET = withErrorHandler(async (req) => {
 *     const data = await db.room.findMany();
 *     return NextResponse.json({ data });
 *   });
 *
 *   export const POST = withErrorHandler(async (req) => {
 *     const body = await req.json();
 *     // ... your logic
 *     return NextResponse.json({ success: true });
 *   });
 */

type Handler = (req: NextRequest, context?: any) => Promise<NextResponse | Response>;

export function withErrorHandler(handler: Handler): Handler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      // Log the error with context
      const url = req.nextUrl.pathname;
      const method = req.method;
      console.error(`[API ERROR] ${method} ${url}:`, {
        message: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      });

      // Return a proper JSON error response
      const statusCode = error.statusCode || 500;
      const response: any = {
        error: statusCode === 500 ? "Internal server error" : error.message,
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
        path: url,
        method,
        timestamp: new Date().toISOString(),
      };

      // In development, include the full error for debugging
      if (process.env.NODE_ENV === "development") {
        response.devMessage = error.message;
        response.devStack = error.stack?.split("\n").slice(0, 5).join("\n");
      }

      return NextResponse.json(response, { status: statusCode });
    }
  };
}

/**
 * Safe DB query wrapper
 *
 * Wraps a Prisma query in a try-catch that returns null on failure
 * (instead of crashing the entire API route).
 *
 * Usage:
 *   const rooms = await safeQuery(() => db.room.findMany(), []);
 *   // Returns the query result, or [] if the DB is down
 */
export async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[DB ERROR]", error);
    return fallback;
  }
}

/**
 * Safe fetch wrapper
 *
 * Wraps a fetch call in a try-catch that returns null on failure.
 * Includes a timeout to prevent hanging.
 *
 * Usage:
 *   const data = await safeFetch(() => fetch("/api/data").then(r => r.json()), null, 5000);
 */
export async function safeFetch<T>(fn: () => Promise<T>, fallback: T, timeoutMs = 10000): Promise<T> {
  try {
    const result = await Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
      ),
    ]);
    return result;
  } catch (error) {
    console.error("[FETCH ERROR]", error);
    return fallback;
  }
}
