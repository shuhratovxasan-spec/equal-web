export type BgId = "bg1" | "bg2" | "bg3" | "bg4" | "bg5" | "bg6";

export const BACKGROUNDS: { id: BgId; src: string }[] = [
  { id: "bg1", src: "/backgrounds/bg1.png" },
  { id: "bg2", src: "/backgrounds/bg2.png" },
  { id: "bg3", src: "/backgrounds/bg3.png" },
  { id: "bg4", src: "/backgrounds/bg4.png" },
  { id: "bg5", src: "/backgrounds/bg5.png" },
  { id: "bg6", src: "/backgrounds/bg6.png" },
];

export const DEFAULT_BG: BgId = "bg1";
