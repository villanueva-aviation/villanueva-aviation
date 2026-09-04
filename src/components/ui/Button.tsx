import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";

const HOVER = "[@media(hover:hover)_and_(pointer:fine)]:hover" as const;

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: `bg-gold-500 text-navy-950 ${HOVER}:bg-gold-400 shadow-[0_0_20px_rgba(212,175,55,0.35)] ${HOVER}:shadow-[0_0_32px_rgba(212,175,55,0.55)] ${HOVER}:scale-[1.03] active:scale-[0.97]`,
  secondary: `bg-transparent text-white border border-white/30 ${HOVER}:bg-white/10 ${HOVER}:border-gold-500/50 ${HOVER}:shadow-[0_0_20px_rgba(212,175,55,0.18)] ${HOVER}:scale-[1.03] active:scale-[0.97]`,
  ghost: `bg-transparent text-gold-400 ${HOVER}:text-gold-300`,
};

const BASE_CLASSES =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold font-display tracking-wide transition-[transform,background-color,border-color,box-shadow,color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100";

function Shimmer() {
  return (
    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-x-full" />
  );
}

interface CommonProps {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; to?: undefined };

type ButtonAsAnchor = CommonProps & {
  href: string;
  to?: undefined;
  target?: string;
  rel?: string;
};

type ButtonAsLink = CommonProps & { to: LinkProps["to"]; href?: undefined };

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = "primary", children, className = "" } = props;
  const classes = `${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${className}`;
  const shimmer = variant !== "ghost";

  if ("to" in props && props.to !== undefined) {
    const { to } = props;
    return (
      <Link to={to} className={classes}>
        {shimmer && <Shimmer />}
        {children}
      </Link>
    );
  }

  if ("href" in props && props.href !== undefined) {
    const { href, target, rel } = props;
    return (
      <a href={href} target={target} rel={rel} className={classes}>
        {shimmer && <Shimmer />}
        {children}
      </a>
    );
  }

  const { variant: _v, children: _c, className: _cl, ...rest } = props as ButtonAsButton;
  return (
    <button {...rest} className={classes}>
      {shimmer && <Shimmer />}
      {children}
    </button>
  );
}
