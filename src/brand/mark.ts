export const BRAND = {
  ink: "#26282b",
  light: "#ffffff",
  accent: "#b9420b",
  amber: "#e18a50",
  rust: "#94421f",
} as const;
export const MARK = {
  viewBox: 48,
  polygons: [
    {
      points: [
        [24, 4],
        [44, 39],
        [4, 39],
      ],
      fill: BRAND.accent,
    },
    {
      points: [
        [24, 4],
        [24, 29],
        [4, 39],
      ],
      fill: BRAND.amber,
    },
    {
      points: [
        [24, 29],
        [44, 39],
        [4, 39],
      ],
      fill: BRAND.rust,
    },
  ],
  seams: [
    [
      [24, 4],
      [24, 29],
      [44, 39],
    ],
    [
      [24, 29],
      [4, 39],
    ],
  ],
  strokeWidth: 1.5,
} as const;
export function prismMarkSvg(variant: "color" | "ink" | "light" = "color") {
  const ink = variant === "light" ? BRAND.light : BRAND.ink;
  const polygons = MARK.polygons
    .map(
      (shape) =>
        `<polygon points="${shape.points.map((point) => point.join(",")).join(" ")}" fill="${variant === "color" ? shape.fill : ink}"/>`,
    )
    .join("");
  const seams =
    variant === "color"
      ? MARK.seams
          .map(
            (points) =>
              `<polyline points="${points.map((point) => point.join(",")).join(" ")}" fill="none" stroke="${BRAND.light}" stroke-width="${MARK.strokeWidth}"/>`,
          )
          .join("")
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK.viewBox} ${MARK.viewBox}">${polygons}${seams}</svg>`;
}
