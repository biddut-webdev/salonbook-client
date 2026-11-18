import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Home page banner: title, short description, CTA and a salon-themed image.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1600&q=80"
        alt="Salon interior"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      {/* Dark overlay so the text stays readable on any screen */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 py-20 text-center text-white">
        <p className="text-sm font-medium tracking-widest text-primary-foreground/90 uppercase">
          Welcome to SalonBook
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Look Great. Feel Confident.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Book your favourite salon services online. Choose a time that suits
          you and let our expert stylists take care of the rest.
        </p>
        <Button
          size="lg"
          className="mt-8 h-11 px-6 text-base"
          nativeButton={false}
          render={<Link href="/services" />}
        >
          Explore Salon Services
        </Button>
      </div>
    </section>
  );
}
