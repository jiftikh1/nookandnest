import PublicNav from "@/components/layout/PublicNav";
import Hero from "@/components/public/Hero";
import About from "@/components/public/About";
import Services from "@/components/public/Services";
import Portfolio from "@/components/public/Portfolio";
import Process from "@/components/public/Process";
import Testimonials from "@/components/public/Testimonials";
import CTA from "@/components/public/CTA";
import Contact from "@/components/public/Contact";
import SectionBreak from "@/components/public/SectionBreak";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="plaster-wall">
      <PublicNav />
      <main>
        <Hero />
        <SectionBreak
          src="/hero-dining.jpg"
          alt="Dining room interior"
          eyebrow="A space remembers"
          quote="Design is how a room learns to hold you."
          height="440px"
          objectPosition="center 60%"
        />
        <About />
        <Services />
        <SectionBreak
          src="/images/bedroom-mirror.jpg"
          alt="Interior vignette"
          eyebrow="In practice"
          height="360px"
        />
        <Portfolio />
        <Process />
        <Testimonials />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
