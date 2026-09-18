// Bilingual seed listings + size/price guide for the Listings search board.
// These guarantee the search tool always demonstrates fully (with real images),
// merged with live Supabase rows on the /properties page.
import typeStudio1 from "@/assets/type-studios-1.jpg";
import typeStudio2 from "@/assets/type-studios-2.jpg";
import typeApartment1 from "@/assets/type-apartments-1.jpg";
import typeApartment2 from "@/assets/type-apartments-2.jpg";
import typeDuplex1 from "@/assets/type-duplexes-1.jpg";
import typeDuplex2 from "@/assets/type-duplexes-2.jpg";
import typeVilla1 from "@/assets/type-villas-1.jpg";
import typeVilla2 from "@/assets/type-villas-2.jpg";
import typeSmart1 from "@/assets/type-smart-homes-1.jpg";
import typeSmart2 from "@/assets/type-smart-homes-2.jpg";
import typeCountry1 from "@/assets/type-country-houses-1.jpg";
import typeCountry2 from "@/assets/type-country-houses-2.jpg";
import typeLand1 from "@/assets/type-land-1.jpg";
import mountCitySea from "@/assets/mount-city-sea.jpg";
import mountCityDev from "@/assets/mount-city-development.jpg";
import typeAgiba1 from "@/assets/type-agiba-1.jpg";
import mountAgibaSea from "@/assets/mount-agiba-sea.jpg";

export type ListingType =
  | "studio"
  | "apartment"
  | "duplex"
  | "villa"
  | "smart_home"
  | "country_house"
  | "land_montcity"
  | "land_agiba";

export type SeedListing = {
  id: string;
  title_en: string;
  title_ar: string;
  location_en: string;
  location_ar: string;
  note_en: string;
  note_ar: string;
  type: ListingType;
  size: number;
  price: number;
  bedrooms: number;
  bathrooms: number | null;
  featured: boolean;
  image: string;
  created_at: string;
  href?: string;
};

