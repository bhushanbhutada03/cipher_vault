import { cn } from "@/utils/cn";

export function VaultDial({ className }: { className?: string }) {
  const ticks = Array.from({ length: 36 });

  return (
    <svg
      viewBox="0 0 320 320"
      className={cn("text-brass", className)}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="160" cy="160" r="150" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
      <g style={{ transformOrigin: "160px 160px", animation: "dial-turn 90s linear infinite" }}>
        {ticks.map((_, i) => {
          const angle = (i / ticks.length) * 360;
          const isMajor = i % 9 === 0;
          return (
            <line
              key={i}
              x1="160"
              y1={isMajor ? "18" : "26"}
              x2="160"
              y2="34"
              stroke="currentColor"
              strokeWidth={isMajor ? "2" : "1"}
              strokeOpacity={isMajor ? "0.85" : "0.35"}
              transform={`rotate(${angle} 160 160)`}
            />
          );
        })}
      </g>
      <circle cx="160" cy="160" r="108" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx="160" cy="160" r="72" fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" />
      <path
        d="M160 132a18 18 0 0 1 10 32.9V184a10 10 0 0 1-20 0v-19.1A18 18 0 0 1 160 132Z"
        fill="currentColor"
      />
    </svg>
  );
}
