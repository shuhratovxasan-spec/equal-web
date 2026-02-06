"use client";

import { BACKGROUNDS, type BgId } from "../lib/backgrounds";

export default function BackgroundPicker({
  value,
  onChange,
}: {
  value: BgId;
  onChange: (bgId: BgId) => void;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
        Choose cover
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {BACKGROUNDS.map((b) => {
          const isSelected = b.id === value;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onChange(b.id)}
              title={b.label}
              aria-label={b.label}
              style={{
                border: isSelected
                  ? "2px solid #ffffff"
                  : "1px solid rgba(255, 255, 255, 0.35)",
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
          );
        })}
      </div>
    </div>
  );
}
