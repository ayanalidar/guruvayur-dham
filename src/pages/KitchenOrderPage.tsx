"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Utensils, Plus, Minus, ShoppingCart, Check, ChevronRight, Clock,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CATEGORIES = ["BREAKFAST", "LUNCH", "DINNER", "SNACKS", "BEVERAGES"];
const CATEGORY_LABELS: any = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACKS: "Snacks & Starters",
  BEVERAGES: "Beverages",
};

export default function KitchenOrderPage({ roomNumber: initialRoom }: { roomNumber?: string }) {
  const { navigate } = useHashRoute();
  const [roomNumber, setRoomNumber] = useState(initialRoom || "");
  const [menu, setMenu] = useState<any[]>([]);
  const [category, setCategory] = useState("BREAKFAST");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [confirmed, setConfirmed] = useState<any>(null);

  useEffect(() => {
    fetch("/api/menu", { cache: "no-store" }).then(r => r.json()).then(j => setMenu(j.items || []));
  }, []);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return item ? { ...item, qty } : null;
  }).filter(Boolean);
  const cartTotal = cartItems.reduce((s, it: any) => s + it.price * it.qty, 0);

  const updateQty = (id: string, delta: number) => {
    setCart((c) => {
      const next = (c[id] || 0) + delta;
      if (next <= 0) { const { [id]: _, ...rest } = c; return rest; }
      return { ...c, [id]: next };
    });
  };

  const placeOrder = async () => {
    if (!roomNumber || !guestName) {
      toast.error("Please enter your room number and name");
      return;
    }
    setPlacing(true);
    const r = await fetch("/api/kitchen-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomNumber, guestName, guestPhone,
        items: cartItems.map((it: any) => ({ itemId: it.id, name: it.name, qty: it.qty, price: it.price })),
        notes,
      }),
    });
    const j = await r.json();
    if (j.error) toast.error(j.error);
    else {
      setConfirmed(j);
      setCart({});
      toast.success(`Order placed! Reference: ${j.order.reference}`);
    }
    setPlacing(false);
  };

  if (confirmed) {
    return (
      <div className="animate-page-reveal min-h-[80vh] grid place-items-center bg-ink px-4 pt-20">
        <div className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-green-500/30 bg-green-500/15">
            <Check className="h-10 w-10 text-green-300" />
          </div>
          <h2 className="mt-4 font-serif text-3xl text-ivory">Order Placed!</h2>
          <p className="mt-1 text-sm text-ivory/60">Kitchen has been notified. Your order is being prepared.</p>
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-champagne/15 bg-ink-card p-5 text-left">
            <p className="text-xs uppercase tracking-wider text-ivory/50">Order Reference</p>
            <p className="font-mono text-2xl text-gold-foil">{confirmed.order.reference}</p>
            <p className="mt-2 text-sm text-ivory/70">Room {confirmed.order.roomNumber} · {confirmed.order.guestName}</p>
            <p className="mt-1 text-sm text-ivory/70">Total: <span className="font-semibold text-gold-foil">₹{confirmed.order.total}</span></p>
            <p className="mt-3 text-xs text-ivory/50">You'll get a WhatsApp notification when your food is ready.</p>
          </div>
          <button onClick={() => { setConfirmed(null); navigate("/"); }} className="btn-ghost-luxe mt-6">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow={`Room ${roomNumber || "—"} · In-Room Dining`}
        icon={Utensils}
        title={<>Order <GoldFoilText>Food</GoldFoilText></>}
        subtitle="Pure-veg kitchen. Order from your room · delivered in 20-30 min. Added to your room bill."
        crumbs={[{ label: "Home", route: "/" }, { label: "Kitchen Order" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x max-w-4xl">
          {/* Guest info */}
          <div className="card-luxe mb-6 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Room Number</label>
                <input value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="101" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Your Name</label>
                <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Rajesh Menon" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-ivory/50">Phone (optional)</label>
                <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-sm text-ivory focus:border-champagne/40 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div className="mb-6 flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cn("flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all", category === c ? "border border-champagne/30 bg-champagne/15 text-champagne" : "border border-champagne/10 text-ivory/60 hover:border-champagne/25")}>
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Menu items */}
          <div className="grid gap-3 sm:grid-cols-2">
            {menu.filter((m) => m.category === category).map((item) => (
              <div key={item.id} className="card-luxe flex items-center gap-4 p-4">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl border border-champagne/20 bg-gradient-to-br from-champagne/15 to-transparent">
                  <span className="text-lg text-green-300">🟢</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base text-ivory">{item.name}</p>
                  <p className="text-xs text-ivory/50 line-clamp-1">{item.description}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-sm font-semibold text-gold-foil">₹{item.price}</span>
                    <span className="text-[10px] text-ivory/40"><Clock className="mr-0.5 inline h-2.5 w-2.5" />{item.prepTime} min</span>
                  </div>
                </div>
                {cart[item.id] ? (
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="grid h-8 w-8 place-items-center rounded-full border border-champagne/20 text-champagne"><Minus className="h-3 w-3" /></button>
                    <span className="font-serif text-lg text-ivory">{cart[item.id]}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-full border border-champagne/20 text-champagne"><Plus className="h-3 w-3" /></button>
                  </div>
                ) : (
                  <button onClick={() => updateQty(item.id, 1)} className="grid h-8 w-8 place-items-center rounded-full bg-champagne text-ink"><Plus className="h-4 w-4" /></button>
                )}
              </div>
            ))}
          </div>

          {/* Cart */}
          {cartItems.length > 0 && (
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-2xl px-4 sm:bottom-6">
              <div className="card-luxe p-5 shadow-luxe-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-champagne" />
                    <span className="font-serif text-lg text-ivory">{cartItems.length} item{cartItems.length > 1 ? "s" : ""}</span>
                    <span className="text-xs text-ivory/50">· ₹{cartTotal}</span>
                  </div>
                  <button onClick={() => { document.getElementById("cart-details")?.scrollIntoView({ behavior: "smooth" }); }} className="text-xs text-champagne">View cart</button>
                </div>
                <div id="cart-details" className="mt-3 hidden space-y-1 border-t border-champagne/10 pt-3">
                  {cartItems.map((it: any) => (
                    <div key={it.id} className="flex justify-between text-sm">
                      <span className="text-ivory/70">{it.name} × {it.qty}</span>
                      <span className="text-ivory">₹{it.price * it.qty}</span>
                    </div>
                  ))}
                  <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions (less spicy, no onion, etc.)" className="mt-2 w-full rounded-lg border border-champagne/15 bg-ink px-3 py-2 text-xs text-ivory focus:border-champagne/40 focus:outline-none" />
                  <button onClick={placeOrder} disabled={placing || !roomNumber || !guestName} className="btn-luxe mt-3 w-full disabled:opacity-40">
                    {placing ? "Placing order…" : <>Place Order · ₹{cartTotal} <ChevronRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
