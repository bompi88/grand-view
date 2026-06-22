import { useTranslation } from 'react-i18next';
import { AppRoot, PlatformProvider, WorkspaceProvider } from '@gv/ui';
import type { BootContext } from './bootstrap/bootstrap.js';
import { SUPPORTED_LANGUAGES } from './i18n.js';

export function App({ boot }: { boot: BootContext }) {
  const { t, i18n } = useTranslation();

  return (
    <PlatformProvider adapter={boot.adapter}>
      <WorkspaceProvider workspace={boot.workspace}>
        <div className="gv-app">
          <header className="gv-header">
            <div>
              <h1>{t('app.title')}</h1>
              <p className="gv-tagline">{t('app.tagline')}</p>
            </div>
            <label className="gv-lang">
              {t('lang.label')}:{' '}
              <select
                value={i18n.language}
                onChange={(e) => void i18n.changeLanguage(e.target.value)}
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
          </header>
          <main className="gv-main gv-main-flex">
            <AppRoot />
          </main>
          <footer className="gv-footer">{boot.adapter.platform} · local-first</footer>
        </div>
      </WorkspaceProvider>
    </PlatformProvider>
  );
}
