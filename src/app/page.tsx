"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
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

import HomePage from "@/pages/HomePage";
import RoomsPage from "@/pages/RoomsPage";
import RoomDetailPage from "@/pages/RoomDetailPage";
import PoojaPage from "@/pages/PoojaPage";
import AboutPage from "@/pages/AboutPage";
import GalleryPage from "@/pages/GalleryPage";
import EventsPage from "@/pages/EventsPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import FAQPage from "@/pages/FAQPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import GuestBookingPage from "@/pages/GuestBookingPage";
import KitchenOrderPage from "@/pages/KitchenOrderPage";
import VirtualTourPage from "@/pages/VirtualTourPage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ReviewSubmitPage from "@/pages/ReviewSubmitPage";
import InfluencerPortalPage from "@/pages/InfluencerPortalPage";
import PolicyPage from "@/pages/PolicyPage";
import SettingsPage from "@/pages/SettingsPage";
import CMSPage from "@/pages/CMSPage";
import SEOPage from "@/pages/SEOPage";
import { SEO_PAGE_SLUGS } from "@/lib/seo-pages";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminContent from "@/pages/admin/AdminContent";
import AdminRooms from "@/pages/admin/AdminRooms";
import AdminChannels from "@/pages/admin/AdminChannels";
import AdminHub from "@/pages/admin/AdminHub";

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

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // Route matching
  const renderPage = () => {
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
    if (path === "/login") return <LoginPage />;
    if (path === "/dashboard") return <DashboardPage />;
    if (path === "/review") return <ReviewSubmitPage />;
    if (path === "/influencer") return <InfluencerPortalPage />;
    if (path === "/policies") return <PolicyPage />;
    // SEO landing pages (festivals, hotels-near, darshan-timings)
    if (SEO_PAGE_SLUGS.includes(path)) return <SEOPage slug={path} />;
    if (path === "/settings") return <AdminGuard><SettingsPage /></AdminGuard>;
    if (path === "/cms") return <AdminGuard><CMSPage /></AdminGuard>;
    if (path === "/reset-password") return <LoginPage />; // handled via query param
    if (path.startsWith("/kitchen/")) {
      const room = path.replace("/kitchen/", "");
      return <KitchenOrderPage roomNumber={room} />;
    }
    if (path === "/kitchen") return <KitchenOrderPage />;
    // Admin routes · protected by AdminGuard
    if (path === "/admin") return <AdminGuard><AdminDashboard /></AdminGuard>;
    if (path === "/admin/hub") return <AdminGuard><AdminHub /></AdminGuard>;
    if (path === "/admin/bookings") return <AdminGuard><AdminBookings /></AdminGuard>;
    if (path === "/admin/content") return <AdminGuard roles={["MANAGER"]} ><AdminContent /></AdminGuard>;
    if (path === "/admin/rooms") return <AdminGuard><AdminRooms /></AdminGuard>;
    if (path === "/admin/channels") return <AdminGuard><AdminChannels /></AdminGuard>;
    return <NotFound />;
  };

  // Hide navbar/footer on login page (full-screen split layout)
  const isLoginPage = path === "/login";
  const isResetPage = path === "/reset-password";

  return (
    <>
      <AnimatePresence>{loading && <PageLoader onDone={() => setLoading(false)} />}</AnimatePresence>

      {!isLoginPage && <Navbar />}
      <main className={cn("min-h-screen", !isLoginPage && "pb-16 sm:pb-0")}>
        <AnimatePresence mode="wait">
          <div key={path}>{renderPage()}</div>
        </AnimatePresence>
      </main>
      {!isLoginPage && <Footer />}
      {!isLoginPage && <FloatingActions />}
      {!isLoginPage && <WhatsAppChat />}
      <PWAEnhancements />
      <CookieConsent />
    </>
  );
}
