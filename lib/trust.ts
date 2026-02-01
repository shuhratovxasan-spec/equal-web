export type Badge = "New" | "Trusted" | "Verified" | "Banned";

export function badgeFromTrust(input: {
  isBanned?: boolean;
  trustScore?: number;
  ratingCount?: number;
}): Badge {
  if (input.isBanned) return "Banned";
  const score = typeof input.trustScore === "number" ? input.trustScore : 0;
  const rc = typeof input.ratingCount === "number" ? input.ratingCount : 0;

  if (score >= 80 && rc >= 5) return "Verified";
  if (score >= 45) return "Trusted";
  return "New";
}
