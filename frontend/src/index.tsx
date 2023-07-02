/* @refresh reload */
import { render } from 'solid-js/web';
import translations from './translations';
import './index.css';
import App from './App';

import { TransProvider } from '@mbarzda/solid-i18next';

render(() =>
  <TransProvider options={{ fallbackLng: "en", resources: translations }} children={<App />} />
  , document.getElementById('root') as HTMLElement);
