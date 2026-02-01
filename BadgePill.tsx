"use client";

export type Badge = "New" | "Trusted" | "Verified" | "Banned";

function cls(badge: Badge) {
  switch (badge) {
    case "Verified":
      return "bg-black text-white";
    case "Trusted":
      return "bg-emerald-600 text-white";
    case "Banned":
      return "bg-red-600 text-white";
    default:
      return "bg-gray-200 text-gray-800";
  }
}

export default function BadgePill({ badge }: { badge: Badge }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs ${cls(badge)}`}>
      {badge}
    </span>
  );
}
