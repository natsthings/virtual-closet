"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Item, WearLogEntry } from "@/lib/types";

export default function StatsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [log, setLog] = useState<WearLogEntry[]>([]);
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const [borrowName, setBorrowName] = useState<Record<string, string>>({});

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: itemData } = await supabase.from("items").select("*").eq("is_wishlist", false);
    const { data: logData } = await supabase.from("wear_log").select("*");
    const { data: ratioData } = await supabase.from("ratio_targets").select("*");
    setItems((itemData as Item[]) ?? []);
    setLog((logData as WearLogEntry[]) ?? []);
    const r: Record<string, number> = {};
    (ratioData ?? []).forEach((row: any) => (r[row.category] = row.target_count));
    setRatios(r);
  }

  const wearCounts = useMemo(() => {
    const c: Record<string, number> = {};
    log.forEach((l) => { if (l.item_id) c[l.item_id] = (c[l.item_id] ?? 0) + 1; });
    return c;
  }, [log]);

  const costPerWear = useMemo(() => {
    return items
      .filter((i) => i.price)
      .map((i) => ({
        item: i,
        wears: wearCounts[i.id] ?? 0,
        cpw: (i.price as number) / Math.max(1, wearCounts[i.id] ?? 0)
      }))
      .sort((a, b) => b.cpw - a.cpw);
  }, [items, wearCounts]);

  const categoryCounts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((i) => { c[i.category] = (c[i.category] ?? 0) + 1; });
    return c;
  }, [items]);

  async function saveRatioTarget(category: string, target: number) {
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return;
    await supabase.from("ratio_targets").upsert(
      { user_id: userId, category, target_count: target },
      { onConflict: "user_id,category" }
    );
    load();
  }

  async function markBorrowed(item: Item) {
    const name = borrowName[item.id];
    if (!name) return;
    const { data: userRes } = await supabase.auth.getUser();
    const userId = userRes.user?.id;
    if (!userId) return;
    await supabase.from("borrow_records").insert({ user_id: userId, item_id: item.id, borrowed_by: name });
    alert(`Marked "${item.name}" as borrowed by ${name}.`);
  }

  return (
    <div className="space-y-10">
      <h2 className="font-display text-xl text-plum">Wardrobe stats</h2>

      {/* #10 Cost per wear */}
      <section>
        <h3 className="font-medium text-plum mb-2">Cost per wear</h3>
        <p className="text-xs text-ink/50 mb-3">Worst value first — these are the ones to actually wear more.</p>
        <div className="space-y-1.5">
          {costPerWear.slice(0, 10).map(({ item, wears, cpw }) => (
            <div key={item.id} className="flex justify-between text-sm border-b border-plum/5 pb-1.5">
              <span>{item.name} <span className="text-ink/40 text-xs">({wears}x worn)</span></span>
              <span className="text-plum font-medium">${cpw.toFixed(2)}/wear</span>
            </div>
          ))}
          {costPerWear.length === 0 && <p className="text-ink/40 text-sm">Add prices to items to see this.</p>}
        </div>
      </section>

      {/* #16 & #17 Ratio / buy recommendations */}
      <section>
        <h3 className="font-medium text-plum mb-2">Category balance & what to buy next</h3>
        <p className="text-xs text-ink/50 mb-3">Set a target count per category — I'll flag where you're short.</p>
        <div className="space-y-2">
          {Object.keys(categoryCounts).concat(Object.keys(ratios)).filter((v, i, a) => a.indexOf(v) === i).map((cat) => {
            const have = categoryCounts[cat] ?? 0;
            const target = ratios[cat];
            const short = target && have < target ? target - have : 0;
            return (
              <div key={cat} className="flex items-center gap-3 text-sm">
                <span className="w-24 capitalize">{cat}</span>
                <span className="text-ink/50">{have} owned</span>
                <input
                  type="number"
                  placeholder="target"
                  defaultValue={target ?? ""}
                  onBlur={(e) => e.target.value && saveRatioTarget(cat, parseInt(e.target.value))}
                  className="w-16 border border-plum/20 rounded-tag px-1.5 py-0.5 text-xs"
                />
                {short > 0 && <span className="text-dirty text-xs">buy {short} more</span>}
              </div>
            );
          })}
        </div>
      </section>

      {/* #20 Borrowing */}
      <section>
        <h3 className="font-medium text-plum mb-2">Lend a piece</h3>
        <div className="space-y-2">
          {items.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <span className="flex-1">{item.name}</span>
              <input
                placeholder="friend's name"
                value={borrowName[item.id] ?? ""}
                onChange={(e) => setBorrowName((b) => ({ ...b, [item.id]: e.target.value }))}
                className="border border-plum/20 rounded-tag px-2 py-1 text-xs w-32"
              />
              <button onClick={() => markBorrowed(item)} className="text-xs bg-gold/20 text-plum px-2 py-1 rounded-tag">
                mark borrowed
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink/30 mt-2">
          Shareable "wrapped" placard to send friends isn't built yet — see the README's "not yet built" list.
        </p>
      </section>
    </div>
  );
}
