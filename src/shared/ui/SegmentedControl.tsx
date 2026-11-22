import { ToggleButton, ToggleButtonGroup } from "react-aria-components";

import "./SegmentedControl.css";

export interface SegmentedControlItem<Id extends string> {
  id: Id;
  label: string;
}

export interface SegmentedControlProps<Id extends string> {
  "aria-label": string;
  items: readonly SegmentedControlItem<Id>[];
  selectedId: Id;
  onChange: (id: Id) => void;
}

/** Выбор одного варианта из нескольких (React Aria `ToggleButtonGroup`): стрелки, `aria-pressed`. */
export function SegmentedControl<Id extends string>({
  items,
  selectedId,
  onChange,
  ...props
}: SegmentedControlProps<Id>) {
  return (
    <ToggleButtonGroup
      {...props}
      className="SegmentedControl"
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[selectedId]}
      onSelectionChange={(keys) => {
        const next = items.find((item) => keys.has(item.id));
        if (next) onChange(next.id);
      }}
    >
      {items.map((item) => (
        <ToggleButton key={item.id} id={item.id} className="SegmentedControl-item">
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
