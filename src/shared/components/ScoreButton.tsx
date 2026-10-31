// A button component for selecting a score with color coding based on the value.
export function ScoreButton({
  value,
  selected,
  onClick,
}: {
  value: number;
  selected: boolean;
  onClick: () => void;
}) {
  const getColor = (v: number) =>
    v >= 9 ? "#34d399" : v >= 7 ? "#60a5fa" : v >= 5 ? "#fbbf24" : "#f87171";

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-150"
      style={{
        background: selected ? getColor(value) + "22" : "rgba(15,23,42,0.6)",
        border: `1px solid ${selected ? getColor(value) : "rgba(99,102,241,0.15)"}`,
        color: selected ? getColor(value) : "#64748b",
        transform: selected ? "scale(1.1)" : "scale(1)",
        boxShadow: selected ? `0 0 12px ${getColor(value)}40` : "none",
      }}
    >
      {value}
    </button>
  );
}
