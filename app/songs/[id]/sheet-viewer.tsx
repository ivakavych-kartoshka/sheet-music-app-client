import Link from "next/link";
import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";

type SheetViewerProps = {
  sheetSources: string[];
  songTitle: string;
  songSlug: string;
};

function isPdfUrl(url: string): boolean {
  const lower = url.toLowerCase();
  if (/\.pdf(\?.*)?$/i.test(lower) || lower.includes("/raw/upload/")) {
    return true;
  }

  try {
    const parsed = new URL(url);
    const format = parsed.searchParams.get("format");
    return format?.toLowerCase() === "pdf";
  } catch {
    return false;
  }
}

export default function SheetViewer({
  sheetSources,
  songTitle,
  songSlug,
}: SheetViewerProps) {
  return (
    <div className="space-y-3">
      {sheetSources.map((sheetUrl, index) => (
        <div
          key={`${sheetUrl}-${index}`}
          className="space-y-2 overflow-hidden rounded-2xl border border-border/70 bg-background p-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Trang sheet {index + 1}</p>
            <Button asChild type="button" variant="outline" size="sm" className="gap-1">
              <Link href={`/songs/${songSlug}/sheet?page=${index + 1}`}>
                <Expand className="h-3.5 w-3.5" />
                Fullscreen
              </Link>
            </Button>
          </div>
          {isPdfUrl(sheetUrl) ? (
            <iframe
              src={sheetUrl}
              title={`Sheet PDF ${index + 1}`}
              className="h-[70vh] w-full"
            />
          ) : (
            <img
              src={sheetUrl}
              alt={`Sheet nhac ${index + 1} - ${songTitle}`}
              className="h-auto w-full object-contain"
            />
          )}
        </div>
      ))}
    </div>
  );
}
