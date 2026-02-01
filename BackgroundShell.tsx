"use client";

import React from "react";

export default function BackgroundShell({
  bgSrc,
  children,
}: {
  bgSrc: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `url(${bgSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "saturate(1.05)",
          zIndex: 0,
        }}
      />

      {/* dark overlay for readability */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.28)",
          zIndex: 1,
        }}
      />

      {/* content */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
