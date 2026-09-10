"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  Mail,
  Music2,
  User as UserIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  clearUserSession,
  getFavorites,
  getMe,
  getStoredUser,
  isLoggedIn,
  type SongListItem,
  type UserProfile,
} from "@/app/lib/api";
import FavoriteButton from "@/components/favorite-button";
import SiteHeader from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/6 blur-[120px] animate-float" />
      </div>
      <section className="relative mx-auto w-full max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        <Card className="mt-5 rounded-3xl border-border/30 bg-card/50 shadow-sm glass card-glow overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Skeleton className="h-20 w-20 rounded-full shrink-0" />
              <div className="flex-1 space-y-3 w-full max-w-xs">
                <Skeleton className="h-7 w-40 rounded-lg mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-56 rounded-lg mx-auto sm:mx-0" />
              </div>
              <Skeleton className="h-10 w-28 rounded-xl shrink-0" />
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          <Skeleton className="h-9 w-48 rounded-xl" />
          <Card className="rounded-3xl border-border/30 bg-card/50 shadow-sm glass card-glow">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "favorites" ? "favorites" : "profile";

  const [user, setUser] = useState<UserProfile | null>(() =>
    typeof window === "undefined" ? null : getStoredUser(),
  );
  const [favorites, setFavorites] = useState<SongListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/verify-password");
      return;
    }

    const load = async () => {
      try {
        const me = await getMe();
        setUser(me);
        localStorage.setItem("user_info", JSON.stringify(me));
        const favs = await getFavorites();
        setFavorites(Array.isArray(favs) ? favs : []);
      } catch (error: unknown) {
        const status = (
          error as {
            response?: { status?: number };
          }
        )?.response?.status;

        if (status === 401) {
          clearUserSession();
          router.replace("/verify-password");
        } else {
          setUser(getStoredUser());
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/6 blur-[120px] animate-float" />
        <div className="absolute -right-24 top-1/4 h-[26rem] w-[26rem] rounded-full bg-chart-2/5 blur-[100px]" />
      </div>

      <section className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        {/* Profile Header Card */}
        <Card className="mt-5 rounded-3xl border-border/30 bg-card/50 shadow-sm glass card-glow hero-gradient overflow-hidden animate-fade-in">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Avatar className="h-20 w-20 border-2 border-primary/15 shadow-lg shadow-primary/10">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {initials || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {user.name || "Người dùng"}
                  </h1>
                  {user.role === "admin" && (
                    <Badge variant="secondary" className="rounded-lg text-xs bg-primary/8 text-primary border-primary/10">
                      Quản trị viên
                    </Badge>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                  <Mail className="h-4 w-4" />
                  <span>{user.email || "Chưa có email"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/50 px-4 py-2.5">
                <Heart className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  {favorites.length} yêu thích
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mt-8 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <Tabs defaultValue={initialTab}>
            <TabsList className="rounded-xl bg-card/60 border border-border/30">
              <TabsTrigger value="profile" className="gap-2 rounded-lg">
                <UserIcon className="h-4 w-4" />
                Thông tin
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 rounded-lg">
                <Heart className="h-4 w-4" />
                Yêu thích
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card className="rounded-3xl border-border/30 bg-card/50 shadow-sm glass card-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/40 px-4 py-3.5 transition-colors hover:bg-muted/20">
                    <span className="text-muted-foreground">Tên</span>
                    <span className="font-medium">{user.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/40 px-4 py-3.5 transition-colors hover:bg-muted/20">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{user.email || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/30 bg-background/40 px-4 py-3.5 transition-colors hover:bg-muted/20">
                    <span className="text-muted-foreground">Ngày tham gia</span>
                    <span className="font-medium">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "—"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="favorites" className="mt-6">
              {favorites.length === 0 ? (
                <section className="rounded-3xl border border-dashed border-border/50 bg-card/20 p-8 text-center backdrop-blur-sm sm:p-12 animate-fade-in">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
                    <Heart className="h-7 w-7 text-muted-foreground/50" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    Chưa có bài hát yêu thích
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Bấm vào trái tim trên các bài hát để lưu chúng vào danh sách
                    này.
                  </p>
                  <Link href="/" className="inline-block mt-6">
                    <Button className="gap-2 rounded-xl btn-primary-glow">
                      Khám phá bài hát
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </section>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {favorites.map((song, index) => (
                    <Link
                      key={song._id}
                      href={`/songs/${song.slug}`}
                      prefetch={false}
                      className="group block animate-slide-up"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <Card className="h-full rounded-2xl border-border/30 bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 glass card-glow hover:card-glow-hover">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge
                              variant="secondary"
                              className="rounded-lg px-2.5 py-1 text-[11px] font-medium bg-primary/8 text-primary border-primary/8"
                            >
                              {song.category?.trim() || "Chưa phân loại"}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <FavoriteButton songId={song._id} compact />
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary">
                                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </div>
                            </div>
                          </div>
                          <CardTitle className="line-clamp-2 text-base font-semibold sm:text-lg leading-snug group-hover:text-primary transition-colors duration-200">
                            {song.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-200">
                            <Music2 className="h-3 w-3" />
                            <span>Nhấn để xem chi tiết</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}
