"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { getDisplayName, getUser, logout, type UserSession } from "@/lib/auth";

export default function UserMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [user, setUserState] = useState<UserSession | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUserState(getUser());
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = getDisplayName(user);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl border border-brand-border hover:border-brand-primary/40 hover:bg-brand-background transition-all"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <User className="w-4 h-4 text-brand-primary" />
        </div>
        <div className="hidden md:block text-left max-w-[140px]">
          <p className="text-sm font-bold text-brand-navy truncate">{displayName}</p>
          <p className="text-[10px] text-brand-muted truncate">{user.email ?? user.username}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl border border-brand-border bg-white shadow-panel py-1.5 z-50"
        >
          <div className="px-4 py-3 border-b border-brand-border md:hidden">
            <p className="text-sm font-bold text-brand-navy truncate">{displayName}</p>
            <p className="text-xs text-brand-muted truncate">{user.email ?? user.username}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout();
              setOpen(false);
              window.location.href = "/login";
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
