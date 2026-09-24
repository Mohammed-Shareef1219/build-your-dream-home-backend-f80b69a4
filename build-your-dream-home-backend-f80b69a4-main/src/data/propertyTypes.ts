import type { ComponentType } from "react";
import { Building2, Cpu, Home, Layers, Square, Trees } from "lucide-react";

/**
 * Shared property-type dataset — the single source of truth for typology
 * numbers (pricing, ROI, sustainability) used by the Property Types page and
 * the footer "Resources" panel. Display fields that need localization
 * (name, tagline, idealFamily, maintenance, liquidity, acStrategy,
 * sustainability, spaceTrick) live in i18n under `types.<slug>`.
 */
export type TypeKey = "villa" | "apartment" | "duplex" | "country_house" | "studio" | "smart_home";

export interface PropertyType {
  slug: TypeKey;
  name: string; // fallback only — prefer t(`types.<slug>.name`)
  tagline: string; // fallback only
  icon: ComponentType<{ className?: string }>;
  startingPrice: number; // EGP
  pricePerSqm: number;
  minSize: number;
  idealFamily: string; // fallback only
  maintenance: "Low" | "Medium" | "High"; // index into footer.resources.maintenanceLevels
  roi: number; // % yearly
  appreciation: number; // % yearly
  rentYield: number; // %
  liquidity: "High" | "Medium" | "Low"; // index into footer.resources.liquidityLevels
  insulation: number; // 1-5
  naturalLight: number; // 1-5
  acStrategy: string; // fallback only
  sustainability: string[]; // fallback only
  spaceTrick: string; // fallback only
  floorPlanZones: { label: string; pct: number; color: string }[];
}

