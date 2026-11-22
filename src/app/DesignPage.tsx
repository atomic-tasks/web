import { useEffect, useState } from "react";

import { AnchorButton } from "../shared/ui/AnchorButton";
import { Button } from "../shared/ui/Button";
import { ErrorMessage } from "../shared/ui/ErrorMessage";
import { CurrentIcon } from "../shared/ui/icons/CurrentIcon";
import { FolderIcon } from "../shared/ui/icons/FolderIcon";
import { Link } from "../shared/ui/Link";
import { Loading } from "../shared/ui/Loading";
import { TabBar } from "../shared/ui/TabBar";
import "./DesignPage.css";

const COLORS = [
  "bg",
  "surface",
  "surface-sunken",
  "text",
  "text-muted",
  "border-strong",
  "accent",
  "accent-soft",
  "success",
  "warning",
  "danger",
  "danger-surface",
] as const;

const TEXT_SIZES = ["caption", "small", "body", "title"] as const;
const RADII = ["sm", "md", "lg", "full"] as const;

/** Допустимые оттенки акцента 5–35 (спека 0004, «Акцент»). */
const HUE_MIN = 5;
const HUE_MAX = 35;
const HUE_DEFAULT = 18;

/** Витрина токенов и компонентов — только `pnpm dev` (маршрут `/design`, `DesignRoute`). */
export function DesignPage() {
  const [hue, setHue] = useState(HUE_DEFAULT);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent-hue", String(hue));
    return () => {
      document.documentElement.style.removeProperty("--accent-hue");
    };
  }, [hue]);

  return (
    <div className="DesignPage">
      <h2>Витрина токенов</h2>
      <p>Только для разработки. Тема — по настройке системы; эмуляция настроек — в DevTools.</p>

      <section aria-labelledby="design-accent">
        <h3 id="design-accent">Акцент</h3>
        <label className="DesignPage-slider">
          <span>Оттенок {hue}° (допустимо 5–35)</span>
          <input
            type="range"
            min={HUE_MIN}
            max={HUE_MAX}
            value={hue}
            aria-valuetext={`оттенок ${String(hue)} градусов`}
            onChange={(event) => {
              setHue(Number(event.target.value));
            }}
          />
        </label>
      </section>

      <section aria-labelledby="design-colors">
        <h3 id="design-colors">Цвета</h3>
        <ul className="DesignPage-swatches">
          {COLORS.map((name) => (
            <li key={name} className="DesignPage-swatch" data-token={name}>
              <span className="DesignPage-swatchName">--color-{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="design-type">
        <h3 id="design-type">Текст</h3>
        {TEXT_SIZES.map((size) => (
          <p key={size} className="DesignPage-text" data-size={size}>
            --font-size-{size}: Съешь ещё этих мягких французских булок
          </p>
        ))}
        <p className="DesignPage-muted">Вспомогательный текст (--color-text-muted)</p>
      </section>

      <section aria-labelledby="design-radius">
        <h3 id="design-radius">Радиусы</h3>
        <ul className="DesignPage-radii">
          {RADII.map((name) => (
            <li key={name} className="DesignPage-radius" data-radius={name}>
              {name}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="design-components">
        <h3 id="design-components">Компоненты</h3>
        <div className="DesignPage-row">
          <Button variant="primary">Основная</Button>
          <Button>Вторичная</Button>
          <Button isDisabled>Недоступна</Button>
          <AnchorButton href="/">Ссылка-кнопка</AnchorButton>
        </div>
        <p>
          Ссылка в тексте: <Link to="/">на главную</Link>
        </p>
        <ErrorMessage message="Нет связи с сервером" onRetry={() => undefined} />
        <Loading />
      </section>

      <TabBar
        aria-label="Основная навигация (витрина)"
        items={[
          { to: "/", label: "Главная", icon: <CurrentIcon /> },
          { to: "/design", label: "Витрина", icon: <FolderIcon /> },
        ]}
      />
    </div>
  );
}
