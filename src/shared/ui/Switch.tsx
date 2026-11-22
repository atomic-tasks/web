import { SwitchButton, SwitchField } from "react-aria-components";

import "./Switch.css";

export interface SwitchProps {
  children: string;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
}

/** Переключатель «включено/выключено» с подписью (React Aria `Switch`). */
export function Switch({ children, isSelected, onChange }: SwitchProps) {
  return (
    <SwitchField isSelected={isSelected} onChange={onChange}>
      <SwitchButton className="Switch">
        <span className="Switch-track" aria-hidden="true">
          <span className="Switch-thumb" />
        </span>
        {children}
      </SwitchButton>
    </SwitchField>
  );
}
