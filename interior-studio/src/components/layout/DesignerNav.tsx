"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function DesignerNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const links = [
    { href: "/designer/dashboard", label: "Dashboard" },
    { href: "/designer/projects", label: "Projects" },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ backgroundColor: "#FAF8F5", borderColor: "#E0DCD6" }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/designer/dashboard"
          className="text-lg font-light tracking-widest"
          style={{ fontFamily: "var(--font-serif)", color: "#1A1A1A" }}
        >
          Nooks <span style={{ color: "#8B7355" }}>&amp; Nest</span>
        </Link>

        <nav className="flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs tracking-widest uppercase transition-colors"
              style={{
                color: pathname.startsWith(link.href) ? "#8B7355" : "#7A7A7A",
              }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="text-xs tracking-widest uppercase transition-colors"
            style={{ color: "#7A7A7A" }}
          >
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  );
}
