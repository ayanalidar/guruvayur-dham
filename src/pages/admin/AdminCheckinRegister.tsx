"use client";
import { useEffect, useState } from "react";
import { FileText, RefreshCw, Save, Download, Check, X } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText } from "@/components/site/visuals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ID_TYPES = ["Aadhaar Card", "Passport", "Driving License", "PAN Card", "Voter ID", "Other"];

export default function AdminCheckinRegister() {
  const { navigate } = useHashRoute();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ idType: "", idNumber: "", nationality: "Indian", arrivalFrom: "", departureTo: "", vehicleNumber: "", companions: 0 });

  const load = () => {
    setLoading(true);
    fetch("/api/admin/checkin-register", { cache: "no-store" })
      .then(r => r.json())
      .then(j => { setRecords(j.records || []); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const startEdit = (r: any) => {
    setEditing(r.reference);
    setForm({
      idType: r.idType || "Aadhaar Card",
      idNumber: r.idNumber || "",
      nationality: r.nationality || "Indian",
      arrivalFrom: r.arrivalFrom || "",
      departureTo: r.departureTo || "",
      vehicleNumber: r.vehicleNumber || "",
      companions: r.companions || 0,
    });
  };

  const save = async (record: any) => {
    // Find booking ID from the record (we need the booking ID, not the reference)
    // The API returns reference but needs bookingId. Let's get it from the record.
    try {
      const r = await fetch("/api/admin/checkin-register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: record.reference, ...form }),
      });
      const j = await r.json();
      if (j.ok) {
        toast.success("Check-in register updated");
        setEditing(null);
        load();
      } else {
        toast.error(j.error || "Failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const exportCSV = () => {
    window.location.href = "/api/admin/checkin-register?export=csv";
  };

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Admin"
        icon={FileText}
        title={<>Check-in <GoldFoilText>Register</GoldFoilText></>}
        subtitle="Digital guest register for police/FRRO compliance. Capture guest ID details at check-in. Export as CSV for police submission."
        crumbs={[{ label: "Home", route: "/" }, { label: "Admin", route: "/admin" }, { label: "Check-in Register" }]}
      />
      <section className="bg-ink py-12">
        <div className="container-x">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-ivory/60">{records.length} checked-in guests</p>
              <p className="mt-1 text-xs text-ivory/40">
                {records.filter(r => r.registerComplete).length} complete ·
                {" "}{records.filter(r => !r.registerComplete).length} pending ID details
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={load} className="grid h-10 w-10 place-items-center rounded-full border border-champagne/20 text-champagne hover:bg-champagne/10">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
              <button onClick={exportCSV} className="btn-luxe">
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {records.map((r) => (
              <div key={r.reference} className="card-luxe p-4">
                {/* Summary row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-8 w-8 place-items-center rounded-full ${r.registerComplete ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}>
                      {r.registerComplete ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-serif text-sm text-ivory">{r.guestName}</p>
                        <span className="font-mono text-[10px] text-champagne">{r.reference}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-ivory/50">
                        {r.roomName} {r.roomNumber && `· Room ${r.roomNumber}`} · {r.checkIn} → {r.checkOut} · {r.nights}n · {r.guests} guests
                      </p>
                    </div>
                  </div>
                  <button onClick={() => editing === r.reference ? setEditing(null) : startEdit(r)} className="rounded-lg border border-champagne/20 px-3 py-1.5 text-xs font-semibold text-champagne hover:bg-champagne/10">
                    {r.registerComplete ? "Edit" : "Add Details"}
                  </button>
                </div>

                {/* Edit form */}
                {editing === r.reference && (
                  <div className="mt-4 space-y-3 border-t border-champagne/10 pt-4">
                    {/* Current register data (if any) */}
                    {r.registerComplete && (
                      <div className="grid grid-cols-2 gap-2 text-xs text-ivory/60 sm:grid-cols-4">
                        <div><span className="text-ivory/40">ID Type:</span> {r.idType}</div>
                        <div><span className="text-ivory/40">ID Number:</span> {r.idNumber}</div>
                        <div><span className="text-ivory/40">Nationality:</span> {r.nationality}</div>
                        <div><span className="text-ivory/40">Arrival From:</span> {r.arrivalFrom}</div>
                        <div><span className="text-ivory/40">Departure To:</span> {r.departureTo}</div>
                        <div><span className="text-ivory/40">Vehicle:</span> {r.vehicleNumber || "—"}</div>
                        <div><span className="text-ivory/40">Companions:</span> {r.companions}</div>
                      </div>
                    )}
                    {/* Form fields */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-[10px] uppercase text-ivory/50">ID Type</Label>
                        <select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })}
                          className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory">
                          {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-ivory/50">ID Number</Label>
                        <Input value={form.idNumber} onChange={e => setForm({ ...form, idNumber: e.target.value })} placeholder="XXXX XXXX XXXX" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-ivory/50">Nationality</Label>
                        <Input value={form.nationality} onChange={e => setForm({ ...form, nationality: e.target.value })} placeholder="Indian" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-ivory/50">Arrival From (city)</Label>
                        <Input value={form.arrivalFrom} onChange={e => setForm({ ...form, arrivalFrom: e.target.value })} placeholder="Delhi" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-ivory/50">Departure To (city)</Label>
                        <Input value={form.departureTo} onChange={e => setForm({ ...form, departureTo: e.target.value })} placeholder="Agra" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-ivory/50">Vehicle Number</Label>
                        <Input value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="UP 78 AB 1234" />
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase text-ivory/50">Companions</Label>
                        <Input type="number" value={form.companions} onChange={e => setForm({ ...form, companions: parseInt(e.target.value) || 0 })} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(null)} className="btn-ghost-luxe">Cancel</button>
                      <button onClick={() => save(r)} className="btn-luxe"><Save className="h-4 w-4" /> Save Register</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {records.length === 0 && (
              <div className="card-luxe p-12 text-center text-ivory/50">
                {loading ? "Loading..." : "No checked-in guests yet. Check in a guest from the reservation calendar to see them here."}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
