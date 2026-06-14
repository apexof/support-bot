import { type ButtonHTMLAttributes, type FC, type PropsWithChildren } from "react";
import { cn } from "@/shared/lib";
import s from "./Button.module.css";

const sizeStyles = {
  sm: s.sizeSm,
  md: s.sizeMd,
  lg: s.sizeLg,
} as const;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: FC<PropsWithChildren<Props>> = (props) => {
  const { children, variant = "primary", size = "md", className, ...rest } = props;

  return (
    <button
      className={cn(s.button, s[variant], sizeStyles[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
};
