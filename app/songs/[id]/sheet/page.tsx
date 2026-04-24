import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { SongDetailData } from "@/app/lib/api";
import { Button } from "@/components/ui/button";

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

function isPdfUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (/\.pdf(\?.*)?$/i.test(lower) || lower.includes("/raw/upload/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("format")?.toLowerCase() === "pdf";
  } catch {
    return false;
  }
}

function getPdfViewerUrl(url: string): string {
  const hash = "toolbar=1&navpanes=1&scrollbar=1&view=FitH";
  return url.includes("#") ? `${url}&${hash}` : `${url}#${hash}`;
}

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function SheetPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page } = await searchParams;
  const song = await getSong(id);

  const sheetSources =
    song?.sheetUrls?.map((url) => url?.trim()).filter(Boolean) ||
    (song?.sheetUrl?.trim() ? [song.sheetUrl.trim()] : []);

  if (sheetSources.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Chưa có sheet nhạc.</p>
      </main>
    );
  }

  const pageNumber = Number(page || "1");
  const safePage = Number.isFinite(pageNumber) ? pageNumber : 1;
  const currentIndex = Math.min(Math.max(1, safePage), sheetSources.length) - 1;
  const currentSheet = sheetSources[currentIndex];
  const isPdf = isPdfUrl(currentSheet);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-black/80 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm" className="gap-1">
            <Link href={`/songs/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              Quay lại bài hát
            </Link>
          </Button>
          <p className="text-sm">
            {song?.title?.trim() || "Untitled"} - Trang {currentIndex + 1}/
            {sheetSources.length}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            asChild
            variant="secondary"
            size="icon"
            disabled={currentIndex === 0}
          >
            <Link href={`/songs/${id}/sheet?page=${currentIndex}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="icon"
            disabled={currentIndex >= sheetSources.length - 1}
          >
            <Link href={`/songs/${id}/sheet?page=${currentIndex + 2}`}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-52px)] w-full overflow-auto bg-black">
        {isPdf ? (
          <iframe
            src={getPdfViewerUrl(currentSheet)}
            title="Sheet PDF"
            className="h-full w-full"
          />
        ) : (
          <img
            src={currentSheet}
            alt="Sheet nhạc"
            className="block h-auto w-full"
          />
        )}
      </div>
    </main>
  );
}
