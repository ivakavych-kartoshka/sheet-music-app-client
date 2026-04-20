import axios from "axios";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Music2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SongLine = {
  lyric?: string;
  notes?: string;
};

type SongSection = {
  title?: string;
  lines?: SongLine[];
};

type SongDetailData = {
  title?: string;
  category?: string;
  audioUrl?: string;
  sections?: SongSection[];
};

type SongError = {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
  message?: string;
};

async function getSong(id: string): Promise<SongDetailData> {
  console.log("ENV:", process.env.NEXT_PUBLIC_API_URL);
  const res = await axios.get(
    `https://sheet-music-app-npoe.onrender.com/songs/${id}`,
    { timeout: 10000 },
  );

  return res.data;
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
    const fallbackBeatUrl = "https://www.youtube.com/watch?v=Fl933Iu7phA";
    const beatUrl = song?.audioUrl?.trim() || fallbackBeatUrl;

    return (
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-[22rem] w-[22rem] rounded-full bg-amber-300/12 blur-3xl" />
          <div className="absolute -right-20 top-28 h-[22rem] w-[22rem] rounded-full bg-sky-300/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[16rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-200/8 blur-3xl" />
        </div>

        <section className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
          <Link href="/" className="inline-block">
            <Button variant="outline" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              Back to songs
            </Button>
          </Link>

          <Card className="mt-5 rounded-3xl border-border/60 bg-card/75 shadow-sm backdrop-blur-md sm:mt-6">
            <CardHeader className="gap-4 pb-4">
              <Badge
                variant="outline"
                className="w-fit rounded-xl px-3 py-1 text-xs sm:text-sm"
              >
                {song?.category?.trim() || "Uncategorized"}
              </Badge>
              <CardTitle className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                {song?.title?.trim() || "Untitled"}
              </CardTitle>

              <div>
                <Button
                  asChild
                  variant="secondary"
                  className="mt-1 gap-2 rounded-xl"
                >
                  <a href={beatUrl} target="_blank" rel="noopener noreferrer">
                    Xem beat
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
          </Card>

          {song?.sections && song.sections.length > 0 ? (
            <div className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
              {song.sections.map((section, index) => (
                <Card
                  key={index}
                  className="rounded-2xl border-border/60 bg-card/75 shadow-sm transition-colors hover:border-foreground/20"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold sm:text-xl">
                      {section?.title?.trim() || `Section ${index + 1}`}
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {section?.lines && section.lines.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {section.lines.map((line, lineIndex) => (
                          <div
                            key={lineIndex}
                            className="rounded-xl border border-border/70 bg-background/70 p-4"
                          >
                            <p className="text-sm leading-relaxed text-foreground sm:text-base">
                              {line?.lyric?.trim() || "-"}
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
                              <Music2 className="h-3.5 w-3.5" />
                              {line?.notes?.trim() || "No notes"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="py-4 text-sm text-muted-foreground sm:text-base">
                        No lyrics available.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-6 rounded-2xl border-border/60 bg-card/75 shadow-sm sm:mt-8">
              <CardContent className="py-10 text-center sm:py-14">
                <p className="text-sm text-muted-foreground sm:text-base">
                  No sections available for this song.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    );
  } catch (error: unknown) {
    const typedError = error as SongError;

    return (
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <section className="mx-auto flex min-h-screen w-full max-w-2xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <Card className="w-full rounded-2xl border-destructive/25 bg-card/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-destructive sm:text-2xl">
                Error loading song
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm sm:text-base">
              <div>
                <p className="font-semibold text-muted-foreground">
                  Status code
                </p>
                <p>{typedError.response?.status || "Unknown"}</p>
              </div>

              <div>
                <p className="font-semibold text-muted-foreground">Message</p>
                <p>
                  {typedError.response?.data?.message ||
                    typedError.message ||
                    "Unknown error"}
                </p>
              </div>

              <Link href="/" className="block pt-1">
                <Button className="w-full">Back to songs</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }
}
