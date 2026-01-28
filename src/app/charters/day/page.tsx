import CharterTemplate from "@/components/CharterTemplate";

export const dynamic = "force-dynamic";

export default function FullDayCharterPage() {
  const title = "Full Day Charter";
  const subtitle = "10:00–17:00 • Full day adventure around Antigua";

  const body = [
    "A full day charter is the ultimate way to experience Antigua’s coastline — unhurried, flexible, and designed around what you love most: swimming, exploring, relaxing, or a bit of everything.",
    "Your Captain will suggest beautiful bays, quiet swim spots and standout locations for a beach stop or lunch. Prefer to keep it spontaneous? No problem — we’ll shape the day around the conditions and your mood.",
    "Expect a comfortable, safe ride with an attentive crew who will take care of the details, so you can focus on the sun, the sea and the scenery. It’s a day made for memories.",
  ];

  // Put images here: /public/charters/fullday/hero.jpg, img1.jpg ... img4.jpg
  const folder = "/charters/fullday";

  // YouTube (live link supported)
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
