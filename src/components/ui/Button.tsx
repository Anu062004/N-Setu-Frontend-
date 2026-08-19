import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "blue";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size === "sm" ? "btn--sm" : "",
    block ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={classes} {...rest} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  block = false,
  className = "",
  href,
  children,
}: {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  href: string;
  children: React.ReactNode;
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    size === "sm" ? "btn--sm" : "",
    block ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}