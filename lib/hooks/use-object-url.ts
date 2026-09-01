"use client";

import * as React from "react";

/**
 * URL d'objet pour un fichier local, à afficher avant tout envoi au serveur.
 *
 * Création et révocation se font dans le même effet : en StrictMode le montage
 * rejoue setup, cleanup, setup, et un blob créé au rendu serait révoqué sans
 * jamais être recréé. L'URL est par ailleurs gardée avec le fichier dont elle
 * vient, sinon celle du fichier précédent, déjà révoquée, servirait de source
 * le temps d'un rendu.
 *
 * Renvoie `null` tant que l'effet n'a pas tourné pour le fichier courant.
 */
export function useObjectUrl(file?: File | null): string | null {
  const [blob, setBlob] = React.useState<{ file: File; url: string } | null>(
    null
  );

  React.useEffect(() => {
    if (!file) return;
    const created = URL.createObjectURL(file);
    // Le blob doit vivre et mourir avec l'effet : créé au rendu, il serait
    // révoqué par le cleanup simulé de StrictMode sans jamais être recréé.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBlob({ file, url: created });
    return () => URL.revokeObjectURL(created);
  }, [file]);

  if (!file) return null;
  return blob?.file === file ? blob.url : null;
}
