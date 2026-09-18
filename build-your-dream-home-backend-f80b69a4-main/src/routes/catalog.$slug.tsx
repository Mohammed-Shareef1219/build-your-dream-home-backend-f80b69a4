import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Phone, Star, MapPin, Ruler, Building2, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/* ---------------- Types ---------------- */

export type CategorySlug = "apartment" | "villa" | "duplex" | "country_house" | "studio";

export interface Listing {
  code: string;
  name: string;
  arabicName: string;
  area: string;
  price: string;
  designStyle: string;
  rating: number;
  features: string[];
  builder: string;
  seller: string;
  contact: string;
  location: string;
  image: string;
}

export interface Category {
  slug: CategorySlug;
  title: string;
  arabicTitle: string;
  subtitle: string;
  directoryLine: string;
  listings: Listing[];
}

/* ---------------- Data: 5 categories × 10 listings ---------------- */

export const CATEGORIES: Record<CategorySlug, Category> = {
  apartment: {
    slug: "apartment",
    title: "Smart Apartments",
    arabicTitle: "شقق ذكية",
    subtitle: "Luxury Apartment Models Catalogue",
    directoryLine: "Vision 2026 — Smart Apartments",
    listings: [
      {
        code: "IB-2026-A1", name: "Skyline View", arabicName: "الشقة البانورامية",
        area: "220 m²", price: "8,200,000 EGP", designStyle: "Ultra-Modern Glass Facade", rating: 4.9,
        features: ["Floor-to-ceiling windows", "Smart climate zoning", "Concierge floor"],
        builder: "Ebny Betak Towers", seller: "Ahmed Sherif", contact: "+20 100 200 3001",
        location: "New Administrative Capital",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A2", name: "Family Smart Hub", arabicName: "شقة العائلة الذكية",
        area: "185 m²", price: "6,500,000 EGP", designStyle: "Contemporary Family Style", rating: 4.8,
        features: ["Voice-controlled lighting", "Open-plan kitchen", "Kids smart-room"],
        builder: "Ebny Betak Residences", seller: "Mona Khalil", contact: "+20 100 200 3002",
        location: "New Cairo — Fifth Settlement",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A3", name: "Penthouse", arabicName: "شقة الروف الفاخرة",
        area: "210 m² + 80 m² terrace", price: "9,800,000 EGP", designStyle: "Luxury Outdoor Living", rating: 5.0,
        features: ["Private rooftop pool", "Skyline panorama", "Outdoor kitchen"],
        builder: "Ebny Betak Towers", seller: "Karim Helmy", contact: "+20 100 200 3003",
        location: "Sheikh Zayed — Beverly Hills",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A4", name: "Compact Efficiency", arabicName: "الشقة الاقتصادية الموفرة",
        area: "115 m²", price: "4,200,000 EGP", designStyle: "Scandinavian Minimalism", rating: 4.6,
        features: ["Modular furniture", "Energy-saving appliances", "Hidden storage"],
        builder: "Ebny Betak Smart Living", seller: "Nour Adel", contact: "+20 100 200 3004",
        location: "6th of October — Gardenia",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A5", name: "Garden Flat", arabicName: "شقة الدور الأرضي بحديقة",
        area: "160 m² + 50 m² garden", price: "6,900,000 EGP", designStyle: "Biophilic Design", rating: 4.7,
        features: ["Private garden", "Indoor planters", "Natural ventilation"],
        builder: "Ebny Betak Greens", seller: "Salma Fouad", contact: "+20 100 200 3005",
        location: "New Cairo — Mountain View",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A6", name: "Urban Loft", arabicName: "شقة اللوفت الصناعي",
        area: "140 m² (high ceiling)", price: "5,700,000 EGP", designStyle: "Industrial Modern", rating: 4.7,
        features: ["Exposed concrete", "Mezzanine workspace", "Smart speakers"],
        builder: "Ebny Betak Lofts", seller: "Tarek Mostafa", contact: "+20 100 200 3006",
        location: "Downtown Cairo — Maadi",
        image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A7", name: "Hotel Suite", arabicName: "شقة الأجنحة الفندقية",
        area: "130 m² (each room en-suite)", price: "5,500,000 EGP", designStyle: "Neo-Classical Modern", rating: 4.8,
        features: ["Hotel-grade finishes", "Room-service ready", "Marble bathrooms"],
        builder: "Ebny Betak Hospitality", seller: "Layla Hosny", contact: "+20 100 200 3007",
        location: "El Gouna — Red Sea",
        image: "https://images.unsplash.com/photo-1551776235-dde6d4829808?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A8", name: "ROI Plus", arabicName: "شقة الاستثمار السريع",
        area: "95 m²", price: "3,800,000 EGP", designStyle: "High-Tech Minimalism", rating: 4.5,
        features: ["Short-term rental ready", "Smart locks", "Furnished package"],
        builder: "Ebny Betak Invest", seller: "Hassan Gaber", contact: "+20 100 200 3008",
        location: "North Coast — Marassi",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A9", name: "Royal Suite", arabicName: "شقة الـ 4 غرف الملكية",
        area: "275 m²", price: "11,500,000 EGP", designStyle: "Luxury Arabesque Modern", rating: 4.9,
        features: ["Mashrabiya screens", "Maid quarters", "Private elevator"],
        builder: "Ebny Betak Royal", seller: "Omar El-Sayed", contact: "+20 100 200 3009",
        location: "Zamalek — Nile View",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-A10", name: "Eco-Friendly Home", arabicName: "الشقة المستدامة",
        area: "170 m²", price: "6,300,000 EGP", designStyle: "Sustainable Green Design", rating: 4.8,
        features: ["Solar panels", "Greywater recycling", "Bamboo flooring"],
        builder: "Ebny Betak EcoLiving", seller: "Yasmin Saad", contact: "+20 100 200 3010",
        location: "New Capital — Green River",
        image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900&auto=format&fit=crop",
      },
    ],
  },

  villa: {
    slug: "villa",
    title: "Luxury Villas",
    arabicTitle: "فيلات فاخرة",
    subtitle: "Luxury Villa Collection Catalogue",
    directoryLine: "Vision 2026 — Luxury Villas",
    listings: [
      {
        code: "IB-2026-VILLA-01", name: "Horizon Villa", arabicName: "فيلا الأفق",
        area: "600 m² land / 600 m² built", price: "25,000,000 EGP", designStyle: "Heritage / Futuristic", rating: 4.9,
        features: ["Infinity pool", "Smart home OS", "Cinema lounge"],
        builder: "Ebny Betak Villas", seller: "Mostafa Diab", contact: "+20 100 400 5001",
        location: "Sheikh Zayed — Allegria",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-VILLA-02", name: "Generations Villa", arabicName: "فيلا الأجيال",
        area: "600 m² land / 600 m² built", price: "23,500,000 EGP", designStyle: "Multi-generational Modern", rating: 4.8,
        features: ["Two master suites", "Guest wing", "Indoor garden"],
        builder: "Ebny Betak Villas", seller: "Rania Salah", contact: "+20 100 400 5002",
        location: "New Cairo — Katameya Heights",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-VILLA-V2", name: "Jewel Villa", arabicName: "فيلا الجوهرة",
        area: "600 m² land / 600 m² built", price: "28,000,000 EGP", designStyle: "Crystal Geometric", rating: 5.0,
        features: ["Glass atrium", "Skylight roof", "Onyx feature wall"],
        builder: "Ebny Betak Signature", seller: "Khaled Mansour", contact: "+20 100 400 5003",
        location: "Sahel — Hacienda Bay",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-V6", name: "Breeze Villa", arabicName: "فيلا النسيم",
        area: "600 m² land / 600 m² built", price: "22,000,000 EGP", designStyle: "Coastal Modern", rating: 4.8,
        features: ["Sea-facing terrace", "Cross ventilation", "Beach access"],
        builder: "Ebny Betak Coastal", seller: "Aliaa Wahba", contact: "+20 100 400 5004",
        location: "North Coast — Marassi",
        image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-V3", name: "Oasis Villa", arabicName: "فيلا الواحة",
        area: "600 m² land / 600 m² built", price: "24,500,000 EGP", designStyle: "Desert Contemporary", rating: 4.7,
        features: ["Date palm courtyard", "Reflecting pool", "Shaded loggia"],
        builder: "Ebny Betak Desert", seller: "Hatem Rashad", contact: "+20 100 400 5005",
        location: "New Capital — R7 District",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-V7", name: "Palm Villa", arabicName: "فيلا التيل",
        area: "600 m² land / 600 m² built", price: "26,000,000 EGP", designStyle: "Tropical Resort", rating: 4.9,
        features: ["Palm-lined driveway", "Outdoor lounge", "Resort pool"],
        builder: "Ebny Betak Resort", seller: "Sara Naguib", contact: "+20 100 400 5006",
        location: "El Gouna — West Golf",
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161df9d8?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-V5", name: "Coast Villa", arabicName: "فيلا الساحل",
        area: "600 m² land / 600 m² built", price: "27,500,000 EGP", designStyle: "White-Box Mediterranean", rating: 4.9,
        features: ["Direct sea view", "Boat dock", "Sunset deck"],
        builder: "Ebny Betak Coastal", seller: "Wael Ibrahim", contact: "+20 100 400 5007",
        location: "Sahl Hasheesh — Red Sea",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-V6-B", name: "Breeze Estate", arabicName: "فيلا السيم",
        area: "600 m² land / 600 m² built", price: "21,800,000 EGP", designStyle: "Heritage / Futuristic", rating: 4.7,
        features: ["Carved stone facade", "Smart shutters", "Wine cellar"],
        builder: "Ebny Betak Estates", seller: "Dina Farag", contact: "+20 100 400 5008",
        location: "October — Palm Hills",
        image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-V9", name: "Crystal Villa", arabicName: "فيلا الكريستال",
        area: "600 m² land / 600 m² built", price: "29,500,000 EGP", designStyle: "Glass Cube Modern", rating: 5.0,
        features: ["All-glass facade", "LED courtyard", "Smart privacy glass"],
        builder: "Ebny Betak Signature", seller: "Mahmoud Eid", contact: "+20 100 400 5009",
        location: "New Cairo — Mivida",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-2026-V10", name: "Dunes Villa", arabicName: "فيلا الضحراء",
        area: "600 m² land / 600 m² built", price: "23,000,000 EGP", designStyle: "Sculptural Desert", rating: 4.8,
        features: ["Earth-tone palette", "Sand-shielded windows", "Stargazing roof"],
        builder: "Ebny Betak Desert", seller: "Reem El-Beltagy", contact: "+20 100 400 5010",
        location: "Ain Sokhna — La Vista",
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format&fit=crop",
      },
    ],
  },

  duplex: {
    slug: "duplex",
    title: "Duplex Designs",
    arabicTitle: "تصميمات دوبليكس",
    subtitle: "Luxury Duplex Models Catalogue",
    directoryLine: "Vision 2026 — Duplex Units",
    listings: [
      {
        code: "DPX-2026-N1", name: "Al-Nour Duplex", arabicName: "دوبليكس النور",
        area: "220 m²", price: "9,500,000 EGP", designStyle: "Twin-Glass Courtyard", rating: 4.8,
        features: ["Inner courtyard", "Glass-walled stairs", "Skylight atrium"],
        builder: "Ebny Betak Duplex Co.", seller: "Sherif Adel", contact: "+20 100 600 7001",
        location: "New Cairo — Fifth Settlement",
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-N1-G", name: "Garden Duplex", arabicName: "دوبليكس الحديقة",
        area: "195 m² + garden", price: "8,700,000 EGP", designStyle: "Modern with Wide Terrace", rating: 4.7,
        features: ["Wide terrace", "Ground-floor garden", "Outdoor dining"],
        builder: "Ebny Betak Greens", seller: "Mariam Hosny", contact: "+20 100 600 7002",
        location: "Sheikh Zayed — Belton",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-G1", name: "Garden Duplex Plus", arabicName: "دوبليكس الحديقة بلس",
        area: "195 m² + garden", price: "8,700,000 EGP", designStyle: "Modern with Wide Terrace", rating: 4.7,
        features: ["Lush landscaping", "BBQ pavilion", "Smart irrigation"],
        builder: "Ebny Betak Greens", seller: "Tamer Wagdy", contact: "+20 100 600 7003",
        location: "October — Palm Hills",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-A5", name: "Urban Loft Duplex", arabicName: "دوبليكس اللوفت الحضري",
        area: "140 m²", price: "5,700,000 EGP", designStyle: "Industrial Loft", rating: 4.6,
        features: ["Double-height ceiling", "Exposed steel beams", "Mezzanine bedroom"],
        builder: "Ebny Betak Lofts", seller: "Hossam Bakr", contact: "+20 100 600 7004",
        location: "Maadi — Degla",
        image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-A8", name: "ROI Plus Duplex", arabicName: "دوبليكس الاستثمار السريع",
        area: "95 m²", price: "3,500,000 EGP", designStyle: "High-Tech Minimalism", rating: 4.5,
        features: ["Compact two-level", "Investor-ready", "Smart locks"],
        builder: "Ebny Betak Invest", seller: "Lina Mahmoud", contact: "+20 100 600 7005",
        location: "Nasr City — Eighth District",
        image: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-A0", name: "Eco-Friendly Duplex", arabicName: "دوبليكس البيئي",
        area: "170 m²", price: "6,300,000 EGP", designStyle: "Sustainable Green Design", rating: 4.8,
        features: ["Vertical garden", "Solar hot water", "Recycled materials"],
        builder: "Ebny Betak EcoLiving", seller: "Nada Shawky", contact: "+20 100 600 7006",
        location: "New Capital — Green River",
        image: "https://images.unsplash.com/photo-1582268611958-ebfd161df9d8?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-N2", name: "Sky Duplex", arabicName: "دوبليكس السماء",
        area: "240 m²", price: "10,200,000 EGP", designStyle: "Top-Floor Penthouse Style", rating: 4.9,
        features: ["Roof terrace", "City skyline view", "Private elevator"],
        builder: "Ebny Betak Towers", seller: "Yasser Adly", contact: "+20 100 600 7007",
        location: "New Capital — Diplomatic Zone",
        image: "https://images.unsplash.com/photo-1600573472556-e636c2acda88?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-N3", name: "Family Stack", arabicName: "دوبليكس العائلة",
        area: "260 m²", price: "11,000,000 EGP", designStyle: "Family-Centric Modern", rating: 4.8,
        features: ["Two living rooms", "Children's play floor", "Home office"],
        builder: "Ebny Betak Residences", seller: "Heba Saber", contact: "+20 100 600 7008",
        location: "Madinaty — B12",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-N4", name: "Heritage Duplex", arabicName: "دوبليكس التراث",
        area: "230 m²", price: "9,800,000 EGP", designStyle: "Modern Arabesque", rating: 4.7,
        features: ["Mashrabiya screens", "Carved wooden doors", "Patterned tiles"],
        builder: "Ebny Betak Heritage", seller: "Amr Hegazy", contact: "+20 100 600 7009",
        location: "Heliopolis — Korba",
        image: "https://images.unsplash.com/photo-1600566753086-00f18fe6ba66?w=900&auto=format&fit=crop",
      },
      {
        code: "DPX-2026-N5", name: "Pool Duplex", arabicName: "دوبليكس المسبح",
        area: "280 m² + 30 m² pool", price: "12,500,000 EGP", designStyle: "Resort-Style Modern", rating: 5.0,
        features: ["Private plunge pool", "Sun deck", "Outdoor shower"],
        builder: "Ebny Betak Resort", seller: "Marwan Said", contact: "+20 100 600 7010",
        location: "North Coast — Telal",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format&fit=crop",
      },
    ],
  },

  country_house: {
    slug: "country_house",
    title: "Country Houses",
    arabicTitle: "البيوت الريفية",
    subtitle: "Country & Countryside Homes Catalogue",
    directoryLine: "Vision 2026 — Country Houses",
    listings: [
      {
        code: "CH-2026-01", name: "Olive Grove House", arabicName: "بيت الزيتون",
        area: "320 m² + 1000 m² land", price: "7,500,000 EGP", designStyle: "Mediterranean Farmhouse", rating: 4.9,
        features: ["Olive tree orchard", "Stone walls", "Wood-burning oven"],
        builder: "Ebny Betak Countryside", seller: "Farid Anwar", contact: "+20 101 800 9001",
        location: "Fayoum — Tunis Village",
        image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-02", name: "Nile Retreat", arabicName: "ملاذ النيل",
        area: "280 m² + private dock", price: "8,200,000 EGP", designStyle: "Riverside Modern", rating: 4.8,
        features: ["Direct Nile view", "Private dock", "Sunset deck"],
        builder: "Ebny Betak Riverside", seller: "Salim Tawfik", contact: "+20 101 800 9002",
        location: "Aswan — Sehel Island",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-03", name: "Desert Bloom", arabicName: "زهرة الصحراء",
        area: "260 m² + 800 m² land", price: "6,800,000 EGP", designStyle: "Eco Adobe", rating: 4.7,
        features: ["Mud-brick walls", "Natural cooling", "Date palm garden"],
        builder: "Ebny Betak Eco", seller: "Ola Magdy", contact: "+20 101 800 9003",
        location: "Siwa Oasis",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-04", name: "Mountain Lodge", arabicName: "بيت الجبل",
        area: "300 m² + 1200 m² land", price: "9,000,000 EGP", designStyle: "Alpine Modern", rating: 4.8,
        features: ["Stone fireplace", "Panoramic glass", "Hiking trails"],
        builder: "Ebny Betak Highlands", seller: "Bassem Iskander", contact: "+20 101 800 9004",
        location: "Saint Catherine — Sinai",
        image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-05", name: "Lakeside Cabin", arabicName: "كوخ البحيرة",
        area: "240 m² + lake access", price: "7,200,000 EGP", designStyle: "Wood & Glass Cabin", rating: 4.7,
        features: ["Lakefront porch", "Cedar exterior", "Boat house"],
        builder: "Ebny Betak Lakes", seller: "Hany Zaki", contact: "+20 101 800 9005",
        location: "Wadi El Rayan — Fayoum",
        image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-06", name: "Citrus Estate", arabicName: "ضيعة الموالح",
        area: "350 m² + 2000 m² land", price: "10,500,000 EGP", designStyle: "Andalusian Country", rating: 4.9,
        features: ["Citrus orchard", "Tiled fountain", "Guest cottage"],
        builder: "Ebny Betak Estates", seller: "Magda El-Sherif", contact: "+20 101 800 9006",
        location: "Wadi El Natrun",
        image: "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-07", name: "Beach Bungalow", arabicName: "بنغلو الشاطئ",
        area: "180 m²", price: "5,900,000 EGP", designStyle: "Tropical Beach", rating: 4.6,
        features: ["Beachfront", "Outdoor shower", "Hammock terrace"],
        builder: "Ebny Betak Coastal", seller: "Karim Selim", contact: "+20 101 800 9007",
        location: "Ras Sudr — South Sinai",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-08", name: "Rural Modern", arabicName: "الريف المعاصر",
        area: "290 m² + 900 m² land", price: "7,800,000 EGP", designStyle: "Modern Farmhouse", rating: 4.7,
        features: ["Vegetable garden", "Chicken coop", "Solar power"],
        builder: "Ebny Betak Countryside", seller: "Doaa Hamed", contact: "+20 101 800 9008",
        location: "Sharkia — Belbeis",
        image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-09", name: "Stone Cottage", arabicName: "بيت الحجر",
        area: "220 m²", price: "6,500,000 EGP", designStyle: "Heritage Stone", rating: 4.8,
        features: ["Limestone walls", "Vaulted ceilings", "Herb garden"],
        builder: "Ebny Betak Heritage", seller: "Mostafa Lotfy", contact: "+20 101 800 9009",
        location: "Dahab — South Sinai",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format&fit=crop",
      },
      {
        code: "CH-2026-10", name: "Eco Retreat", arabicName: "الملاذ البيئي",
        area: "270 m² + 1500 m² land", price: "8,900,000 EGP", designStyle: "Off-Grid Sustainable", rating: 5.0,
        features: ["Off-grid solar", "Rainwater harvesting", "Compost system"],
        builder: "Ebny Betak Eco", seller: "Yara Mokhtar", contact: "+20 101 800 9010",
        location: "White Desert — Farafra",
        image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900&auto=format&fit=crop",
      },
    ],
  },

  studio: {
    slug: "studio",
    title: "Studios",
    arabicTitle: "استديوهات",
    subtitle: "Smart Studios Catalogue",
    directoryLine: "2026 Studio Directory",
    listings: [
      {
        code: "IB-S26-01", name: "Ultra Modern", arabicName: "ألترا مودرن",
        area: "40 m²", price: "1,800,000 EGP", designStyle: "Smart integrated storage", rating: 4.7,
        features: ["Hidden storage walls", "Smart lighting", "Convertible bed"],
        builder: "Ebny Betak Studios", seller: "Mai Helmy", contact: "+20 102 100 4001",
        location: "Downtown — New Capital",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-02", name: "Panorama", arabicName: "بانوراما",
        area: "45 m²", price: "2,100,000 EGP", designStyle: "Floor-to-ceiling windows", rating: 4.8,
        features: ["Panoramic glass", "City view", "Sunlight all day"],
        builder: "Ebny Betak Towers", seller: "Sherif Younis", contact: "+20 102 100 4002",
        location: "Sheikh Zayed — Westown",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-03", name: "Loft Studio", arabicName: "لوفت",
        area: "55 m² (inc. mezzanine)", price: "2,400,000 EGP", designStyle: "Mezzanine sleep area", rating: 4.7,
        features: ["Mezzanine bedroom", "Industrial finish", "High ceiling"],
        builder: "Ebny Betak Lofts", seller: "Hisham Adly", contact: "+20 102 100 4003",
        location: "Maadi — Cornish",
        image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-04", name: "Smart Space", arabicName: "سمارت سبيس",
        area: "38 m²", price: "1,750,000 EGP", designStyle: "Convertible furniture", rating: 4.6,
        features: ["Murphy bed", "Folding desk", "Voice control"],
        builder: "Ebny Betak Smart Living", seller: "Reem Talaat", contact: "+20 102 100 4004",
        location: "New Cairo — Rehab",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-05", name: "Luxury Compact", arabicName: "لوكشري كومباكت",
        area: "35 m²", price: "1,600,000 EGP", designStyle: "Premium finishes", rating: 4.7,
        features: ["Marble countertops", "Brass fittings", "Designer lighting"],
        builder: "Ebny Betak Signature", seller: "Mariam Adel", contact: "+20 102 100 4005",
        location: "Zamalek",
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-06", name: "Flexible Living", arabicName: "مرن",
        area: "42 m²", price: "1,900,000 EGP", designStyle: "Movable wall panel", rating: 4.7,
        features: ["Sliding wall divider", "Reconfigurable layout", "Acoustic panels"],
        builder: "Ebny Betak Flex", seller: "Tamer Galal", contact: "+20 102 100 4006",
        location: "October — Hyde Park",
        image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-07", name: "Eco-Smart", arabicName: "إيكو سمارت",
        area: "40 m²", price: "1,850,000 EGP", designStyle: "Integrated solar tech", rating: 4.8,
        features: ["Solar window film", "Low-VOC paint", "Energy dashboard"],
        builder: "Ebny Betak EcoLiving", seller: "Nora Sabri", contact: "+20 102 100 4007",
        location: "New Capital — Green River",
        image: "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-08", name: "Zen Minimalist", arabicName: "زن مينيماليست",
        area: "48 m²", price: "2,200,000 EGP", designStyle: "Japanese-inspired zen layout", rating: 4.9,
        features: ["Tatami area", "Hidden storage", "Indoor bonsai nook"],
        builder: "Ebny Betak Zen", seller: "Aya Khaled", contact: "+20 102 100 4008",
        location: "New Cairo — Mivida",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-09", name: "Micro-Loft", arabicName: "مايكرو-لوفت",
        area: "38 m² (compact double level)", price: "1,750,000 EGP", designStyle: "Compact multi-level living", rating: 4.6,
        features: ["Stair storage", "Upper sleeping pod", "Compact kitchenette"],
        builder: "Ebny Betak Lofts", seller: "Karim Wagih", contact: "+20 102 100 4009",
        location: "Heliopolis — Sheraton",
        image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=900&auto=format&fit=crop",
      },
      {
        code: "IB-S26-10", name: "Ultimate Efficiency", arabicName: "ألتيمت إفشنسي",
        area: "36 m²", price: "1,650,000 EGP", designStyle: "Fully optimized footprint", rating: 4.7,
        features: ["Every-cm storage", "Built-in appliances", "Multi-use furniture"],
        builder: "Ebny Betak Smart Living", seller: "Hazem Fathy", contact: "+20 102 100 4010",
        location: "Nasr City — Makram Ebeid",
        image: "https://images.unsplash.com/photo-1560448075-bb485b067938?w=900&auto=format&fit=crop",
      },
    ],
  },
};

