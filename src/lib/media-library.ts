import { useEffect, useState } from "react";

export type MediaItem = {
  id: string;
  url: string;
  name: string;
  createdAt: string;
};

const KEY = "rn-media-v1";

function read(): MediaItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as MediaItem[];
  } catch {
    /* ignore */
  }
  return [];
}

export function useMediaLibrary() {
  const [items, setItems] = useState<MediaItem[]>([]);
  useEffect(() => {
    setItems(read());
    const h = () => setItems(read());
    window.addEventListener("rn-store", h);
    return () => window.removeEventListener("rn-store", h);
  }, []);

  const save = (next: MediaItem[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("rn-store"));
  };

  const add = (url: string, name = "upload") => {
    const item: MediaItem = {
      id: String(Date.now()),
      url,
      name,
      createdAt: new Date().toISOString(),
    };
    save([item, ...read()]);
    return item;
  };

  const remove = (id: string) => save(read().filter((x) => x.id !== id));

  return { items, add, remove, save };
}

export function pushToMediaLibrary(url: string, name = "upload") {
  if (typeof window === "undefined" || !url) return;
  const items = read();
  if (items.some((x) => x.url === url)) return;
  const item: MediaItem = {
    id: String(Date.now()),
    url,
    name,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify([item, ...items].slice(0, 80)));
  window.dispatchEvent(new Event("rn-store"));
}
