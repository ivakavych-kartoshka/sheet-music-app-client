"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Music2, ArrowUpRight, Library, Waves } from "lucide-react";
import { getSongs } from "./lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Song = {
  _id: string;
  title: string;
  category?: string;
};

function LoadingCard() {
  return (
    <Card className="h-full overflow-hidden border-border/60 bg-card/60 backdrop-blur">
      <div className="h-36 animate-pulse bg-muted/60 sm:h-40" />
      <CardHeader className="pb-2">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted/70" />
      </CardHeader>
      <CardContent>
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted/70" />
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const ITEMS_PER_PAGE = 9;
  const [songs, setSongs] = useState<Song[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("ENV:", process.env.NEXT_PUBLIC_API_URL);
    getSongs()
      .then((data: Song[]) => setSongs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(songs.map((song) => song.category?.trim() || "Uncategorized")),
    ).sort((a, b) => a.localeCompare(b));

    return ["Tất cả", ...uniqueCategories];
  }, [songs]);

  const filteredSongs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return songs.filter((song) => {
      const songCategory = song.category?.trim() || "Uncategorized";
      const keywordMatches = normalizedKeyword
        ? song.title.toLowerCase().includes(normalizedKeyword)
        : true;
      const categoryMatches =
        selectedCategory === "Tất cả" || songCategory === selectedCategory;

      return keywordMatches && categoryMatches;
    });
  }, [songs, keyword, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSongs.length / ITEMS_PER_PAGE),
  );

  const paginatedSongs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSongs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSongs, currentPage, ITEMS_PER_PAGE]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, selectedCategory]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-0 h-[24rem] w-[24rem] rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute -right-24 top-32 h-[22rem] w-[22rem] rounded-full bg-sky-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-[18rem] w-[32rem] -translate-x-1/2 rounded-full bg-emerald-200/8 blur-3xl" />
      </div>

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        <header className="rounded-3xl border border-border/60 bg-card/70 p-5 shadow-sm backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Sheet Music Library
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
              <Badge
                variant="outline"
                className="h-auto justify-start gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm"
              >
                <Library className="h-3.5 w-3.5" />
                {songs.length} bài nhạc
              </Badge>
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="song-search" className="sr-only">
              Tìm kiếm bài hát
            </label>
            <div className="group relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
              <Input
                id="song-search"
                placeholder="Tìm theo tên bài hát..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-11 rounded-xl border-border/70 bg-background/80 pl-11 text-sm sm:h-12 sm:text-base"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = selectedCategory === category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors sm:text-sm ${
                      isActive
                        ? "border-foreground/40 bg-foreground text-background"
                        : "border-border/70 bg-background/70 text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        <div className="mt-8 sm:mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} />
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur sm:p-12">
              <Music2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
                Không tìm thấy bài hát
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Thử lại từ khóa hoặc kiểm tra tên bài hát khác.
              </p>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {paginatedSongs.map((song) => (
                <Link
                  key={song._id}
                  href={`/songs/${song._id}`}
                  className="group block"
                >
                  <Card className="h-full rounded-2xl border-border/60 bg-card/75 transition-transform duration-300 hover:-translate-y-1 hover:border-foreground/25 hover:shadow-lg">
                    <CardHeader className="pb-2">
                      <div className="mb-1">
                        <Badge
                          variant="secondary"
                          className="rounded-lg px-2 py-1 text-[11px]"
                        >
                          {song.category?.trim() || "Uncategorized"}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-2 text-base font-semibold sm:text-lg">
                        {song.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Xem chi tiết</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!loading && filteredSongs.length > 0 && (
            <Pagination className="mt-6 sm:mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text="Trước"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                      }
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;

                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text="Sau"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage((prev) => prev + 1);
                      }
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </section>
    </main>
  );
}
