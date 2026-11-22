import "./Badge.css";

export interface BadgeProps {
  /** Готовый текст значения. */
  children: string;
}

/** Пилюля со значением (например, приоритет). */
export function Badge({ children }: BadgeProps) {
  return <span className="Badge">{children}</span>;
}
