"use client";

import { useRef, useState } from "react";

// ── SVG coordinate space ──────────────────────────────────
const SVG_W = 900;
const LABEL_W = 185;
const TL_W = SVG_W - LABEL_W; // 715
const ROW_H = 50;
const HEADER_H = 38;
const BAR_H = 22;
const HANDLE_W = 10;

// Literal brand colours (CSS vars don't work in SVG fill= attrs)
const C_BRAND   = "#1C3253";
const C_ACCENT  = "#2F5FB3";
const C_BORDER  = "#DDD9D0";
const C_SUNK    = "#F1EFEA";
const C_MUTED   = "#888888";
const C_TEXT    = "#111111";
const C_STRIPE  = "#F8F7F6";

// ── Date utils ────────────────────────────────────────────
function parse(iso: string): Date { return new Date(iso + "T00:00:00"); }
function iso(d: Date): string { return d.toISOString().slice(0, 10); }
function addDays(d: Date, n: number): Date { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function daysBetween(a: Date, b: Date): number { return Math.round((b.getTime() - a.getTime()) / 86400000); }
function fmtShort(d: Date): string { return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
function fmtMonthYear(d: Date): string { return d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }); }

// ── Props ─────────────────────────────────────────────────
interface Props {
  milestones: { id: string; label: string }[];
  dates: Record<string, string>;
  onChange: (dates: Record<string, string>) => void;
}

