import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Sparkles, MapPin, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — BuildYourHome" },
      { name: "description", content: "Join our team of brokers and programmers building the future of AI-powered real estate marketing." },
      { property: "og:title", content: "Careers — BuildYourHome" },
      { property: "og:description", content: "Join our team of brokers and programmers." },
    ],
  }),
  component: CareersPage,
});

const agencies = ["Ibn Beitak", "Z Agency", "Al-Nujoom"];
const locationKeys = ["newCairo", "october", "sheikhZayed", "maadi", "heliopolis", "alexandria", "northCoast", "settlement5"];
const firstNames = ["Ahmed", "Mohamed", "Omar", "Youssef", "Khaled", "Karim", "Mahmoud", "Hassan", "Tarek", "Amir", "Sara", "Nour", "Mariam", "Salma", "Laila", "Dina", "Hana", "Rana", "Yara", "Farah"];
const lastNames = ["Mansour", "Hassan", "Ali", "Saleh", "Tarek", "Khaled", "Fouad", "Said", "Adel", "Ibrahim"];

// 50 high-quality professional portrait photo IDs from Unsplash
const photoIds = [
  "1500648767791-00dcc994a43e", "1494790108377-be9c29b29330", "1507003211169-0a1dd7228f2d",
  "1438761681033-6461ffad8d80", "1472099645785-5658abf4ff4e", "1544005313-94ddf0286df2",
  "1573496359142-b8d87734a5a2", "1519085360753-af0119f7cbe7", "1580489944761-15a19d654956",
  "1607746882042-944635dfe10e", "1531123897727-8f129e1688ce", "1438761681033-6461ffad8d80",
  "1573497019940-1c28c88b4f3e", "1492562080023-ab3db95bfbce", "1564564321837-a57b7070ac4f",
  "1551836022-d5d88e9218df", "1517841905240-472988babdf9", "1539571696357-5a69c17a67c6",
  "1463453091185-61582044d556", "1499952127939-9bbf5af6c51c", "1542206395-9feb3edaa68d",
  "1521119989659-a83eee488004", "1557862921-37829c790f19", "1605497788044-5a32c7078486",
  "1556157382-97eda2d62296", "1545996124-0501ebae84d0", "1502323777036-f29e3972d82f",
  "1506794778202-cad84cf45f1d", "1573497620053-ea5300f94f21", "1487412720507-e7ab37603c6f",
  "1547425260-76bcadfb4f2c", "1488161628813-04466f872be2", "1539109136881-3be0616acf4b",
  "1500648767791-00dcc994a43e", "1564564321837-a57b7070ac4f", "1573496359142-b8d87734a5a2",
  "1438761681033-6461ffad8d80", "1502685104226-ee32379fefbe", "1492562080023-ab3db95bfbce",
  "1559548331-f9cb98001426", "1583195763986-0e3f0dcd8a09", "1568602471122-7832951cc4c5",
  "1620455092811-39c4f8a4d1c2", "1577880216142-8549e9488dad", "1530268729831-4b0b9e170218",
  "1582750433449-648ed127bb54", "1521252659862-eec69941b071", "1612833609248-c50e4a012c33",
  "1607746882042-944635dfe10e", "1531746020798-e6953c6e8e04",
];

const roleKeys = ["senior", "sales", "advisor"];

const brokers = photoIds.map((id, i) => ({
  photo: `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&crop=faces`,
  name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
  agency: agencies[i % agencies.length],
  locationKey: locationKeys[i % locationKeys.length],
  phone: `+20 ${100 + (i % 900)} ${1000000 + i * 137}`.slice(0, 19),
  roleKey: roleKeys[i % roleKeys.length],
}));

function CareersPage() {
  const { t } = useTranslation("info");
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <header className="text-center max-w-3xl mx-auto">
        <p className="text-sm font-semibold text-secondary uppercase tracking-wider">{t("careers.eyebrow")}</p>
        <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">{t("careers.title")}</h1>
      </header>

      {/* Notice boards */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border-l-4 border-secondary bg-secondary/10 p-6 shadow-soft">
          <div className="flex items-center gap-2 text-secondary font-semibold"><Briefcase className="h-5 w-5" /> {t("careers.openRoles.label")}</div>
          <p className="mt-2 text-lg font-medium">{t("careers.openRoles.text")}</p>
        </div>
        <div className="rounded-2xl border-l-4 border-accent bg-accent/10 p-6 shadow-soft">
          <div className="flex items-center gap-2 text-accent-foreground font-semibold"><Sparkles className="h-5 w-5" /> {t("careers.mission.label")}</div>
          <p className="mt-2 text-lg font-medium">{t("careers.mission.text")}</p>
        </div>
      </div>

      {/* Broker gallery */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold">{t("careers.brokersHeading")}</h2>
        <p className="text-muted-foreground mt-1">{t("careers.brokersSub")}</p>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {brokers.map((b, i) => (
            <article key={i} className="group rounded-2xl overflow-hidden bg-card border shadow-soft hover:shadow-elegant transition-all">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={b.photo}
                  alt={b.name}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate">{b.name}</h3>
                <p className="text-xs text-secondary font-medium">{t(`careers.roles.${b.roleKey}`)}</p>
                <p className="text-xs text-muted-foreground mt-1">{b.agency}</p>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t(`careers.locations.${b.locationKey}`)}</div>
                  <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{b.phone}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
