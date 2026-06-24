/**
 * ES Module compat layer for Kitten Game
 *
 * During migration, each game file needs to both export its classes (for ES module consumers)
 * and register them on the global namespace (for legacy code that references globals).
 *
 * This utility provides helpers for that dual-registration pattern.
 */

/**
 * Export a value as an ES module default AND assign it to a global namespace path.
 *
 * @param {string} name - Dot-separated global path, e.g. "classes.managers.ResourceManager"
 * @param {*} value - The value to export and assign globally
 * @returns {*} The value passed in (for chaining)
 */
export function exportGlobal(name, value) {
  const parts = name.split('.');
  let obj = window;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
  obj[parts[parts.length - 1]] = value;
  return value;
}

/**
 * Create a globally-accessible namespace if it doesn't exist.
 * Useful for ensuring namespaces like `com.nuclearunicorn` exist before classes are declared.
 *
 * @param {string} name - Dot-separated namespace path
 */
export function ensureNamespace(name) {
  const parts = name.split('.');
  let obj = window;
  for (let i = 0; i < parts.length; i++) {
    if (!obj[parts[i]]) obj[parts[i]] = {};
    obj = obj[parts[i]];
  }
}
