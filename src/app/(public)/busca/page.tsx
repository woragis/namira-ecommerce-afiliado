import { permanentRedirect } from "next/navigation";
import { catalogQueryString } from "@/lib/filters";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BuscaPage({ searchParams }: Props) {
  const params = await searchParams;
  const get = (key: string) => {
    const v = params[key];
    return typeof v === "string" ? v : undefined;
  };

  permanentRedirect(
    `/produtos${catalogQueryString({
      q: get("q"),
      loja: get("loja"),
      tag: get("tag") || get("categoria") || get("badge"),
      ordenar: get("ordenar"),
      preco_min: get("preco_min"),
      preco_max: get("preco_max"),
      page: get("page"),
    })}`,
  );
}
