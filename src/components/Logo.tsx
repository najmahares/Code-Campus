import Image from "next/image";

export function LogoMark({ size = 56, color = "#E8A0A8" }: { size?: number; color?: string }) {
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <Image
        src="/deer.svg"
        alt="Code Campus"
        fill
        style={{ objectFit: "contain", filter: `drop-shadow(0 0 0 ${color})` }}
      />
    </div>
  );
}

export function LogoLockup({ size = 56, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}>
      <LogoMark size={size} />
      <span style={{
        fontFamily: "'Quicksand', sans-serif",
        fontWeight: 700,
        fontSize: "1.75rem",
        letterSpacing: "-0.05em",
        lineHeight: 1,
      }}>
        <span style={{ color }}>Code</span>
        <span style={{ color: "#E8A0A8" }}> Campus</span>
      </span>
    </div>
  );
}
