import coreMethods from './core';
import documentsMethods from './documents';
import documentMethods from './document';
import settingsMethods from './settings';

export default function () {
  coreMethods();
  settingsMethods();
  documentsMethods();
  documentMethods();
}
