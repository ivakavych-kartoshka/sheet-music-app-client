"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
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

export default function DashboardPage() {
  const [songs, setSongs] = useState<SongListItem[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(["Tat ca"]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tat ca");
  const [error, setError] = useState<string | null>(null);

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
        category: selectedCategory === "Tat ca" ? undefined : selectedCategory,
        page: 1,
        limit: 50,
      });

      setSongs(Array.isArray(response.items) ? response.items : []);
    } catch {
      setError("Khong the tai danh sach bai hat.");
    } finally {
      setLoadingSongs(false);
    }
  }, [debouncedKeyword, selectedCategory]);

  useEffect(() => {
    let mounted = true;

    getSongCategories()
      .then((data) => {
        if (!mounted || !Array.isArray(data)) {
          return;
        }

        setCategories(["Tat ca", ...data]);
      })
      .catch(() => {
        if (mounted) {
          setCategories(["Tat ca"]);
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

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Ban chac chan muon xoa bai hat nay?");

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingSongId(id);
      await deleteSong(id);
      await fetchSongs();
    } catch {
      setError("Khong the xoa bai hat.");
    } finally {
      setDeletingSongId(null);
    }
  };

  const totalSongsLabel = useMemo(() => `${songs.length} bai hat`, [songs.length]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-block">
              <Button variant="outline" className="gap-2 rounded-xl">
                <ArrowLeft className="h-4 w-4" />
                Quay lai
              </Button>
            </Link>
            <Badge variant="outline" className="rounded-xl px-3 py-1">
              {totalSongsLabel}
            </Badge>
          </div>

          <Link href="/dashboard/new" className="inline-block">
            <Button className="gap-2 rounded-xl">
              <Plus className="h-4 w-4" />
              Them bai hat moi
            </Button>
          </Link>
        </div>

        <Card className="mt-5 rounded-2xl border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Quan ly bai hat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tim theo ten bai hat..."
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
              <p className="text-sm text-muted-foreground">Dang tai danh sach...</p>
            ) : songs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chua co bai hat nao.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tieu de</TableHead>
                    <TableHead>The loai</TableHead>
                    <TableHead className="text-right">Hanh dong</TableHead>
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
                              Sua
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
                            {deletingSongId === song._id ? "Dang xoa..." : "Xoa"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
