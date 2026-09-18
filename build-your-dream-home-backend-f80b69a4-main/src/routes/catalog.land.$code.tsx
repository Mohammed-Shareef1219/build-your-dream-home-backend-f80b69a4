import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Maximize,
  Wallet,
  ShieldCheck,
  Eye,
  Zap,
  Users,
  Building2,
  Droplets,
  Route as RouteIcon,
  Sparkles,
  Ruler,
  Landmark,
  Waves,
  TreePine,
} from "lucide-react";
import landMapSat from "@/assets/land-map-sat.jpg";
import { useLanguage } from "@/hooks/useLanguage";
import {
  LAND_PROJECTS,
  STATUS_LABELS,
  type LandProject,
  type Plot,
  type PlotStatus,
} from "@/land.projects";

export const Route = createFileRoute("/catalog/land/$code")({
  beforeLoad: ({ params }) => {
    if (!LAND_PROJECTS[params.code]) throw notFound();
  },
  head: ({ params }) => {
    const p = LAND_PROJECTS[params.code];
    return {
      meta: [
        { title: p ? `${p.name} — ${p.code} | BuildYourHome Land` : "Land Plot — BuildYourHome" },
        {
          name: "description",
          content: p
            ? `Interactive land plot map for ${p.name} (${p.owner}) — ${p.locationLine}. Live availability, prices per sqm and direct contact.`
            : "Interactive land catalog.",
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold mb-3">Land project not found</h1>
      <Link to="/property-types" className="text-secondary underline">
        Back to Property Types
      </Link>
    </div>
  ),
  component: LandProjectPage,
});

/* ---------------- small helpers ---------------- */

const STATUS_FILL: Record<PlotStatus, string> = {
  available: "rgba(45,212,191,0.28)",
  reserved: "rgba(245,158,11,0.38)",
  sold: "rgba(75,85,99,0.45)",
  security: "rgba(139,92,246,0.35)",
};
const STATUS_BORDER: Record<PlotStatus, string> = {
  available: "#2dd4bf",
  reserved: "#f59e0b",
  sold: "#6b7280",
  security: "#8b5cf6",
};
const STATUS_TEXT: Record<PlotStatus, string> = {
  available: "text-teal-200",
  reserved: "text-amber-200",
  sold: "text-gray-300",
  security: "text-violet-200",
};

function fmtEGP(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1000)}K`;
  return String(n);
}

/** Derive display dimensions (m) from plot area with a 2:3 ratio */
function plotDims(total: number, pricePerSqm: number): [number, number] {
  const area = total / pricePerSqm;
  const w = Math.max(6, Math.round(Math.sqrt(area / 1.5)));
  return [w, Math.round(w * 1.5)];
}

const KEY_ICONS = { area: Maximize, price: Wallet, ownership: ShieldCheck, view: Eye, roads: RouteIcon };
const AMENITY_ICONS = {
  power: Zap,
  guarding: ShieldCheck,
  clubhouse: Users,
  build: Building2,
  distance: MapPin,
  services: Sparkles,
  water: Droplets,
  roads: RouteIcon,
};
const VIEW_LABEL: Record<string, { en: string; ar: string }> = {
  sea: { en: "Sea View", ar: "إطلالة بحرية" },
  garden: { en: "Garden", ar: "حديقة" },
  lagoon: { en: "Lagoon", ar: "لاجون" },
};

/* ---------------- component ---------------- */

function LandProjectPage() {
  const { code } = Route.useParams();
  const project: LandProject = LAND_PROJECTS[code];
  const { lang, dir } = useLanguage();
  const isAr = lang === "ar";
  const s = project.strings[lang];
  const mapBg = project.mapImage ?? landMapSat;

  const [selectedId, setSelectedId] = useState<string>(project.plots[0].id);
  const [statusFilter, setStatusFilter] = useState<Set<PlotStatus>>(new Set());
  const [locStep, setLocStep] = useState(0);
  const [priceStep, setPriceStep] = useState(0);
  const [sizeStep, setSizeStep] = useState(0);
  const [viewStep, setViewStep] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [galleryIdx, setGalleryIdx] = useState(0);

  const blocks = useMemo(() => ["All", ...Array.from(new Set(project.plots.map((p) => p.block)))], [project]);
  const block = blocks[locStep % blocks.length];
  const priceSteps = [null, 200_000, 400_000];
  const priceMax = priceSteps[priceStep % priceSteps.length];
  const sizeSteps = [null, 180, 220];
  const sizeMin = sizeSteps[sizeStep % sizeSteps.length];
  const viewSteps = [null, "sea"];
  const viewFilter = viewSteps[viewStep % viewSteps.length];

  const matches = (p: Plot) => {
    if (statusFilter.size > 0 && !statusFilter.has(p.status)) return false;
    if (block !== "All" && p.block !== block) return false;
    if (priceMax != null && p.total > priceMax) return false;
    const area = p.total / p.pricePerSqm;
    if (sizeMin != null && area < sizeMin) return false;
    if (viewFilter != null && p.view !== viewFilter) return false;
    return true;
  };

  const selected = project.plots.find((p) => p.id === selectedId) ?? project.plots[0];
  const [dimW, dimH] = plotDims(selected.total, project.pricePerSqm);
  const heroImg = project.galleryImages[galleryIdx % project.galleryImages.length];

  const toggleStatus = (st: PlotStatus) =>
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(st)) next.delete(st);
      else next.add(st);
      return next;
    });

  const reserve = () => {
    toast.success(s.reservedToast);
  };

  const telHref = `tel:${project.phones[0]}`;
  const waHref = `https://wa.me/2${project.whatsapp}?text=${encodeURIComponent(`${project.name} — ${selected.id}`)}`;

  const filters = [
    { label: s.locationShort, value: block === "All" ? (isAr ? "الكل" : "All") : block, onClick: () => setLocStep((v) => v + 1) },
    { label: s.priceLabel, value: priceMax == null ? (isAr ? "الكل" : "Any") : `≤ ${fmtEGP(priceMax)}`, onClick: () => setPriceStep((v) => v + 1) },
    { label: isAr ? "المساحة" : "Size", value: sizeMin == null ? (isAr ? "الكل" : "Any") : `≥ ${sizeMin} m²`, onClick: () => setSizeStep((v) => v + 1) },
    { label: s.viewLabel, value: viewFilter == null ? (isAr ? "الكل" : "Any") : (isAr ? "بحرية" : "Sea"), onClick: () => setViewStep((v) => v + 1) },
  ];

  return (
    <div dir={dir} lang={lang} className="min-h-screen bg-[#060b18] text-white">
      <div className="mx-auto max-w-[1500px] px-3 sm:px-5 py-5">
        <div className="grid gap-4 lg:grid-cols-12">
          {/* ================= MAP ================= */}
          <section className="lg:col-span-8 space-y-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a1226] shadow-2xl">
              {/* Map canvas */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={mapBg}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ transform: `scale(${zoom})`, transition: "transform 300ms ease" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040814]/30 via-transparent to-[#040814]/15 pointer-events-none" />

                {/* Sea label */}
                <div className="absolute right-4 top-1/3 text-cyan-200/60 text-sm italic tracking-wide select-none" dir="ltr">
                  {isAr ? "البحر المتوسط" : "Mediterranean Sea"}
                </div>

                {/* Plots */}
                <div className="absolute inset-0">
                  {project.plots.map((p) => {
                    const dim = matches(p);
                    const isSel = p.id === selected.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className={`absolute rounded-[3px] border flex items-center justify-center text-[10px] font-mono transition-all duration-200 ${
                          isSel ? "z-20 ring-2 ring-white shadow-lg" : "z-10 hover:z-20 hover:ring-1 hover:ring-white/60"
                        } ${dim ? "opacity-100" : "opacity-15"}`}
                        style={{
                          left: `${p.x}%`,
                          top: `${p.y}%`,
                          width: `${p.w}%`,
                          height: `${p.h}%`,
                          background: STATUS_FILL[p.status],
                          borderColor: STATUS_BORDER[p.status],
                        }}
                        aria-label={`Plot ${p.id}`}
                      >
                        <span className={STATUS_TEXT[p.status]}>{p.id}</span>
                      </button>
                    );
                  })}

                  {/* Decorative pins */}
                  <MapPin className="absolute left-[46%] top-[62%] size-6 text-cyan-300 drop-shadow-lg z-10" fill="#22d3ee" />
                  <MapPin className="absolute left-[36%] top-[70%] size-6 text-cyan-300 drop-shadow-lg z-10" fill="#22d3ee" />
                </div>

                {/* Selected-plot popup — anchored under the plot, click-transparent wrapper */}
                <div
                  className="pointer-events-none absolute z-30 w-64 -translate-x-1/2"
                  style={{ left: `${Math.min(82, Math.max(18, selected.x + selected.w / 2))}%`, top: `${selected.y + selected.h}%` }}
                >
                  <div className="pointer-events-auto mt-2 rounded-xl border border-cyan-300/30 bg-[#0b142b]/95 backdrop-blur-md shadow-2xl p-3 text-start" dir={dir}>
                    <p className="text-sm font-bold text-white">
                      {isAr
                        ? `القطعة ${selected.id} (${project.nameAr}) | ${Math.round(selected.total / selected.pricePerSqm)} م²`
                        : `Plot ${selected.id} (${project.name}) | ${Math.round(selected.total / selected.pricePerSqm)} sqm`}
                    </p>
                    <p className="text-xs text-white/70 mt-1">
                      {s.dimensions}: {dimW}m × {dimH}m
                    </p>
                    <p className="text-xs text-white/70">
                      {s.priceLabel}: {selected.pricePerSqm} EGP/m²
                    </p>
                    <p className="text-xs text-white/70">
                      {s.totalLabel}: {selected.total.toLocaleString()} EGP
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        onClick={reserve}
                        className="rounded-md bg-teal-400/90 hover:bg-teal-300 text-[#04121a] text-xs font-bold px-2.5 py-1.5"
                      >
                        {s.reservePlot}
                      </button>
                      <span className="rounded-md bg-white/10 border border-white/15 text-xs px-2.5 py-1.5 text-white/80">
                        {STATUS_LABELS[selected.status][isAr ? "ar" : "en"]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Back button */}
                <Link
                  to="/property-types"
                  className="absolute left-3 top-3 z-30 size-9 rounded-lg bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center text-white/90 hover:bg-black/80"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-4 rtl:-scale-x-100" />
                </Link>

                {/* Legend */}
                <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2 flex flex-wrap justify-center gap-1.5">
                  {(Object.keys(STATUS_LABELS) as PlotStatus[]).map((st) => {
                    const active = statusFilter.has(st);
                    return (
                      <button
                        key={st}
                        onClick={() => toggleStatus(st)}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold backdrop-blur border transition-colors ${
                          active ? "bg-white/25 border-white/50 text-white" : "bg-black/55 border-white/10 text-white/85 hover:bg-black/75"
                        }`}
                      >
                        <span className="size-2.5 rounded-[3px] border" style={{ background: STATUS_FILL[st], borderColor: STATUS_BORDER[st] }} />
                        {STATUS_LABELS[st][isAr ? "ar" : "en"]}
                      </button>
                    );
                  })}
                </div>

                {/* Zoom controls */}
                <div className="absolute right-3 bottom-16 z-30 flex flex-col gap-1.5">
                  <button onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.2).toFixed(2)))} className="size-9 rounded-lg bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-black/80" aria-label="Zoom in">
                    <ZoomIn className="size-4" />
                  </button>
                  <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))} className="size-9 rounded-lg bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-black/80" aria-label="Zoom out">
                    <ZoomOut className="size-4" />
                  </button>
                  <button onClick={() => setZoom(1)} className="size-9 rounded-lg bg-black/60 backdrop-blur border border-white/15 flex items-center justify-center hover:bg-black/80" aria-label="Reset view">
                    <Crosshair className="size-4" />
                  </button>
                </div>

                {/* Mini dimension panel */}
                <div className="absolute left-1/2 bottom-3 z-20 -translate-x-1/2 hidden sm:block">
                  <div className="rounded-xl border border-white/15 bg-[#0b142b]/90 backdrop-blur px-3 py-2" dir="ltr">
                    <div className="mx-auto w-28 border border-cyan-300/60 grid grid-cols-4 grid-rows-3 gap-px bg-cyan-300/20 p-px">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={`aspect-square ${i === 7 ? "bg-teal-400/80" : "bg-[#0b142b]"}`} />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-white/60 mt-1 font-mono">
                      <span>{dimW}m</span>
                      <span>{Math.round(selected.total / selected.pricePerSqm)} m²</span>
                      <span>{dimH}m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seller / description band under the map */}
              <div className="border-t border-white/10 bg-[#0a1128]/95 p-4 sm:p-5">
                <h2 className="text-sm font-bold tracking-[0.18em] text-cyan-300 mb-2">{s.sellerTitle}</h2>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <h3 className="text-lg font-bold text-white">{s.descTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/85">{s.descBody}</p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                    <div>
                      <p className="text-white/60 text-xs mb-1">{s.sellerContactFor}</p>
                      <a href={telHref} className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100 font-semibold" dir="ltr">
                        <Phone className="size-4" /> {project.phones[0]}
                      </a>
                      <a href={telHref} className="flex items-center gap-2 text-cyan-200 hover:text-cyan-100 font-semibold mt-1" dir="ltr">
                        <Phone className="size-4" /> {project.phones[1]}
                      </a>
                      <a href={waHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-600/25 border border-emerald-400/40 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-600/40">
                        <MessageCircle className="size-3.5" /> {s.whatsappLabel}
                      </a>
                    </div>
                    <div className="text-white/75 text-sm space-y-1.5">
                      <p className="flex items-start gap-2">
                        <Landmark className="size-4 mt-0.5 text-amber-300 shrink-0" />
                        <span>{isAr ? project.ownerAr : project.owner}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="size-4 mt-0.5 text-cyan-300 shrink-0" />
                        <span>{s.officeAddress}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        {isAr ? <TreePine className="size-4 mt-0.5 text-teal-300 shrink-0" /> : <Waves className="size-4 mt-0.5 text-teal-300 shrink-0" />}
                        <span>{isAr ? project.locationLineAr : project.locationLine}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= SIDEBAR ================= */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#0a1128]/95 p-4 sm:p-5 shadow-xl">
              <h1 className="text-xl font-bold text-white">{s.detailsTitle}</h1>

              {/* Gallery image */}
              <button
                onClick={() => setGalleryIdx((i) => (i + 1) % project.galleryImages.length)}
                className="mt-3 block w-full overflow-hidden rounded-xl border border-white/10 group"
                aria-label="Next image"
              >
                <img src={heroImg.src} alt={isAr ? heroImg.captionAr : heroImg.caption} className="h-40 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="block bg-white/5 px-3 py-1.5 text-[11px] text-white/70 text-start">
                  {isAr ? heroImg.captionAr : heroImg.caption}
                </span>
              </button>

              {/* Key info */}
              <h2 className="mt-4 text-sm font-bold tracking-wide text-white/90">{s.keyInfo}</h2>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {project.keyInfo.map((k) => {
                  const Icon = KEY_ICONS[k.icon];
                  return (
                    <div key={k.label.en} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
                      <Icon className="size-3.5 text-cyan-300 shrink-0" />
                      <span className="text-white/85">{k.label[lang]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Amenities */}
              <h2 className="mt-4 text-sm font-bold tracking-wide text-white/90">{s.amenities}</h2>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                {project.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a.icon];
                  return (
                    <div key={a.label.en} className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-2.5 py-2">
                      <Icon className="size-3.5 text-teal-300 shrink-0" />
                      <span className="text-white/85">{a.label[lang]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Location */}
              <h2 className="mt-4 text-sm font-bold tracking-wide text-white/90">{s.location}</h2>
              <a
                href={project.mapHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white/85 hover:bg-white/10"
              >
                <img src="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M21.35 11.1H12v3.9h5.35c-.25 1.3-1.65 3.8-5.35 3.8A6.3 6.3 0 1 1 16.1 7.2l2.7-2.6A9.9 9.9 0 0 0 12 2a10 10 0 1 0 0 20c5.75 0 9.55-4.05 9.55-9.75 0-.4-.05-.8-.2-1.15Z'/%3E%3C/svg%3E" alt="" className="size-5 rounded-full bg-white p-0.5" />
                <span className="truncate">{project.mapQuery}</span>
                <span className="ms-auto text-[10px] text-cyan-300 shrink-0">{s.openMaps}</span>
              </a>

              {/* Filters */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {filters.map((f) => (
                  <button
                    key={f.label}
                    onClick={f.onClick}
                    className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white/85 hover:bg-white/10"
                  >
                    {f.label}: {f.value} ▾
                  </button>
                ))}
              </div>

              {/* Plot list */}
              <div className="mt-3 max-h-72 space-y-1.5 overflow-y-auto pe-1">
                {project.plots.filter(matches).map((p) => {
                  const area = Math.round(p.total / p.pricePerSqm);
                  const isSel = p.id === selected.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={`w-full rounded-lg border px-3 py-2 text-start transition-colors ${
                        isSel ? "border-cyan-300/60 bg-cyan-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-white">
                          {p.id} <span className="text-xs font-normal text-white/60">{area} m²</span>
                        </span>
                        <span className="font-semibold text-teal-300">{fmtEGP(p.total)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/60">
                        <span className="flex items-center gap-1">
                          <Ruler className="size-3" /> {plotDims(p.total, p.pricePerSqm).join("m × ")}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" /> {VIEW_LABEL[p.view ?? "garden"][isAr ? "ar" : "en"]}
                        </span>
                        <span className="ms-auto rounded px-1.5 py-0.5 font-semibold" style={{ background: STATUS_FILL[p.status], color: STATUS_BORDER[p.status] }}>
                          {STATUS_LABELS[p.status][isAr ? "ar" : "en"]}
                        </span>
                      </div>
                    </button>
                  );
                })}
                {project.plots.filter(matches).length === 0 && (
                  <p className="py-6 text-center text-xs text-white/50">{isAr ? "لا توجد قطع مطابقة للتصفية" : "No plots match the current filters"}</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
