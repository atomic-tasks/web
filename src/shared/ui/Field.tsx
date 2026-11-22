import { Input, Label, TextArea, TextField as AriaTextField } from "react-aria-components";

import "./Field.css";

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Многострочное поле (описание). */
  multiline?: boolean;
  isRequired?: boolean;
  maxLength?: number;
}

/** Текстовое поле с подписью (React Aria): подпись, фокус и ошибки доступны скринридеру. */
export function TextField({ label, multiline, ...props }: TextFieldProps) {
  return (
    <AriaTextField {...props} className="Field">
      <Label className="Field-label">{label}</Label>
      {multiline ? (
        <TextArea className="Field-input" rows={4} />
      ) : (
        <Input className="Field-input" />
      )}
    </AriaTextField>
  );
}

export interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

const SLIDER_FORMAT = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

/** Ползунок (нативный `<input type="range">`, платформа раньше библиотек): стрелки меняют на шаг, значение видно в подписи. */
export function SliderField({ label, value, onChange, min, max, step }: SliderFieldProps) {
  const shown = SLIDER_FORMAT.format(value);
  return (
    <label className="Field">
      <span className="Field-label">
        {label}: <output className="Field-value">{shown}</output>
      </span>
      <input
        className="Field-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={shown}
        onChange={(event) => {
          onChange(event.target.valueAsNumber);
        }}
      />
      <span className="Field-scale" aria-hidden="true">
        <span>{SLIDER_FORMAT.format(min)}</span>
        <span>{SLIDER_FORMAT.format(max)}</span>
      </span>
    </label>
  );
}

export interface SelectFieldProps<Id extends string> {
  label: string;
  value: Id;
  options: readonly { id: Id; label: string }[];
  onChange: (id: Id) => void;
}

/** Выбор из списка: нативный `<select>` (платформа раньше библиотек, `AGENTS.md`). */
export function SelectField<Id extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<Id>) {
  return (
    <label className="Field">
      <span className="Field-label">{label}</span>
      <select
        className="Field-input"
        value={value}
        onChange={(event) => {
          const next = options.find((option) => option.id === event.target.value);
          if (next) onChange(next.id);
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
