import * as React from "react";
import { WHEEL_COLORS, WHEEL_TEXT_COLOR } from "@/data/wheels";

interface SpinWheelProps {
  items: string[];
  usedItems?: Set<string>;
  spinning: boolean;
  rotation: number;
  onSpin: () => void;
}

function lighten(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `rgb(${lr}, ${lg}, ${lb})`;
}

function darken(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgb(${Math.round(r * (1 - amount))}, ${Math.round(g * (1 - amount))}, ${Math.round(b * (1 - amount))})`;
}

export function SpinWheel({ items, usedItems, spinning, rotation, onSpin }: SpinWheelProps) {
  const size = 500;
  const radius = size / 2;
  const center = size / 2;
  const segmentAngle = 360 / items.length;

  const createPath = (index: number) => {
    const startAngle = (index * segmentAngle - segmentAngle / 2) * (Math.PI / 180);
    const endAngle = ((index + 1) * segmentAngle - segmentAngle / 2) * (Math.PI / 180);

    const startX = center + radius * Math.cos(startAngle);
    const startY = center + radius * Math.sin(startAngle);
    const endX = center + radius * Math.cos(endAngle);
    const endY = center + radius * Math.sin(endAngle);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  const bulbCount = 24;
  const bulbRadius = radius + 14;

  return (
    <div className="relative w-[320px] h-[320px] md:w-[500px] md:h-[500px] select-none touch-none">
      {/* Soft outer glow halo */}
      <div
        className="absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,179,198,0.25) 0%, rgba(195,177,225,0.15) 40%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      {/* Decorative gold bulb ring */}
      <svg
        className="absolute -inset-[18px] pointer-events-none"
        viewBox={`0 0 ${size + 36} ${size + 36}`}
      >
        <defs>
          <radialGradient id="bulb-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF6CC" />
            <stop offset="60%" stopColor="#F5C76E" />
            <stop offset="100%" stopColor="#C9962A" />
          </radialGradient>
        </defs>
        {Array.from({ length: bulbCount }).map((_, i) => {
          const angle = (i / bulbCount) * 2 * Math.PI - Math.PI / 2;
          const cx = (size + 36) / 2 + (bulbRadius + 4) * Math.cos(angle);
          const cy = (size + 36) / 2 + (bulbRadius + 4) * Math.sin(angle);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={5}
              fill="url(#bulb-gradient)"
              style={{
                filter: "drop-shadow(0 0 6px rgba(255,220,140,0.7))",
              }}
            />
          );
        })}
      </svg>

      {/* The pointer (12 o'clock) */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-14 z-30 pointer-events-none">
        <svg viewBox="0 0 40 56" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pointer-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF6CC" />
              <stop offset="50%" stopColor="#F5C76E" />
              <stop offset="100%" stopColor="#B8861E" />
            </linearGradient>
          </defs>
          <path
            d="M20 56 L4 22 C4 11 11 4 20 4 C29 4 36 11 36 22 L20 56 Z"
            fill="url(#pointer-grad)"
            stroke="#5C3A0E"
            strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))" }}
          />
          <circle cx="20" cy="18" r="4" fill="#FFF6CC" opacity="0.9" />
        </svg>
      </div>

      {/* The wheel itself */}
      <div
        className="relative w-full h-full rounded-full overflow-hidden cursor-pointer"
        onClick={() => !spinning && onSpin()}
        role="button"
        aria-label="Spin the wheel"
        style={{
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.45), inset 0 0 0 6px #2a1c3a, inset 0 0 0 12px #F5C76E, inset 0 0 0 16px #2a1c3a",
        }}
      >
        <div
          className="w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? "transform 5s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
          }}
        >
          <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
            <defs>
              {WHEEL_COLORS.map((c, i) => (
                <radialGradient
                  key={`grad-${i}`}
                  id={`seg-grad-${i}`}
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor={lighten(c, 0.25)} />
                  <stop offset="70%" stopColor={c} />
                  <stop offset="100%" stopColor={darken(c, 0.1)} />
                </radialGradient>
              ))}
              <radialGradient id="shine" cx="50%" cy="35%" r="55%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                <stop offset="60%" stopColor="rgba(255,255,255,0.06)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            <g transform={`rotate(-90 ${center} ${center})`}>
              {items.map((item, index) => {
                const colorIdx = index % WHEEL_COLORS.length;
                const textAngle = index * segmentAngle;
                const isUsed = usedItems?.has(item) ?? false;

                return (
                  <g
                    key={`${item}-${index}`}
                    style={{
                      opacity: isUsed ? 0.32 : 1,
                      transition: "opacity 400ms ease",
                    }}
                  >
                    <path
                      d={createPath(index)}
                      fill={`url(#seg-grad-${colorIdx})`}
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth="1.5"
                    />
                    {isUsed && (
                      <path
                        d={createPath(index)}
                        fill="rgba(20, 12, 30, 0.55)"
                        stroke="none"
                      />
                    )}
                    <g transform={`rotate(${textAngle} ${center} ${center})`}>
                      {(() => {
                        const outerX = center + radius - 55;
                        const innerX = center + 65;
                        const maxWidth = outerX - innerX;
                        const baseFontSize = items.length > 8 ? 16 : 20;
                        const parts = item.includes(" ")
                          ? item.split(/\s+/).filter(Boolean)
                          : [item];
                        const useTwoLines =
                          parts.length > 1 &&
                          item.length * baseFontSize * 0.6 > maxWidth;
                        const sharedTextProps = {
                          textAnchor: "end" as const,
                          alignmentBaseline: "middle" as const,
                          fill: WHEEL_TEXT_COLOR,
                          fontWeight: 800,
                          className: "tracking-wide font-sans",
                          style: {
                            letterSpacing: "0.05em",
                            textTransform: "uppercase" as const,
                            textDecoration: isUsed
                              ? ("line-through" as const)
                              : ("none" as const),
                          },
                        };

                        if (useTwoLines) {
                          const mid = Math.ceil(parts.length / 2);
                          const line1 = parts.slice(0, mid).join(" ");
                          const line2 = parts.slice(mid).join(" ");
                          const lineFontSize = Math.min(baseFontSize, 16);
                          const longest = Math.max(line1.length, line2.length);
                          const estWidth = longest * lineFontSize * 0.6;
                          const tlAttrs =
                            estWidth > maxWidth
                              ? {
                                  textLength: maxWidth,
                                  lengthAdjust: "spacingAndGlyphs" as const,
                                }
                              : {};
                          return (
                            <text
                              x={outerX}
                              y={center}
                              fontSize={lineFontSize}
                              {...sharedTextProps}
                            >
                              <tspan x={outerX} dy="-0.55em" {...tlAttrs}>
                                {line1}
                              </tspan>
                              <tspan x={outerX} dy="1.1em" {...tlAttrs}>
                                {line2}
                              </tspan>
                            </text>
                          );
                        }

                        const estWidth = item.length * baseFontSize * 0.6;
                        const tlAttrs =
                          estWidth > maxWidth
                            ? {
                                textLength: maxWidth,
                                lengthAdjust: "spacingAndGlyphs" as const,
                              }
                            : {};
                        return (
                          <text
                            x={outerX}
                            y={center}
                            fontSize={baseFontSize}
                            {...sharedTextProps}
                            {...tlAttrs}
                          >
                            {item}
                          </text>
                        );
                      })()}
                    </g>
                  </g>
                );
              })}
            </g>
            {/* Top shine overlay */}
            <circle
              cx={center}
              cy={center}
              r={radius - 4}
              fill="url(#shine)"
              pointerEvents="none"
            />
          </svg>
        </div>
      </div>

      {/* Layered center hub */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div
          className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, #FFF6CC 0%, #F5C76E 45%, #B8861E 100%)",
            boxShadow:
              "0 6px 14px rgba(0,0,0,0.5), inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 3px 6px rgba(255,255,255,0.5)",
          }}
        >
          <div
            className="w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, hsl(345 75% 86%) 0%, hsl(345 75% 70%) 60%, hsl(345 70% 55%) 100%)",
              boxShadow: "inset 0 -2px 6px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)",
            }}
          >
            <div
              className="w-3 h-3 md:w-4 md:h-4 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, #FFF6CC 0%, #F5C76E 100%)",
                boxShadow: "0 0 6px rgba(255,220,140,0.9)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
