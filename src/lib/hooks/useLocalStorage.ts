"use client";

import { useState, useEffect } from "react";

/**
 * A drop-in replacement for `useState` that persists to localStorage.
 * - Safe for SSR (returns defaultValue during server render)
 * - Handles corrupted/invalid JSON gracefully
 * - Supports TTL (time-to-live) to auto-expire stale cache
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  ttlMs?: number // Optional: max age of cached value in milliseconds
): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      const parsed = JSON.parse(stored);

      // TTL check: if cachedAt + ttlMs < now, treat as expired
      if (ttlMs && parsed?.__cachedAt) {
        if (Date.now() - parsed.__cachedAt > ttlMs) {
          localStorage.removeItem(key);
          return defaultValue;
        }
        // Return without the internal __cachedAt field
        const { __cachedAt, ...rest } = parsed;
        return rest as T;
      }

      return parsed as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (value === null || value === undefined) {
        localStorage.removeItem(key);
        return;
      }
      // If TTL is set, stamp with cachedAt
      const toStore = ttlMs
        ? { ...(value as object), __cachedAt: Date.now() }
        : value;
      localStorage.setItem(key, JSON.stringify(toStore));
    } catch {
      // Storage quota exceeded or unavailable — fail silently
    }
  }, [key, value, ttlMs]);

  const clear = () => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  };

  return [value, setValue, clear];
}
