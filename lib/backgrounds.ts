export type BgId = "bg1" | "bg2" | "bg3" | "bg4" | "bg5" | "bg6";

export const BACKGROUNDS: { id: BgId; src: string; label: string }[] = [
  { id: "bg1", src: "/backgrounds/bg1.png", label: "Background 1" },
  { id: "bg2", src: "/backgrounds/bg2.png", label: "Background 2" },
  { id: "bg3", src: "/backgrounds/bg3.png", label: "Background 3" },
  { id: "bg4", src: "/backgrounds/bg4.png", label: "Background 4" },
  { id: "bg5", src: "/backgrounds/bg5.png", label: "Background 5" },
  { id: "bg6", src: "/backgrounds/bg6.png", label: "Background 6" },
];

export const DEFAULT_BG: BgId = "bg1";
