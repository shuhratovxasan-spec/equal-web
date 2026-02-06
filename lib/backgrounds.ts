// lib/backgrounds.ts

export const BACKGROUNDS = [
  { id: "bg1", src: "/backgrounds/bg1.png" },
  { id: "bg2", src: "/backgrounds/bg2.png" },
  { id: "bg3", src: "/backgrounds/bg3.png" },
  { id: "bg4", src: "/backgrounds/bg4.png" },
  { id: "bg5", src: "/backgrounds/bg5.png" },
  { id: "bg6", src: "/backgrounds/bg6.png" },
] as const;

export type BgId = (typeof BACKGROUNDS)[number]["id"];

export const DEFAULT_BG: BgId = "bg1";
