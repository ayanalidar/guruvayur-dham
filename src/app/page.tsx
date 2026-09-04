import Navbar from "@/components/site/Navbar";
import Hero from "@/components/site/Hero";
import WhyChooseUs from "@/components/site/WhyChooseUs";
import Rooms from "@/components/site/Rooms";
import PlanYourDarshan from "@/components/site/PlanYourDarshan";
import PoojaSection from "@/components/site/PoojaSection";
import Testimonials from "@/components/site/Testimonials";
import AboutSection from "@/components/site/AboutSection";
import Gallery from "@/components/site/Gallery";
import EventsSection from "@/components/site/EventsSection";
import BlogSection from "@/components/site/BlogSection";
import FAQ from "@/components/site/FAQ";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";
import FloatingActions from "@/components/site/FloatingActions";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pb-16 sm:pb-0">
        <Hero />
        <WhyChooseUs />
        <Rooms />
        <PlanYourDarshan />
        <PoojaSection />
        <Testimonials />
        <AboutSection />
        <Gallery />
        <EventsSection />
        <BlogSection />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
