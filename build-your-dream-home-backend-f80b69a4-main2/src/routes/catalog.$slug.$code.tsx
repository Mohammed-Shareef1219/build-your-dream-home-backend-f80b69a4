import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Eye,
  Star,
  Facebook,
  Instagram,
  MessageCircle,
  Building2,
  CheckCircle2,
  Send,
  Heart,
  Flame,
  Headphones,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, type CategorySlug, type Listing } from "./catalog.$slug";

/* ---------------- Mood-board templates per category ---------------- */

type Board = { id: string; label: string; emoji: string; image: string; caption: string };

const BOARDS_BY_CATEGORY: Record<CategorySlug, Board[]> = {
  apartment: [
    { id: "kitchen", label: "Kitchen", emoji: "🥘", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&auto=format&fit=crop", caption: "Open-plan smart kitchen with energy-efficient appliances." },
    { id: "living", label: "Living Room", emoji: "🛋️", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1400&auto=format&fit=crop", caption: "Spacious living area with voice-controlled lighting." },
    { id: "bath", label: "Bathroom", emoji: "🚿", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&auto=format&fit=crop", caption: "Super-lux finishing with smart mirror and rain shower." },
    { id: "bedroom", label: "Bedrooms", emoji: "🛏️", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&auto=format&fit=crop", caption: "Three private bedrooms with ambient climate zoning." },
    { id: "balcony", label: "Balcony / Garden", emoji: "🌳", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1400&auto=format&fit=crop", caption: "Floor-to-ceiling windows opening to a green skyline." },
  ],
  villa: [
    { id: "exterior", label: "Exterior", emoji: "🏡", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1400&auto=format&fit=crop", caption: "Panoramic facade with absolute privacy." },
    { id: "reception", label: "Reception", emoji: "🛋️", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&auto=format&fit=crop", caption: "Grand reception with double-height ceilings." },
    { id: "kitchen", label: "Kitchen", emoji: "🥘", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1400&auto=format&fit=crop", caption: "Chef's kitchen with island and pantry." },
    { id: "master", label: "Master Rooms", emoji: "🛏️", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1400&auto=format&fit=crop", caption: "Master suites with dressing rooms." },
    { id: "garden", label: "Garden", emoji: "🌳", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1400&auto=format&fit=crop", caption: "Private garden with infinity pool." },
  ],
  duplex: [
    { id: "ground", label: "Ground Floor", emoji: "🏠", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop", caption: "Guest-area ground floor with privacy zoning." },
    { id: "first", label: "First Floor", emoji: "⬆️", image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1400&auto=format&fit=crop", caption: "Family bedrooms upstairs for total separation." },
    { id: "stairs", label: "Internal Stairs", emoji: "🪜", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&auto=format&fit=crop", caption: "Sculptural glass-walled internal staircase." },
    { id: "terrace", label: "Terrace", emoji: "🌅", image: "https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=1400&auto=format&fit=crop", caption: "Wide terrace and private garden." },
  ],
  studio: [
    { id: "sleeping", label: "Sleeping Area", emoji: "🛏️", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1400&auto=format&fit=crop", caption: "Smart furnishing maximises every square meter." },
    { id: "kitchen", label: "American Kitchen", emoji: "🥘", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop", caption: "Open American kitchen, energy-efficient." },
    { id: "bath", label: "Bathroom", emoji: "🚿", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1400&auto=format&fit=crop", caption: "Compact spa-style bathroom." },
  ],
  country_house: [
    { id: "landscape", label: "Landscape", emoji: "🌄", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&auto=format&fit=crop", caption: "Tranquility of nature with open green spaces." },
    { id: "reception", label: "Rustic Reception", emoji: "🪵", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&auto=format&fit=crop", caption: "Natural stone meets warm wooden tones." },
    { id: "rooms", label: "Wooden Rooms", emoji: "🛏️", image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1400&auto=format&fit=crop", caption: "Wooden rooms with fresh air & quietness." },
    { id: "bbq", label: "BBQ Area", emoji: "🔥", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop", caption: "Outdoor seating around the BBQ pavilion." },
  ],
};

const PITCH_BY_CATEGORY: Record<CategorySlug, string> = {
  apartment: "Smart design providing maximum space utilization, with separate bedrooms for ultimate privacy.",
  villa: "Panoramic views with absolute privacy, featuring a modern design with luxurious touches.",
  duplex: "Complete separation between guest area and bedrooms, with a private garden and elegant internal stairs.",
  studio: "Smart furnishing, energy-efficient and close to all services — the perfect investor unit.",
  country_house: "The tranquility of nature with a design that blends natural stone with open green spaces.",
};

const SMART_HOME_LINE =
  "Smart Home: Complete control over your home via your phone (lighting, AC, security) with 2026 technology.";

/* ---------------- Route ---------------- */

export const Route = createFileRoute("/catalog/$slug/$code")({
  beforeLoad: ({ params }) => {
    const cat = CATEGORIES[params.slug as CategorySlug];
    if (!cat) throw notFound();
    const listing = cat.listings.find((l) => l.code === params.code);
    if (!listing) throw notFound();
  },
  head: ({ params }) => {
    const cat = CATEGORIES[params.slug as CategorySlug];
    const listing = cat?.listings.find((l) => l.code === params.code);
    const title = listing ? `${listing.name} — ${cat.title} 2026` : "Property — Ebny Betak 2026";
    return {
      meta: [
        { title },
        { name: "description", content: listing ? `${listing.name} (${listing.area}) at ${listing.location}. ${listing.designStyle}.` : "Smart property details." },
        { property: "og:title", content: title },
        { property: "og:image", content: listing?.image ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center text-white">
      <h1 className="text-3xl font-bold mb-3">Property not found</h1>
      <Button asChild><Link to="/property-types">Back to Property Types</Link></Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center text-white">
      <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
      <p className="text-white/60 mb-6">{error.message}</p>
      <Button asChild><Link to="/property-types">Back</Link></Button>
    </div>
  ),
  component: PropertyDetail,
});

/* ---------------- Component ---------------- */

function PropertyDetail() {
  const { slug, code } = Route.useParams();
  const cat = CATEGORIES[slug as CategorySlug];
  const listing = cat.listings.find((l) => l.code === code) as Listing;

  const boards = useMemo(() => {
    const base = BOARDS_BY_CATEGORY[slug as CategorySlug] ?? [];
    // Use the listing's main image as the first/hero board frame
    return [
      { id: "hero", label: "Exterior", emoji: "🏙️", image: listing.image, caption: listing.designStyle },
      ...base,
    ];
  }, [slug, listing]);

  const [activeBoardId, setActiveBoardId] = useState(boards[0].id);
  const activeIndex = Math.max(0, boards.findIndex((b) => b.id === activeBoardId));
  const activeBoard = boards[activeIndex] ?? boards[0];

  const phoneHref = `tel:${listing.contact.replace(/\s/g, "")}`;
  const mapsHref = `https://www.google.com/maps/search/${encodeURIComponent(listing.location)}`;
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => { setShareUrl(window.location.href); }, []);
  const waHref = `https://wa.me/?text=${encodeURIComponent(`${listing.name} — ${listing.location} — ${shareUrl}`)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const igHref = `https://www.instagram.com/`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070d1c] via-[#0b1530] to-[#070d1c] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#070d1c]/80 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <Link to="/catalog/$slug" params={{ slug: slug as CategorySlug }} className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-amber-200">
            <ArrowLeft className="size-4" /> Back to {cat.title}
          </Link>
          <div className="hidden md:flex items-center gap-2 text-sm">
            <span className="text-white/50">IBN BEITAK</span>
            <span className="text-cyan-300 font-bold">2026</span>
          </div>
          <a href={phoneHref} className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 border border-cyan-300/40 px-4 py-1.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/30">
            <Phone className="size-4" /> {listing.contact}
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Hero + Mood Boards */}
          <section className="lg:col-span-8 space-y-5">
            {/* Hero card */}
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
              <div className="aspect-[16/10] relative overflow-hidden">
                {/* Sliding track */}
                <div
                  className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                  style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                >
                  {boards.map((b) => (
                    <div key={b.id} className="relative w-full h-full shrink-0">
                      <img
                        src={b.image}
                        alt={`${listing.name} — ${b.label}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050a18]/90 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ))}
                </div>

                {/* Floating code + views */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span className="rounded-lg bg-black/60 backdrop-blur px-3 py-1.5 text-xs font-mono text-amber-200 border border-amber-300/30">
                    [Property Code: {listing.code}]
                  </span>
                  <span className="rounded-lg bg-black/60 backdrop-blur px-3 py-1.5 text-xs text-white/80 border border-white/10 inline-flex items-center gap-1.5">
                    <Eye className="size-3 text-cyan-300" /> 1,250 views
                  </span>
                </div>

                {/* Arabic property tag */}
                <div className="absolute top-4 right-4 z-10">
                  <span className="rounded-lg bg-black/60 backdrop-blur px-4 py-2 text-base font-bold text-white border border-white/10">
                    {listing.arabicName}
                  </span>
                </div>

                {/* Active caption */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 z-10">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{listing.name}</h1>
                    <p className="text-sm text-white/70 flex items-center gap-1.5 mt-1">
                      <MapPin className="size-3.5 text-cyan-300" /> {listing.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-300/40 px-3 py-1">
                    <Star className="size-3.5 fill-amber-300 text-amber-300" />
                    <span className="text-sm font-bold text-amber-200">{listing.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Mood boards strip */}
              <div className="bg-[#0a142b]/80 border-t border-white/10 p-4">
                <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-1">
                  {boards.map((b) => {
                    const active = b.id === activeBoardId;
                    return (
                      <button
                        key={b.id}
                        onClick={() => setActiveBoardId(b.id)}
                        className={`group relative shrink-0 w-28 rounded-xl overflow-hidden border transition-all duration-300 ${
                          active
                            ? "border-cyan-300 ring-2 ring-cyan-300/50 -translate-y-1"
                            : "border-white/10 hover:border-cyan-300/50"
                        }`}
                      >
                        <div className="aspect-[4/3] relative">
                          <img src={b.image} alt={b.label} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute top-1 left-1 size-7 rounded-full bg-cyan-500/90 text-white flex items-center justify-center text-sm shadow-lg">
                            {b.emoji}
                          </div>
                        </div>
                        <div className={`px-2 py-1.5 text-[11px] font-semibold text-center ${active ? "text-cyan-200" : "text-white/70"}`}>
                          [{b.label}]
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-white/60 italic mt-3">{activeBoard.caption}</p>
              </div>
            </div>

            {/* Comments & Questions */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold tracking-wide">COMMENTS & QUESTIONS</h2>
                <MessageCircle className="size-5 text-cyan-300" />
              </div>
              <div className="space-y-3 mb-4">
                {[
                  { who: "Ahmed M.", text: "Are installment plans available?" },
                  { who: "Nour S.", text: "Is the smart-home package included in the price?" },
                  { who: "Hassan K.", text: "How soon can I schedule a site visit?" },
                ].map((c, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className="size-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {c.who[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/90">{c.text}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">— {c.who}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  placeholder="Ask a question about this unit…"
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:border-cyan-300/60"
                />
                <button type="submit" className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070d1c] font-semibold px-4 py-2 inline-flex items-center gap-1.5 text-sm">
                  <Send className="size-4" /> Send
                </button>
              </form>
            </div>
          </section>

          {/* MIDDLE: Description + Specs (on lg screens splits with sidebar) */}
          <section className="lg:col-span-4 space-y-5">
            {/* Unit Description */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h2 className="text-sm font-bold tracking-[0.2em] text-cyan-300 mb-3">UNIT DESCRIPTION</h2>
              <p className="text-sm text-white/85 leading-relaxed mb-3">
                <span className="font-semibold text-white">{cat.title.replace(/s$/, "")}: </span>
                "{PITCH_BY_CATEGORY[slug as CategorySlug]}"
              </p>
              <p className="text-sm text-white/85 leading-relaxed">
                <Sparkles className="inline size-3.5 text-amber-300 mr-1" />
                {SMART_HOME_LINE}
              </p>

              {/* Spec table */}
              <div className="mt-5 rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-cyan-300 font-semibold">Property Type</th>
                      <th className="px-3 py-2 text-left text-cyan-300 font-semibold">Mood Board</th>
                      <th className="px-3 py-2 text-left text-cyan-300 font-semibold">Feature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {boards.slice(1).map((b, i) => (
                      <tr key={b.id} className="hover:bg-white/5">
                        <td className="px-3 py-2 text-white/80">{cat.title.replace(/s$/, "")}</td>
                        <td className="px-3 py-2 text-white/70">{b.label}</td>
                        <td className="px-3 py-2 text-amber-200">{listing.features[i % listing.features.length]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Engagement Counter */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <h2 className="text-sm font-bold tracking-[0.2em] text-cyan-300 mb-3">ENGAGEMENT COUNTER</h2>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-white/85">
                  <Heart className="size-4 fill-pink-400 text-pink-400" /> 45 people liked this unit
                </p>
                <p className="flex items-center gap-2 text-white/85">
                  <Flame className="size-4 text-orange-400" /> 3 similar units have been booked
                </p>
                <p className="flex items-center gap-2 text-white/85">
                  <Eye className="size-4 text-cyan-300" /> 1,250 views this week
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Sticky seller sidebar — full width below on mobile, floating right on desktop */}
        <aside className="fixed right-4 bottom-4 lg:right-6 lg:bottom-6 z-30 w-[300px] max-w-[calc(100vw-2rem)] hidden lg:block">
          <div className="rounded-2xl border border-cyan-300/30 bg-gradient-to-br from-[#0a142b]/95 to-[#0d1b3d]/95 backdrop-blur-xl shadow-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-lg bg-cyan-500/20 border border-cyan-300/40 flex items-center justify-center">
                <Building2 className="size-5 text-cyan-300" />
              </div>
              <div>
                <p className="text-xs text-white/60">DEVELOPMENTS</p>
                <p className="text-sm font-bold text-white">{listing.builder}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="size-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center text-sm font-bold text-[#070d1c] shrink-0">
                {listing.seller.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <a
                href={phoneHref}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold px-3 py-2 text-sm shadow-lg shadow-cyan-500/30"
              >
                <Phone className="size-4" /> CALL NOW
              </a>
            </div>
            <p className="text-[11px] text-white/60 text-center mb-4">{listing.seller} · {listing.contact}</p>

            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl overflow-hidden border border-white/10 mb-4 group"
            >
              <div className="h-28 relative">
                <iframe
                  title={`Map of ${listing.location}`}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(listing.location)}&output=embed`}
                  className="absolute inset-0 w-full h-full border-0 grayscale-[20%] contrast-110"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-cyan-300/20" />
              </div>
              <div className="bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 inline-flex items-center gap-1.5 w-full group-hover:bg-cyan-500/10 transition-colors">
                <MapPin className="size-3.5 text-amber-300" /> VIEW ON MAP
              </div>
            </a>

            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Share:</span>
              <div className="flex items-center gap-2">
                <a href={fbHref} target="_blank" rel="noreferrer" className="size-8 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/30 flex items-center justify-center">
                  <Facebook className="size-4 text-blue-200" />
                </a>
                <a href={waHref} target="_blank" rel="noreferrer" className="size-8 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/30 flex items-center justify-center">
                  <MessageCircle className="size-4 text-emerald-200" />
                </a>
                <a href={igHref} target="_blank" rel="noreferrer" className="size-8 rounded-lg bg-pink-600/30 hover:bg-pink-600/50 border border-pink-400/30 flex items-center justify-center">
                  <Instagram className="size-4 text-pink-200" />
                </a>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Headphones className="size-4 text-cyan-300" />
                <div>
                  <p className="font-semibold text-white/90">AI ASSISTANT (ZEYAD)</p>
                  <p className="text-[10px] italic">"Ask about Financing!"</p>
                </div>
              </div>
              <button className="size-9 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#070d1c] flex items-center justify-center shadow-lg">
                <MessageCircle className="size-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile sticky bottom bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-white/10 bg-[#070d1c]/95 backdrop-blur-xl px-4 py-3 flex items-center gap-2">
          <div className="flex-1 text-xs">
            <p className="font-bold text-white truncate">{listing.builder}</p>
            <p className="text-white/60 truncate">Code: {listing.code}</p>
          </div>
          <a href={mapsHref} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 border border-white/15 size-10 flex items-center justify-center text-amber-300">
            <MapPin className="size-4" />
          </a>
          <a href={phoneHref} className="rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#070d1c] font-semibold px-4 py-2 text-sm inline-flex items-center gap-1.5">
            <Phone className="size-4" /> Call
          </a>
        </div>

        {/* Features quick strip */}
        <div className="mt-8 grid sm:grid-cols-3 gap-3">
          {listing.features.map((f) => (
            <div key={f} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm flex items-start gap-2">
              <CheckCircle2 className="size-4 text-amber-300 shrink-0 mt-0.5" />
              <span className="text-white/85">{f}</span>
            </div>
          ))}
        </div>
      </main>

      {/* Floating AI Assistant bubble */}
      <AiAssistantBubble />
    </div>
  );
}

function AiAssistantBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "ai" | "me"; text: string }[]>([
    { from: "ai", text: "Hi, I'm Zeyad 👋 Ask about financing, installments, or scheduling a tour." },
  ]);
  const [input, setInput] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    setMessages((m) => [...m, { from: "me", text: t }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { from: "ai", text: "Great question! Installment plans up to 8 years are available — want me to send the full payment plan?" },
      ]);
    }, 600);
  };

  return (
    <div className="fixed right-4 bottom-24 lg:bottom-4 z-50">
      {open && (
        <div className="mb-3 w-[300px] rounded-2xl border border-cyan-300/30 bg-[#0a142b]/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-cyan-500 flex items-center justify-center">
                <Headphones className="size-4 text-[#070d1c]" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">AI ASSISTANT</p>
                <p className="text-[10px] text-cyan-200">Zeyad · Online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-lg leading-none">×</button>
          </div>
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs ${m.from === "me" ? "bg-cyan-500 text-[#070d1c]" : "bg-white/10 text-white/90"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="flex gap-2 p-3 border-t border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs placeholder:text-white/40 focus:outline-none focus:border-cyan-300/60 text-white"
            />
            <button type="submit" className="rounded-lg bg-cyan-500 hover:bg-cyan-400 text-[#070d1c] px-3 inline-flex items-center">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="size-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-2xl shadow-cyan-500/40 flex items-center justify-center text-white hover:scale-110 transition-transform border-2 border-white/20"
        aria-label="Open AI assistant"
      >
        <MessageCircle className="size-6" />
      </button>
    </div>
  );
}

