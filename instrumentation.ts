/**
 * Next.js instrumentation hook — runs once before the server starts.
 *
 * Node.js 22+ ships `localStorage` as a built-in global, but without a
 * `--localstorage-file` path its methods (getItem, setItem, …) are undefined.
 * This causes a `TypeError: localStorage.getItem is not a function` during
 * SSR when Next.js renders client components on the server.
 *
 * We replace the broken stub with a no-op in-memory implementation so that
 * all `typeof window !== "undefined"` guards in the app work correctly and
 * no SSR code actually relies on persistent storage.
 */
export async function register() {
  if (
    typeof localStorage !== "undefined" &&
    typeof (localStorage as Storage).getItem !== "function"
  ) {
    const store: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      key: (index: number) => Object.keys(store)[index] ?? null,
      get length() {
        return Object.keys(store).length;
      },
    };
  }
}