export const SEED_LISTINGS: SeedListing[] = [
  // Studios (45–70 sqm | 1.2M–2.5M)
  { id: "seed-studio-1", title_en: "Luxury Investment Studio", title_ar: "استوديو استثماري فاخر", location_en: "North Coast", location_ar: "الساحل الشمالي", note_en: "Ideal for investment and coastal living", note_ar: "مثالية للاستثمار والساحل", type: "studio", size: 45, price: 1200000, bedrooms: 1, bathrooms: 1, featured: true, image: typeStudio1, created_at: "2026-08-12" },
  { id: "seed-studio-2", title_en: "Modern Studio with Open View", title_ar: "استوديو مودرن بإطلالة مفتوحة", location_en: "North Coast", location_ar: "الساحل الشمالي", note_en: "Ideal for investment and coastal living", note_ar: "مثالية للاستثمار والساحل", type: "studio", size: 70, price: 2500000, bedrooms: 1, bathrooms: 1, featured: false, image: typeStudio2, created_at: "2026-08-02" },
  // Apartments (90–180 sqm | 2.5M–5.5M)
  { id: "seed-apt-1", title_en: "Two-Bedroom Residential Apartment", title_ar: "شقة سكنية غرفتين", location_en: "New Cairo", location_ar: "القاهرة الجديدة", note_en: "Options ranging from 2 to 3 bedrooms", note_ar: "تتنوع بين غرفتين إلى 3 غرف", type: "apartment", size: 90, price: 2500000, bedrooms: 2, bathrooms: 2, featured: true, image: typeApartment1, created_at: "2026-08-20" },
  { id: "seed-apt-2", title_en: "Spacious 3-Bedroom Apartment", title_ar: "شقة واسعة 3 غرف", location_en: "New Cairo", location_ar: "القاهرة الجديدة", note_en: "Options ranging from 2 to 3 bedrooms", note_ar: "تتنوع بين غرفتين إلى 3 غرف", type: "apartment", size: 180, price: 5500000, bedrooms: 3, bathrooms: 3, featured: true, image: typeApartment2, created_at: "2026-07-28" },
  // Duplexes (200–320 sqm | 6M–10M)
  { id: "seed-duplex-1", title_en: "Two-Level Duplex with Garden", title_ar: "دوبلكس طابقين بحديقة", location_en: "6th of October", location_ar: "أكتوبر", note_en: "Two-level designs with distinctive views", note_ar: "تصميم طابقين بإطلالات مميزة", type: "duplex", size: 200, price: 6000000, bedrooms: 4, bathrooms: 3, featured: false, image: typeDuplex1, created_at: "2026-08-05" },
  { id: "seed-duplex-2", title_en: "Luxury Panorama Duplex", title_ar: "دوبلكس فاخر إطلالة بانوراما", location_en: "6th of October", location_ar: "أكتوبر", note_en: "Two-level designs with distinctive views", note_ar: "تصميم طابقين بإطلالات مميزة", type: "duplex", size: 320, price: 10000000, bedrooms: 5, bathrooms: 4, featured: true, image: typeDuplex2, created_at: "2026-08-22" },
  // Villas (250–500 sqm | 12M–25M)
  { id: "seed-villa-1", title_en: "Modern Standalone Villa", title_ar: "فيلا مستقلة مودرن", location_en: "Fifth Settlement", location_ar: "التجمع الخامس", note_en: "Private garden and optional swimming pool", note_ar: "تشمل حديقة خاصة وإمكانية حمام سباحة", type: "villa", size: 250, price: 12000000, bedrooms: 4, bathrooms: 4, featured: true, image: typeVilla1, created_at: "2026-08-30" },
  { id: "seed-villa-2", title_en: "Grand 500 sqm Villa", title_ar: "فيلا كبرى مساحة 500 متر", location_en: "Fifth Settlement", location_ar: "التجمع الخامس", note_en: "Private garden and optional swimming pool", note_ar: "تشمل حديقة خاصة وإمكانية حمام سباحة", type: "villa", size: 500, price: 25000000, bedrooms: 6, bathrooms: 5, featured: true, image: typeVilla2, created_at: "2026-09-01" },
  // Smart homes (150–300 sqm | 5M–11M)
  { id: "seed-smart-1", title_en: "Fully Automated Smart Home", title_ar: "سمارت هوم متكامل الأنظمة", location_en: "Sheikh Zayed", location_ar: "الشيخ زايد", note_en: "Fully equipped with smart systems", note_ar: "مجهزة بالكامل بأنظمة الأتمتة الحديثة", type: "smart_home", size: 150, price: 5000000, bedrooms: 3, bathrooms: 3, featured: true, image: typeSmart1, created_at: "2026-08-18" },
  { id: "seed-smart-2", title_en: "Spacious Independent Smart Home", title_ar: "بيت ذكي متسع ومستقل", location_en: "Sheikh Zayed", location_ar: "الشيخ زايد", note_en: "Fully equipped with smart systems", note_ar: "مجهزة بالكامل بأنظمة الأتمتة الحديثة", type: "smart_home", size: 300, price: 11000000, bedrooms: 4, bathrooms: 4, featured: false, image: typeSmart2, created_at: "2026-07-15" },
  // Garden / country houses (120–250 sqm | 3.5M–7M)
  { id: "seed-country-1", title_en: "Warm-Design Country House", title_ar: "بيت ريفي بتصميم دافئ", location_en: "European Countryside", location_ar: "الريف الأوروبي", note_en: "Nature-inspired design", note_ar: "طابع دافئ مستوحى من الطبيعة", type: "country_house", size: 120, price: 3500000, bedrooms: 2, bathrooms: 2, featured: false, image: typeCountry1, created_at: "2026-07-20" },
  { id: "seed-country-2", title_en: "Wide Country Home amid Nature", title_ar: "منزل ريفي واسع وسط الطبيعة", location_en: "European Countryside", location_ar: "الريف الأوروبي", note_en: "Nature-inspired design", note_ar: "طابع دافئ مستوحى من الطبيعة", type: "country_house", size: 250, price: 7000000, bedrooms: 4, bathrooms: 3, featured: true, image: typeCountry2, created_at: "2026-08-25" },
  // Land
  { id: "seed-land-invest", title_en: "Small Investment Plot", title_ar: "قطعة أرض صغيرة استثمارية", location_en: "Matrouh", location_ar: "مطروح", note_en: "Investment sizes start from 28 sqm", note_ar: "تبدأ المساحات الاستثمارية من 28 متر مربع", type: "land_montcity", size: 28, price: 35000, bedrooms: 0, bathrooms: null, featured: false, image: typeLand1, created_at: "2026-06-10", href: "/catalog/land/IB-2026-A1" },
  { id: "seed-land-mc-1", title_en: "Prime Residential Plot — Mont City", title_ar: "أرض سكنية مميزة - مونت سيتي", location_en: "Mont City, Marsa Matrouh", location_ar: "مونت سيتي، مطروح", note_en: "Zoned for construction — Rooya ownership", note_ar: "مخصصة للبناء الفردي أو الاستثماري — ملكية رؤية", type: "land_montcity", size: 200, price: 75000, bedrooms: 0, bathrooms: null, featured: true, image: mountCitySea, created_at: "2026-09-02", href: "/catalog/land/IB-2026-A1" },
  { id: "seed-land-mc-2", title_en: "Wide Open Plot — Mont City", title_ar: "أرض فضاء واسعة - مونت سيتي", location_en: "Mont City, Marsa Matrouh", location_ar: "مونت سيتي، مطروح", note_en: "Zoned for construction — Rooya ownership", note_ar: "مخصصة للبناء الفردي أو الاستثماري — ملكية رؤية", type: "land_montcity", size: 350, price: 200000, bedrooms: 0, bathrooms: null, featured: true, image: mountCityDev, created_at: "2026-08-28", href: "/catalog/land/IB-2026-A1" },
  { id: "seed-land-ag-1", title_en: "Coastal Plot — Mont Agiba Resort", title_ar: "أرض ساحلية - منتجع مونت عجيبة", location_en: "Mont Agiba Resort, Marsa Matrouh", location_ar: "منتجع مونت عجيبة، مطروح", note_en: "Close to the coastal landscape", note_ar: "قريبة من الطبيعة الساحلية", type: "land_agiba", size: 150, price: 50000, bedrooms: 0, bathrooms: null, featured: true, image: typeAgiba1, created_at: "2026-09-05", href: "/catalog/land/IB-2026-A2" },
  { id: "seed-land-ag-2", title_en: "Seafront Plot — Mont Agiba Resort", title_ar: "أرض واجهة بحرية - منتجع مونت عجيبة", location_en: "Mont Agiba Resort, Marsa Matrouh", location_ar: "منتجع مونت عجيبة، مطروح", note_en: "Close to the coastal landscape", note_ar: "قريبة من الطبيعة الساحلية", type: "land_agiba", size: 190, price: 100000, bedrooms: 0, bathrooms: null, featured: false, image: mountAgibaSea, created_at: "2026-08-08", href: "/catalog/land/IB-2026-A2" },
];

