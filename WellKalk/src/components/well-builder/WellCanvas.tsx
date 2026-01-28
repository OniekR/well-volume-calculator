import { WellSlice } from "../../utils/wellGeometry";

interface WellCanvasProps {
  slices: WellSlice[];
}

const WellCanvas = ({ slices }: WellCanvasProps) => {
  const maxDepth = Math.max(100, ...slices.map((slice) => slice.depthBottom));
  const maxDiameter = Math.max(10, ...slices.map((slice) => slice.diameter));

  return (
    <svg viewBox={`0 0 200 ${maxDepth + 50}`} className="h-[420px] w-full">
      {slices.map((slice) => {
        const width = (slice.diameter / maxDiameter) * 120;
        const x = 100 - width / 2;
        const y = slice.depthTop;
        const height = Math.max(2, slice.depthBottom - slice.depthTop);
        return (
          <g key={slice.id}>
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill={slice.color}
              stroke="var(--eq-border)"
              strokeWidth={0.5}
              rx={4}
            />
            <text x={x + width + 6} y={y + 12} fontSize={10} fill="var(--eq-text)">
              {slice.label}
            </text>
            <line
              x1={0}
              y1={slice.depthTop}
              x2={200}
              y2={slice.depthTop}
              stroke="#e0e7ee"
              strokeWidth={0.5}
            />
          </g>
        );
      })}
    </svg>
  );
};

export default WellCanvas;