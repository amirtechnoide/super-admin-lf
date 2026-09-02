import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Marque LF COMPANY.
 *
 * Deux fichiers plutôt qu'un filtre CSS : le logo est un dégradé de gris, une
 * inversion le rendrait terne. Les deux versions sont rendues et le thème en
 * masque une, ce qui évite au passage le clignotement d'une bascule décidée en
 * JavaScript après l'hydratation.
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <>
      <Image
        src="/logo/lfcompany.svg"
        alt=""
        width={size}
        height={size}
        priority
        className={cn("dark:hidden", className)}
      />
      <Image
        src="/logo/whitelogo.svg"
        alt=""
        width={size}
        height={size}
        priority
        className={cn("hidden dark:block", className)}
      />
    </>
  );
}

/** Marque et nom, tels qu'ils apparaissent dans la barre latérale. */
export function Wordmark({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      <span className="font-display text-[13px] font-semibold tracking-tight">
        LF COMPANY
      </span>
    </span>
  );
}
