import { useState, useEffect } from "react";
import { liveQuery } from "dexie";
import { db } from "@/db/db";
import type { Category, TransactionType } from "@/types";

/**
 * Reactive hook — subscribes to the categories table.
 * Optionally filters by transaction type.
 */
export function useCategories(type?: TransactionType): Category[] {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const subscription = liveQuery(async () => {
      if (type) {
        return db.categories.where("type").equals(type).toArray();
      }
      return db.categories.toArray();
    }).subscribe({
      next: setCategories,
    });

    return () => subscription.unsubscribe();
  }, [type]);

  return categories;
}
