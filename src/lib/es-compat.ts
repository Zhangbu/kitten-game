/**
 * ES Module compat layer for Kitten Game
 *
 * Provides helpers for dual-registration (ES module export + global namespace)
 * during the migration from legacy script loading to ES modules.
 */

/**
 * Export a value as an ES module export AND assign it to a global namespace path.
 */
export function exportGlobal<T>(name: string, value: T): T {
  const parts = name.split('.');
  let obj: any = window;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
  return value;
}

/**
 * Create a globally-accessible namespace if it doesn't exist.
 */
export function ensureNamespace(name: string): void {
  const parts = name.split('.');
  let obj: any = window;
  for (let i = 0; i < parts.length; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
}
