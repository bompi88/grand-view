import { useTranslation } from 'react-i18next';
import { DocProvider, PlatformProvider, TreeView } from '@gv/ui';
import type { BootContext } from './bootstrap/wireWeb.js';
import { SUPPORTED_LANGUAGES } from './i18n.js';

export function App({ boot }: { boot: BootContext }) {
  const { t, i18n } = useTranslation();

  return (
    <PlatformProvider adapter={boot.adapter}>
      <DocProvider doc={boot.doc}>
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
          <main className="gv-main">
            <TreeView />
          </main>
          <footer className="gv-footer">
            {boot.adapter.platform} · local-first · provider: {boot.provider.kind}
          </footer>
        </div>
      </DocProvider>
    </PlatformProvider>
  );
}
