"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Item } from "@/lib/types";
import ItemCard from "../components/ItemCard";

export default function WishlistPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("items").select("*").eq("is_wishlist", true);
    setItems((data as Item[]) ?? []);
  }

  async function moveToCloset(item: Item) {
    await supabase.from("items").update({ is_wishlist: false }).eq("id", item.id);
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-plum">Wishlist</h2>
        <Link href="/add" className="bg-plum text-cream text-sm px-4 py-2 rounded-tag">+ Add wish</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-ink/40 text-sm py-10 text-center">Nothing on the list yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <ItemCard item={item} />
              {item.shopping_link && (
                <a href={item.shopping_link} target="_blank" rel="noreferrer" className="block text-center text-xs text-plum underline">
                  find it online
                </a>
              )}
              <button onClick={() => moveToCloset(item)} className="w-full text-xs bg-clean/10 text-clean py-1 rounded-tag">
                got it! move to closet
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
