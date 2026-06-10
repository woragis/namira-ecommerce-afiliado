import {
  buildAffiliateSharePath,
  buildProductSharePath,
  buildProductShareUrl,
} from "@/lib/share-code";
import { getSiteBaseUrl } from "@/lib/whatsapp";

type Props = {
  shareCode: string;
  slug: string;
};

export function AdminProductShareLinks({ shareCode, slug }: Props) {
  const sharePath = buildProductSharePath(shareCode);
  const affiliatePath = buildAffiliateSharePath(shareCode);
  const shareUrl = buildProductShareUrl(shareCode);
  const siteUrl = getSiteBaseUrl();

  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <h2 className="mb-3 text-sm font-semibold text-zinc-300">Links para compartilhar</h2>
      <dl className="space-y-2 text-sm">
        <div>
          <dt className="text-zinc-500">Página do produto (curto)</dt>
          <dd>
            <a
              href={sharePath}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-violet-400 hover:underline"
            >
              {siteUrl}
              {sharePath}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Link de afiliado (curto)</dt>
          <dd>
            <a
              href={affiliatePath}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-violet-400 hover:underline"
            >
              {siteUrl}
              {affiliatePath}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">Página completa (legado)</dt>
          <dd className="break-all text-zinc-400">
            {siteUrl}/produtos/{slug}
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-zinc-500">
        Use o link curto ({shareUrl}) no WhatsApp, Instagram e stories.
      </p>
    </div>
  );
}
