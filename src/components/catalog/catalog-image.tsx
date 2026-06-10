import Image from "next/image";

function isSupabasePublicUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.includes("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

type Props = {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/** Imagem de catálogo: otimiza Supabase; usa <img> nativo para URLs de afiliados/externas. */
export function CatalogImage({
  src,
  alt,
  fill,
  className,
  priority,
  sizes,
}: Props) {
  if (!src.trim()) return null;

  if (isSupabasePublicUrl(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        priority={priority}
        sizes={sizes}
      />
    );
  }

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={`absolute inset-0 h-full w-full ${className ?? ""}`} />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  );
}
