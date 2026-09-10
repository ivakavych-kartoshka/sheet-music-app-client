"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Music2,
  ArrowUpRight,
  Library,
  ArrowUp,
  Disc3,
} from "lucide-react";
import { getSongCategories, getSongs, type SongListItem } from "./lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import FavoriteButton from "@/components/favorite-button";
import SiteHeader from "@/components/site-header";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

function LoadingCard({ index }: { index: number }) {
  return (
    <div
      className="h-full rounded-2xl border border-border/30 bg-card/50 glass p-5 space-y-4 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-3/4 rounded-lg" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
  );
}

export default function Home() {
  const ITEMS_PER_PAGE = 9;
  const [songs, setSongs] = useState<SongListItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tất cả"]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [keyword]);

  useEffect(() => {
    let mounted = true;

    getSongCategories()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) {
          return;
        }

        setCategories(["Tất cả", ...data]);
      })
      .catch(() => {
        if (mounted) {
          setCategories(["Tất cả"]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    getSongs({
      search: debouncedKeyword || undefined,
      category: selectedCategory === "Tất cả" ? undefined : selectedCategory,
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    })
      .then((data) => {
        if (!mounted) {
          return;
        }

        const nextTotalPages = Math.max(1, data.totalPages || 1);

        setSongs(Array.isArray(data.items) ? data.items : []);
        setTotalSongs(data.total || 0);
        setTotalPages(nextTotalPages);

        if (currentPage > nextTotalPages) {
          setCurrentPage(nextTotalPages);
        }
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setSongs([]);
        setTotalSongs(0);
        setTotalPages(1);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [debouncedKeyword, selectedCategory, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, selectedCategory]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages: Array<number | string> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) {
      pages.push("start-ellipsis");
    }

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    if (end < totalPages - 1) {
      pages.push("end-ellipsis");
    }

    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <SiteHeader />

      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/6 blur-[120px] animate-float" />
        <div className="absolute -right-24 top-1/4 h-[26rem] w-[26rem] rounded-full bg-chart-2/5 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[22rem] w-[30rem] -translate-x-1/2 rounded-full bg-chart-3/4 blur-[100px]" />
      </div>

      <section className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
        {/* Hero Header */}
        <header className="overflow-hidden rounded-3xl border border-border/30 bg-card/50 shadow-sm glass animate-fade-in hero-gradient">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-primary/10 border border-primary/15">
                    <Disc3 className="h-5 w-5 text-primary" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1 text-xs font-medium bg-primary/8 text-primary border-primary/10"
                  >
                    <Library className="h-3 w-3 mr-1.5" />
                    {totalSongs} bài nhạc
                  </Badge>
                </div>
                <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  <span className="text-gradient">Thư Viện</span>{" "}
                  <span className="text-foreground">FTC</span>
                </h1>
                <p className="mt-3 text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Kho nhạc của clb FTC — tìm kiếm, nghe và luyện tập mọi lúc mọi nơi
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6">
              <label htmlFor="song-search" className="sr-only">
                Tìm kiếm bài hát
              </label>
              <div className="group relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
                <Input
                  id="song-search"
                  placeholder="Tìm theo tên bài hát..."
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="h-12 rounded-2xl border-border/40 bg-background/60 pl-12 pr-4 text-sm sm:text-base focus:border-primary/40 focus:ring-2 focus:ring-primary/15 input-glow transition-all duration-200"
                />
              </div>

              {/* Category filters */}
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isActive = selectedCategory === category;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-xl border px-4 py-1.5 text-xs font-medium transition-all duration-250 sm:text-sm ${
                        isActive
                          ? "border-primary/40 bg-primary text-primary-foreground shadow-md shadow-primary/15 btn-primary-glow"
                          : "border-border/40 bg-background/50 text-muted-foreground hover:border-primary/25 hover:text-foreground hover:bg-background/70 hover:shadow-sm"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="mt-8 sm:mt-10">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <LoadingCard key={index} index={index} />
              ))}
            </div>
          ) : songs.length === 0 ? (
            <section className="rounded-3xl border border-dashed border-border/50 bg-card/20 p-8 text-center backdrop-blur-sm sm:p-16 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 mb-5">
                <Music2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                Không tìm thấy bài hát
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base max-w-md mx-auto leading-relaxed">
                Thử từ khóa khác hoặc kiểm tra danh mục để khám phá thêm bài
                hát.
              </p>
            </section>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {songs.map((song, index) => (
                <Link
                  key={song._id}
                  href={`/songs/${song.slug}`}
                  prefetch={false}
                  className="group block animate-slide-up"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <Card className="h-full rounded-2xl border-border/30 bg-card/60 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 glass card-glow hover:card-glow-hover group-hover:bg-card/80">
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

          {/* Pagination */}
          {!loading && songs.length > 0 && (
            <div className="mt-8 sm:mt-10 flex justify-center">
              <Pagination>
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

                  {visiblePages.map((page) => {
                    if (typeof page !== "number") {
                      return (
                        <PaginationItem key={page}>
                          <span className="px-3 py-2 text-sm text-muted-foreground">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }

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
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border/30 bg-card/20 glass-strong">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div>
              <p className="text-sm font-medium text-foreground">
                © {new Date().getFullYear()} Thư Viện FTC
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Được xây dựng bởi Phạm Khả Vy.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={handleBackToTop}
            >
              <ArrowUp className="h-4 w-4" />
              Lên đầu trang
            </Button>
          </div>
        </div>
      </footer>

      {/* Floating back-to-top */}
      {showBackToTop && (
        <Button
          type="button"
          size="icon"
          className="fixed bottom-6 right-6 z-20 h-12 w-12 rounded-2xl shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 animate-scale-in btn-primary-glow"
          onClick={handleBackToTop}
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </main>
  );
}
