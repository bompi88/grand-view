import coreMethods from './core';
import documentsMethods from './documents';
import settingsMethods from './settings';

export default function () {
  coreMethods();
  settingsMethods();
  documentsMethods();
}
