"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Gauge, Volume2, Pause, Play } from "lucide-react";

type AudioPlayerProps = {
  src: string;
};

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(100);
  const [speed, setSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const volumeLabel = useMemo(() => `${volume}%`, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
    audioRef.current.playbackRate = speed;
  }, [speed, volume]);

  const handleVolumeChange = (nextVolume: number) => {
    setVolume(nextVolume);
    if (audioRef.current) {
      audioRef.current.volume = nextVolume / 100;
    }
  };

  const handleSpeedChange = (nextSpeed: number) => {
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/60 glass card-glow shadow-md">
      <div className="space-y-4 p-4">
        <audio
          ref={audioRef}
          controls
          className="w-full mobile-optimized"
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={src} type="audio/mpeg" />
          <source src={src} type="audio/wav" />
          <source src={src} type="audio/ogg" />
        </audio>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2.5 rounded-xl border border-border/30 bg-background/40 p-3.5 text-sm">
            <span className="flex items-center justify-between text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Volume2 className="h-4 w-4" />
                Volume
              </span>
              <span className="font-medium text-foreground">{volumeLabel}</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(event) =>
                handleVolumeChange(Number(event.target.value))
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </label>

          <label className="space-y-2.5 rounded-xl border border-border/30 bg-background/40 p-3.5 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="h-4 w-4" />
              Tốc độ
            </span>
            <select
              value={speed}
              onChange={(event) =>
                handleSpeedChange(Number(event.target.value))
              }
              className="h-10 w-full rounded-lg border border-border/40 bg-background/60 px-3 py-2 font-medium text-sm focus:border-primary/40 focus:ring-2 focus:ring-primary/15 input-glow transition-all duration-200"
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}x
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
