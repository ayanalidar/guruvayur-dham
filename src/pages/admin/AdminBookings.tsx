"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, Plus, RefreshCw, Phone, Users, IndianRupee,
  Radio, ArrowLeft, X, Check, AlertCircle, Building2,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import {
  fetchBookings, fetchRooms, createWalkIn, simulateChannelBooking,
} from "@/lib/api-client";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";
import { cn } from "@/lib/utils";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const SOURCE_COLORS: Record<string, string> = {
  DIRECT: "from-champagne to-gold-deep",
  WALKIN: "from-saffron to-maroon",
  BOOKING_COM: "from-blue-500 to-blue-700",
  MAKEMYTRIP: "from-red-500 to-red-700",
  GOIBIBO: "from-green-500 to-green-700",
  AGODA: "from-purple-500 to-purple-700",
};
const SOURCE_LABELS: Record<string, string> = {
  DIRECT: "Direct Website", WALKIN: "Walk-in",
  BOOKING_COM: "Booking.com", MAKEMYTRIP: "MakeMyTrip",
  GOIBIBO: "Goibibo", AGODA: "Agoda",
};

export default function AdminBookings() {
  const { navigate } = useHashRoute();
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [walkinOpen, setWalkinOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(false);

  const load = async () => {
    const [b, r] = await Promise.all([
      fetchBookings(filter === "ALL" ? undefined : { source: filter }),
      fetchRooms(),
    ]);
    setBookings(b);
    setRooms(r);
    setLoading(false);
  };
  useEffect(() => {
    let active = true;
    Promise.all([
      fetchBookings(filter === "ALL" ? undefined : { source: filter }),
      fetchRooms(),
    ]).then(([b, r]) => {
      if (active) {
        setBookings(b);
        setRooms(r);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [filter]);

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={CalendarDays}
        title={<>All <GoldFoilText>Bookings</GoldFoilText></>}
        subtitle="Every booking across all channels — direct, walk-in, Booking.com, MakeMyTrip, Goibibo, and Agoda. Each booking auto-syncs inventory to all other channels."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Bookings" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Actions */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {["ALL", "DIRECT", "WALKIN", "BOOKING_COM", "MAKEMYTRIP", "GOIBIBO", "AGODA"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                    filter === f
                      ? "border border-champagne/30 bg-champagne/15 text-champagne"
                      : "border border-champagne/10 text-ivory/60 hover:border-champagne/25 hover:text-ivory"
                  )}
                >
                  {f === "ALL" ? "All Sources" : SOURCE_LABELS[f] || f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setWalkinOpen(true)} className="btn-luxe">
                <Plus className="h-4 w-4" /> Walk-in Booking
              </button>
              <button onClick={() => setSimOpen(true)} className="btn-ghost-luxe">
                <Radio className="h-4 w-4" /> Simulate Channel Booking
              </button>
              <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Bookings table */}
          <div className="card-luxe overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="border-b border-champagne/10 bg-ink/50 text-xs uppercase tracking-wider text-ivory/50">
                  <tr>
                    <th className="px-5 py-3">Reference</th>
                    <th className="px-5 py-3">Guest</th>
                    <th className="px-5 py-3">Room</th>
                    <th className="px-5 py-3">Check-in</th>
                    <th className="px-5 py-3">Nights</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="border-b border-champagne/5 hover:bg-ink/30">
                      <td className="px-5 py-3 font-mono text-xs text-champagne">{b.reference}</td>
                      <td className="px-5 py-3">
                        <p className="font-semibold text-ivory">{b.guestName}</p>
                        <p className="text-xs text-ivory/50">{b.guestPhone}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-ivory">{b.room?.name}</p>
                        <p className="text-xs text-ivory/50">{b.room?.type}</p>
                      </td>
                      <td className="px-5 py-3 text-ivory/70">
                        {new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-5 py-3 text-ivory/70">{b.nights}</td>
                      <td className="px-5 py-3 font-semibold text-gold-foil">₹{b.amount.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3">
                        <span className={cn("inline-flex rounded-full bg-gradient-to-r px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white", SOURCE_COLORS[b.source])}>
                          {SOURCE_LABELS[b.source] || b.source}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          b.status === "CONFIRMED" && "bg-green-500/15 text-green-300",
                          b.status === "CHECKED_IN" && "bg-blue-500/15 text-blue-300",
                          b.status === "CHECKED_OUT" && "bg-ivory/10 text-ivory/70",
                          b.status === "CANCELLED" && "bg-red-500/15 text-red-300"
                        )}>
                          {b.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-ivory/50">
                        {loading ? "Loading…" : "No bookings found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Walk-in dialog */}
      <WalkInDialog
        open={walkinOpen}
        onClose={() => setWalkinOpen(false)}
        rooms={rooms}
        onCreated={() => { setWalkinOpen(false); load(); }}
      />

      {/* Simulate channel booking dialog */}
      <SimulateChannelDialog
        open={simOpen}
        onClose={() => setSimOpen(false)}
        rooms={rooms}
        onCreated={() => { setSimOpen(false); load(); }}
      />
    </div>
  );
}

function WalkInDialog({ open, onClose, rooms, onCreated }: any) {
  const [form, setForm] = useState({
    roomSlug: "", guestName: "", guestPhone: "", guestEmail: "",
    checkIn: "", checkOut: "", guests: 2, notes: "",
  });
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    if (!form.roomSlug || !form.guestName || !form.guestPhone || !form.checkIn || !form.checkOut) {
      toast.error("Please fill all required fields");
      return;
    }
    setCreating(true);
    try {
      const r = await createWalkIn(form);
      if (r.error) {
        toast.error(r.error);
      } else {
        toast.success(`Walk-in booking ${r.booking?.reference} created! Synced to ${r.syncResults?.success}/${r.syncResults?.totalChannels} channels.`);
        onCreated();
      }
    } catch (e) {
      toast.error("Failed to create walk-in booking");
    }
    setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-ivory">New Walk-in Booking</DialogTitle>
          <DialogDescription className="text-ivory/60">
            Creates a walk-in booking AND instantly blocks inventory on all 4 channel partners.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Room *">
            <Select value={form.roomSlug} onValueChange={(v) => setForm({ ...form, roomSlug: v })}>
              <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
              <SelectContent>
                {rooms.map((r: any) => <SelectItem key={r.slug} value={r.slug}>{r.name} — ₹{r.price}/night</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Guest Name *"><Input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="Rajesh Menon" /></Field>
            <Field label="Phone *"><Input value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} placeholder="+91 98765 43210" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in *"><Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Field>
            <Field label="Check-out *"><Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Field>
          </div>
          <Field label="Guests"><Input type="number" value={form.guests} onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) || 1 })} /></Field>
          <Field label="Notes"><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" /></Field>

          <div className="rounded-xl border border-champagne/15 bg-ink/50 p-3 text-xs text-ivory/60">
            <AlertCircle className="mb-1 h-4 w-4 text-champagne" />
            This booking will be instantly synced to <strong className="text-champagne">Booking.com, MakeMyTrip, Goibibo, and Agoda</strong> — marking the room as sold out on all platforms.
          </div>

          <button onClick={submit} disabled={creating} className="btn-luxe w-full">
            {creating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Creating & Syncing…</> : <><Check className="h-4 w-4" /> Create Walk-in & Sync All Channels</>}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SimulateChannelDialog({ open, onClose, rooms, onCreated }: any) {
  const [form, setForm] = useState({
    channelCode: "BOOKING_COM", roomSlug: "", guestName: "", guestPhone: "",
    checkIn: "", checkOut: "", guests: 2,
  });
  const [creating, setCreating] = useState(false);

  const submit = async () => {
    if (!form.roomSlug || !form.guestName || !form.guestPhone || !form.checkIn || !form.checkOut) {
      toast.error("Please fill all required fields");
      return;
    }
    setCreating(true);
    try {
      const channelBookingId = form.channelCode.slice(0, 2) + "-" + Math.random().toString(36).slice(2, 8).toUpperCase();
      const r = await simulateChannelBooking({ ...form, channelBookingId });
      if (r.error) {
        toast.error(r.error);
      } else {
        toast.success(`Booking from ${SOURCE_LABELS[form.channelCode]} received! Auto-synced to ${r.syncResults?.totalBroadcast} other channels.`);
        onCreated();
      }
    } catch (e) {
      toast.error("Failed to simulate channel booking");
    }
    setCreating(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-ivory">Simulate Channel Booking</DialogTitle>
          <DialogDescription className="text-ivory/60">
            Mimics a booking arriving from a channel partner's webhook. Tests the full sync pipeline.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Field label="Channel Partner *">
            <Select value={form.channelCode} onValueChange={(v) => setForm({ ...form, channelCode: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BOOKING_COM">Booking.com</SelectItem>
                <SelectItem value="MAKEMYTRIP">MakeMyTrip</SelectItem>
                <SelectItem value="GOIBIBO">Goibibo</SelectItem>
                <SelectItem value="AGODA">Agoda</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Room *">
            <Select value={form.roomSlug} onValueChange={(v) => setForm({ ...form, roomSlug: v })}>
              <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
              <SelectContent>
                {rooms.map((r: any) => <SelectItem key={r.slug} value={r.slug}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Guest Name *"><Input value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} placeholder="Test Guest" /></Field>
            <Field label="Phone *"><Input value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} placeholder="+91 90000 00000" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in *"><Input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} /></Field>
            <Field label="Check-out *"><Input type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} /></Field>
          </div>

          <div className="rounded-xl border border-champagne/15 bg-ink/50 p-3 text-xs text-ivory/60">
            <Building2 className="mb-1 h-4 w-4 text-champagne" />
            This simulates <strong className="text-champagne">{SOURCE_LABELS[form.channelCode]}</strong> sending us a booking via webhook. We'll auto-create the booking and broadcast BLOCK to all other channels.
          </div>

          <button onClick={submit} disabled={creating} className="btn-luxe w-full">
            {creating ? <><RefreshCw className="h-4 w-4 animate-spin" /> Processing…</> : <><Radio className="h-4 w-4" /> Simulate Inbound Booking</>}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-ivory/60">{label}</Label>
      {children}
    </div>
  );
}
