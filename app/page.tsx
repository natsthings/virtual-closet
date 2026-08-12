"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Item, Category, Location } from "@/lib/types";
import ItemCard from "./components/ItemCard";

const TABS: { key: Category | "all" | "jewelry"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "shirt", label: "Shirts" },
  { key: "tshirt", label: "Tees" },
  { key: "tank", label: "Tanks" },
  { key: "skirt", label: "Skirts" },
  { key: "shorts", label: "Shorts" },
  { key: "pants", label: "Pants" },
  { key: "dress", label: "Dresses" },
  { key: "outerwear", label: "Outerwear" },
  { key: "shoes", label: "Shoes" },
  { key: "jewelry", label: "Jewelry" },
  { key: "accessory", label: "Accessories" }
];

const LOCATIONS: (Location | "all")[] = ["all", "home", "dorm", "hamper", "away"];

export default function ClosetPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [wearCounts, setWearCounts] = useState<Record<string, number>>({});
  const [lastWorn, setLastWorn] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<Location | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: itemData } = await supabase
      .from("items")
      .select("*")
      .eq("is_wishlist", false)
      .order("created_at", { ascending: false });

    const { data: wearData } = await supabase.from("wear_log").select("item_id, worn_date");

    const counts: Record<string, number> = {};
    const last: Record<string, string> = {};
    (wearData ?? []).forEach((w) => {
      if (!w.item_id) return;
      counts[w.item_id] = (counts[w.item_id] ?? 0) + 1;
      if (!last[w.item_id] || w.worn_date > last[w.item_id]) last[w.item_id] = w.worn_date;
    });

    setItems((itemData as Item[]) ?? []);
    setWearCounts(counts);
    setLastWorn(last);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (tab !== "all" && i.category !== tab) return false;
      if (locationFilter !== "all" && i.location !== locationFilter) return false;
      return true;
    });
  }, [items, tab, locationFilter]);

  const forgotten = useMemo(() => {
    const now = Date.now();
    return items.filter((i) => {
      if (i.location === "away") return false;
      const lw = lastWorn[i.id];
      const days = lw ? (now - new Date(lw).getTime()) / 86400000 : Infinity;
      return days >= 30;
    });
  }, [items, lastWorn]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-ink/60 text-sm">{items.length} pieces in rotation</p>
        <Link
          href="/add"
          className="bg-plum text-cream text-sm px-4 py-2 rounded-tag hover:bg-plum-deep transition-colors"
        >
          + Add item
        </Link>
      </div>

      {forgotten.length > 0 && (
        <div className="bg-dirty/5 border border-dirty/20 rounded-tag p-3">
          <p className="text-xs font-semibold text-dirty mb-1">! Forgotten fits — not worn in 30+ days</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {forgotten.slice(0, 8).map((i) => (
              <span key={i.id} className="text-xs bg-white px-2 py-1 rounded-full border border-dirty/20 whitespace-nowrap">
                {i.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap text-sm px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.key
                ? "bg-plum text-cream border-plum"
                : "bg-white text-ink/70 border-plum/15 hover:border-plum/40"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 text-xs">
        {LOCATIONS.map((l) => (
          <button
            key={l}
            onClick={() => setLocationFilter(l)}
            className={`px-2.5 py-1 rounded-full border ${
              locationFilter === l ? "border-gold text-plum bg-gold/10" : "border-plum/10 text-ink/50"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-ink/40 text-sm">Loading your closet…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-ink/40">
          <p className="font-display text-lg text-plum/60 mb-1">Nothing here yet</p>
          <p className="text-sm">Add a piece to fill this rack.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              wearCount={wearCounts[item.id] ?? 0}
              lastWorn={lastWorn[item.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
