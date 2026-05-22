"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import UserMenu from "@/components/UserMenu";
import { LayoutGrid, LogIn, UserPlus, LayoutDashboard } from "lucide-react";

const publicLinks = [
  { name: "Explore CattlePro", href: "/", icon: LayoutGrid },
  { name: "Login", href: "/login", icon: LogIn },
  { name: "Register", href: "/register", icon: UserPlus },
];

const authLinks = [
  { name: "Explore CattlePro", href: "/", icon: LayoutGrid },
];

export default function Navbar() {
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getUser()?.username ?? null);
  }, [pathname]);

  return (
    <>
      <div className="bg-brand-navy text-white text-[11px] py-2 px-6 text-center tracking-widest uppercase font-medium">
        Enterprise Animal ERP · Pakistan · FBR Compliant · 14-Day Free Trial
      </div>
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border shadow-sm h-[72px] flex items-center">
        <div className="max-w-7xl w-full mx-auto px-6 sm:px-10 flex justify-between items-center">
          <a href="https://animalcare360.com" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image src="/user-icon.png" alt="AnimalCare360 Logo" fill className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-tight text-brand-navy block leading-none">
                AnimalCare<span className="text-brand-primary">360</span>
              </span>
              <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                Business Portal
              </span>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-6">
            {(username ? authLinks : publicLinks).map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`hidden sm:flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-lg transition-all ${
                    active
                      ? "text-brand-primary bg-green-50"
                      : "text-brand-muted hover:text-brand-navy hover:bg-brand-background"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}

            {username ? (
              <div className="pl-3 border-l border-brand-border">
                <UserMenu />
              </div>
            ) : (
              <Link href="/login" className="btn-primary !py-2.5 !px-5 sm:!px-6 text-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
