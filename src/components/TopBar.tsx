import { useLanguage } from "../i18n/LanguageContext";
import type { Locale } from "../i18n/translations";

export default function TopBar() {
  const { t, locale, setLocale, locales } = useLanguage();

  return (
    <header className="top-bar">
      <div className="top-bar-brand">
        <img src="/logo.png?v=colored" alt="" className="top-bar-logo" />
        <span className="top-bar-title">{t.appTitle}</span>
      </div>
      <label className="lang-select-wrap">
        <span className="lang-select-label">{t.languageLabel}</span>
        <select
          className="lang-select"
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          aria-label={t.languageLabel}
        >
          {locales.map((item) => (
            <option key={item.code} value={item.code}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
