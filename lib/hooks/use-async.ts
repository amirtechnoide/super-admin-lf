"use client";

/*
 * Exception assumée aux règles React Compiler, limitée à ce fichier :
 *
 * - `use-memo` : la liste de dépendances est fournie par l'appelant, elle ne
 *   peut donc pas être un littéral ici. C'est le prix d'un hook générique.
 * - `set-state-in-effect` : ce hook synchronise justement React avec une source
 *   externe (la couche `lib/data/`) ; passer en état « chargement » à chaque
 *   changement de dépendances est le comportement voulu.
 *
 * Le jour où `lib/data/` renvoie de vrais appels réseau, ce hook peut être
 * remplacé par TanStack Query ou `use()` + Suspense, et ces exceptions sautent.
 */
/* eslint-disable react-hooks/use-memo, react-hooks/set-state-in-effect */

import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  reload: () => void;
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
}

/**
 * Charge une fonction de `lib/data/` et expose loading/error/reload.
 * Les composants n'appellent jamais `fetch` : ils passent par ce hook.
 */
export function useAsync<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList
): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);
  const requestId = useRef(0);

  const stableLoader = useCallback(loader, deps);

  useEffect(() => {
    const id = ++requestId.current;
    let cancelled = false;
    setLoading(true);
    setError(null);

    stableLoader()
      .then((result) => {
        if (cancelled || id !== requestId.current) return;
        setData(result);
      })
      .catch((err: unknown) => {
        if (cancelled || id !== requestId.current) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (cancelled || id !== requestId.current) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [stableLoader, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  const update = useCallback(
    (updater: T | ((prev: T | undefined) => T)) => {
      setData((prev) =>
        typeof updater === "function"
          ? (updater as (p: T | undefined) => T)(prev)
          : updater
      );
    },
    []
  );

  return { data, loading, error, reload, setData: update };
}

/** Debounce simple, pour les champs de recherche. */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
