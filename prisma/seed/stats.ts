export type SeedCounters = {
  created: number;
  skipped: number;
  updated: number;
  linked: number;
};

export function emptyCounters(): SeedCounters {
  return { created: 0, skipped: 0, updated: 0, linked: 0 };
}

export class SeedStats {
  readonly stores = emptyCounters();
  readonly categories = emptyCounters();
  readonly badges = emptyCounters();
  readonly products = emptyCounters();
  readonly collections = emptyCounters();
  readonly collectionLinks = emptyCounters();
  readonly settings = emptyCounters();
  readonly pages = emptyCounters();
  readonly storeCounts = emptyCounters();

  bump(target: SeedCounters, action: keyof SeedCounters) {
    target[action] += 1;
  }

  summary(mode: string, upgrade: boolean) {
    return {
      mode,
      upgrade,
      stores: { ...this.stores },
      categories: { ...this.categories },
      badges: { ...this.badges },
      products: { ...this.products },
      collections: { ...this.collections },
      collectionLinks: { ...this.collectionLinks },
      settings: { ...this.settings },
      pages: { ...this.pages },
      storeCounts: { ...this.storeCounts },
    };
  }
}
