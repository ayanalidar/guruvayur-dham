"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Clock, Navigation, Check, ChevronRight, CalendarDays,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton, MandalaDivider } from "@/components/site/visuals";
import { useContent } from "@/lib/use-cms";
import { SITE } from "@/lib/site-data";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────────────────────────────
 *  Pilgrimage Planner  ·  /#/planner
 * ───────────────────────────────────────────────────────────────────────
 *
 *  Interactive itinerary builder. The guest picks:
 *    - Number of days (1, 2, 3)
 *    - Which of the 7 SITE.nearbyTemples to include
 *
 *  The planner auto-suggests an itinerary based on proximity and temple
 *  opening times, then renders a day-by-day plan with timings + travel
 *  time from Guruvayur Dham.
 *
 *  Templates are CMS-editable via the content blocks:
 *    - planner.day1  (JSON-stringified array of stops)
 *    - planner.day2  (same)
 *    - planner.day3  (same)
 *  Falling back to hardcoded Mathura-specific templates (defined below)
 *  when the CMS rows are missing or malformed.
 *
 *  "Book this itinerary" button navigates to /#/book.
 */

interface ItineraryStop {
  temple: string;
  slot: string;       // "Morning" | "Afternoon" | "Sunset" | "Evening"
  time: string;       // opening-time text from SITE.nearbyTemples
  travelFromGD: string; // e.g. "5 min walk", "25 min drive (auto)"
  note?: string;
}

interface DayPlan {
  title: string;
  summary: string;
  stops: ItineraryStop[];
}

/* Hardcoded fallback templates (Mathura-specific, no Kerala references).
 * Each is a JSON-stringified array of ItineraryStop objects.
 * Admins can override these via /admin/content → planner.day1/2/3 blocks.
 */
const FALLBACK_DAY1 = JSON.stringify([
  {
    temple: "Shri Krishna Janmabhoomi",
    slot: "Morning",
    time: "5 AM - 12 PM, 4 - 9:30 PM",
    travelFromGD: "1.5 km · 5 min drive / 20 min walk",
    note: "Most peaceful at 5 AM Mangala Aarti. Reach before 6 AM to avoid crowds.",
  },
  {
    temple: "Dwarkadhish Temple",
    slot: "Afternoon",
    time: "6:30 - 10:30 AM, 4 - 7 PM",
    travelFromGD: "2 km · 7 min drive",
    note: "Sandhya Aarti at 6 PM is the highlight.",
  },
  {
    temple: "Vishram Ghat",
    slot: "Sunset",
    time: "Open all day · best at sunset",
    travelFromGD: "2.5 km · 8 min drive",
    note: "Evening aarti with floating diyas on the Yamuna — magical at dusk.",
  },
]);

const FALLBACK_DAY2 = JSON.stringify([
  {
    temple: "Banke Bihari Temple (Vrindavan)",
    slot: "Morning",
    time: "7:45 AM - 12 PM, 5:30 - 9:30 PM",
    travelFromGD: "15 km · 25 min drive (auto Rs 250)",
    note: "Reach by 8 AM for peaceful darshan. Unique curtain darshan.",
  },
  {
    temple: "Prem Mandir (Vrindavan)",
    slot: "Afternoon",
    time: "8:30 AM - 8:30 PM",
    travelFromGD: "15 km · 25 min drive",
    note: "White marble temple, life-size dioramas. Stay for evening light show at 6:30 PM.",
  },
  {
    temple: "ISKCON Temple (Vrindavan)",
    slot: "Evening",
    time: "5 AM - 8:30 PM",
    travelFromGD: "16 km · 25 min drive",
    note: "Kirtan starts at 7 PM. Great way to end the Vrindavan day.",
  },
]);

const FALLBACK_DAY3 = JSON.stringify([
  {
    temple: "Radha Rani Mandir (Barsana)",
    slot: "Morning",
    time: "6 AM - 9 PM",
    travelFromGD: "45 km · 1 hr drive",
    note: "200 steps to the hilltop temple. Start at 7 AM for peaceful darshan.",
  },
  {
    temple: "Nanda Bhavan (Nandgaon)",
    slot: "Afternoon",
    time: "7 AM - 12 PM, 3 - 8 PM",
    travelFromGD: "8 km from Barsana · 50 km from Mathura",
    note: "Krishna's childhood village. Visit Pavan Sarovar nearby.",
  },
  {
    temple: "Mata Pathwari Mandir",
    slot: "Evening",
    time: "5 AM - 9 PM",
    travelFromGD: "Next door to Guruvayur Dham · 2 min walk",
    note: "Wind down with a short walk to the adjacent temple.",
  },
]);

