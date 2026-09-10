"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  clearUserSession,
  getStoredUser,
  isLoggedIn,
  type UserProfile,
} from "@/app/lib/api";

export default function UserMenu() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) {
      setUser(getStoredUser());
    }
  }, []);

  const initials = useMemo(() => {
    const name = user?.name?.trim() || "?";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [user]);

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="relative">
        <div className="h-9 w-9 animate-pulse-glow rounded-full border border-border/40 bg-muted/40" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link href="/verify-password" className="inline-flex">
        <Button
          variant="default"
          size="sm"
          className="gap-2 rounded-xl bg-primary hover:bg-primary/90 btn-primary-glow"
        >
          <User className="h-3.5 w-3.5" />
          Đăng nhập
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/40 bg-background/50 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10"
          aria-label="Tài khoản"
        >
          <Avatar className="h-8 w-8">
            {user.avatar ? (
              <AvatarImage src={user.avatar} alt={user.name} />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/30">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href="/profile">
            <User className="h-4 w-4" />
            Trang cá nhân
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href="/profile?tab=favorites">
            <Heart className="h-4 w-4" />
            Bài hát yêu thích
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
