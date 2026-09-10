"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Pencil, Plus, Trash2, Search, Music2, Disc3 } from "lucide-react";
import {
  deleteSong,
  getSongCategories,
  getSongs,
  type SongListItem,
} from "@/app/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { AdminGuard } from "@/components/admin-guard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-border/30 bg-card/50 glass card-glow overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Table header skeleton */}
        <div className="flex items-center gap-4 pb-3 border-b border-border/20">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
          <Skeleton className="h-3 w-16 rounded ml-auto" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 animate-fade-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center gap-2.5 flex-1">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <Skeleton className="h-4 rounded-lg" style={{ width: `${40 + (i % 3) * 15}%` }} />
            </div>
            <Skeleton className="h-5 w-16 rounded-lg shrink-0" />
            <div className="flex gap-1.5 shrink-0">
              <Skeleton className="h-8 w-16 rounded-lg" />
              <Skeleton className="h-8 w-14 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [songs, setSongs] = useState<SongListItem[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(["Tất cả"]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSongs, setTotalSongs] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [keyword]);

  const fetchSongs = useCallback(async () => {
    try {
      setLoadingSongs(true);
      setError(null);

      const response = await getSongs({
        search: debouncedKeyword || undefined,
        category: selectedCategory === "Tất cả" ? undefined : selectedCategory,
        page: currentPage,
        limit: 10,
      });

      setSongs(Array.isArray(response.items) ? response.items : []);
      setTotalPages(response.totalPages || 1);
      setTotalSongs(response.total || 0);
    } catch {
      setError("Không thể tải danh sách bài hát.");
    } finally {
      setLoadingSongs(false);
    }
  }, [debouncedKeyword, selectedCategory, currentPage]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchSongs();
  }, [fetchSongs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, selectedCategory]);

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bài hát này?",
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingSongId(id);
      await deleteSong(id);
      await fetchSongs();
    } catch {
      setError("Không thể xóa bài hát.");
    } finally {
      setDeletingSongId(null);
    }
  };

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
    <AdminGuard>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-primary/5 blur-[120px] animate-float" />
          <div className="absolute -right-24 top-1/3 h-[22rem] w-[22rem] rounded-full bg-chart-2/4 blur-[100px]" />
        </div>

        <section className="relative mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                <Disc3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Quản lý bài hát
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {totalSongs} bài nhạc trong thư viện
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/dashboard/new" className="inline-block">
                <Button className="gap-2 rounded-xl btn-primary-glow">
                  <Plus className="h-4 w-4" />
                  Thêm mới
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="gap-2 rounded-xl border-border/40 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>

          {/* Search & Filter */}
          <Card className="mt-6 rounded-2xl border-border/30 bg-card/50 shadow-sm glass card-glow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Tìm theo tên bài nhạc..."
                    className="h-10 pl-10 rounded-xl border-border/40 bg-background/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 input-glow transition-all duration-200"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      type="button"
                      size="sm"
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-lg text-xs transition-all duration-200 ${
                        selectedCategory === category
                          ? "shadow-sm shadow-primary/15 btn-primary-glow"
                          : "border-border/40 hover:border-primary/20"
                      }`}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-xl border border-destructive/15 bg-destructive/5 p-3 animate-fade-in">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Content */}
          <div className="mt-4">
            {loadingSongs ? (
              <LoadingSkeleton />
            ) : songs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 bg-card/20 p-12 text-center animate-fade-in">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/40 mb-4">
                  <Music2 className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium">Chưa có bài nhạc nào</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Bắt đầu bằng cách thêm bài hát mới
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/30 bg-card/50 shadow-sm overflow-hidden glass card-glow">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Tiêu đề
                      </TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Thể loại
                      </TableHead>
                      <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                        Hành động
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {songs.map((song) => (
                      <TableRow
                        key={song._id}
                        className="border-border/20 transition-colors hover:bg-muted/20"
                      >
                        <TableCell className="font-medium py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
                              <Music2 className="h-3.5 w-3.5" />
                            </div>
                            <span className="line-clamp-1">{song.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="rounded-lg text-[11px] font-medium bg-primary/8 text-primary border-primary/8"
                          >
                            {song.category?.trim() || "Chưa phân loại"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Link href={`/dashboard/${song._id}`}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 rounded-lg h-8 px-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Sửa
                              </Button>
                            </Link>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="gap-1.5 rounded-lg h-8 px-3 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                              onClick={() => void handleDelete(song._id)}
                              disabled={deletingSongId === song._id}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              {deletingSongId === song._id
                                ? "..."
                                : "Xóa"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!loadingSongs && songs.length > 0 && totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        text="Trước"
                        onClick={(event) => {
                          event.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                          }
                        }}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>

                    {visiblePages.map((page, index) => {
                      if (typeof page !== "number") {
                        return (
                          <PaginationItem key={`${page}-${index}`}>
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
                            setCurrentPage(currentPage + 1);
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
      </main>
    </AdminGuard>
  );
}
