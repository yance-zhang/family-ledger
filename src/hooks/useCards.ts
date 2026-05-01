import { useState, useEffect } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/db";
import type { Card } from "@/types";

/**
 * Reactive hook — subscribes to cards table.
 */
export function useCards(): Card[] {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const subscription = liveQuery(async () =>
      db.cards.orderBy("createdAt").reverse().toArray(),
    ).subscribe({
      next: setCards,
    });

    return () => subscription.unsubscribe();
  }, []);

  return cards;
}
