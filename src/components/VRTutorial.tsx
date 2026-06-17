import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { Controller } from "./Controller";

const PHASES = {
  INTRO: { start: 0, end: 30 },
  HIGHLIGHT_GRAB: { start: 30, end: 75 },
  SCALE_TOGETHER: { start: 75, end: 120 },
  SCALE_APART: { start: 120, end: 165 },
  HOLD: { start: 165, end: 185 },
};

const clamp = (v: number) => Math.max(0, Math.min(1, v));

export const VRTutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // --- Grab button highlight ---
  const grabHighlight = clamp(
    interpolate(
      frame,
      [PHASES.HIGHLIGHT_GRAB.start, PHASES.HIGHLIGHT_GRAB.start + 20, PHASES.HIGHLIGHT_GRAB.end - 10, PHASES.HIGHLIGHT_GRAB.end],
      [0, 1, 1, 0.6],
      { easing: Easing.out(Easing.quad) }
    )
  );

  // Keep grab highlighted during movement phases
  const grabDuringMove = frame >= PHASES.SCALE_TOGETHER.start
    ? clamp(interpolate(frame, [PHASES.SCALE_TOGETHER.start, PHASES.SCALE_TOGETHER.start + 10], [0.6, 0.9]))
    : 0;

  const finalGrabHighlight = frame >= PHASES.SCALE_TOGETHER.start ? grabDuringMove : grabHighlight;

  // --- Controller horizontal positions (center-relative) ---
  const baseSpread = 240;

  // Pulse during highlight phase to draw attention
  const highlightPulse = frame >= PHASES.HIGHLIGHT_GRAB.start && frame < PHASES.SCALE_TOGETHER.start
    ? Math.sin((frame - PHASES.HIGHLIGHT_GRAB.start) * 0.25) * 12
    : 0;

  // Spread during scale phases
  const scaleSpread = clamp(
    interpolate(
      frame,
      [
        PHASES.SCALE_TOGETHER.start, PHASES.SCALE_TOGETHER.end,
        PHASES.SCALE_APART.start, PHASES.SCALE_APART.end,
      ],
      [baseSpread, baseSpread - 120, baseSpread - 120, baseSpread + 80],
      { easing: Easing.inOut(Easing.cubic) }
    )
  );

  const spread = frame < PHASES.SCALE_TOGETHER.start
    ? baseSpread + highlightPulse
    : scaleSpread;

  // --- Scale indicator (object between controllers) ---
  const objectScale = clamp(
    interpolate(
      frame,
      [
        PHASES.SCALE_TOGETHER.start, PHASES.SCALE_TOGETHER.end,
        PHASES.SCALE_APART.start, PHASES.SCALE_APART.end,
      ],
      [1, 0.4, 0.4, 1.5],
      { easing: Easing.inOut(Easing.cubic) }
    )
  );

  // --- Arrow animation for scale together/apart ---
  const showArrows = frame >= PHASES.SCALE_TOGETHER.start;
  const arrowPhase = frame >= PHASES.SCALE_APART.start ? "apart" : "together";

  // --- Text labels ---
  const stepTexts = [
    { text: "Hold the Grab button\non each controller", start: PHASES.HIGHLIGHT_GRAB.start, end: PHASES.SCALE_TOGETHER.start },
    { text: "Bring controllers together\nto scale smaller", start: PHASES.SCALE_TOGETHER.start, end: PHASES.SCALE_APART.start },
    { text: "Pull controllers apart\nto scale larger", start: PHASES.SCALE_APART.start, end: PHASES.HOLD.end },
  ];

  const cx = width / 2;
  const cy = height / 2 - 20;

  // Controller Y bob
  const bob = Math.sin(frame * 0.08) * 6;

  return (
    <div
      style={{
        width,
        height,
        background: "linear-gradient(160deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Background grid */}
      <svg
        style={{ position: "absolute", top: 0, left: 0, opacity: 0.08 }}
        width={width}
        height={height}
      >
        {Array.from({ length: Math.ceil(width / 60) + 1 }, (_, i) => (
          <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={height} stroke="#4488ff" strokeWidth="1" />
        ))}
        {Array.from({ length: Math.ceil(height / 60) + 1 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 60} x2={width} y2={i * 60} stroke="#4488ff" strokeWidth="1" />
        ))}
      </svg>

      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          color: "white",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          textShadow: "0 0 20px rgba(100,180,255,0.6)",
        }}
      >
        VR Controller Tutorial
      </div>

      {/* Step indicator dots */}
      <div style={{ position: "absolute", top: 85, display: "flex", gap: 10 }}>
        {[0, 1, 2].map((i) => {
          const active =
            (i === 0 && frame >= PHASES.HIGHLIGHT_GRAB.start && frame < PHASES.SCALE_TOGETHER.start) ||
            (i === 1 && frame >= PHASES.SCALE_TOGETHER.start && frame < PHASES.SCALE_APART.start) ||
            (i === 2 && frame >= PHASES.SCALE_APART.start);
          return (
            <div
              key={i}
              style={{
                width: active ? 24 : 10,
                height: 10,
                borderRadius: 5,
                background: active ? "#FFD700" : "rgba(255,255,255,0.3)",
                transition: "width 0.3s",
                boxShadow: active ? "0 0 8px #FFD700" : "none",
              }}
            />
          );
        })}
      </div>

      {/* Object / cube being scaled */}
      {frame >= PHASES.SCALE_TOGETHER.start && (
        <div
          style={{
            position: "absolute",
            left: cx - 35 * objectScale,
            top: cy - 35 * objectScale,
            width: 70 * objectScale,
            height: 70 * objectScale,
            background: "linear-gradient(135deg, rgba(100,180,255,0.8), rgba(60,100,200,0.8))",
            borderRadius: 10 * objectScale,
            border: "2px solid rgba(150,210,255,0.9)",
            boxShadow: `0 0 ${20 * objectScale}px rgba(100,180,255,0.6)`,
            transform: `rotate(${frame * 1.5}deg)`,
          }}
        />
      )}

      {/* Arrow indicators */}
      {showArrows && (
        <svg
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
          width={width}
          height={height}
        >
          {arrowPhase === "together" ? (
            <>
              {/* Left arrow → right (toward center) */}
              <Arrow x1={cx - spread + 60} y1={cy} x2={cx - 60} y2={cy} frame={frame} phase="together" />
              {/* Right arrow → left (toward center) */}
              <Arrow x1={cx + spread - 60} y1={cy} x2={cx + 60} y2={cy} frame={frame} phase="together" flip />
            </>
          ) : (
            <>
              {/* Left arrow ← (away from center) */}
              <Arrow x1={cx - 60} y1={cy} x2={cx - spread + 60} y2={cy} frame={frame} phase="apart" flip />
              {/* Right arrow → (away from center) */}
              <Arrow x1={cx + 60} y1={cy} x2={cx + spread - 60} y2={cy} frame={frame} phase="apart" />
            </>
          )}
        </svg>
      )}

      {/* Controllers */}
      <div
        style={{
          position: "absolute",
          left: cx - spread - 110,
          top: cy - 130 + bob,
        }}
      >
        <Controller grabHighlight={finalGrabHighlight} />
      </div>

      <div
        style={{
          position: "absolute",
          left: cx + spread - 110,
          top: cy - 130 + bob,
        }}
      >
        <Controller flip grabHighlight={finalGrabHighlight} />
      </div>

      {/* Step text */}
      {stepTexts.map(({ text, start, end }) => {
        const opacity = clamp(
          interpolate(frame, [start, start + 15, end - 15, end], [0, 1, 1, 0])
        );
        if (opacity === 0) return null;
        return (
          <div
            key={text}
            style={{
              position: "absolute",
              bottom: 70,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "white",
              fontSize: 26,
              fontWeight: 600,
              opacity,
              lineHeight: 1.5,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              whiteSpace: "pre-line",
            }}
          >
            {text}
          </div>
        );
      })}

      {/* Scale label */}
      {frame >= PHASES.SCALE_TOGETHER.start && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#FFD700",
            fontSize: 18,
            fontWeight: 700,
            opacity: clamp(interpolate(frame, [PHASES.SCALE_TOGETHER.start, PHASES.SCALE_TOGETHER.start + 10], [0, 1])),
            letterSpacing: 1,
          }}
        >
          Scale: {Math.round(objectScale * 100)}%
        </div>
      )}
    </div>
  );
};

// Animated arrow component
const Arrow: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  frame: number; phase: string; flip?: boolean;
}> = ({ x1, y1, x2, y2, frame, phase, flip = false }) => {
  const t = (frame % 30) / 30;
  const alpha = clamp(interpolate(t, [0, 0.3, 0.7, 1], [0, 1, 1, 0]));
  const color = phase === "together" ? "#FFD700" : "#00FFCC";

  const dx = x2 - x1;
  const len = Math.abs(dx);
  const arrowSize = 12;

  return (
    <g opacity={alpha}>
      <defs>
        <marker id={`arrow-${phase}-${flip ? "r" : "l"}`} markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={color} />
        </marker>
      </defs>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth="3"
        strokeDasharray="10,5"
        markerEnd={`url(#arrow-${phase}-${flip ? "r" : "l"})`}
      />
    </g>
  );
};
