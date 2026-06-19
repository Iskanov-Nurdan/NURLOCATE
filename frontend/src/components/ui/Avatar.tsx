import { petAccent } from "../../utils/format";

export function Avatar({ name, size = 8 }: { name: string; size?: number }) {
  const bg = petAccent(name);
  return (
    <span
      className={`inline-grid h-${size} w-${size} shrink-0 place-items-center rounded-full text-xs font-bold text-[#07100d]`}
      style={{ background: bg }}
    >
      {name[0]?.toUpperCase()}
    </span>
  );
}
