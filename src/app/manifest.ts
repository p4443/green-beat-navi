import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GREEN BEAT NAVI",
    short_name: "GREEN BEAT",
    description:
      "音楽、地元の食、楽器体験をめぐる地域フェスティバル公式ナビ",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6ef",
    theme_color: "#092d20",
    lang: "ja",
    icons: [
      {
        src: "/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
