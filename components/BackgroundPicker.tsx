"use client";

import React from "react";
import { BACKGROUNDS, type BgId } from "../lib/backgrounds";

type Props = {
  value: BgId;
  onChange: (id: BgId) => void;
};

export default function BackgroundPicker({ value, onChange }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 10,
      }}
    >
      {BACKGROUNDS.map((b) => (
        <button
          key={b.id}
          type="button"
          onClick={() => onChange(b.id)}
          title={b.label}
          aria-label={b.label}
          style={{
            border: b.id === value ? "2px solid #fff" : "1px solid rgba(255,255,255,0.35)",
            borderRadius: 12,
            overflow: "hidden",
            padding: 0,
            background: "transparent",
            cursor: "pointer",
            height: 64,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${b.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </button>
      ))}
    </div>
  );
}
