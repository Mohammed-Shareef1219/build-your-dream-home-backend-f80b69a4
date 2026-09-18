import mountCitySea from "@/assets/mount-city-sea.jpg";
import mountCityDev from "@/assets/mount-city-development.jpg";
import mountAgibaResort from "@/assets/mount-agiba-resort.jpg";
import mountAgibaSea from "@/assets/mount-agiba-sea.jpg";
import typeAgiba1 from "@/assets/type-agiba-1.jpg";
import typeAgiba2 from "@/assets/type-agiba-2.jpg";
import montCitySat from "@/assets/mont-city-sat.png";
import mountAgibaSat from "@/assets/mount-agiba-map.png";

/* ============================================================
   Interactive land-catalog data — the two partner projects.
   Consumed by the /catalog/land/$code route.
   Pages follow the app-wide language toggle (EN/AR).
   ============================================================ */

export type PlotStatus = "available" | "reserved" | "sold" | "security";

export interface Plot {
  id: string;
  status: PlotStatus;
  /** Position + size on the master-plan map, in % of the map box */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Per-project unit price per sqm in EGP */
  pricePerSqm: number;
  /** Total price in EGP — computed by shape but stored for clarity */
  total: number;
  /** Plot-specific extras */
  view?: "sea" | "garden" | "lagoon";
  block?: string;
  note?: string;
}

export interface PageStrings {
  detailsTitle: string;
  keyInfo: string;
  amenities: string;
  location: string;
  openMaps: string;
  filtersLabel: string;
  sellerTitle: string;
  sellerContactFor: string;
  officeAddress: string;
  descTitle: string;
  descBody: string;
  reservePlot: string;
  viewDetails: string;
  plotDetails: string;
  dimensions: string;
  priceLabel: string;
  totalLabel: string;
  statusLabel: string;
  viewLabel: string;
  locationShort: string;
  masterPlanTitle: string;
  legendAvailable: string;
  legendReserved: string;
  legendSold: string;
  legendSecurity: string;
  reservedToast: string;
  phoneLabel: string;
  whatsappLabel: string;
}

export interface LandProject {
  code: string;
  /** Satellite/master-plan background of the interactive map (falls back to heroImage) */
  mapImage?: string;
  name: string;
  nameAr: string;
  owner: string;
  ownerAr: string;
  locationLine: string;
  locationLineAr: string;
  heroImage: string;
  galleryImages: { src: string; caption: string; captionAr: string }[];
  pricePerSqm: number;
  /** Page strings per app language */
  strings: { en: PageStrings; ar: PageStrings };
  keyInfo: { icon: "area" | "price" | "ownership" | "view" | "roads"; label: { en: string; ar: string } }[];
  amenities: { icon: "power" | "guarding" | "clubhouse" | "build" | "distance" | "services" | "water" | "roads"; label: { en: string; ar: string } }[];
  mapHref: string;
  mapQuery: string;
  phones: string[];
  whatsapp: string;
  plots: Plot[];
}

/** Mont City — 6 x 7 residential grid */
function montCityPlots(): Plot[] {
  const plots: Plot[] = [];
  const cols = 6;
  const rows = 7;
  // Deterministic status pattern
  const pattern: PlotStatus[] = [
    "available", "available", "reserved", "available", "sold", "available",
    "available", "sold", "available", "available", "reserved", "available",
    "reserved", "available", "security", "available", "available", "sold",
    "available", "available", "available", "reserved", "available", "available",
    "sold", "available", "available", "available", "sold", "reserved",
    "available", "reserved", "available", "available", "available", "available",
    "available", "sold", "available", "reserved", "available", "sold",
  ];
  let n = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const status = pattern[n % pattern.length];
      const w = 12.8;
      const h = 10;
      const x = 5 + c * 14.6;
      const y = 6 + r * 12.4;
      const id = `P-${String(r * cols + c + 1).padStart(2, "0")}`;
      const areaSqm = 200 + ((r * cols + c) % 5) * 10; // 200–240 sqm
      plots.push({
        id,
        status,
        x,
        y,
        w,
        h,
        pricePerSqm: 1000,
        total: areaSqm * 1000,
        view: (r + c) % 3 === 0 ? "sea" : (r + c) % 3 === 1 ? "garden" : "lagoon",
        block: String.fromCharCode(65 + (c % 4)),
      });
      n++;
    }
  }
  return plots;
}

/** Mount Agiba — organically-shaped plot cluster.
 *  Kept within x ≤ 90% so the coastline stays visible on the right. */
