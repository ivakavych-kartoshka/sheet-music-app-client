import Link from "next/link";
import { ArrowLeft, ExternalLink, Music2 } from "lucide-react";
import type { SongDetailData } from "@/app/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SongError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
};

// ================= HELPERS =================

async function getSong(slug: string): Promise<SongDetailData> {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is missing");
  }

  const response = await fetch(`${backendUrl}/songs/slug/${slug}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load song with slug '${slug}'`);
  }

  return (await response.json()) as SongDetailData;
}

function canPlayAudioDirectly(url: string): boolean {
  const normalized = url.toLowerCase();
  return (
    /\.(mp3|wav|ogg|m4a)(\?.*)?$/.test(normalized) ||
    normalized.includes("/video/upload/")
  );
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

// ================= PAGE =================

interface Props {
  params: Promise<{
    id: string; // This is now the slug, not the ID
  }>;
}

export default async function SongDetail({ params }: Props) {
  const { id } = await params;

  try {
    const song = await getSong(id);

    const fallbackBeatUrl = "https://www.youtube.com/watch?v=Fl933Iu7phA";
    const beatUrl = song?.audioUrl?.trim() || fallbackBeatUrl;

    const youtubeId = isYouTubeUrl(beatUrl) ? getYouTubeId(beatUrl) : null;

    const canPlayDirect = canPlayAudioDirectly(beatUrl);

    return (
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-[22rem] w-[22rem] rounded-full bg-amber-300/12 blur-3xl" />
          <div className="absolute -right-20 top-28 h-[22rem] w-[22rem] rounded-full bg-sky-300/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[16rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-200/8 blur-3xl" />
        </div>

        <section className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
          {/* Back */}
          <Link href="/" className="inline-block">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>

          {/* HEADER */}
          <Card className="mt-5 rounded-3xl border-border/60 bg-card/75 shadow-sm backdrop-blur-md sm:mt-6">
            <CardHeader className="gap-4 pb-4">
              <Badge
                variant="outline"
                className="w-fit rounded-xl px-3 py-1 text-xs sm:text-sm"
              >
                {song?.category?.trim() || "Uncategorized"}
              </Badge>

              <CardTitle className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                {song?.title?.trim() || "Untitled"}
              </CardTitle>

              {/* PLAYER */}
              <div className="space-y-3">
                {/* YOUTUBE */}
                {youtubeId ? (
                  <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                    <p className="mb-2 text-sm text-muted-foreground">
                      Beat YouTube:
                    </p>

                    <div className="aspect-video w-full overflow-hidden rounded-lg">
                      <iframe
                        className="h-full w-full"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : canPlayDirect ? (
                  /* AUDIO */
                  <div className="rounded-xl border border-border/70 bg-background/70 p-3">
                    <p className="mb-2 text-sm text-muted-foreground">Audio:</p>
                    <audio controls className="w-full">
                      <source src={beatUrl} />
                    </audio>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Link không hỗ trợ phát trực tiếp.
                  </p>
                )}

                {/* OPEN LINK */}
                <Button
                  asChild
                  variant="secondary"
                  className="gap-2 rounded-xl"
                >
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* CONTENT */}
          {song?.sections?.length ? (
            <div className="mt-6 space-y-4">
              {song.sections.map((section, index) => (
                <Card key={index} className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>
                      {section.title || `Section ${index + 1}`}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {section.lines && section.lines.length > 0 ? (
                      section.lines.map((line, i) => (
                        <div
                          key={i}
                          className="p-4 border rounded-xl bg-background/80 shadow-sm"
                        >
                          <div className="flex items-start gap-2">
                            <Music2 className="w-4 h-4 mt-1 text-primary" />

                            <div className="flex-1">
                              <p className="font-bold text-base">
                                {line.notes?.trim() || "No notes"}
                              </p>

                              {line.lyric?.trim() && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {line.lyric.trim()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">
                        Không có dữ liệu
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-muted-foreground">Không có lời bài hát</p>
          )}
        </section>
      </main>
    );
  } catch (error: unknown) {
    const typedError = error as SongError;

    return (
      <main className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <CardTitle>Error loading song</CardTitle>
          <p>{typedError.message}</p>

          <Link href="/">
            <Button className="mt-4">Back</Button>
          </Link>
        </Card>
      </main>
    );
  }
}
