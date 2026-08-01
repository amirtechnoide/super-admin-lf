"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` pendant le rendu serveur et au premier rendu client, `true` ensuite.
 * Sert à n'afficher qu'après hydratation ce que le serveur ne peut pas connaître
 * (thème résolu, préférences locales) sans provoquer d'écart d'hydratation.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