function mountAgibaPlots(): Plot[] {
  const plots: Plot[] = [];
  const pattern: PlotStatus[] = [
    "available", "reserved", "available", "sold",
    "available", "available", "security", "available",
    "sold", "available", "available", "reserved",
    "reserved", "available", "sold", "available",
  ];
  // Two rows of 8, slight stagger for the "organic" coastal feel
  let n = 0;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 8; c++) {
      const status = pattern[n % pattern.length];
      const w = 9.6;
      const h = 20;
      const x = 3 + c * 10.8 + (r === 1 ? 1.2 : 0);
      const y = 16 + r * (h + 10);
      const id = `P-${String(r * 8 + c + 1).padStart(2, "0")}`;
      const areaSqm = 150 + ((r * 8 + c) % 4) * 25; // 150–225 sqm
      plots.push({
        id,
        status,
        x,
        y,
        w,
        h,
        pricePerSqm: 500,
        total: areaSqm * 500,
        view: (r + c) % 2 === 0 ? "sea" : "garden",
        block: "أ",
      });
      n++;
    }
  }
  return plots;
}

export const LAND_PROJECTS: Record<string, LandProject> = {
  "IB-2026-A1": {
    code: "IB-2026-A1",
    mapImage: montCitySat,
    name: "Mont City",
    nameAr: "مونت سيتي",
    owner: "Rooya Real Estate Investment",
    ownerAr: "روية للاستثمار العقاري",
    locationLine: "Marsa Matrouh — Agiba Beach — North Coast, Egypt",
    locationLineAr: "مرسى مطروح — شاطئ عجيبة — الساحل الشمالي، مصر",
    heroImage: mountCitySea,
    galleryImages: [
      { src: mountCitySea, caption: "Coastal land overlooking the Mediterranean", captionAr: "أرض ساحلية مطلة على البحر المتوسط" },
      { src: mountCityDev, caption: "Development works under way — Phase 1", captionAr: "أعمال التطوير جارية — المرحلة الأولى" },
      { src: typeAgiba1, caption: "Agiba coastline near the project", captionAr: "ساحل عجيبة قرب المشروع" },
      { src: typeAgiba2, caption: "Resort-style destination plan", captionAr: "خطة الوجهة بطراز المنتجع" },
    ],
    pricePerSqm: 1000,
    strings: {
      en: {
        detailsTitle: "Interactive Land Map",
        keyInfo: "Key Info",
        amenities: "Amenities",
        location: "Location",
        openMaps: "Open in Google Maps",
        filtersLabel: "Filters",
        sellerTitle: "Seller Data",
        sellerContactFor: "Contact for:",
        officeAddress: "5 El-Bahry El-Gedid St., Shubra Masr, in front of Misr for Aviation, 6th floor",
        descTitle: "Project Description",
        descBody:
          "Matrouh, Umm El Rakham, Awlad Marai Road, near Agiba Beach and Umm El Rakham Beach, after Blue Beach Village, next to the governorate chalets, after Carlos Hotel and Al Abyad Hotel, and after the Applied Sciences Syndicate Village, on Awlad Marai Road or the Corniche Road, the main road connecting the coastal road from the sea to the international coastal road, where a monorail or electric train station is expected to be built.",
        reservePlot: "Reserve Plot",
        viewDetails: "View Details",
        plotDetails: "Plot Details",
        dimensions: "Dimensions",
        priceLabel: "Price",
        totalLabel: "Total Price",
        statusLabel: "Status",
        viewLabel: "View",
        locationShort: "Location",
        masterPlanTitle: "Master Plan",
        legendAvailable: "Available",
        legendReserved: "Reserved",
        legendSold: "Sold",
        legendSecurity: "Security",
        reservedToast: "Reservation request sent — our team will call you shortly.",
        phoneLabel: "Call Sales",
        whatsappLabel: "WhatsApp Sales",
      },
      ar: {
        detailsTitle: "الخريطة التفاعلية للأرض",
        keyInfo: "معلومات رئيسية",
        amenities: "المرافق",
        location: "الموقع",
        openMaps: "افتح في خرائط جوجل",
        filtersLabel: "تصفية",
        sellerTitle: "بيانات البائع",
        sellerContactFor: "للتواصل:",
        officeAddress: "٥ ش البحرى الجديد، شبرا مصر، أمام مصر للطيران، الدور السادس",
        descTitle: "وصف المشروع",
        descBody:
          "مطروح، أم الرخم، طريق أولاد مرعي، بالقرب من شاطئ عجيبة وشاطئ أم الرخم، بعد قرية بلو بيتش، بجوار شاليهات المحافظة، بعد فندق كارلوس وفندق الأبيض، وبعد قرية نقابة العلوم التطبيقية، على طريق أولاد مرعي أو طريق الكورنيش، الطريق الرئيسي الرابط بين الطريق الساحلي من البحر إلى الطريق الساحلي الدولي، حيث يُتوقع إنشاء محطة مونوريل أو قطار كهربائي.",
        reservePlot: "احجز القطعة",
        viewDetails: "عرض التفاصيل",
        plotDetails: "تفاصيل القطعة",
        dimensions: "الأبعاد",
        priceLabel: "السعر",
        totalLabel: "الإجمالي",
        statusLabel: "الحالة",
        viewLabel: "الإطلالة",
        locationShort: "الموقع",
        masterPlanTitle: "المخطط العام",
        legendAvailable: "متاح",
        legendReserved: "محجوز",
        legendSold: "مباع",
        legendSecurity: "أمن",
        reservedToast: "تم إرسال طلب الحجز — سيتواصل معك فريقنا قريبًا.",
        phoneLabel: "اتصل بالمبيعات",
        whatsappLabel: "واتساب المبيعات",
      },
    },
    keyInfo: [
      { icon: "area", label: { en: "200 m²", ar: "200 م²" } },
      { icon: "price", label: { en: "1,000 EGP/m²", ar: "1,000 جنيه/م²" } },
      { icon: "ownership", label: { en: "Freehold · Flat Land", ar: "ملكية حرّة · أرض مسطحة" } },
      { icon: "view", label: { en: "Sea view available", ar: "إطلالة بحرية متاحة" } },
    ],
    amenities: [
      { icon: "power", label: { en: "Electricity", ar: "كهرباء" } },
      { icon: "water", label: { en: "Water", ar: "مياه" } },
      { icon: "roads", label: { en: "Road Access", ar: "طريق دخول" } },
      { icon: "guarding", label: { en: "Security", ar: "حراسة" } },
      { icon: "distance", label: { en: "Beach 5 min", ar: "البحر ٥ دقائق" } },
      { icon: "services", label: { en: "Sea View", ar: "إطلالة بحرية" } },
    ],
    mapHref: "https://www.google.com/maps/search/?api=1&query=Agiba+Beach+Marsa+Matrouh",
    mapQuery: "Agiba Beach, Marsa Matrouh, Egypt",
    phones: ["01020010906", "01020010905"],
    whatsapp: "01155405831",
    plots: montCityPlots(),
  },

  "IB-2026-A2": {
    code: "IB-2026-A2",
    mapImage: mountAgibaSat,
    name: "Mount Agiba Resort",
    nameAr: "منتجع مونت عجيبة",
    owner: "Ro'yat Al-Mustaqbal Real Estate Investment",
    ownerAr: "روية المستقبل للاستثمار العقاري",
    locationLine: "Marsa Matrouh — Umm El Rakham Beach — 5 min from Agiba Beach",
    locationLineAr: "مرسى مطروح — شاطئ أم الرخم — ٥ دقائق من شاطئ عجيبة",
    heroImage: mountAgibaResort,
    galleryImages: [
      { src: mountAgibaResort, caption: "Umm El Rakham beach — 300m from the plots", captionAr: "شاطئ أم الرخم — على بُعد ٣٠٠ متر من القطع" },
      { src: mountAgibaSea, caption: "Mediterranean waters at the project shore", captionAr: "مياه البحر المتوسط عند شواطئ المشروع" },
      { src: typeAgiba1, caption: "Agiba Beach panorama", captionAr: "بانوراما شاطئ عجيبة" },
      { src: typeAgiba2, caption: "Resort master plan renders", captionAr: "تصورات المخطط العام للمنتجع" },
    ],
    pricePerSqm: 500,
    strings: {
      en: {
        detailsTitle: "Mount Agiba Resort Details",
        keyInfo: "Key Info",
        amenities: "Amenities",
        location: "Location",
        openMaps: "Open in Google Maps",
        filtersLabel: "Filters",
        sellerTitle: "Seller Data",
        sellerContactFor: "Contact for:",
        officeAddress: "5 El-Bahry El-Gedid St., Shubra Masr, in front of Misr for Aviation, 6th floor",
        descTitle: "Project Description",
        descBody:
          "Ro'yat Al-Mustaqbal Real Estate Investment presents Mount Agiba Resort: sea-front land in the Umm El Rakham area, 5 minutes from the beloved Agiba Beach and only 300 m from the sea. Plots start from 150 sqm at 500 EGP per sqm, with a single owner, a clear guarantee of land ownership and a practical path to build. The master plan includes tourist and investment units, green spaces and integrated services.",
        reservePlot: "Reserve Plot",
        viewDetails: "View Details",
        plotDetails: "Plot Details",
        dimensions: "Dimensions",
        priceLabel: "Price",
        totalLabel: "Total Price",
        statusLabel: "Status",
        viewLabel: "View",
        locationShort: "Location",
        masterPlanTitle: "Master Plan",
        legendAvailable: "Available",
        legendReserved: "Reserved",
        legendSold: "Sold",
        legendSecurity: "Security",
        reservedToast: "Reservation request sent — our team will call you shortly.",
        phoneLabel: "Call Sales",
        whatsappLabel: "WhatsApp Sales",
      },
      ar: {
        detailsTitle: "تفاصيل منتج مونت عجيبة",
        keyInfo: "معلومات رئيسية",
        amenities: "المرافق",
        location: "الموقع",
        openMaps: "افتح في خرائط جوجل",
        filtersLabel: "تصفية",
        sellerTitle: "بيانات البائع",
        sellerContactFor: "للتواصل:",
        officeAddress: "٥ ش البحرى الجديد، شبرا مصر، أمام مصر للطيران، الدور السادس",
        descTitle: "الوصف",
        descBody:
          "شركة رؤية المستقبل للاستثمار العقاري تقدم مشروع مونت عجيبة: أرض واجهة بحر بمنطقة أم الرخم، على بُعد 5 دقائق من شاطئ عجيبة الحبيب، و300 متر فقط من البحر. قطع بمساحات تبدأ من 150 متر مربع بسعر 500 جنيه للمتر، بمالك حر وضمان واضح لملكية الأرض ومسار عملي للبناء. مناطق المخطط تتضمن وحدات استثمارية وسياحية ومساحات خضراء وخدمات متكاملة.",
        reservePlot: "احجز القطعة",
        viewDetails: "عرض التفاصيل",
        plotDetails: "تفاصيل القطعة",
        dimensions: "الأبعاد",
        priceLabel: "السعر",
        totalLabel: "الإجمالي",
        statusLabel: "الحالة",
        viewLabel: "الإطلالة",
        locationShort: "الموقع",
        masterPlanTitle: "المخطط العام",
        legendAvailable: "متاح",
        legendReserved: "محجوز",
        legendSold: "مباع",
        legendSecurity: "أمن",
        reservedToast: "تم إرسال طلب الحجز — سيتواصل معك فريقنا قريبًا.",
        phoneLabel: "اتصل بالمبيعات",
        whatsappLabel: "واتساب المبيعات",
      },
    },
    keyInfo: [
      { icon: "area", label: { en: "150 m²", ar: "150 م²" } },
      { icon: "price", label: { en: "500 EGP/m²", ar: "500 جنيه/م²" } },
      { icon: "ownership", label: { en: "Freehold · Flat Land", ar: "مالك حر · أرض مسطحة" } },
      { icon: "view", label: { en: "Umm El Rakham Beach", ar: "شاطئ أم الرخم" } },
    ],
    amenities: [
      { icon: "power", label: { en: "Electricity (50-amp)", ar: "كهرباء 50 قدمة" } },
      { icon: "guarding", label: { en: "24/7 Security", ar: "حراسة 24 ساعة" } },
      { icon: "clubhouse", label: { en: "Clubhouse", ar: "نادي اجتماعي" } },
      { icon: "water", label: { en: "Water network", ar: "شبكة مياه" } },
      { icon: "build", label: { en: "60% build ratio", ar: "بناء 60%" } },
      { icon: "distance", label: { en: "5 min to Agiba", ar: "٥ دقائق من عجيبة" } },
      { icon: "services", label: { en: "Integrated services", ar: "خدمات متكاملة" } },
    ],
    mapHref: "https://www.google.com/maps/search/?api=1&query=Umm+El+Rakham+Beach+Marsa+Matrouh",
    mapQuery: "شاطئ أم الرخم، مرسى مطروح، مصر",
    phones: ["01020010906", "01020010905"],
    whatsapp: "01155405831",
    plots: mountAgibaPlots(),
  },
};

export const STATUS_LABELS: Record<PlotStatus, { en: string; ar: string }> = {
  available: { en: "Available", ar: "متاح" },
  reserved: { en: "Reserved", ar: "محجوز" },
  sold: { en: "Sold", ar: "مباع" },
  security: { en: "Security", ar: "أمن" },
};
