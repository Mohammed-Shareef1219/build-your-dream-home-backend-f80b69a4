import { useEffect, useRef, useState } from "react";
import { Maximize, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * Dynamic ad slot — supports video (native custom controls) and image/banner.
 *
 * Content source: edit `AD_CAMPAIGNS` below (or point it at a Supabase table /
 * JSON later). Each campaign declares `type: "video" | "banner"`; the container
 * swaps an HTML5 <video> for an <img> + typographic overlay without any layout
 * shift (both render inside the same aspect-ratio-locked box).
 *
 * Rich text overlays / CTA copy are translated via i18n keys `adSlot.*`.
 */

type VideoCampaign = {
  type: "video";
  src: string;
  poster?: string;
  headline?: string;
  cta?: string;
  href?: string;
};

type BannerCampaign = {
  type: "banner";
  image: string;
  logo?: string;
  headline: string;
  sub?: string;
  cta?: string;
  href?: string;
};

type Campaign = VideoCampaign | BannerCampaign;

// Swap these to serve different creatives; first entry wins.
const AD_CAMPAIGNS: Campaign[] = [
  {
    type: "banner",
    image: new URL("../assets/mount-agiba-7.png", import.meta.url).href,
    logo: new URL("../assets/logo.png", import.meta.url).href,
    headline: "adSlot.banner.headline",
    sub: "adSlot.banner.sub",
    cta: "adSlot.banner.cta",
    href: "/catalog/land/IB-2026-A2",
  },
];

function AdControls({
  playing,
  muted,
  progress,
  onPlayPause,
  onMute,
  onSeek,
  onFullscreen,
}: {
  playing: boolean;
  muted: boolean;
  progress: number; // 0..1
  onPlayPause: () => void;
  onMute: () => void;
  onSeek: (frac: number) => void;
  onFullscreen: () => void;
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 opacity-0 transition-opacity group-hover/ad:opacity-100 focus-within:opacity-100">
      <button
        type="button"
        onClick={onPlayPause}
        aria-label={playing ? "Pause" : "Play"}
        className="rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <div
        role="slider"
        aria-label="Timeline"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          onSeek(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
        }}
        className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/25"
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <button
        type="button"
        onClick={onMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={onFullscreen}
        aria-label="Full screen"
        className="rounded-full bg-white/15 p-2 text-white backdrop-blur hover:bg-white/25 transition-colors"
      >
        <Maximize className="h-4 w-4" />
      </button>
    </div>
  );
}

export function AdSlot() {
  const { t } = useTranslation("home");
  const campaign = AD_CAMPAIGNS[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setProgress(v.duration ? v.currentTime / v.duration : 0);
    const onEnd = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("ended", onEnd);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("ended", onEnd);
    };
  }, [campaign]);

  // Respect prefers-reduced-motion: never autoplay video.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let ok = true;
    try {
      ok = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch { /* older browsers */ }
    if (campaign.type === "video" && ok) {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (dismissed) return null;

  const isVideo = campaign.type === "video";

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };
  const seek = (frac: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = frac * v.duration;
  };
  const fullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <section className="bg-background py-10" aria-label={t("adSlot.label")}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={containerRef}
          className="group/ad relative overflow-hidden rounded-3xl bg-black shadow-elegant"
          style={{ aspectRatio: "21 / 9", maxHeight: 480 }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label={t("adSlot.dismiss")}
            className="absolute end-3 top-3 z-20 rounded-full bg-black/50 p-1.5 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {isVideo ? (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                playsInline
                muted={muted}
                loop
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              >
                <source src={(campaign as VideoCampaign).src} />
              </video>
              {/* Text overlay */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-center px-8 sm:px-14">
                <h3 className="max-w-xl text-2xl sm:text-4xl font-bold text-white drop-shadow-lg">
                  {t("adSlot.video.headline")}
                </h3>
                <p className="mt-2 max-w-lg text-sm sm:text-base text-white/85">
                  {t("adSlot.video.sub")}
                </p>
              </div>
              <AdControls
                playing={playing}
                muted={muted}
                progress={progress}
                onPlayPause={togglePlay}
                onMute={toggleMute}
                onSeek={seek}
                onFullscreen={fullscreen}
              />
            </>
          ) : (
            <>
              <img
                src={(campaign as BannerCampaign).image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
              {/* Centered typography over solid dark base */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 px-6 text-center">
                {(campaign as BannerCampaign).logo && (
                  <img
                    src={(campaign as BannerCampaign).logo}
                    alt=""
                    className="h-10 w-auto sm:h-12"
                    loading="lazy"
                  />
                )}
                <h3 className="text-2xl sm:text-4xl font-bold text-white">
                  {t("adSlot.banner.headline")}
                </h3>
                <p className="max-w-xl text-sm sm:text-lg text-white/80">
                  {t("adSlot.banner.sub")}
                </p>
                <a
                  href={(campaign as BannerCampaign).href ?? "#"}
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:brightness-110 transition"
                >
                  {t("adSlot.banner.cta")}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
