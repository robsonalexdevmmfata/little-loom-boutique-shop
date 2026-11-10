import { useEffect, useRef, useState } from "react";

type Loader<T> = () => Promise<T | null | undefined>;
type Saver<T> = (value: T) => Promise<unknown>;

/**
 * Estado sincronizado com PostgreSQL (via server fns).
 * Mantém cache em localStorage como fallback offline / flash inicial.
 */
export function useDbSynced<T>(opts: {
  key: string;
  seed: T;
  load: Loader<T>;
  save: Saver<T>;
  merge?: (fromDb: T, seed: T) => T;
}) {
  const { key, seed, load, save, merge } = opts;
  const [v, setV] = useState<T>(() => {
    if (typeof window === "undefined") return seed;
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    return seed;
  });
  const [ready, setReady] = useState(false);
  const saving = useRef(false);

  useEffect(() => {
    let alive = true;
    load()
      .then((data) => {
        if (!alive) return;
        if (data != null) {
          const next = merge ? merge(data, seed) : data;
          setV(next);
          try {
            localStorage.setItem(key, JSON.stringify(next));
          } catch {
            /* ignore */
          }
          window.dispatchEvent(new Event("rn-store"));
        }
        setReady(true);
      })
      .catch(() => {
        if (!alive) return;
        setReady(true);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = (next: T) => {
    setV(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("rn-store"));
    saving.current = true;
    void save(next)
      .catch((e) => console.error(`[db-sync] falha ao salvar ${key}`, e))
      .finally(() => {
        saving.current = false;
      });
  };

  return [v, set, ready] as const;
}
