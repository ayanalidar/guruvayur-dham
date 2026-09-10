"use client";

import { motion } from "framer-motion";
import { Camera, MapPin, Info, Upload, AlertCircle } from "lucide-react";
import { useHashRoute } from "@/lib/router";
import PageHeader from "@/components/site/PageHeader";
import { GoldFoilText, MagneticButton, SectionHeader } from "@/components/site/visuals";
import VirtualTourViewer, { type TourScene } from "@/components/site/VirtualTourViewer";

// Demo scenes · uses regular photos as 360° placeholders.
// In production, replace these URLs with real equirectangular 360° panoramas (2:1 aspect ratio).
// The viewer will still work with regular photos (just no actual 360° rotation), but
// for a true VR experience you need 360° photos shot with a specialized camera or app.
const DEMO_SCENES: TourScene[] = [
  {
    id: "deluxe-room",
    title: "Deluxe AC Room",
    panorama: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=2048&h=1024&fit=crop",
    preview: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=400&fit=crop",
    hotspots: [
      { pitch: 0, yaw: 90, type: "scene", targetScene: "bathroom", text: "→ Bathroom" },
      { pitch: 0, yaw: -90, type: "scene", targetScene: "corridor", text: "← Corridor" },
      { pitch: -20, yaw: 0, type: "info", text: "King-size bed with premium linen" },
    ],
  },
  {
    id: "bathroom",
    title: "En-suite Bathroom",
    panorama: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=2048&h=1024&fit=crop",
    preview: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=400&fit=crop",
    hotspots: [
      { pitch: 0, yaw: 180, type: "scene", targetScene: "deluxe-room", text: "← Back to Room" },
      { pitch: -30, yaw: 0, type: "info", text: "24×7 hot water with glass shower cubicle" },
    ],
  },
  {
    id: "corridor",
    title: "Corridor & Reception",
    panorama: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=2048&h=1024&fit=crop",
    preview: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=400&fit=crop",
    hotspots: [
      { pitch: 0, yaw: 0, type: "scene", targetScene: "deluxe-room", text: "→ Deluxe Room" },
      { pitch: 0, yaw: 90, type: "scene", targetScene: "restaurant", text: "→ Restaurant" },
      { pitch: 0, yaw: -90, type: "info", text: "24×7 reception with pilgrim helpdesk" },
    ],
  },
  {
    id: "restaurant",
    title: "Pure-Veg Restaurant",
    panorama: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=2048&h=1024&fit=crop",
    preview: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=400&fit=crop",
    hotspots: [
      { pitch: 0, yaw: 180, type: "scene", targetScene: "corridor", text: "← Back to Corridor" },
      { pitch: -20, yaw: 0, type: "info", text: "Pure-veg Brahmin hotel tie-up · order to your room via QR" },
    ],
  },
];

export default function VirtualTourPage() {
  const { navigate } = useHashRoute();

  return (
    <div className="animate-page-reveal">
      <PageHeader
        eyebrow="Immersive Experience"
        icon={Camera}
        title={<>360° <GoldFoilText>Virtual Tour</GoldFoilText></>}
        subtitle="Walk through our rooms, bathrooms, corridors, and restaurant from your screen. Drag to look around, click hotspots to navigate between spaces."
        crumbs={[{ label: "Home", route: "/" }, { label: "Virtual Tour" }]}
      />

      <section className="bg-ink py-12">
        <div className="container-x">
          {/* Tour viewer */}
          <VirtualTourViewer scenes={DEMO_SCENES} className="h-[500px] sm:h-[600px]" />

          {/* Instructions */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <div className="flex items-center gap-2 text-champagne">
                <MapPin className="h-5 w-5" />
                <span className="text-xs uppercase tracking-wider">Drag to Look</span>
              </div>
              <p className="mt-2 text-sm text-ivory/70">Click and drag the image in any direction to look around the room · up, down, left, right.</p>
            </div>
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <div className="flex items-center gap-2 text-champagne">
                <Info className="h-5 w-5" />
                <span className="text-xs uppercase tracking-wider">Click Hotspots</span>
              </div>
              <p className="mt-2 text-sm text-ivory/70">Click the circular markers on the panorama to navigate between rooms and read details about each area.</p>
            </div>
            <div className="rounded-xl border border-champagne/10 bg-ink/50 p-4">
              <div className="flex items-center gap-2 text-champagne">
                <Upload className="h-5 w-5" />
                <span className="text-xs uppercase tracking-wider">Scroll to Zoom</span>
              </div>
              <p className="mt-2 text-sm text-ivory/70">Use your mouse wheel or pinch on mobile to zoom in and inspect details like linen quality, fixtures, and finishes.</p>
            </div>
          </div>

          {/* Demo notice */}
          <div className="mt-6 rounded-xl border border-champagne/15 bg-ink/50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-champagne" />
              <div>
                <p className="text-sm font-semibold text-ivory">About This Demo</p>
                <p className="mt-1 text-xs text-ivory/60">
                  This virtual tour uses regular photos as placeholders. For a true 360° VR experience, you need equirectangular panoramas (2:1 aspect ratio, 360°×180°) shot with a 360° camera (Ricoh Theta, Insta360, etc.) or a smartphone app (Google Street View, Cardboard Camera). The viewer component is fully built · just upload real 360° photos to replace the demo URLs.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 rounded-2xl border border-champagne/15 bg-ink-card p-6 text-center">
            <SectionHeader
              eyebrow="See It in Person"
              title={<>Book Your <GoldFoilText>Stay</GoldFoilText></>}
              subtitle="The virtual tour is just a preview. Experience the real comfort, devotion, and warmth of Guruvayur Dham."
            />
            <div className="mt-6 flex justify-center gap-3">
              <MagneticButton onClick={() => navigate("/book")}>Book Now</MagneticButton>
              <MagneticButton variant="ghost" onClick={() => navigate("/rooms")}>View All Rooms</MagneticButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