export default function GanttChart({ milestones, dates, onChange }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ id: string; startTlX: number; startDate: Date } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // ── Range ───────────────────────────────────────────────
  const milDates = milestones.map((m) => parse(dates[m.id]));
  const rangeStart = addDays(milDates[0], -7);
  const rangeEnd   = addDays(milDates[milDates.length - 1], 18);
  const totalDays  = daysBetween(rangeStart, rangeEnd);
  const svgH = HEADER_H + milestones.length * ROW_H + 1;

  // ── Coord helpers ───────────────────────────────────────
  function dateToX(d: Date): number {
    return (daysBetween(rangeStart, d) / totalDays) * TL_W;
  }
  function tlXToDate(tlX: number): Date {
    return addDays(rangeStart, Math.round((tlX / TL_W) * totalDays));
  }
  function clientToTlX(clientX: number): number {
    if (!svgRef.current) return 0;
    const { left, width } = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - left) / width) * SVG_W;
    return svgX - LABEL_W;
  }

  // ── Grid markers ────────────────────────────────────────
  const monthMarkers: { x: number; label: string }[] = [];
  const d0 = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  for (let d = new Date(d0); d <= rangeEnd; d.setMonth(d.getMonth() + 1)) {
    const x = dateToX(d);
    if (x >= 0) monthMarkers.push({ x, label: fmtMonthYear(new Date(d)) });
  }

  const weekLines: number[] = [];
  const wk = new Date(rangeStart);
  while (wk.getDay() !== 1) wk.setDate(wk.getDate() + 1);
  for (; wk <= rangeEnd; wk.setDate(wk.getDate() + 7)) {
    const x = dateToX(wk);
    if (x >= 0 && x <= TL_W) weekLines.push(x);
  }

  const todayX = dateToX(new Date());

  // ── Drag handlers ────────────────────────────────────────
  function onHandleDown(e: React.PointerEvent<SVGRectElement>, id: string) {
    e.preventDefault();
    svgRef.current?.setPointerCapture(e.pointerId);
    dragRef.current = { id, startTlX: clientToTlX(e.clientX), startDate: parse(dates[id]) };
    setIsDragging(true);
  }

  function onSvgMove(e: React.PointerEvent<SVGSVGElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = clientToTlX(e.clientX) - drag.startTlX;
    const delta = Math.round((dx / TL_W) * totalDays);
    const newDate = addDays(drag.startDate, delta);

    const idx = milestones.findIndex((m) => m.id === drag.id);
    const lo = idx > 0 ? addDays(parse(dates[milestones[idx - 1].id]), 1) : addDays(rangeStart, 1);
    const hi = idx < milestones.length - 1 ? addDays(parse(dates[milestones[idx + 1].id]), -1) : rangeEnd;
    const clamped = new Date(Math.max(lo.getTime(), Math.min(hi.getTime(), newDate.getTime())));

    onChange({ ...dates, [drag.id]: iso(clamped) });
  }

  function onSvgUp() {
    dragRef.current = null;
    setIsDragging(false);
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden shadow-sm">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${svgH}`}
        width="100%"
        className="block"
        style={{ cursor: isDragging ? "ew-resize" : "default", userSelect: "none" }}
        onPointerMove={onSvgMove}
        onPointerUp={onSvgUp}
        onPointerCancel={onSvgUp}
      >
        {/* Background */}
        <rect width={SVG_W} height={svgH} fill="white" />

        {/* Header strip */}
        <rect x={LABEL_W} width={TL_W} height={HEADER_H} fill={C_SUNK} />

        {/* Week grid lines */}
        {weekLines.map((x, i) => (
          <line key={i}
            x1={LABEL_W + x} y1={HEADER_H}
            x2={LABEL_W + x} y2={svgH}
            stroke={C_BORDER} strokeWidth={0.5}
          />
        ))}

        {/* Month separators + labels */}
        {monthMarkers.map((m, i) => (
          <g key={i}>
            <line x1={LABEL_W + m.x} y1={0} x2={LABEL_W + m.x} y2={HEADER_H} stroke={C_BORDER} strokeWidth={1} />
            <text x={LABEL_W + m.x + 5} y={HEADER_H / 2 + 4}
              fill={C_MUTED} fontSize={10.5}
              fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.05em"
            >
              {m.label}
            </text>
          </g>
        ))}

        {/* Today line */}
        {todayX >= 0 && todayX <= TL_W && (
          <g>
            <line
              x1={LABEL_W + todayX} y1={HEADER_H}
              x2={LABEL_W + todayX} y2={svgH}
              stroke={C_ACCENT} strokeWidth={1.5} strokeDasharray="4 3"
            />
            <rect x={LABEL_W + todayX - 16} y={HEADER_H - 16} width={32} height={15} rx={3} fill={C_ACCENT} />
            <text x={LABEL_W + todayX} y={HEADER_H - 5}
              textAnchor="middle" fill="white" fontSize={9}
              fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.06em"
            >
              TODAY
            </text>
          </g>
        )}

        {/* Rows */}
        {milestones.map((m, i) => {
          const rowY   = HEADER_H + i * ROW_H;
          const barY   = rowY + (ROW_H - BAR_H) / 2;
          const target = parse(dates[m.id]);
          const prev   = i > 0 ? parse(dates[milestones[i - 1].id]) : addDays(target, -7);
          const x1     = Math.max(0, dateToX(i > 0 ? prev : addDays(target, -7)));
          const x2     = dateToX(target);
          const barW   = Math.max(HANDLE_W + 2, x2 - x1);
          const isHov  = hoveredId === m.id;

          return (
            <g key={m.id}>
              {/* Row stripe */}
              <rect x={0} y={rowY} width={SVG_W} height={ROW_H}
                fill={i % 2 === 0 ? "white" : C_STRIPE}
              />
              {/* Row top border */}
              <line x1={0} y1={rowY} x2={SVG_W} y2={rowY} stroke={C_BORDER} strokeWidth={0.5} />

              {/* Milestone label */}
              <text
                x={LABEL_W - 14} y={rowY + ROW_H / 2 + 4.5}
                textAnchor="end"
                fill={C_TEXT} fontSize={12.5}
                fontFamily="'IBM Plex Sans', sans-serif" fontWeight="500"
              >
                {m.label}
              </text>

              {/* Milestone number badge */}
              <text
                x={8} y={rowY + ROW_H / 2 + 4}
                fill={C_MUTED} fontSize={10}
                fontFamily="'IBM Plex Mono', monospace"
              >
                {String(i + 1).padStart(2, "0")}
              </text>

              {/* Bar body */}
              <rect
                x={LABEL_W + x1} y={barY}
                width={barW} height={BAR_H} rx={4}
                fill={C_BRAND} opacity={isHov ? 1 : 0.88}
              />

              {/* Date label inside bar (if wide enough) */}
              {barW > 72 && (
                <text
                  x={LABEL_W + x1 + 9} y={barY + BAR_H / 2 + 4}
                  fill="white" fontSize={10} opacity={0.9}
                  fontFamily="'IBM Plex Mono', monospace" letterSpacing="0.03em"
                  style={{ pointerEvents: "none" }}
                >
                  {fmtShort(target)}
                </text>
              )}

              {/* Date label to the right of handle (always visible) */}
              <text
                x={LABEL_W + x2 + HANDLE_W / 2 + 6}
                y={barY + BAR_H / 2 + 4}
                fill={isHov ? C_ACCENT : C_MUTED}
                fontSize={10.5}
                fontFamily="'IBM Plex Mono', monospace"
                letterSpacing="0.03em"
                style={{ pointerEvents: "none" }}
              >
                {fmtShort(target)}
              </text>

              {/* Drag handle */}
              <rect
                x={LABEL_W + x2 - HANDLE_W / 2} y={barY - 2}
                width={HANDLE_W} height={BAR_H + 4} rx={3}
                fill={isHov ? C_ACCENT : C_BRAND}
                style={{ cursor: "ew-resize" }}
                onPointerDown={(e) => onHandleDown(e, m.id)}
                onPointerEnter={() => setHoveredId(m.id)}
                onPointerLeave={() => setHoveredId(null)}
              />

              {/* Grip dots */}
              {[-3, 0, 3].map((dy) => (
                <circle key={dy}
                  cx={LABEL_W + x2} cy={barY + BAR_H / 2 + dy}
                  r={1.2} fill="white" opacity={0.75}
                  style={{ pointerEvents: "none" }}
                />
              ))}
            </g>
          );
        })}

        {/* Bottom border */}
        <line x1={0} y1={svgH - 1} x2={SVG_W} y2={svgH - 1} stroke={C_BORDER} strokeWidth={1} />

        {/* Label / timeline divider */}
        <line x1={LABEL_W} y1={0} x2={LABEL_W} y2={svgH} stroke={C_BORDER} strokeWidth={1} />
      </svg>
    </div>
  );
}
