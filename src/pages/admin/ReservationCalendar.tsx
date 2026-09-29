"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft, ChevronRight, LogIn, LogOut, BedDouble,
  Users, RefreshCw, User, Globe, Phone, Home, Footprints,
  Save, Settings, X, Plus, Trash2, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Channel partner icon + color mapping
const CHANNEL_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string; text: string }> = {
  DIRECT:       { icon: Home,       label: "Direct",    color: "#22c55e", bg: "bg-green-500/20",   text: "text-green-300" },
  WALKIN:       { icon: Footprints,  label: "Walk-in",   color: "#3b82f6", bg: "bg-blue-500/20",    text: "text-blue-300" },
  BOOKING_COM:  { icon: Globe,      label: "B.com",      color: "#003580", bg: "bg-blue-900/30",    text: "text-blue-200" },
  MAKEMYTRIP:   { icon: Globe,      label: "MMT",        color: "#eb2026", bg: "bg-red-500/20",     text: "text-red-300" },
  GOIBIBO:      { icon: Globe,      label: "Goibibo",    color: "#e2140d", bg: "bg-red-600/20",     text: "text-red-300" },
  AGODA:        { icon: Globe,      label: "Agoda",      color: "#5394f1", bg: "bg-sky-500/20",     text: "text-sky-300" },
};

const STATUS_CONFIG: Record<string, { label: string; border: string; bg: string }> = {
  CONFIRMED:   { label: "Confirmed",   border: "border-champagne/40",  bg: "bg-champagne/15" },
  CHECKED_IN:  { label: "In House",     border: "border-green-500/40", bg: "bg-green-500/15" },
  CHECKED_OUT: { label: "Checked Out",  border: "border-ivory/20",    bg: "bg-ivory/5" },
  CANCELLED:   { label: "Cancelled",    border: "border-red-500/40",  bg: "bg-red-500/10 line-through" },
};

type CalendarRoom = { number: string; floor: number; type: string; typeName: string };
type CalendarDate = { date: string; dayName: string; dayNum: number; isToday: boolean };
type CalendarBooking = {
  id: string; reference: string; guestName: string; guestPhone: string;
  checkIn: string; checkOut: string; nights: number; amount: number;
  status: string; source: string; roomNumber: string; roomType: string; roomSlug: string;
};

