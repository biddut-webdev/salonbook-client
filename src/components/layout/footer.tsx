import Link from "next/link";
import { Clock, Mail, MapPin, Phone, Scissors } from "lucide-react";

// Important navigation links shown in the footer.
const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sign-in", label: "Sign In" },
];

// Placeholder social links — replace with the salon's real profiles.
const socialLinks = [
  { href: "https://facebook.com", label: "Facebook" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://x.com", label: "X (Twitter)" },
  { href: "https://youtube.com", label: "YouTube" },
];

// The footer is a Server Component: it has no state or event handlers,
// so it does not need "use client" and adds no JavaScript for the browser.
export default function Footer() {
  return (
    <footer className="mt-auto bg-neutral-900 text-neutral-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Logo + short description */}
        <div>
          <Link href="/" className="flex items-center gap-2 text-white">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Scissors className="size-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">SalonBook</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
            Book salon appointments online with ease. Explore our services and
            reserve your seat at the salon — no waiting, no phone calls.
          </p>
        </div>

        {/* Important navigation links */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact information */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Contact Us
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>123 Gulshan Avenue, Dhaka 1212, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              <a href="tel:+8801712345678" className="hover:text-white">
                +880 1712-345678
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              <a href="mailto:hello@salonbook.com" className="hover:text-white">
                hello@salonbook.com
              </a>
            </li>
          </ul>
        </div>

        {/* Opening hours */}
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
            Opening Hours
          </h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Saturday – Thursday
                <br />
                10:00 AM – 8:00 PM
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Friday
                <br />
                2:00 PM – 8:00 PM
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar: social links + copyright */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 text-sm text-neutral-400 sm:flex-row sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-white"
              >
                {social.label}
              </a>
            ))}
          </div>
          <p className="text-center">
            © {new Date().getFullYear()} SalonBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
