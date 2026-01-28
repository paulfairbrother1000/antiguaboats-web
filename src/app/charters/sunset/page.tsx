import CharterTemplate from "@/components/CharterTemplate";

export const dynamic = "force-dynamic";

export default function SunsetCharterPage() {
  const title = "Sunset Cruise";
  const subtitle = "16:30–18:30 • Golden hour magic";

  const body = [
    "There are few moments more special than being out on the water as the Caribbean sun begins to set. A sunset cruise is all about slowing down, soaking up the atmosphere, and enjoying Antigua at its most beautiful.",
    "We’ll take you to a scenic stretch of coastline where the light turns golden, the sea calms, and the island glows. It’s the perfect time for a relaxed drink, great conversation, and unforgettable photos.",
    "Ideal for couples, celebrations, or anyone looking for a truly memorable experience, our sunset cruises offer a calm, stylish end to the day — with the option to tailor the pace and route to suit your mood.",
  ];

  // Images must live here:
  // /public/charters/sunset/hero.jpg
  // /public/charters/sunset/img1.jpg ... img4.jpg
  const folder = "/charters/sunset";

  // Use same live video for now (can be changed later)
  const youtubeUrl = "https://www.youtube.com/live/pIfhcodEbls";

  return (
    <CharterTemplate
      title={title}
      subtitle={subtitle}
      body={body}
      folder={folder}
      youtubeUrl={youtubeUrl}
    />
  );
}