const VALID_SLUGS = Object.keys(CATEGORIES) as CategorySlug[];

/* ---------------- Route ---------------- */

export const Route = createFileRoute("/catalog/$slug")({
  beforeLoad: ({ params }) => {
    if (!VALID_SLUGS.includes(params.slug as CategorySlug)) {
      throw notFound();
    }
  },
  head: ({ params }) => {
    const cat = CATEGORIES[params.slug as CategorySlug];
    return {
      meta: [
        { title: `${cat?.title ?? "Catalogue"} — BuildYourHome` },
        { name: "description", content: `${cat?.subtitle ?? ""} — 10 unique listings across Egypt with prices, ratings, builder & seller.` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold mb-3">Catalogue not found</h1>
      <p className="text-muted-foreground mb-6">That property type doesn't exist.</p>
      <Button asChild><Link to="/property-types">Back to Property Types</Link></Button>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
      <p className="text-muted-foreground mb-6">{error.message}</p>
      <Button asChild><Link to="/property-types">Back to Property Types</Link></Button>
    </div>
  ),
  component: CatalogPage,
});

/* ---------------- UI ---------------- */

function CatalogPage() {
  const { slug } = Route.useParams();
  const cat = CATEGORIES[slug as CategorySlug];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] via-[#0d1b30] to-[#0a1628] text-white">
      {/* Hero / Header band */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(212,175,55,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(59,130,246,0.15) 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <Button asChild variant="ghost" className="mb-6 text-white/80 hover:text-white hover:bg-white/10">
            <Link to="/property-types">
              <ArrowLeft className="size-4" /> Back to Property Types
            </Link>
          </Button>
          <div className="text-center">
            <p className="text-sm tracking-[0.3em] text-amber-300/90 uppercase mb-3">
              Ebny Betak Real Estate Development
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent">
              {cat.title} — 2026
            </h1>
            <p className="text-lg text-white/70">{cat.subtitle}</p>
            <p className="text-sm text-amber-300/80 mt-2">{cat.directoryLine}</p>
          </div>
        </div>
      </header>

      {/* Listings grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {cat.listings.map((listing, idx) => (
            <ListingCard key={listing.code} listing={listing} index={idx + 1} slug={cat.slug} />
          ))}
        </div>

        {/* Footer / CTA */}
        <div className="mt-16 rounded-2xl border border-amber-300/30 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-500/10 p-6 text-center backdrop-blur">
          <p className="text-sm text-white/70 mb-1">For Sales and Booking</p>
          <a
            href="tel:+201234567890"
            className="inline-flex items-center gap-2 text-2xl font-bold text-amber-300 hover:text-amber-200 transition-colors"
          >
            <Phone className="size-5" /> +20 123 456 7890
          </a>
        </div>
      </main>
    </div>
  );
}

function ListingCard({ listing, index, slug }: { listing: Listing; index: number; slug: CategorySlug }) {
  return (
    <Link
      to="/catalog/$slug/$code"
      params={{ slug, code: listing.code }}
      className="group flex gap-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5 backdrop-blur-sm shadow-2xl hover:border-amber-300/40 hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative w-2/5 shrink-0 overflow-hidden">
        <img
          src={listing.image}
          alt={listing.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 size-8 rounded-full bg-amber-400 text-[#0a1628] text-sm font-bold flex items-center justify-center shadow-lg">
          {index}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <h3 className="text-lg font-bold text-amber-200">{listing.name}</h3>
            <p className="text-xs text-white/60 mt-0.5">{listing.arabicName}</p>
          </div>
          <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 px-2 py-1 rounded-full">
            <Star className="size-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-200">{listing.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-white/80 mb-3">
          <div className="flex items-center gap-1.5">
            <Ruler className="size-3 text-amber-300/70" />
            <span>{listing.area}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3 text-amber-300/70" />
            <span>{listing.location}</span>
          </div>
        </div>

        <div className="text-base font-bold text-white mb-2">{listing.price}</div>
        <div className="text-[11px] text-white/60 italic mb-3">Design: {listing.designStyle}</div>

        <ul className="space-y-1 mb-3">
          {listing.features.map((f) => (
            <li key={f} className="flex items-start gap-1.5 text-[11px] text-white/75">
              <CheckCircle2 className="size-3 shrink-0 mt-0.5 text-amber-300/70" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-3 border-t border-white/10 space-y-1 text-[11px] text-white/70">
          <div className="flex items-center gap-1.5">
            <Building2 className="size-3 text-amber-300/70" />
            <span><span className="text-white/50">Builder:</span> {listing.builder}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="size-3 text-amber-300/70" />
            <span><span className="text-white/50">Seller:</span> {listing.seller}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <Phone className="size-3" />
            <span>{listing.contact}</span>
          </div>
          <div className="text-[10px] text-white/40 pt-1">Code: {listing.code}</div>
        </div>
        <div className="mt-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 group-hover:text-amber-200">
            View full details →
          </span>
        </div>
      </div>
    </Link>
  );
}
