"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Disc3,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  User as UserIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import UserMenu from "@/components/user-menu";
import {
  clearUserSession,
  getStoredUser,
  isLoggedIn,
  type UserProfile,
} from "@/app/lib/api";

function initialsOf(name: string) {
  const parts = (name || "?").trim().split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const NAV_LINKS = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/profile", label: "Tài khoản", icon: UserIcon },
  { href: "/profile?tab=favorites", label: "Yêu thích", icon: Heart },
  { href: "/dashboard", label: "Quản lý", icon: LayoutDashboard },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/songs");
  }
  if (href === "/profile") {
    return pathname === "/profile";
  }
  if (href === "/profile?tab=favorites") {
    return pathname === "/profile";
  }
  return pathname.startsWith(href);
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn()) {
      setUser(getStoredUser());
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isAdmin = user?.role === "admin";
  const visibleLinks = NAV_LINKS.filter(
    (link) => link.href !== "/dashboard" || isAdmin,
  );

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/70 glass-strong">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 transition-all duration-200 group-hover:bg-primary/15 group-hover:shadow-sm group-hover:shadow-primary/10">
            <Disc3 className="h-5 w-5 text-primary" />
          </span>
          <span className="text-base font-bold tracking-tight">
            Thư Viện{" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              FTC
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle compact />
          <div className="hidden md:block">
            <UserMenu />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground md:hidden transition-colors duration-200"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Mở menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/30 bg-background/90 glass-strong md:hidden animate-slide-down">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-1">
              {visibleLinks.map((link) => {
                const active = isActive(pathname, link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 border-t border-border/30 pt-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border/40">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {initialsOf(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors duration-200"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Link href="/verify-password" className="block">
                  <Button
                    variant="default"
                    className="w-full gap-2 rounded-xl bg-primary hover:bg-primary/90 btn-primary-glow"
                  >
                    <UserIcon className="h-4 w-4" />
                    Đăng nhập
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