export const TYPES: PropertyType[] = [
  {
    slug: "studio",
    name: "Smart Studio",
    tagline: "Compact intelligence — every square meter earns its keep.",
    icon: Square,
    startingPrice: 1200000,
    pricePerSqm: 6500,
    minSize: 28,
    idealFamily: "1 person",
    maintenance: "Low",
    roi: 9.2,
    appreciation: 4.5,
    rentYield: 7.8,
    liquidity: "High",
    insulation: 4,
    naturalLight: 3,
    acStrategy: "Single split unit with smart zoning",
    sustainability: ["LED-only lighting", "Compact thermal envelope", "Low water fixtures"],
    spaceTrick: "Convertible furniture + mezzanine = 28m² feels like 42m².",
    floorPlanZones: [
      { label: "Living / Sleep", pct: 55, color: "var(--secondary)" },
      { label: "Kitchen", pct: 20, color: "var(--accent)" },
      { label: "Bath", pct: 15, color: "var(--primary-glow)" },
      { label: "Storage", pct: 10, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "apartment",
    name: "Smart Apartment",
    tagline: "Vertical living, optimized for modern households.",
    icon: Building2,
    startingPrice: 2500000,
    pricePerSqm: 5800,
    minSize: 75,
    idealFamily: "2–4 people",
    maintenance: "Low",
    roi: 7.5,
    appreciation: 5.2,
    rentYield: 6.4,
    liquidity: "High",
    insulation: 4,
    naturalLight: 4,
    acStrategy: "Central VRF with per-room thermostats",
    sustainability: ["Shared building insulation", "Greywater recycling", "Smart metering"],
    spaceTrick: "Open-plan + concealed storage walls turn 100m² into perceived 130m².",
    floorPlanZones: [
      { label: "Living / Dining", pct: 40, color: "var(--secondary)" },
      { label: "Bedrooms", pct: 35, color: "var(--primary-glow)" },
      { label: "Kitchen", pct: 15, color: "var(--accent)" },
      { label: "Bath / Utility", pct: 10, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "duplex",
    name: "Duplex Design",
    tagline: "Two floors, one family — privacy by vertical zoning.",
    icon: Layers,
    startingPrice: 6000000,
    pricePerSqm: 5200,
    minSize: 160,
    idealFamily: "4–6 people",
    maintenance: "Medium",
    roi: 6.8,
    appreciation: 5.8,
    rentYield: 5.5,
    liquidity: "Medium",
    insulation: 4,
    naturalLight: 5,
    acStrategy: "Two-zone central AC, upper/lower independent",
    sustainability: ["Stacked plumbing core", "Cross-ventilation stairwell", "Roof PV ready"],
    spaceTrick: "Stairwell as light-well doubles daylight reach across both floors.",
    floorPlanZones: [
      { label: "Ground Social", pct: 45, color: "var(--secondary)" },
      { label: "Upper Private", pct: 40, color: "var(--primary-glow)" },
      { label: "Service Core", pct: 15, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "villa",
    name: "Luxury Villa",
    tagline: "Detached freedom — land, garden, full architectural control.",
    icon: Home,
    startingPrice: 12000000,
    pricePerSqm: 4800,
    minSize: 280,
    idealFamily: "5–8 people",
    maintenance: "High",
    roi: 5.5,
    appreciation: 6.5,
    rentYield: 4.2,
    liquidity: "Medium",
    insulation: 5,
    naturalLight: 5,
    acStrategy: "Zoned ducted system + ceiling fans, mashrabiya shading",
    sustainability: ["Double-skin walls", "Solar water heating", "Greywater garden irrigation"],
    spaceTrick: "Courtyard plan cools internal rooms passively, reducing AC by ~30%.",
    floorPlanZones: [
      { label: "Living / Majlis", pct: 35, color: "var(--secondary)" },
      { label: "Bedrooms", pct: 30, color: "var(--primary-glow)" },
      { label: "Garden / Court", pct: 20, color: "var(--accent)" },
      { label: "Service", pct: 15, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "country_house",
    name: "Country House",
    tagline: "Off-grid sensibility, rooted in landscape.",
    icon: Trees,
    startingPrice: 3500000,
    pricePerSqm: 4200,
    minSize: 180,
    idealFamily: "3–6 people",
    maintenance: "Medium",
    roi: 5.0,
    appreciation: 4.8,
    rentYield: 4.0,
    liquidity: "Low",
    insulation: 5,
    naturalLight: 5,
    acStrategy: "Passive cooling + minimal split units; thermal mass walls",
    sustainability: ["Rammed-earth or stone walls", "Rainwater harvesting", "Solar PV array"],
    spaceTrick: "Deep verandas extend living space outdoors 6 months a year.",
    floorPlanZones: [
      { label: "Indoor Living", pct: 50, color: "var(--secondary)" },
      { label: "Veranda / Outdoor", pct: 25, color: "var(--accent)" },
      { label: "Bedrooms", pct: 20, color: "var(--primary-glow)" },
      { label: "Service", pct: 5, color: "var(--muted-foreground)" },
    ],
  },
  {
    slug: "smart_home",
    name: "Fully Smart Home",
    tagline: "AI-orchestrated comfort — the building thinks with you.",
    icon: Cpu,
    startingPrice: 5000000,
    pricePerSqm: 6200,
    minSize: 140,
    idealFamily: "2–5 people",
    maintenance: "Low",
    roi: 8.0,
    appreciation: 7.0,
    rentYield: 6.0,
    liquidity: "High",
    insulation: 5,
    naturalLight: 5,
    acStrategy: "AI-driven HVAC reacting to occupancy + weather forecasts",
    sustainability: ["Net-zero ready", "Battery storage", "Auto-tinting glazing"],
    spaceTrick: "Sensor-driven lighting & motorized partitions adapt rooms by time of day.",
    floorPlanZones: [
      { label: "Adaptive Living", pct: 45, color: "var(--secondary)" },
      { label: "Smart Bedrooms", pct: 30, color: "var(--primary-glow)" },
      { label: "Tech Core", pct: 15, color: "var(--accent)" },
      { label: "Service", pct: 10, color: "var(--muted-foreground)" },
    ],
  },
];
