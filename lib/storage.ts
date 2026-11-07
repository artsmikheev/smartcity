// Keep each require literal so Metro can bundle the local assets. Lazy loaders
// also let non-asset callers import this helper without loading JPGs in Node.
const localAssets: Readonly<Record<string, () => number | string>> = {
  "reutov-urban-day-concept.jpg": () =>
    require("../assets/images/reutov-urban-day-concept.jpg"),
  "reutov-urban-evening-concept.jpg": () =>
    require("../assets/images/reutov-urban-evening-concept.jpg"),
  "reutov-terrace-view-concept.jpg": () =>
    require("../assets/images/reutov-terrace-view-concept.jpg"),
};

export function resolveMediaUrl(
  path: string | null | undefined,
): number | string | null {
  if (!path || !path.trim()) return null;

  if (/^https?:\/\/[^\s]+$/i.test(path)) {
    try {
      const url = new URL(path);
      if (url.hostname) return path;
    } catch {
      return null;
    }
  }

  if (!path.startsWith("asset://")) return null;

  const key = path.slice("asset://".length).replace(/^(?:assets\/)?images\//, "");
  if (!Object.prototype.hasOwnProperty.call(localAssets, key)) return null;

  return localAssets[key]();
}
