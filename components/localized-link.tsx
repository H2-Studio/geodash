// components/LocalizedLink.tsx
import Link, { LinkProps } from "next/link";
import { useLocale } from "next-intl";
import { useMemo } from "react";

/**
 * Ajoute automatiquement la locale courante dans le href si ce n'est pas déjà fait.
 * Usage :
 * <LocalizedLink href="/dashboard">Dashboard</LocalizedLink>
 * => si locale = 'fr', alors href="/fr/dashboard"
 */
export type LocalizedLinkProps = Omit<LinkProps, "href"> & {
  href: string;
  locale?: string; // permet d'override la locale si besoin
  children: React.ReactNode;
  className?: string;
};

export default function LocalizedLink({
  href,
  locale,
  children,
  className,
  ...props
}: LocalizedLinkProps) {
  const currentLocale = locale || useLocale();

  // Préfixe la locale seulement si ce n'est pas déjà fait (évite /fr/fr/...)
  const localizedHref = useMemo(() => {
    if (
      href.startsWith("/") &&
      !href.startsWith(`/${currentLocale}/`) &&
      href !== `/${currentLocale}`
    ) {
      // Gère les cas particuliers "/"
      return href === "/"
        ? `/${currentLocale}`
        : `/${currentLocale}${href}`;
    }
    return href;
  }, [href, currentLocale]);

  return (
    <Link href={localizedHref} className={className} {...props}>
      {children}
    </Link>
  );
}