/* Stub stops (used if JSON parse fails) — declared BEFORE the
 * FALLBACK_PLANS object literal below (const decls are not hoisted). */
const FALLBACK_DAY1_STUB: ItineraryStop = {
  temple: "Shri Krishna Janmabhoomi",
  slot: "Morning",
  time: "5 AM - 12 PM, 4 - 9:30 PM",
  travelFromGD: "1.5 km · 5 min drive",
  note: "Most peaceful at 5 AM Mangala Aarti.",
};
const FALLBACK_DAY2_STUB: ItineraryStop = {
  temple: "Banke Bihari Temple (Vrindavan)",
  slot: "Morning",
  time: "7:45 AM - 12 PM, 5:30 - 9:30 PM",
  travelFromGD: "15 km · 25 min drive (auto Rs 250)",
  note: "Reach by 8 AM for peaceful darshan.",
};
const FALLBACK_DAY3_STUB: ItineraryStop = {
  temple: "Radha Rani Mandir (Barsana)",
  slot: "Morning",
  time: "6 AM - 9 PM",
  travelFromGD: "45 km · 1 hr drive",
  note: "200 steps to the hilltop temple.",
};

const FALLBACK_PLANS_NOT_USED = null; // (kept for documentation; plans built in useMemo below)

function safeParse(json: string, fallback: ItineraryStop[]): ItineraryStop[] {
  try {
    const arr = JSON.parse(json);
    if (Array.isArray(arr) && arr.length > 0 && arr[0] && arr[0].temple) {
      return arr as ItineraryStop[];
    }
  } catch {
    // fall through
  }
  return fallback;
}

const SLOT_ORDER = ["Morning", "Afternoon", "Sunset", "Evening"] as const;

