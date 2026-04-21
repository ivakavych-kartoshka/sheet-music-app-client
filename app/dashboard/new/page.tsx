"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SongForm } from "@/app/dashboard/components/song-form";
import { Button } from "@/components/ui/button";

export default function NewSongPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-block">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              Ve dashboard
            </Button>
          </Link>
        </div>

        <SongForm mode="create" onSaved={() => router.push("/dashboard")} />
      </section>
    </main>
  );
}
