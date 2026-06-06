'use client';

import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import KeyFeatures from '@/components/KeyFeatures';
import Services from '@/components/Services';
import Doctors from '@/components/Doctors';
import Testimonials from '@/components/Testimonials';
import Gallery from '@/components/Gallery';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <KeyFeatures />
        <Services />
        <Doctors />
        <Testimonials />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
