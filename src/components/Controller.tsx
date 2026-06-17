import React from "react";

interface ControllerProps {
  flip?: boolean;
  grabHighlight?: number; // 0-1 opacity of highlight
  style?: React.CSSProperties;
}

// SVG recreation of the VR controller (based on the grey oval controller shape)
export const Controller: React.FC<ControllerProps> = ({
  flip = false,
  grabHighlight = 0,
  style,
}) => {
  return (
    <div
      style={{
        position: "relative",
        width: 220,
        height: 260,
        transform: flip ? "scaleX(-1)" : undefined,
        ...style,
      }}
    >
      <svg
        width="220"
        height="260"
        viewBox="0 0 220 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main body - outer shell */}
        <ellipse cx="110" cy="140" rx="90" ry="108" fill="#B0B0B0" />
        <ellipse cx="110" cy="136" rx="85" ry="102" fill="#C8C8C8" />

        {/* Inner gradient for 3D feel */}
        <ellipse cx="110" cy="133" rx="80" ry="97" fill="#D4D4D4" />

        {/* Thumb area top bump */}
        <ellipse cx="110" cy="52" rx="52" ry="44" fill="#BEBEBE" />
        <ellipse cx="110" cy="50" rx="47" ry="40" fill="#CACACA" />

        {/* Thumbstick */}
        <circle cx="110" cy="68" r="22" fill="#888888" />
        <circle cx="110" cy="68" r="18" fill="#777777" />
        <circle cx="110" cy="65" r="14" fill="#666666" />
        <circle cx="107" cy="63" r="5" fill="#888888" opacity="0.5" />

        {/* Face buttons area (right side) */}
        <circle cx="150" cy="100" r="11" fill="#999999" />
        <circle cx="150" cy="100" r="8" fill="#888888" />

        <circle cx="135" cy="115" r="11" fill="#999999" />
        <circle cx="135" cy="115" r="8" fill="#888888" />

        {/* Trigger button - front top */}
        <path
          d="M75 38 Q110 20 145 38 L148 55 Q110 42 72 55 Z"
          fill="#AAAAAA"
        />
        <path
          d="M80 40 Q110 25 140 40 L143 52 Q110 38 77 52 Z"
          fill="#BBBBBB"
        />

        {/* Grab button - side grip area (THIS is what gets highlighted) */}
        <path
          d="M28 145 Q18 165 22 190 Q26 210 42 218 L52 210 Q36 202 34 185 Q30 162 42 145 Z"
          fill="#AAAAAA"
        />

        {/* Grab button highlight overlay */}
        {grabHighlight > 0 && (
          <>
            <path
              d="M28 145 Q18 165 22 190 Q26 210 42 218 L52 210 Q36 202 34 185 Q30 162 42 145 Z"
              fill={`rgba(255, 200, 0, ${grabHighlight * 0.8})`}
            />
            <path
              d="M28 145 Q18 165 22 190 Q26 210 42 218 L52 210 Q36 202 34 185 Q30 162 42 145 Z"
              stroke={`rgba(255, 220, 0, ${grabHighlight})`}
              strokeWidth="3"
              fill="none"
            />
            {/* Glow effect */}
            <path
              d="M24 142 Q12 163 16 192 Q20 215 40 224 L56 213 Q38 205 36 187 Q31 160 44 142 Z"
              stroke={`rgba(255, 220, 0, ${grabHighlight * 0.4})`}
              strokeWidth="6"
              fill="none"
            />
          </>
        )}

        {/* Bottom grip */}
        <path
          d="M70 220 Q110 240 150 220 L155 245 Q110 260 65 245 Z"
          fill="#AAAAAA"
        />
        <path
          d="M75 222 Q110 238 145 222 L148 240 Q110 254 72 240 Z"
          fill="#B8B8B8"
        />

        {/* Menu / system button */}
        <circle cx="84" cy="100" r="9" fill="#999999" />
        <circle cx="84" cy="100" r="7" fill="#888888" />

        {/* Shine/highlight */}
        <ellipse
          cx="88"
          cy="85"
          rx="28"
          ry="20"
          fill="white"
          opacity="0.12"
          transform="rotate(-15, 88, 85)"
        />
      </svg>

      {/* Grab button label */}
      {grabHighlight > 0.5 && (
        <div
          style={{
            position: "absolute",
            left: -90,
            top: 155,
            background: "rgba(255, 200, 0, 0.95)",
            color: "#000",
            fontSize: 13,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 20,
            whiteSpace: "nowrap",
            opacity: Math.min(1, (grabHighlight - 0.5) * 2),
            fontFamily: "sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          GRAB
        </div>
      )}
    </div>
  );
};
