import { NextRequest, NextResponse } from "next/server";

// GET /api/weather?date=2026-09-10 — returns Guruvayur weather (simulated, since no API key)
// In production, integrate with OpenWeatherMap or WeatherAPI.com
export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();
  const month = date.getMonth();

  // Kerala climate patterns by month
  const seasons = [
    { name: "Winter", tempRange: [22, 32], humidity: 65, rain: 5, desc: "Pleasant mornings, cool evenings" }, // Jan
    { name: "Winter", tempRange: [23, 33], humidity: 65, rain: 5, desc: "Pleasant mornings, warm days" }, // Feb
    { name: "Spring", tempRange: [25, 35], humidity: 70, rain: 15, desc: "Warming up, occasional showers" }, // Mar
    { name: "Summer", tempRange: [26, 36], humidity: 75, rain: 25, desc: "Hot & humid, thunderstorms likely" }, // Apr
    { name: "Summer", tempRange: [26, 35], humidity: 80, rain: 40, desc: "Pre-monsoon heat, humid" }, // May
    { name: "Monsoon", tempRange: [24, 30], humidity: 90, rain: 85, desc: "Heavy monsoon rain, lush green" }, // Jun
    { name: "Monsoon", tempRange: [24, 30], humidity: 90, rain: 90, desc: "Peak monsoon, expect flooding" }, // Jul
    { name: "Monsoon", tempRange: [24, 31], humidity: 88, rain: 75, desc: "Monsoon continues, less intense" }, // Aug
    { name: "Post-Monsoon", tempRange: [24, 32], humidity: 80, rain: 45, desc: "Rain easing, greener than ever" }, // Sep
    { name: "Autumn", tempRange: [24, 32], humidity: 75, rain: 25, desc: "Pleasant, occasional showers" }, // Oct
    { name: "Winter", tempRange: [23, 31], humidity: 70, rain: 15, desc: "Cool & comfortable, festival season" }, // Nov
    { name: "Winter", tempRange: [22, 31], humidity: 65, rain: 8, desc: "Pleasant, peak pilgrim season" }, // Dec
  ];

  const season = seasons[month];
  const temp = Math.round(season.tempRange[0] + Math.random() * (season.tempRange[1] - season.tempRange[0]));
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const isFuture = date > today;

  // Generate 7-day forecast
  const forecast = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const m = d.getMonth();
    const s = seasons[m];
    return {
      date: d.toISOString().slice(0, 10),
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      temp: Math.round(s.tempRange[0] + Math.random() * (s.tempRange[1] - s.tempRange[0])),
      rain: Math.round(s.rain * (0.5 + Math.random() * 0.5)),
      condition: s.rain > 60 ? "Rainy" : s.rain > 30 ? "Showers" : s.tempRange[1] > 34 ? "Hot" : "Pleasant",
    };
  });

  return NextResponse.json({
    location: "Guruvayur, Kerala, India",
    coordinates: { lat: 10.5945, lng: 76.0424 },
    current: isToday ? {
      temp,
      condition: season.rain > 60 ? "Rainy" : season.rain > 30 ? "Showers" : season.tempRange[1] > 34 ? "Hot" : "Pleasant",
      humidity: season.humidity,
      rainChance: Math.round(season.rain),
      description: season.desc,
    } : null,
    requestedDate: {
      date: date.toISOString().slice(0, 10),
      season: season.name,
      tempRange: season.tempRange,
      rainChance: Math.round(season.rain),
      description: season.desc,
    },
    forecast,
  });
}
