"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, ChevronRight,
  ArrowLeft, KeyRound, ShieldCheck, Sparkles, Loader2, Check, Star,
  MapPin, Bell, MessageCircle,
} from "lucide-react";
import { useHashRoute } from "@/lib/router";
import { SITE, waLink } from "@/lib/site-data";
import { useContent } from "@/lib/use-cms";
import { GoldFoilText, MagneticButton } from "@/components/site/visuals";
import OAuthButtons from "@/components/site/OAuthButtons";
import { useI18n } from "@/lib/i18n/context";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "staff" | "guest";
type StaffMode = "pin" | "email";
type GuestMode = "login" | "register" | "otp";

export default function LoginPage() {
  const { navigate } = useHashRoute();
  const { t } = useI18n();
  const { get } = useContent();
  // Login page images — editable via CMS content blocks
  const loginBgImage = get(
    "login.bgImage",
    "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&h=1600&fit=crop"
  );
  const loginLogo = get("login.logo", "/logo-large.png");
  const brandName = get("site.name", "Guruvayur Dham");
  const brandTagline = get("footer.tagline", "Luxury Pilgrim Stay");
  const [tab, setTab] = useState<Tab>("guest");
  const [staffMode, setStaffMode] = useState<StaffMode>("pin");
  const [guestMode, setGuestMode] = useState<GuestMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [pin, setPin] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");

  const [guestEmail, setGuestEmail] = useState("");
  const [guestPassword, setGuestPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then(r => r.json())
      .then(j => {
        if (j.authenticated) {
          if (j.role === "GUEST") navigate("/dashboard");
          else navigate("/admin/hub");
        }
      });
  }, [navigate]);

  const handleStaffLogin = async () => {
    setLoading(true);
    try {
      const body = staffMode === "pin"
        ? { type: "pin", pin }
        : { type: "staff", email: staffEmail, password: staffPassword };
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (j.error) toast.error(j.error);
      else { toast.success(`Welcome back, ${j.user.name}!`); navigate("/admin/hub"); }
    } catch { toast.error("Login failed"); }
    setLoading(false);
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "guest", email: guestEmail, password: guestPassword }),
      });
      const j = await r.json();
      if (j.error) toast.error(j.error);
      else { toast.success(`Welcome back, ${j.user.name}!`); navigate("/dashboard"); }
    } catch { toast.error("Login failed"); }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!guestEmail) { toast.error("Enter your email first"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail }),
      });
      const j = await r.json();
      if (j.demoResetUrl) {
        toast.success("Reset link generated!");
        window.open(j.demoResetUrl, "_blank");
      } else {
        toast.success(j.message || "If the email exists, a reset link has been sent.");
      }
    } catch { toast.error("Failed to send reset link"); }
    setLoading(false);
  };

  const handleGuestRegister = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: guestName, email: guestEmail, password: guestPassword, phone: guestPhone }),
      });
      const j = await r.json();
      if (j.error) toast.error(j.error);
      else { toast.success("Account created! Welcome to Guruvayur Dham."); navigate("/dashboard"); }
    } catch { toast.error("Registration failed"); }
    setLoading(false);
  };

  const sendOtp = async () => {
    if (!otpPhone || otpPhone.length < 10) { toast.error("Enter a valid phone number"); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: otpPhone }),
      });
      const j = await r.json();
      if (j.error) toast.error(j.error);
      else { setOtpSent(true); setDemoOtp(j.otp); toast.success(`OTP sent to ${otpPhone}`); }
    } catch { toast.error("Failed to send OTP"); }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "otp", phone: otpPhone, otp }),
      });
      const j = await r.json();
      if (j.error) toast.error(j.error);
      else { toast.success(`Welcome!`); navigate("/dashboard"); }
    } catch { toast.error("OTP verification failed"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink lg:grid lg:grid-cols-2 lg:pt-0">
      {/* ===== LEFT: Brand visual (desktop only) ===== */}
      <div className="relative hidden overflow-hidden lg:block">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={loginBgImage}
            alt="Guruvayur Dham"
            className="h-full w-full object-cover photo-cinematic-strong"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={loginLogo}
              alt={brandName}
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="font-serif text-xl font-medium text-ivory">{brandName}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">{brandTagline}</p>
            </div>
          </div>

          {/* Center content */}
          <div className="max-w-md">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif text-5xl leading-[1.05] text-ivory"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
            >
              Begin Your<br />
              <span className="text-gold-foil">Sacred Journey</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-base leading-relaxed text-ivory/70"
            >
              Book luxury rooms, manage your pooja bookings, track loyalty points, and access exclusive features. All in one place.
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 space-y-3"
            >
              {[
                { icon: Star, text: "Instant booking with live availability" },
                { icon: Bell, text: "Festival alerts & darshan reminders" },
                { icon: ShieldCheck, text: "Secure payments via Razorpay" },
                { icon: MapPin, text: SITE.shortAddress },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-ivory/80">
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-champagne/20 bg-ink/50 backdrop-blur-sm">
                    <f.icon className="h-4 w-4 text-champagne" />
                  </span>
                  {f.text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom: rating + contact */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[0,1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
              </div>
              <span className="text-sm text-ivory/60">{SITE.rating} · {SITE.reviewCount}+ reviews</span>
            </div>
            <a href={`tel:${SITE.phoneRaw}`} className="text-sm text-champagne hover:text-champagne-bright">
              {SITE.phone}
            </a>
          </div>
        </div>
      </div>

      {/* ===== RIGHT: Login form ===== */}
      <div className="flex min-h-screen items-center justify-center px-4 pb-12 pt-24 lg:min-h-screen lg:pt-0">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img
              src={loginLogo}
              alt={brandName}
              className="h-12 w-12 object-contain"
            />
            <div>
              <p className="font-serif text-xl font-medium text-ivory">{brandName}</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne/70">{brandTagline}</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="mb-8 flex gap-1.5 rounded-full border border-champagne/15 bg-ink-card p-1.5">
            <button
              onClick={() => setTab("guest")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                tab === "guest" ? "bg-champagne text-ink" : "text-ivory/60 hover:text-ivory"
              )}
            >
              <UserIcon className="h-4 w-4" /> {t("login.guest")}
            </button>
            <button
              onClick={() => setTab("staff")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                tab === "staff" ? "bg-champagne text-ink" : "text-ivory/60 hover:text-ivory"
              )}
            >
              <Settings className="h-4 w-4" /> {t("login.staff")}
            </button>
          </div>

          {/* Form card */}
          <div className="card-luxe p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {/* ===== GUEST ===== */}
              {tab === "guest" && (
                <motion.div key="guest" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-6 flex gap-1 border-b border-champagne/10">
                    {[
                      { key: "login", label: "Login" },
                      { key: "register", label: "Register" },
                      { key: "otp", label: "OTP" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setGuestMode(t.key as GuestMode)}
                        className={cn(
                          "px-4 py-2 text-sm font-semibold transition-all",
                          guestMode === t.key ? "border-b-2 border-champagne text-champagne" : "text-ivory/50 hover:text-ivory"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Guest Login */}
                  {guestMode === "login" && (
                    <div className="space-y-4">
                      <Field icon={Mail} label="Email">
                        <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="rajesh@example.com" className="input-luxe" />
                      </Field>
                      <Field icon={Lock} label="Password">
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={guestPassword} onChange={(e) => setGuestPassword(e.target.value)} placeholder="••••••••" className="input-luxe pr-10" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>
                      <button onClick={handleGuestLogin} disabled={loading} className="btn-luxe w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("login.signIn")} <ChevronRight className="h-4 w-4" /></>}
                      </button>
                      <button onClick={handleForgotPassword} className="block w-full text-center text-xs text-champagne hover:text-champagne-bright">
                        {t('login.forgotPassword')}
                      </button>
                    </div>
                  )}

                  {/* Guest Register */}
                  {guestMode === "register" && (
                    <div className="space-y-4">
                      <Field icon={UserIcon} label="Full Name">
                        <input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Rajesh Menon" className="input-luxe" />
                      </Field>
                      <Field icon={Mail} label="Email">
                        <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="rajesh@example.com" className="input-luxe" />
                      </Field>
                      <Field icon={Phone} label="Phone (optional)">
                        <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91 98765 43210" className="input-luxe" />
                      </Field>
                      <Field icon={Lock} label="Password (min 6 chars)">
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={guestPassword} onChange={(e) => setGuestPassword(e.target.value)} placeholder="••••••••" className="input-luxe pr-10" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>
                      <button onClick={handleGuestRegister} disabled={loading} className="btn-luxe w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("login.createAccount")} <ChevronRight className="h-4 w-4" /></>}
                      </button>
                    </div>
                  )}

                  {/* Guest OTP */}
                  {guestMode === "otp" && (
                    <div className="space-y-4">
                      {!otpSent ? (
                        <>
                          <Field icon={Phone} label="Phone Number">
                            <input value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)} placeholder="+91 98765 43210" className="input-luxe" />
                          </Field>
                          <button onClick={sendOtp} disabled={loading} className="btn-luxe w-full">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("login.sendOtp")} <ChevronRight className="h-4 w-4" /></>}
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="rounded-lg border border-champagne/15 bg-ink/50 p-3 text-sm text-ivory/70">
                            OTP sent to <strong className="text-champagne">{otpPhone}</strong>
                            {demoOtp && <div className="mt-1 text-xs text-ivory/50">Demo OTP: <code className="text-gold-foil">{demoOtp}</code></div>}
                          </div>
                          <Field icon={KeyRound} label="Enter 4-digit OTP">
                            <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} placeholder="1234" className="input-luxe text-center text-2xl tracking-[0.5em]" />
                          </Field>
                          <button onClick={verifyOtp} disabled={loading || otp.length !== 4} className="btn-luxe w-full">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("login.verifySignIn")} <Check className="h-4 w-4" /></>}
                          </button>
                          <button onClick={() => { setOtpSent(false); setOtp(""); }} className="w-full text-center text-xs text-ivory/50 hover:text-champagne">
                            Change phone number
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* OAuth */}
                  {(guestMode === "login" || guestMode === "register") && <OAuthButtons />}
                </motion.div>
              )}

              {/* ===== STAFF ===== */}
              {tab === "staff" && (
                <motion.div key="staff" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-6 flex gap-1 border-b border-champagne/10">
                    {[
                      { key: "pin", label: "PIN Login" },
                      { key: "email", label: "Email + Password" },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setStaffMode(t.key as StaffMode)}
                        className={cn(
                          "px-4 py-2 text-sm font-semibold transition-all",
                          staffMode === t.key ? "border-b-2 border-champagne text-champagne" : "text-ivory/50 hover:text-ivory"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {staffMode === "pin" && (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-champagne/15 bg-ink/50 p-3 text-xs text-ivory/60">
                        <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-champagne" />
                        Quick login for staff. Enter your 4-digit PIN.
                      </div>
                      <Field icon={KeyRound} label="Staff PIN">
                        <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} placeholder="••••" className="input-luxe text-center text-2xl tracking-[0.5em]" />
                      </Field>
                      <button onClick={handleStaffLogin} disabled={loading || pin.length !== 4} className="btn-luxe w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("login.signIn")} <ChevronRight className="h-4 w-4" /></>}
                      </button>
                      <div className="rounded-lg border border-champagne/10 bg-ink/30 p-3 text-xs text-ivory/50">
                        <p className="mb-1 font-semibold text-ivory/70">Demo PINs:</p>
                        <p>Manager: <code className="text-gold-foil">1234</code></p>
                        <p>Receptionist: <code className="text-gold-foil">2345</code></p>
                        <p>Housekeeping: <code className="text-gold-foil">3456</code></p>
                        <p>Accountant: <code className="text-gold-foil">4567</code></p>
                      </div>
                    </div>
                  )}

                  {staffMode === "email" && (
                    <div className="space-y-4">
                      <Field icon={Mail} label="Staff Email">
                        <input type="email" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} placeholder="manager@guruvayurdham.com" className="input-luxe" />
                      </Field>
                      <Field icon={Lock} label="Password">
                        <div className="relative">
                          <input type={showPassword ? "text" : "password"} value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} placeholder="••••••••" className="input-luxe pr-10" />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/40">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>
                      <button onClick={handleStaffLogin} disabled={loading} className="btn-luxe w-full">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("login.signIn")} <ChevronRight className="h-4 w-4" /></>}
                      </button>
                      <div className="rounded-lg border border-champagne/10 bg-ink/30 p-3 text-xs text-ivory/50">
                        <p>Demo: Use any staff email + PIN as password, or <code className="text-gold-foil">admin123</code></p>
                        <p className="mt-1">e.g. <code className="text-champagne">manager@guruvayurdham.com</code> / <code className="text-gold-foil">1234</code></p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-between text-xs">
              <button onClick={() => navigate("/")} className="text-ivory/50 hover:text-champagne">
                <ArrowLeft className="mr-1 inline h-3 w-3" /> {t('login.backHome')}
              </button>
              <span className="text-ivory/40">{t('login.secure')}</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-ivory/40">
            <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Secure</span>
            <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Fast</span>
          </div>

          {/* GuardianX credit */}
          <p className="mt-6 text-center text-[10px] text-ivory/30">
            Made And Maintained By:{" "}
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-champagne/50 transition-colors hover:text-champagne"
            >
              GuardianX
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        :global(.input-luxe) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(212, 196, 168, 0.15);
          background: rgba(15, 10, 8, 0.5);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #F5EFE6;
          outline: none;
          transition: border-color 0.2s;
        }
        :global(.input-luxe::placeholder) { color: rgba(168, 155, 140, 0.5); }
        :global(.input-luxe:focus) { border-color: rgba(212, 196, 168, 0.4); }
      `}</style>
    </div>
  );
}

function Field({ icon: Icon, label, children }: any) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-ivory/50">
        <Icon className="h-3 w-3" /> {label}
      </label>
      {children}
    </div>
  );
}
