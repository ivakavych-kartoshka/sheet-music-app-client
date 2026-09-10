"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  addFavorite,
  checkFavorite,
  isLoggedIn,
  removeFavorite,
} from "@/app/lib/api";

interface FavoriteButtonProps {
  songId?: string;
  compact?: boolean;
  className?: string;
}

export default function FavoriteButton({
  songId,
  compact = false,
  className = "",
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loadState = useCallback(() => {
    if (!songId || !isLoggedIn()) {
      setLoading(false);
      return;
    }

    checkFavorite(songId)
      .then(setIsFavorite)
      .catch(() => setIsFavorite(false))
      .finally(() => setLoading(false));
  }, [songId]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn()) {
      toast({
        title: "Cần đăng nhập",
        description: "Vui lòng đăng nhập để lưu bài hát yêu thích.",
      });
      router.push("/verify-password");
      return;
    }

    if (!songId || busy) return;

    setBusy(true);
    try {
      if (isFavorite) {
        await removeFavorite(songId);
        setIsFavorite(false);
      } else {
        await addFavorite(songId);
        setIsFavorite(true);
      }
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật yêu thích, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || busy}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-250 disabled:opacity-50 ${
          isFavorite
            ? "border-primary/25 bg-primary/12 text-primary shadow-sm shadow-primary/10"
            : "border-border/40 bg-background/50 text-muted-foreground hover:text-primary hover:border-primary/25 hover:bg-primary/5"
        } ${className}`}
        aria-label="Yêu thích"
      >
        <Heart
          className={`h-4 w-4 transition-all duration-250 ${
            isFavorite ? "fill-current scale-110" : ""
          }`}
        />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={isFavorite ? "default" : "outline"}
      size="sm"
      className={`gap-2 rounded-xl transition-all duration-200 ${isFavorite ? "btn-primary-glow" : "border-border/40 hover:bg-primary/5 hover:border-primary/20"} ${className}`}
      onClick={handleToggle}
      disabled={loading || busy}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-250 ${isFavorite ? "fill-current" : ""}`}
      />
      {isFavorite ? "Đã lưu" : "Lưu bài hát"}
    </Button>
  );
}
