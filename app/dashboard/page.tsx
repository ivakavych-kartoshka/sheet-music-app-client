"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteSong, getSongCategories, getSongs, type SongListItem } from "@/app/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AuthGuard } from "@/components/auth-guard";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [songs, setSongs] = useState<SongListItem[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(["Tất Cả"]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất Cả");
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
        category: selectedCategory === "Tất Cả" ? undefined : selectedCategory,
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

        setCategories(["Tất Cả", ...data]);
      })
      .catch(() => {
        if (mounted) {
          setCategories(["Tất Cả"]);
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

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, selectedCategory]);

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Bạn có chắc chắn muốn xóa bài hát này?");

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
    sessionStorage.removeItem("verified");
    toast({
      title: "Thành công",
      description: "Ðã thoát phiên làm việc.",
    });
    setTimeout(() => {
      router.push("/verify-password");
    }, 1000);
  };

  const totalSongsLabel = useMemo(() => `${totalSongs} bài nhạc`, [totalSongs]);

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
    <AuthGuard>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold">
              DANH SÁCH BÀI HÁT
            </p>
            <Badge variant="outline" className="rounded-xl px-3 py-1">
              {totalSongsLabel}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/new" className="inline-block">
              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Thêm bài nhạc mới
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="gap-2 rounded-xl"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Card className="mt-5 rounded-2xl border-border/60 bg-card/80 shadow-sm">
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm theo tên bài nhạc..."
              />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    size="sm"
                    variant={selectedCategory === category ? "secondary" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            {loadingSongs ? (
              <p className="text-sm text-muted-foreground">Đang tải danh sách...</p>
            ) : songs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có bài nhạc nào.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TIÊU ĐỀ</TableHead>
                    <TableHead>THỂ LOẠI</TableHead>
                    <TableHead className="text-right">HÀNH ĐỘNG</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {songs.map((song) => (
                    <TableRow key={song._id}>
                      <TableCell className="font-medium">{song.title}</TableCell>
                      <TableCell>{song.category?.trim() || "Uncategorized"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/${song._id}`}>
                            <Button type="button" variant="outline" size="sm" className="gap-1">
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                            onClick={() => void handleDelete(song._id)}
                            disabled={deletingSongId === song._id}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            {deletingSongId === song._id ? "Đang xóa..." : "Xóa"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {!loadingSongs && songs.length > 0 && totalPages > 1 && (
              <div className="mt-6">
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
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
    </AuthGuard>
  );
}
