"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Disc3 } from "lucide-react";
import { SongForm } from "@/app/dashboard/components/song-form";
import { Button } from "@/components/ui/button";
import { AdminGuard } from "@/components/admin-guard";
import { useToast } from "@/hooks/use-toast";

export default function EditSongPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const songId = params?.id;
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    toast({
      title: "Thành công",
      description: "Đã thoát phiên làm việc.",
    });
    setTimeout(() => {
      router.push("/verify-password");
    }, 1000);
  };

  if (!songId) {
    return (
      <AdminGuard>
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
          <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
            <p className="text-sm text-destructive">Không tìm thấy ID bài hát.</p>
          </section>
        </main>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-[120px] animate-float" />
        </div>

        <section className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors duration-200 group">
                  <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  Quản lý
                </Button>
              </Link>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
                  <Disc3 className="h-3.5 w-3.5 text-primary" />
                </div>
                <h1 className="text-lg font-semibold">Chỉnh sửa bài hát</h1>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 rounded-xl text-muted-foreground hover:text-destructive transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>

          <SongForm mode="edit" songId={songId} onSaved={() => router.push("/dashboard")} />
        </section>
      </main>
    </AdminGuard>
  );
}
