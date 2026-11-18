export interface LoadingProps {
  label?: string;
}

/** Индикатор загрузки на месте данных. */
export function Loading({ label = "Загрузка…" }: LoadingProps) {
  return (
    <p role="status" aria-live="polite">
      {label}
    </p>
  );
}
