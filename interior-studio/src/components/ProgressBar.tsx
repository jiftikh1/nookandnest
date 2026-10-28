export default function ProgressBar({ pct, height = 6 }: { pct: number; height?: number }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, backgroundColor: "#F0EDE8" }}
      role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct === 100 ? "#4A7B5B" : "#8B7355" }} />
    </div>
  );
}