export default function ReservationCalendar() {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState<CalendarRoom[]>([]);
  const [dates, setDates] = useState<CalendarDate[]>([]);
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [stats, setStats] = useState({ arrivals: 0, departures: 0, inHouse: 0, available: 0, totalRooms: 0 });
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [days, setDays] = useState(7);
  const [selectedBooking, setSelectedBooking] = useState<CalendarBooking | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editRoomNumber, setEditRoomNumber] = useState("");
  const [editGuestName, setEditGuestName] = useState("");
  const [saving, setSaving] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [roomConfig, setRoomConfig] = useState<any[]>([]);
  const [editRoomConfig, setEditRoomConfig] = useState<any[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/reservations?startDate=${startDate}&days=${days}`, { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (j.rooms) {
          setRooms(j.rooms);
          setDates(j.dates);
          setBookings(j.bookings);
          setStats(j.stats);
        }
      })
      .catch(() => toast.error("Failed to load reservations"))
      .finally(() => setLoading(false));
  }, [startDate, days]);

  useEffect(() => { load(); }, [load]);

  // Load room config for settings panel
  useEffect(() => {
    if (showRoomSettings) {
      setEditRoomConfig(roomConfig.length > 0 ? [...roomConfig] : rooms.map(r => ({ ...r })));
    }
  }, [showRoomSettings, rooms, roomConfig]);

  // Open booking detail → populate edit fields
  useEffect(() => {
    if (selectedBooking) {
      setEditRoomNumber(selectedBooking.roomNumber);
      setEditGuestName(selectedBooking.guestName);
      setEditMode(false);
    }
  }, [selectedBooking]);

  const saveBooking = async () => {
    if (!selectedBooking) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          roomNumber: editRoomNumber,
          guestName: editGuestName,
        }),
      });
      const j = await r.json();
      if (j.ok) {
        toast.success("Booking updated - grid refreshed");
        setEditMode(false);
        load();
        setSelectedBooking(null);
      } else {
        toast.error(j.error || "Failed to update");
      }
    } catch { toast.error("Network error"); }
    setSaving(false);
  };

  const saveRoomConfig = async () => {
    setSavingConfig(true);
    try {
      const r = await fetch("/api/admin/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rooms: editRoomConfig }),
      });
      const j = await r.json();
      if (j.ok) {
        toast.success("Room configuration saved - grid refreshed");
        setShowRoomSettings(false);
        load();
      } else {
        toast.error(j.error || "Failed to save");
      }
    } catch { toast.error("Network error"); }
    setSavingConfig(false);
  };

  const addRoomRow = () => {
    setEditRoomConfig([...editRoomConfig, { number: "", floor: 1, type: "deluxe-room", typeName: "Family Suit / Quad" }]);
  };

  const removeRoomRow = (idx: number) => {
    setEditRoomConfig(editRoomConfig.filter((_, i) => i !== idx));
  };

  const updateRoomRow = (idx: number, field: string, value: string) => {
    const updated = [...editRoomConfig];
    updated[idx] = { ...updated[idx], [field]: field === "floor" ? parseInt(value) : value };
    setEditRoomConfig(updated);
  };

  // Group rooms by floor
  const floors = rooms.reduce((acc, r) => {
    const f = r.floor;
    if (!acc[f]) acc[f] = [];
    acc[f].push(r);
    return acc;
  }, {} as Record<number, CalendarRoom[]>);

  // Find bookings for a specific room + date
  const getBookingForCell = (roomNumber: string, dateStr: string): CalendarBooking | null => {
    const date = new Date(dateStr);
    date.setHours(12, 0, 0, 0); // noon to avoid timezone issues
    return bookings.find(b => {
      if (b.roomNumber !== roomNumber) return false;
      const ci = new Date(b.checkIn); ci.setHours(12, 0, 0, 0);
      const co = new Date(b.checkOut); co.setHours(12, 0, 0, 0);
      return date >= ci && date < co;
    }) || null;
  };

  // Calculate block span (how many days a booking occupies in the visible range)
  const getBlockSpan = (booking: CalendarBooking): number => {
    const ci = new Date(booking.checkIn); ci.setHours(0, 0, 0, 0);
    const co = new Date(booking.checkOut); co.setHours(0, 0, 0, 0);
    const rangeStart = new Date(startDate); rangeStart.setHours(0, 0, 0, 0);
    const visibleStart = ci > rangeStart ? ci : rangeStart;
    const visibleEnd = co;
    const span = Math.ceil((visibleEnd.getTime() - visibleStart.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(span, days);
  };

  // Check if booking starts on this date (to render the block)
  const isBookingStart = (booking: CalendarBooking, dateStr: string): boolean => {
    const ci = new Date(booking.checkIn); ci.setHours(0, 0, 0, 0);
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
    // If check-in is before visible range start, show block on first visible day
    const rangeStart = new Date(startDate); rangeStart.setHours(0, 0, 0, 0);
    if (ci <= rangeStart && d.getTime() === rangeStart.getTime()) return true;
    return ci.getTime() === d.getTime();
  };

  const shiftDays = (delta: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + delta);
    setStartDate(d.toISOString().slice(0, 10));
  };

  const todayLabel = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard icon={LogIn} label="Arrivals Today" value={stats.arrivals} color="text-green-400" />
        <StatCard icon={LogOut} label="Departures Today" value={stats.departures} color="text-orange-400" />
        <StatCard icon={Users} label="In House" value={stats.inHouse} color="text-blue-400" />
        <StatCard icon={BedDouble} label="Available" value={stats.available} color="text-champagne" />
        <StatCard icon={BedDouble} label="Total Rooms" value={stats.totalRooms} color="text-ivory/60" />
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-champagne/15 bg-ink-card p-3">
        <div className="flex items-center gap-2">
          <button onClick={() => shiftDays(-7)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => shiftDays(-1)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">
            <ChevronLeft className="h-3 w-3" />
          </button>
          <button onClick={() => setStartDate(new Date().toISOString().slice(0, 10))} className="rounded-lg border border-champagne/20 px-3 py-1 text-xs font-semibold text-champagne hover:bg-champagne/10">
            Today
          </button>
          <button onClick={() => shiftDays(1)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">
            <ChevronRight className="h-3 w-3" />
          </button>
          <button onClick={() => shiftDays(7)} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <select value={days} onChange={e => setDays(parseInt(e.target.value))} className="rounded-lg border border-champagne/20 bg-ink px-2 py-1 text-xs text-ivory">
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
          <button onClick={load} disabled={loading} className="grid h-8 w-8 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
          <button onClick={() => setShowRoomSettings(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-champagne/20 px-3 py-1 text-xs font-semibold text-champagne hover:bg-champagne/10">
            <Settings className="h-3.5 w-3.5" /> Room Settings
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto rounded-xl border border-champagne/15 bg-ink-card">
        <div className="min-w-[800px]">
          {/* Date header row */}
          <div className="flex border-b border-champagne/10">
            <div className="sticky left-0 z-10 w-28 flex-shrink-0 border-r border-champagne/10 bg-ink-card p-2 text-[10px] font-bold uppercase tracking-wider text-champagne/60">
              Room
            </div>
            {dates.map(d => (
              <div
                key={d.date}
                className={cn(
                  "flex-1 min-w-[80px] p-2 text-center",
                  d.isToday && "bg-champagne/10"
                )}
              >
                <p className={cn("text-[10px] uppercase", d.isToday ? "text-champagne font-bold" : "text-ivory/40")}>{d.dayName}</p>
                <p className={cn("text-sm font-semibold", d.isToday ? "text-champagne" : "text-ivory")}>{d.dayNum}</p>
              </div>
            ))}
          </div>

          {/* Room rows grouped by floor */}
          {Object.entries(floors).map(([floor, floorRooms]) => (
            <div key={floor}>
              {/* Floor divider */}
              <div className="flex border-b border-champagne/5 bg-ink/50">
                <div className="sticky left-0 z-10 w-28 flex-shrink-0 border-r border-champagne/10 bg-ink/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ivory/30">
                  Floor {floor}
                </div>
                <div className="flex-1" />
              </div>

              {/* Room rows */}
              {floorRooms.map(room => (
                <div key={room.number} className="flex border-b border-champagne/5 hover:bg-champagne/[0.02]">
                  {/* Room number cell */}
                  <div className="sticky left-0 z-10 w-28 flex-shrink-0 border-r border-champagne/10 bg-ink-card p-2">
                    <p className="text-sm font-bold text-ivory">{room.number}</p>
                    <p className="text-[9px] text-ivory/40">{room.typeName}</p>
                  </div>

                  {/* Date cells */}
                  {dates.map(d => {
                    const booking = getBookingForCell(room.number, d.date);
                    const isStart = booking && isBookingStart(booking, d.date);

                    if (isStart && booking) {
                      const span = getBlockSpan(booking);
                      const channel = CHANNEL_CONFIG[booking.source] || CHANNEL_CONFIG.DIRECT;
                      const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.CONFIRMED;
                      const ChannelIcon = channel.icon;

                      return (
                        <div
                          key={d.date}
                          className="min-w-[80px] flex-1 p-1"
                          style={{ gridColumn: `span ${span}` }}
                        >
                          <div
                            onClick={() => setSelectedBooking(booking)}
                            className={cn(
                              "group relative cursor-pointer rounded-md border p-1.5 transition-all hover:z-10 hover:shadow-lg",
                              status.border,
                              status.bg
                            )}
                          >
                            {/* Channel partner icon */}
                            <div className="flex items-center gap-1">
                              <span className={cn("grid h-4 w-4 place-items-center rounded", channel.bg)}>
                                <ChannelIcon className="h-2.5 w-2.5" style={{ color: channel.color }} />
                              </span>
                              <p className="truncate text-[10px] font-semibold text-ivory">{booking.guestName}</p>
                            </div>
                            {/* Channel label */}
                            <p className={cn("mt-0.5 text-[8px] font-bold uppercase", channel.text)}>{channel.label}</p>
                          </div>
                        </div>
                      );
                    }

                    // Empty cell or continuation of a booking (leave blank)
                    if (booking && !isStart) {
                      return <div key={d.date} className="min-w-[80px] flex-1 border-r border-champagne/5" />;
                    }

                    // Empty (available) cell
                    return (
                      <div
                        key={d.date}
                        className={cn(
                          "min-w-[80px] flex-1 border-r border-champagne/5 p-1",
                          d.isToday && "bg-champagne/[0.03]"
                        )}
                      >
                        <div className="h-full min-h-[36px] rounded border border-dashed border-champagne/10 hover:border-champagne/30 hover:bg-champagne/5" />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Channel legend */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-champagne/15 bg-ink-card p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ivory/40">Channel Sources:</p>
        {Object.entries(CHANNEL_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={cn("grid h-5 w-5 place-items-center rounded", cfg.bg)}>
                <Icon className="h-3 w-3" style={{ color: cfg.color }} />
              </span>
              <span className="text-[10px] text-ivory/60">{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Booking detail modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/95 p-4" onClick={() => { setSelectedBooking(null); setEditMode(false); }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-champagne/20 bg-ink-card p-6 shadow-luxe-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-champagne">{selectedBooking.reference}</p>
                {editMode ? (
                  <input value={editGuestName} onChange={e => setEditGuestName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-champagne/20 bg-ink px-2 py-1 font-serif text-xl text-ivory" />
                ) : (
                  <h3 className="mt-1 font-serif text-xl text-ivory">{selectedBooking.guestName}</h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="grid h-7 w-7 place-items-center rounded-lg border border-champagne/20 text-champagne hover:bg-champagne/10">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={() => { setSelectedBooking(null); setEditMode(false); }} className="text-ivory/40 hover:text-ivory">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <DetailRow icon={Phone} label="Phone" value={selectedBooking.guestPhone} />

              {/* Room Number - editable */}
              {editMode ? (
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-champagne/60" />
                  <span className="text-[10px] uppercase tracking-wider text-ivory/40">Room:</span>
                  <select value={editRoomNumber} onChange={e => setEditRoomNumber(e.target.value)}
                    className="flex-1 rounded-lg border border-champagne/20 bg-ink px-2 py-1 text-sm text-ivory">
                    <option value="">Unassigned</option>
                    {rooms.map(r => (
                      <option key={r.number} value={r.number}>{r.number} - {r.typeName}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <DetailRow icon={BedDouble} label="Room" value={`${selectedBooking.roomNumber} - ${selectedBooking.roomType}`} />
              )}

              <DetailRow icon={LogIn} label="Check-in" value={new Date(selectedBooking.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
              <DetailRow icon={LogOut} label="Check-out" value={new Date(selectedBooking.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
              <DetailRow icon={Users} label="Nights" value={String(selectedBooking.nights)} />
              <DetailRow icon={Home} label="Source" value={CHANNEL_CONFIG[selectedBooking.source]?.label || selectedBooking.source} />
              <DetailRow icon={BedDouble} label="Amount" value={`Rs. ${selectedBooking.amount.toLocaleString("en-IN")}`} />
              <DetailRow icon={User} label="Status" value={STATUS_CONFIG[selectedBooking.status]?.label || selectedBooking.status} />
            </div>

            {editMode && (
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => { setEditMode(false); setEditRoomNumber(selectedBooking.roomNumber); setEditGuestName(selectedBooking.guestName); }}
                  className="rounded-lg border border-champagne/20 px-3 py-1.5 text-xs text-ivory/60 hover:bg-champagne/5">
                  Cancel
                </button>
                <button onClick={saveBooking} disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-champagne px-3 py-1.5 text-xs font-semibold text-ink hover:bg-champagne-bright disabled:opacity-50">
                  {saving ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  Save Changes
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* Room Settings Modal */}
      {showRoomSettings && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/95 p-4 overflow-y-auto" onClick={() => setShowRoomSettings(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-2xl rounded-2xl border border-champagne/20 bg-ink-card p-6 shadow-luxe-lg"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-ivory">Room Configuration</h3>
              <button onClick={() => setShowRoomSettings(false)} className="text-ivory/40 hover:text-ivory">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-ivory/50">Edit room numbers, floors, and type mappings. Changes apply instantly to the reservation grid.</p>

            <div className="mt-4 max-h-[50vh] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-champagne/10 text-[10px] uppercase text-ivory/40">
                    <th className="pb-2 text-left">Room No</th>
                    <th className="pb-2 text-left">Floor</th>
                    <th className="pb-2 text-left">Type (slug)</th>
                    <th className="pb-2 text-left">Display Name</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {editRoomConfig.map((r, i) => (
                    <tr key={i} className="border-b border-champagne/5">
                      <td className="py-1.5">
                        <input value={r.number} onChange={e => updateRoomRow(i, "number", e.target.value)}
                          className="w-16 rounded border border-champagne/15 bg-ink px-2 py-1 text-sm text-ivory" />
                      </td>
                      <td className="py-1.5">
                        <input type="number" value={r.floor} onChange={e => updateRoomRow(i, "floor", e.target.value)}
                          className="w-12 rounded border border-champagne/15 bg-ink px-2 py-1 text-sm text-ivory" />
                      </td>
                      <td className="py-1.5">
                        <select value={r.type} onChange={e => updateRoomRow(i, "type", e.target.value)}
                          className="rounded border border-champagne/15 bg-ink px-2 py-1 text-xs text-ivory">
                          <option value="deluxe-room">deluxe-room</option>
                          <option value="super-deluxe-room">super-deluxe-room</option>
                          <option value="superior-room">superior-room</option>
                          <option value="gvd-suite">gvd-suite</option>
                          <option value="family-comfort-triple-room">family-comfort-triple-room</option>
                        </select>
                      </td>
                      <td className="py-1.5">
                        <input value={r.typeName} onChange={e => updateRoomRow(i, "typeName", e.target.value)}
                          className="w-full rounded border border-champagne/15 bg-ink px-2 py-1 text-xs text-ivory" />
                      </td>
                      <td className="py-1.5">
                        <button onClick={() => removeRoomRow(i)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={addRoomRow} className="mt-3 inline-flex items-center gap-1 text-xs text-champagne hover:text-champagne-bright">
                <Plus className="h-3.5 w-3.5" /> Add Room
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowRoomSettings(false)} className="rounded-lg border border-champagne/20 px-3 py-1.5 text-xs text-ivory/60 hover:bg-champagne/5">
                Cancel
              </button>
              <button onClick={saveRoomConfig} disabled={savingConfig}
                className="inline-flex items-center gap-1.5 rounded-lg bg-champagne px-3 py-1.5 text-xs font-semibold text-ink hover:bg-champagne-bright disabled:opacity-50">
                {savingConfig ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                Save Room Config
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="rounded-xl border border-champagne/15 bg-ink-card p-3">
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-[10px] uppercase tracking-wider text-ivory/40">{label}</span>
      </div>
      <p className={cn("mt-1 font-serif text-2xl", color)}>{value}</p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-champagne/60" />
      <span className="text-[10px] uppercase tracking-wider text-ivory/40">{label}:</span>
      <span className="font-medium text-ivory">{value}</span>
    </div>
  );
}
