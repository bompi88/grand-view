import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n.js';
import { App } from './App.js';
import { bootstrap } from './bootstrap/bootstrap.js';
import './styles.css';

async function main() {
  const boot = await bootstrap();
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <StrictMode>
      <I18nextProvider i18n={i18n}>
        <App boot={boot} />
      </I18nextProvider>
    </StrictMode>,
  );
}

void main();
