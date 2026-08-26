import { permanentRedirect } from "next/navigation";
import { catalogQueryString } from "@/lib/filters";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoriaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return typeof v === "string" ? v : undefined;
  };

  permanentRedirect(
    `/produtos${catalogQueryString({
      tag: slug,
      loja: get("loja"),
      q: get("q"),
      ordenar: get("ordenar"),
      preco_min: get("preco_min"),
      preco_max: get("preco_max"),
      page: get("page"),
    })}`,
  );
}
