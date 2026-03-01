import PublicNav from "@/components/layout/PublicNav";
import Hero from "@/components/public/Hero";
import About from "@/components/public/About";
import Services from "@/components/public/Services";
import Portfolio from "@/components/public/Portfolio";
import Process from "@/components/public/Process";
import Testimonials from "@/components/public/Testimonials";
import CTA from "@/components/public/CTA";
import Contact from "@/components/public/Contact";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <>
      <PublicNav />
      <main>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Process />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
