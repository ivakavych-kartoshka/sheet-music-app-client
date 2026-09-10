import Link from "next/link";
import { ArrowLeft, Music2, BookOpen } from "lucide-react";
import type { SongDetailData } from "@/app/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AudioPlayer from "./audio-player";
import SheetViewer from "./sheet-viewer";
import FavoriteButton from "@/components/favorite-button";
import SiteHeader from "@/components/site-header";

type SongError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
};

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

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function SongDetail({ params }: Props) {
  const { id } = await params;

  try {
    const song = await getSong(id);

    const beatUrl = song?.audioUrl?.trim() || "";
    const sheetSources =
      song?.sheetUrls?.map((url) => url?.trim()).filter(Boolean) ||
      (song?.sheetUrl?.trim() ? [song.sheetUrl.trim()] : []);

    const youtubeId = isYouTubeUrl(beatUrl) ? getYouTubeId(beatUrl) : null;
    const canPlayDirect = canPlayAudioDirectly(beatUrl);
    const hasPlayableMedia = Boolean(youtubeId) || canPlayDirect;

    return (
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <SiteHeader />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/6 blur-[120px] animate-float" />
          <div className="absolute -right-24 top-1/4 h-[22rem] w-[22rem] rounded-full bg-chart-2/5 blur-[100px]" />
        </div>

        <section className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
          {/* Back */}
          <Link href="/" className="inline-block">
            <Button variant="ghost" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors duration-200 group">
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Quay lại
            </Button>
          </Link>

          {/* Header Card */}
          <Card className="mt-5 rounded-3xl border-border/30 bg-card/50 shadow-sm glass card-glow hero-gradient sm:mt-6 overflow-hidden animate-fade-in">
            <CardHeader className="gap-4 pb-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="rounded-lg px-2.5 py-1 text-xs font-medium bg-primary/8 text-primary border-primary/8"
                >
                  {song?.category?.trim() || "Chưa phân loại"}
                </Badge>
                <div className="flex-1" />
                <FavoriteButton songId={song?._id} />
              </div>

              <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {song?.title?.trim() || "Untitled"}
              </CardTitle>

              <div className="space-y-3">
                {hasPlayableMedia ? (
                  youtubeId ? (
                    <div className="overflow-hidden rounded-2xl border border-border/30 bg-card shadow-md">
                      <div className="aspect-video w-full overflow-hidden">
                        <iframe
                          className="h-full w-full"
                          src={`https://www.youtube.com/embed/${youtubeId}`}
                          title="YouTube player"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : (
                    <AudioPlayer src={beatUrl} />
                  )
                ) : (
                  <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-muted/20 p-3 text-sm text-muted-foreground">
                    <Music2 className="h-4 w-4" />
                    Chưa có link YouTube hoặc audio để phát
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Sheet */}
          {sheetSources.length > 0 ? (
            <Card className="mt-6 rounded-3xl border-border/30 bg-card/50 shadow-sm glass card-glow animate-slide-up" style={{ animationDelay: "100ms" }}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">
                    Sheet Nhạc
                  </CardTitle>
                  <Badge variant="secondary" className="rounded-lg text-xs bg-primary/8 text-primary border-primary/8">
                    {sheetSources.length} trang
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <SheetViewer
                  sheetSources={sheetSources}
                  songTitle={song?.title?.trim() || "Untitled"}
                  songSlug={id}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border/30 bg-muted/20 p-3 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              Chưa có sheet nhạc
            </div>
          )}

          {/* Lyrics / Notes */}
          {song?.sections?.length ? (
            <div className="mt-6 space-y-3 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
                  <Music2 className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-lg font-semibold">Lời bài hát & Nốt</h2>
              </div>

              {song.sections.map((section, index) => (
                <Card key={index} className="rounded-2xl border-border/30 bg-card/50 glass card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wider text-primary">
                      {section.title || `Section ${index + 1}`}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {section.lines && section.lines.length > 0 ? (
                      section.lines.map((line, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 rounded-xl border border-border/25 bg-background/40 p-3.5 transition-colors hover:bg-muted/20"
                        >
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/8 mt-0.5">
                            <Music2 className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm leading-relaxed text-foreground">
                              {line.notes?.trim() || "—"}
                            </p>
                            {line.lyric?.trim() && (
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                {line.lyric.trim()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground py-4 text-center">
                        Không có dữ liệu
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border/30 bg-muted/20 p-3 text-sm text-muted-foreground">
              <Music2 className="h-4 w-4" />
              Chưa có lời bài hát
            </div>
          )}
        </section>
      </main>
    );
  } catch (error: unknown) {
    const typedError = error as SongError;

    return (
      <main className="relative min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/6 blur-[120px]" />
        </div>
        <Card className="relative z-10 p-8 text-center rounded-3xl border-border/30 bg-card/60 glass card-glow max-w-md animate-scale-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
            <Music2 className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-lg font-semibold mb-2">Không thể tải bài hát</CardTitle>
          <p className="text-sm text-muted-foreground mb-6">{typedError.message}</p>
          <Link href="/">
            <Button className="rounded-xl btn-primary-glow">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại trang chủ
            </Button>
          </Link>
        </Card>
      </main>
    );
  }
}
