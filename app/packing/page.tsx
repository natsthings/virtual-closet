"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Item } from "@/lib/types";
import ItemCard from "../components/ItemCard";

const WEATHER_TAGS = ["hot","warm","mild","cold","rain","snow","windy"];

export default function PackingPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedWeather, setSelectedWeather] = useState<string[]>([]);
  const [packed, setPacked] = useState<string[]>([]);

  useEffect(() => {
    // #13/#14 — only from CLEAN clothes, not away in seasonal storage
    supabase
      .from("items")
      .select("*")
      .eq("is_wishlist", false)
      .eq("is_dirty", false)
      .neq("location", "away")
      .then(({ data }) => setItems((data as Item[]) ?? []));
  }, []);

  const matches = selectedWeather.length === 0
    ? []
    : items.filter((i) => i.suitable_weather.some((w) => selectedWeather.includes(w)));

  function togglePacked(id: string) {
    setPacked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl text-plum">Pack for a trip</h2>
      <p className="text-sm text-ink/60">Pick the weather you're packing for — I'll pull matching clean clothes.</p>

      <div className="flex flex-wrap gap-1.5">
        {WEATHER_TAGS.map((w) => (
          <button key={w} onClick={() => setSelectedWeather((s) => s.includes(w) ? s.filter((x) => x !== w) : [...s, w])}
            className={`text-xs px-3 py-1.5 rounded-full border ${selectedWeather.includes(w) ? "bg-gold text-plum-deep border-gold" : "border-plum/20 text-ink/60"}`}>
            {w}
          </button>
        ))}
      </div>

      {selectedWeather.length > 0 && (
        <>
          <p className="text-xs text-ink/50">{matches.length} clean pieces work for this weather. Tap to add to your packing list.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {matches.map((item) => (
              <div key={item.id} onClick={() => togglePacked(item.id)} className={packed.includes(item.id) ? "ring-2 ring-clean rounded-tag" : ""}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>

          {packed.length > 0 && (
            <div className="border-t border-plum/10 pt-4">
              <p className="text-sm font-medium text-plum mb-2">Packing list ({packed.length})</p>
              <ul className="text-sm space-y-1">
                {items.filter((i) => packed.includes(i.id)).map((i) => (
                  <li key={i.id}>• {i.name}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-ink/30 pt-4">
        Note: weather is currently picked manually. Auto-suggesting based on your destination's forecast
        (e.g. "don't pack flowy pants, it's windy") needs a weather API key — see the README's "not yet built" list.
      </p>
    </div>
  );
}
