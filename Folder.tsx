import React, { useEffect, useRef, useState } from "react";

export interface FolderProps {
  /** Bold uppercase label on the front card, e.g. "CONFIDENTIAL FILES". */
  title?: string;
  /** Smaller label under the title, e.g. "Internal use only". */
  subtitle?: string;
  /** Mark rendered top-left on the front card. Defaults to a small flower glyph. */
  logo?: React.ReactNode;
  /** Vertical label shown on the document's spine while it's peeking out, closed. */
  peekLabel?: string;
  /** Content revealed on the document when the folder is opened. */
  children?: React.ReactNode;
  /** Extra classes on the outer wrapper — control size via max-w-*, w-*, etc. */
  className?: string;
}

type Phase =
  | "closed"
  | "opening-pull"
  | "opening-over"
  | "opening-flip"
  | "open"
  | "closing-flip"
  | "closing-out"
  | "closing-over";

// Durations (ms) for each leg of the open/close sequences.
const FLIP_MS = 500; // rotateY flip, either direction
const SIDE_MS = 350; // slide fully clear of the card
const ENTER_MS = 500; // slide from clear-of-card back to the peek spot
const PULL_MS = ENTER_MS; // reverse of "enter"
const OVER_MS = SIDE_MS; // reverse of "side"

interface PhaseConfig {
  /** How far the document sits from its aligned-with-card position, as a % translateX. */
  pos: number;
  /** rotateY of the flip card: 0 = front face (peek label), 180 = back face (content). */
  flip: number;
  /** Whether the document renders above (true) or behind (false) the front card. */
  front: boolean;
  /** Whether the whole folder faces the viewer flat (true) or sits at its idle 3D tilt (false). */
  flat: boolean;
  /** Transition duration for the position leg landing on this phase. */
  posDuration: number;
}

const CONFIG: Record<Phase, PhaseConfig> = {
  closed: { pos: 0, flip: 0, front: false, flat: false, posDuration: 400 },
  // pull: the door swings ajar (flat:false) just long enough for the document to
  // slip out from behind it, out to the side
  "opening-pull": { pos: 135, flip: 0, front: false, flat: false, posDuration: PULL_MS },
  // over: once it's clear, the door swings shut flat again and the document comes
  // to the front, sliding back in over the closed door's face
  "opening-over": { pos: 0, flip: 0, front: true, flat: true, posDuration: OVER_MS },
  "opening-flip": { pos: 0, flip: 180, front: true, flat: true, posDuration: FLIP_MS },
  open: { pos: 0, flip: 180, front: true, flat: true, posDuration: 500 },
  "closing-flip": { pos: 0, flip: 0, front: true, flat: true, posDuration: FLIP_MS },
  // out: door stays shut flat while the document, still in front, slides out to the side
  "closing-out": { pos: 135, flip: 0, front: true, flat: true, posDuration: OVER_MS },
  // over: the door swings ajar again (flat:false) so the document can duck back
  // behind it on this last leg home (mirrors "pull")
  "closing-over": { pos: 0, flip: 0, front: false, flat: false, posDuration: PULL_MS },
};

/**
 * Folder
 *
 * A reusable, premium-feeling "confidential folder" card built with layered
 * <div>s, CSS 3D transforms, and Tailwind (no SVG).
 *
 * - At rest the document is fully hidden behind the card; hovering slides it
 *   out to peek from behind the right edge.
 * - Clicking plays the open sequence: the document pulls out from behind the
 *   card to the side, slides back over to align with the card, then flips
 *   front-to-back to land face-up in front of the card, revealing `children`.
 * - Clicking again plays the reverse close sequence: the document flips back
 *   to its front face, slides out to the side clear of the card, then slides
 *   back in from the right and tucks itself behind the card again.
 *
 * Usage:
 *   <Folder title="CONFIDENTIAL FILES" subtitle="Internal use only" peekLabel="DO NOT OPEN">
 *     <p>This document is classified and intended solely for authorized personnel.</p>
 *   </Folder>
 */
