import type { FC } from "react";

export const Sparkline: FC<{ points: number[]; height?: number; className?: string }> = ({ points, height = 64, className }) => {
  const width = Math.max(60, points.length * 12);
  const max = Math.max(1, ...points);
  const step = points.length > 1 ? width / (points.length - 1) : width;
  const d = points.map((v, i) => {
    const x = i * step;
    const y = height - (v / max) * (height - 6) - 3;
    return `${i === 0 ? "M" : "L"} ${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className={className}>
      <path d={d} fill="none" stroke="currentColor" className="text-blue-600" strokeWidth="2" />
    </svg>
  );
};

export const Bars: FC<{ points: number[]; height?: number; className?: string }> = ({ points, height = 64, className }) => {
  const width = Math.max(60, points.length * 12);
  const max = Math.max(1, ...points);
  const barW = Math.max(4, Math.floor(width / (points.length * 1.8)));
  const gap = Math.max(2, Math.floor(barW / 2));
  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className={className}>
      {points.map((v,i)=> {
        const h = Math.max(2, (v/max)*(height-6));
        const x = i*(barW+gap);
        const y = height - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx="2" className="fill-indigo-600/70"/>;
      })}
    </svg>
  );
};
