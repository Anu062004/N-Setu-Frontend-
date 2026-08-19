import { useState } from "react";

/**
 * Renders an image only if the file exists. Missing assets render nothing —
 * no broken icon, no layout jump. Files can be dropped in later with zero code
 * changes (see docs/IMAGE_SPEC.md).
 */
export function SmartImage({
  src,
  alt,
  className,
  eager = false,
  onMissing,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  onMissing?: () => void;
}) {
  const [ok, setOk] = useState(true);

  if (!ok) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      onError={() => {
        setOk(false);
        onMissing?.();
      }}
    />
  );
}