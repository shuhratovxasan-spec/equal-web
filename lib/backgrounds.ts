// lib/backgrounds.ts

export const BACKGROUNDS = [
  { id: "bg1", src: "/backgrounds/bg1.png", label: "Background 1" },
  { id: "bg2", src: "/backgrounds/bg2.png", label: "Background 2" },
  { id: "bg3", src: "/backgrounds/bg3.png", label: "Background 3" },
  { id: "bg4", src: "/backgrounds/bg4.png", label: "Background 4" },
  { id: "bg5", src: "/backgrounds/bg5.png", label: "Background 5" },
  { id: "bg6", src: "/backgrounds/bg6.png", label: "Background 6" },
] as const;

export type BgId = (typeof BACKGROUNDS)[number]["id"];
export type Background = (typeof BACKGROUNDS)[number];

export const DEFAULT_BG: BgId = "bg1";
