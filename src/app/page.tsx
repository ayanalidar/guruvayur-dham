"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { useHashRoute } from "@/lib/router";
import { useAnalytics } from "@/lib/use-analytics";
import { useWebVitals } from "@/lib/use-web-vitals";
import { cn } from "@/lib/utils";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import FloatingActions from "@/components/site/FloatingActions";
import WhatsAppChat from "@/components/site/WhatsAppChat";
import AdminGuard from "@/components/site/AdminGuard";
import PWAEnhancements from "@/components/site/PWAEnhancements";
import CookieConsent from "@/components/site/CookieConsent";
import { PageLoader } from "@/components/site/visuals";
import FestivalBanner from "@/components/site/FestivalBanner";
import PopupCoordinator from "@/components/site/popups/PopupCoordinator";
import { SEO_PAGE_SLUGS } from "@/lib/seo-pages";

// === LAZY LOAD ALL PAGES ===
// Each page is loaded on-demand when the user navigates to it.
// This splits the JS bundle into per-page chunks instead of loading
// all 38 pages upfront (which was causing massive lag on first load).
const HomePage = lazy(() => import("@/pages/HomePage"));
const RoomsPage = lazy(() => import("@/pages/RoomsPage"));
const RoomDetailPage = lazy(() => import("@/pages/RoomDetailPage"));
const PoojaPage = lazy(() => import("@/pages/PoojaPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const GalleryPage = lazy(() => import("@/pages/GalleryPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage = lazy(() => import("@/pages/BlogPostPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const GuestBookingPage = lazy(() => import("@/pages/GuestBookingPage"));
const KitchenOrderPage = lazy(() => import("@/pages/KitchenOrderPage"));
const VirtualTourPage = lazy(() => import("@/pages/VirtualTourPage"));
const PilgrimagePlannerPage = lazy(() => import("@/pages/PilgrimagePlannerPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ReviewSubmitPage = lazy(() => import("@/pages/ReviewSubmitPage"));
const InfluencerPortalPage = lazy(() => import("@/pages/InfluencerPortalPage"));
const PolicyPage = lazy(() => import("@/pages/PolicyPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CMSPage = lazy(() => import("@/pages/CMSPage"));
const SEOPage = lazy(() => import("@/pages/SEOPage"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminBookings = lazy(() => import("@/pages/admin/AdminBookings"));
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
const AdminRooms = lazy(() => import("@/pages/admin/AdminRooms"));
const AdminChannels = lazy(() => import("@/pages/admin/AdminChannels"));
const AdminCoupons = lazy(() => import("@/pages/admin/AdminCoupons"));
const AdminPoojas = lazy(() => import("@/pages/admin/AdminPoojas"));
const AdminFAQs = lazy(() => import("@/pages/admin/AdminFAQs"));
const AdminEvents = lazy(() => import("@/pages/admin/AdminEvents"));
const AdminCheckinRegister = lazy(() => import("@/pages/admin/AdminCheckinRegister"));
const AdminHub = lazy(() => import("@/pages/admin/AdminHub"));
const AdminSystemSettings = lazy(() => import("@/pages/admin/AdminSystemSettings"));

function NotFound() {
  const { navigate } = useHashRoute();
  return (
    <div className="grid min-h-[70vh] place-items-center bg-ink px-4 pt-20">
      <div className="text-center">
        <p className="font-serif text-7xl text-gold-foil">404</p>
        <p className="mt-3 font-serif text-2xl text-ivory">Page Not Found</p>
        <p className="mt-2 text-sm text-ivory/60">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")} className="btn-luxe mt-6">
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { path } = useHashRoute();
  const { trackEvent } = useAnalytics();
  useWebVitals();
  const [loading, setLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const checkMaintenance = () => {
      fetch("/api/maintenance/mode", { cache: "no-store" })
        .then(r => r.ok ? r.json() : null)
        .then(j => {
          if (j && j.enabled === true) setMaintenanceMode(true);
          else setMaintenanceMode(false);
        })
        .catch(() => setMaintenanceMode(false));
    };
    checkMaintenance();
    const interval = setInterval(checkMaintenance, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    const isAdminRoute = path.startsWith("/admin") || path === "/login" || path === "/reset-password" || path === "/cms" || path === "/settings";
    if (maintenanceMode && !isAdminRoute) return <MaintenancePage />;
    if (path === "/" || path === "") return <HomePage />;
    if (path === "/rooms") return <RoomsPage />;
    if (path.startsWith("/rooms/")) {
      const slug = path.replace("/rooms/", "");
      return <RoomDetailPage slug={slug} />;
    }
    if (path === "/pooja") return <PoojaPage />;
    if (path === "/about") return <AboutPage />;
    if (path === "/gallery") return <GalleryPage />;
    if (path === "/events") return <EventsPage />;
    if (path === "/blog") return <BlogPage />;
    if (path.startsWith("/blog/")) {
      const slug = path.replace("/blog/", "");
      return <BlogPostPage slug={slug} />;
    }
    if (path === "/faq") return <FAQPage />;
    if (path === "/contact") return <ContactPage />;
    if (path === "/privacy") return <PrivacyPage />;
    if (path === "/terms") return <TermsPage />;
    if (path === "/book") return <GuestBookingPage />;
    if (path === "/tour") return <VirtualTourPage />;
    if (path === "/planner") return <PilgrimagePlannerPage />;
    if (path === "/login") return <LoginPage />;
    if (path === "/dashboard") return <DashboardPage />;
    if (path === "/review") return <ReviewSubmitPage />;
    if (path === "/influencer") return <InfluencerPortalPage />;
    if (path === "/policies") return <PolicyPage />;
    if (SEO_PAGE_SLUGS.includes(path.replace(/^\//, ""))) return <SEOPage slug={path.replace(/^\//, "")} />;
    if (path === "/settings") return <AdminGuard><SettingsPage /></AdminGuard>;
    if (path === "/cms") return <AdminGuard><CMSPage /></AdminGuard>;
    if (path === "/reset-password") return <LoginPage />;
    if (path.startsWith("/kitchen/")) {
      const room = path.replace("/kitchen/", "");
      return <KitchenOrderPage roomNumber={room} />;
    }
    if (path === "/kitchen") return <KitchenOrderPage />;
    if (path === "/admin") return <AdminGuard><AdminDashboard /></AdminGuard>;
    if (path === "/admin/hub") return <AdminGuard><AdminHub /></AdminGuard>;
    if (path === "/admin/system") return <AdminGuard><AdminSystemSettings /></AdminGuard>;
    if (path === "/admin/bookings") return <AdminGuard><AdminBookings /></AdminGuard>;
    if (path === "/admin/content") return <AdminGuard roles={["MANAGER"]} ><AdminContent /></AdminGuard>;
    if (path === "/admin/rooms") return <AdminGuard><AdminRooms /></AdminGuard>;
    if (path === "/admin/channels") return <AdminGuard><AdminChannels /></AdminGuard>;
    if (path === "/admin/coupons") return <AdminGuard><AdminCoupons /></AdminGuard>;
    if (path === "/admin/poojas") return <AdminGuard><AdminPoojas /></AdminGuard>;
    if (path === "/admin/faqs") return <AdminGuard><AdminFAQs /></AdminGuard>;
    if (path === "/admin/events") return <AdminGuard><AdminEvents /></AdminGuard>;
    if (path === "/admin/checkin-register") return <AdminGuard><AdminCheckinRegister /></AdminGuard>;
    return <NotFound />;
  };

  const isLoginPage = path === "/login";
  const isResetPage = path === "/reset-password";

  return (
    <>
      <Suspense fallback={<PageLoader onDone={() => setLoading(false)} />}>
        {!isLoginPage && !isResetPage && <FestivalBanner />}
        {!isLoginPage && <Navbar />}
        <main className={cn("min-h-screen", !isLoginPage && "pb-16 sm:pb-0")}>
          {renderPage()}
        </main>
        {!isLoginPage && <Footer />}
        {!isLoginPage && <FloatingActions />}
        {!isLoginPage && <WhatsAppChat />}
        <PWAEnhancements />
        <CookieConsent />
        <PopupCoordinator />
      </Suspense>
    </>
  );
}