export default function PilgrimagePlannerPage() {
  const { navigate } = useHashRoute();
  const { get, map } = useContent();
  const [days, setDays] = useState<1 | 2 | 3>(2);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(SITE.nearbyTemples.slice(0, 5).map(t => t.name))
  );

  // Load CMS-overridden day plans (planner.day1/2/3) with fallback.
  // Deps: `get` and `map` — `get` is a closure over `map`, so listing both
  // keeps the React Compiler happy (inferred = get, source = [get, map]).
  const plans: Record<1 | 2 | 3, DayPlan[]> = useMemo(() => {
    const day1Stops = safeParse(
      get("planner.day1", FALLBACK_DAY1),
      [FALLBACK_DAY1_STUB],
    );
    const day2Stops = safeParse(
      get("planner.day2", FALLBACK_DAY2),
      [FALLBACK_DAY2_STUB],
    );
    const day3Stops = safeParse(
      get("planner.day3", FALLBACK_DAY3),
      [FALLBACK_DAY3_STUB],
    );

    const day1: DayPlan = {
      title: "Day 1 · Mathura",
      summary: "Krishna Janmabhoomi (morning) → Dwarkadhish (afternoon) → Vishram Ghat (sunset)",
      stops: day1Stops,
    };
    const day2: DayPlan = {
      title: "Day 2 · Vrindavan",
      summary: "Banke Bihari → Prem Mandir → ISKCON",
      stops: day2Stops,
    };
    const day3: DayPlan = {
      title: "Day 3 · Barsana & Nandgaon",
      summary: "Radha Rani Mandir → Nandgaon → Mata Pathwari (return)",
      stops: day3Stops,
    };

    return {
      1: [day1],
      2: [day1, day2],
      3: [day1, day2, day3],
    };
  }, [get, map]);

  // Filter each day's stops to only include selected temples.
  // If a day's all-stops-unselected, fall back to the full template so the
  // plan never looks empty.
  const visiblePlans = plans[days].map((plan, i) => {
    const filteredStops = plan.stops.filter(s => selected.has(s.temple));
    return {
      ...plan,
      stops: filteredStops.length > 0 ? filteredStops : plan.stops,
      filteredDown: filteredStops.length === 0,
    };
  });

  const toggleTemple = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Plan Your Braj Yatra"
        icon={MapPin}
        title={<>Pilgrimage <GoldFoilText>Planner</GoldFoilText></>}
        subtitle="Build a custom Mathura-Vrindavan-Barsana itinerary in seconds. Pick your dates, choose your temples, get a day-by-day plan with timings and travel time from Guruvayur Dham."
        crumbs={[{ label: "Home", route: "/" }, { label: "Planner" }]}
      />

      <section className="bg-ink py-12 lg:py-16">
        <div className="container-x grid gap-8 lg:grid-cols-3">
          {/* ── Planner controls ── */}
          <div className="lg:col-span-1">
            <div className="card-luxe p-6">
              <h3 className="font-serif text-xl text-ivory">Build Your Itinerary</h3>
              <p className="mt-1 text-xs text-ivory/60">
                Choose duration and temples. We'll arrange the rest.
              </p>

              {/* Duration selector */}
              <div className="mt-5">
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Trip Duration</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {([1, 2, 3] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => setDays(n)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm font-semibold transition-all",
                        days === n
                          ? "border-champagne bg-champagne/15 text-champagne"
                          : "border-champagne/10 text-ivory/60 hover:border-champagne/30"
                      )}
                    >
                      {n} Day{n > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temple checkboxes */}
              <div className="mt-6">
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Temples to Visit</label>
                <ul className="mt-2 space-y-1.5">
                  {SITE.nearbyTemples.map(t => {
                    const checked = selected.has(t.name);
                    return (
                      <li key={t.name}>
                        <button
                          onClick={() => toggleTemple(t.name)}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-lg border p-2.5 text-left transition-all",
                            checked
                              ? "border-champagne/30 bg-champagne/10"
                              : "border-champagne/5 hover:border-champagne/15"
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded border transition-all",
                              checked
                                ? "border-champagne bg-champagne text-ink"
                                : "border-champagne/30 text-transparent"
                            )}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ivory">{t.name}</span>
                            <span className="block text-[10px] text-ivory/50">{t.distance} · {t.timings}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Book this itinerary CTA */}
              <MagneticButton
                onClick={() => navigate("/book")}
                className="mt-6 w-full justify-center"
              >
                <CalendarDays className="h-4 w-4" /> Book This Itinerary
              </MagneticButton>
              <p className="mt-2 text-center text-[10px] text-ivory/40">
                Pre-fill your dates · we'll arrange transport & darshan assistance.
              </p>
            </div>
          </div>

          {/* ── Itinerary preview ── */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {visiblePlans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-2xl border border-champagne/15 bg-ink-card p-6"
                >
                  <div className="flex items-center gap-2">
                    <div className="grid h-10 w-10 place-items-center rounded-full border border-champagne/30 bg-gradient-to-br from-champagne/15 to-transparent font-serif text-lg text-gold-foil">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-ivory">{plan.title}</h3>
                      <p className="text-xs text-ivory/60">{plan.summary}</p>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-3">
                    {[...plan.stops]
                      .sort((a, b) => SLOT_ORDER.indexOf(a.slot as any) - SLOT_ORDER.indexOf(b.slot as any))
                      .map((stop, j) => (
                        <li key={j} className="rounded-xl border border-champagne/10 bg-ink/40 p-4">
                          <div className="flex items-start gap-3">
                            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-champagne/20 bg-champagne/10 text-champagne">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-serif text-base text-ivory">{stop.temple}</p>
                                <span className="rounded-full border border-champagne/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-champagne">
                                  {stop.slot}
                                </span>
                              </div>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-ivory/60">
                                <Clock className="h-3.5 w-3.5" /> {stop.time}
                              </p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-ivory/60">
                                <Navigation className="h-3.5 w-3.5" /> From Guruvayur Dham: {stop.travelFromGD}
                              </p>
                              {stop.note && (
                                <p className="mt-2 rounded-lg border border-champagne/5 bg-champagne/5 p-2 text-xs italic text-ivory/70">
                                  {stop.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* CTA at bottom */}
            <div className="mt-6 rounded-2xl border border-champagne/15 bg-gradient-to-br from-champagne/10 to-transparent p-6 text-center">
              <p className="font-serif text-xl text-ivory">Ready to book your yatra?</p>
              <p className="mt-1 text-sm text-ivory/60">
                Reserve your room at Guruvayur Dham · 16 premium AC rooms · 2 min from Mathura Station.
              </p>
              <MagneticButton onClick={() => navigate("/book")} className="mt-4">
                Book Now <ChevronRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      <MandalaDivider />
    </div>
  );
}

// (No trailing helper — component uses useContent() directly.)