export type GuideCard = {
  type: ListingType;
  name_en: string;
  name_ar: string;
  size_en: string;
  size_ar: string;
  price_en: string;
  price_ar: string;
  note_en: string;
  note_ar: string;
  image: string;
  q?: string; // optional extra text query applied when clicking the card
};

export const SIZE_GUIDE: GuideCard[] = [
  { type: "studio", name_en: "Studios", name_ar: "الاستوديوهات", size_en: "45 sqm – 70 sqm", size_ar: "45 م² – 70 م²", price_en: "EGP 1.2M – 2.5M", price_ar: "1.2 – 2.5 مليون ج.م", note_en: "Ideal for investment and coastal living", note_ar: "مثالية للاستثمار والساحل", image: typeStudio1 },
  { type: "apartment", name_en: "Apartments", name_ar: "الشقق", size_en: "90 sqm – 180 sqm", size_ar: "90 م² – 180 م²", price_en: "EGP 2.5M – 5.5M", price_ar: "2.5 – 5.5 مليون ج.م", note_en: "Options ranging from 2 to 3 bedrooms", note_ar: "تتنوع بين غرفتين إلى 3 غرف", image: typeApartment1 },
  { type: "duplex", name_en: "Duplexes", name_ar: "الدوبلكس", size_en: "200 sqm – 320 sqm", size_ar: "200 م² – 320 م²", price_en: "EGP 6M – 10M", price_ar: "6 – 10 مليون ج.م", note_en: "Two-level designs with distinctive views", note_ar: "تصميم طابقين بإطلالات مميزة", image: typeDuplex1 },
  { type: "villa", name_en: "Villas", name_ar: "الفلل", size_en: "250 sqm – 500 sqm", size_ar: "250 م² – 500 م²", price_en: "EGP 12M – 25M", price_ar: "12 – 25 مليون ج.م", note_en: "Private garden and optional swimming pool", note_ar: "تشمل حديقة خاصة وحمام سباحة", image: typeVilla1 },
  { type: "smart_home", name_en: "Smart Homes", name_ar: "البيوت الذكية", size_en: "150 sqm – 300 sqm", size_ar: "150 م² – 300 م²", price_en: "EGP 5M – 11M", price_ar: "5 – 11 مليون ج.م", note_en: "Fully equipped with smart systems", note_ar: "مجهزة بالكامل بأنظمة الأتمتة", image: typeSmart1 },
  { type: "country_house", name_en: "Garden Units", name_ar: "الوحدات الحديقية (البيوت الريفية)", size_en: "120 sqm – 250 sqm", size_ar: "120 م² – 250 م²", price_en: "EGP 3.5M – 7M", price_ar: "3.5 – 7 مليون ج.م", note_en: "Nature-inspired design", note_ar: "طابع دافئ مستوحى من الطبيعة", image: typeCountry1 },
  { type: "land_montcity", name_en: "Land Plots — Mont City", name_ar: "الأراضي — مونت سيتي", size_en: "Starting from 200 sqm", size_ar: "تبدأ من 200 م²", price_en: "EGP 75,000 – 200,000", price_ar: "75 – 200 ألف ج.م", note_en: "Zoned for construction", note_ar: "مخصصة للبناء", image: mountCitySea },
  { type: "land_agiba", name_en: "Land Plots — Mont Agiba", name_ar: "الأراضي — منتجع مونت عجيبة", size_en: "Starting from 150 sqm", size_ar: "تبدأ من 150 م²", price_en: "EGP 50,000 – 100,000", price_ar: "50 – 100 ألف ج.م", note_en: "Close to the coastal landscape", note_ar: "قريبة من الطبيعة الساحلية", image: typeAgiba1 },
];