const Folder: React.FC<FolderProps> = ({
  title = "CONFIDENTIAL FILES",
  subtitle = "Internal use only",
  logo,
  peekLabel = "DO NOT OPEN",
  children,
  className = "",
}) => {
  const [phase, setPhase] = useState<Phase>("closed");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const handleToggle = () => {
    if (phase === "closed") {
      setPhase("opening-pull");
      timers.current.push(setTimeout(() => setPhase("opening-over"), PULL_MS));
      timers.current.push(setTimeout(() => setPhase("opening-flip"), PULL_MS + OVER_MS));
      timers.current.push(setTimeout(() => setPhase("open"), PULL_MS + OVER_MS + FLIP_MS));
      return;
    }
    if (phase === "open") {
      setPhase("closing-flip");
      timers.current.push(setTimeout(() => setPhase("closing-out"), FLIP_MS));
      timers.current.push(setTimeout(() => setPhase("closing-over"), FLIP_MS + OVER_MS));
      timers.current.push(
        setTimeout(() => setPhase("closed"), FLIP_MS + OVER_MS + PULL_MS)
      );
    }
    // Ignore clicks while mid-animation.
  };

  const cfg = CONFIG[phase];

  return (
    <div
      className={`relative w-full max-w-sm select-none ${className}`}
      style={{ aspectRatio: "3 / 4", perspective: "1400px" }}
    >
      {/* FOLDER BACK — a slightly darker second layer, aligned exactly with the front
          card, giving the folder some physical thickness. Deliberately kept outside
          the tilting group below so it always stays flat, like a back cover resting
          on the table while the front cover lifts open. */}
      <div
        className="absolute inset-0 z-0 rounded-[22px]
                   bg-gradient-to-br from-[#2E52B8] to-[#152C6E]
                   shadow-[0_16px_30px_-14px_rgba(10,20,60,0.5)]"
      />

      <div
        role="button"
        tabIndex={0}
        aria-pressed={phase !== "closed"}
        aria-label={phase === "closed" ? "Open folder" : "Close folder"}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={[
          "group absolute inset-0 cursor-pointer outline-none transition-transform duration-500 ease-out",
          // At rest the folder sits dead flat; the 3D tilt only engages together with
          // the peek, on hover, while closed. Once a click starts an animation the
          // tilt is driven by phase (via inline style below) instead. Only this
          // wrapper (document + front card) tilts — the back panel above stays put.
          // transform-origin is pinned to the left edge (below) so it swings open
          // like a door hinged on the left: the top-left and bottom-left corners
          // never move, the right edge swings toward the viewer (growing larger),
          // and a slight scaleX narrows it as it turns — revealing the back panel
          // + document through the gap that opens up on the right. (No rotateX:
          // that would tilt the hinge line itself and un-pin the corners.)
          phase === "closed"
            ? "[transform:rotateY(0deg)_scaleX(1)] hover:[transform:rotateY(-14deg)_scaleX(0.9)]"
            : "",
        ].join(" ")}
        style={
          phase === "closed"
            ? { transformStyle: "preserve-3d", transformOrigin: "left center" }
            : {
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                transform: cfg.flat ? "rotateY(0deg) scaleX(1)" : "rotateY(-14deg) scaleX(0.9)",
              }
        }
      >
        {/* DOCUMENT POSITIONER — controls left/right placement and stacking order.
            Sandwiched between the folder back and the front card at rest; hovering
            (while closed) peeks it out from behind the right edge via group-hover. */}
        <div
          className={[
            // inset-[5%] keeps the document a bit smaller than the folder on every side.
            "absolute inset-[5%] ease-out",
            cfg.front ? "z-20" : "z-[7]",
            phase === "closed" ? "translate-x-0 transition-transform group-hover:translate-x-[12%]" : "",
          ].join(" ")}
          style={
            phase === "closed"
              ? { perspective: "1400px", transitionDuration: `${cfg.posDuration}ms` }
              : {
                  perspective: "1400px",
                  transform: `translateX(${cfg.pos}%)`,
                  transition: `transform ${cfg.posDuration}ms ease-out`,
                }
          }
        >
          {/* FLIP CARD — rotates 180deg front-to-back when opening/closing. While it's
              in front of the card (open, or mid-flip) it also sits at a slight diagonal,
              like a card that's been tossed down rather than placed perfectly straight. */}
          <div
            className="relative h-full w-full ease-out"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${cfg.flip}deg) rotate(${cfg.front ? -6 : 0}deg)`,
              transition: `transform ${FLIP_MS}ms ease-out`,
            }}
          >
            {/* FRONT FACE — peeking label, shown while closed */}
            <div
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-[6%]
                         shadow-[0_20px_40px_-12px_rgba(20,30,60,0.35)]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <span
                className="whitespace-nowrap text-[11px] font-medium tracking-[0.15em] text-[#2B2B2B]"
                style={{ writingMode: "vertical-rl" }}
              >
                {peekLabel}
              </span>
            </div>

            {/* BACK FACE — revealed content, faces the viewer once flipped open */}
            <div
              className="absolute inset-0 overflow-auto rounded-2xl bg-white p-[8%]
                         shadow-[0_20px_40px_-12px_rgba(20,30,60,0.35)]"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <div className="text-[13px] leading-relaxed text-[#2B2B2B]">{children}</div>
            </div>
          </div>
        </div>

        {/* FRONT CARD — always sits flush in its home position (no shift/dim when the
            document is in front); the tilt above is what shows the door opening. */}
        <div
          className="absolute inset-0 z-10 flex flex-col justify-between rounded-[22px] p-[7%]
                     bg-gradient-to-br from-[#3E68DE] via-[#3159C9] to-[#1F3F9E]
                     border border-white/10
                     shadow-[0_24px_44px_-16px_rgba(20,40,110,0.55),inset_0_1px_0_rgba(255,255,255,0.25)]"
        >
          <div className="text-white">
            {logo ?? <span className="text-2xl leading-none">✳</span>}
          </div>
          <div>
            <p className="font-mono text-[13px] font-semibold uppercase tracking-wide text-white">
              {title}
            </p>
            <p className="mt-1 text-[11px] text-white/70">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
