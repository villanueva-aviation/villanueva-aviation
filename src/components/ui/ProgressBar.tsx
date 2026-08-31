export function ProgressBar({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={`w-full overflow-hidden rounded-full bg-white/10 ${height}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 transition-all duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
