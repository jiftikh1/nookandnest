import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  eyebrow?: string;
  quote?: string;
  height?: string;
  objectPosition?: string;
};

export default function SectionBreak({
  src,
  alt,
  eyebrow,
  quote,
  height = "420px",
  objectPosition = "center",
}: Props) {
  return (
    <section
      aria-label={alt}
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        style={{ objectFit: "cover", objectPosition }}
        sizes="100vw"
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(26,20,16,0.15) 0%, rgba(26,20,16,0.45) 60%, rgba(26,20,16,0.55) 100%)",
        }}
      />
      {(eyebrow || quote) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 2rem",
          }}
        >
          {eyebrow && (
            <p
              style={{
                fontSize: "0.65rem",
                letterSpacing: "0.5em",
                textTransform: "uppercase",
                color: "rgba(250,242,228,0.82)",
                marginBottom: "1.75rem",
              }}
            >
              {eyebrow}
            </p>
          )}
          {quote && (
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(1.4rem, 2.6vw, 2.2rem)",
                lineHeight: 1.45,
                color: "#FAF2E4",
                maxWidth: "780px",
              }}
            >
              {quote}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
