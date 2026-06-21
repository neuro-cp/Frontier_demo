"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense } from "@/lib/expenseTypes";
import { assertUuid, isUuid } from "@/lib/db/ids";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";
import { createSignedInRecord } from "@/lib/db/serverCreate";
import { mutateSignedInRecord } from "@/lib/db/serverMutate";
type Setter<T> = (value: T | ((current: T) => T)) => void;
type DbExpense = { id: string; workspace_id: string; description: string; category: string; amount_cents: number; expense_date?: string | null; notes?: string | null };
export type ExpenseRow = Expense & { id?: string };
const keyOf = (e: ExpenseRow) => e.id ?? `${e.workspaceId}-${e.description}`;
const dbToExpense = (e: DbExpense): ExpenseRow => ({ id: e.id, workspaceId: e.workspace_id, description: e.description, category: e.category, amount: centsToMoneyString(e.amount_cents) });
export function createExpensesRepository({ isSignedIn, supabase, localExpenses, setLocalExpenses }: { isSignedIn: boolean; supabase: SupabaseClient | null; localExpenses: ExpenseRow[]; setLocalExpenses: Setter<ExpenseRow[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getExpenses(workspaceId: string) {
      if (!useDb) return localExpenses.filter((e) => e.workspaceId === workspaceId);
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("expenses").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load expenses.");
      return ((data ?? []) as DbExpense[]).map(dbToExpense);
    },
    async createExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => [...c, expense]), expense;
      assertUuid(expense.workspaceId, "Workspace");
      const data = await createSignedInRecord<DbExpense>("expense", { workspace_id: expense.workspaceId, description: expense.description, category: expense.category, amount_cents: moneyStringToCents(expense.amount) });
      return dbToExpense(data);
    },
    async updateExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => c.map((e) => keyOf(e) === keyOf(expense) ? expense : e)), expense;
      if (!expense.id || !isUuid(expense.id)) return null;
      const data = await mutateSignedInRecord<DbExpense>("expense", "update", {
        id: expense.id,
        workspace_id: expense.workspaceId,
        description: expense.description,
        category: expense.category,
        amount_cents: moneyStringToCents(expense.amount),
      });
      if (!data) throw new Error("Unable to update expense.");
      return dbToExpense(data);
    },
    async deleteExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => c.filter((e) => keyOf(e) !== keyOf(expense))), true;
      if (!expense.id || !isUuid(expense.id)) return false;
      await mutateSignedInRecord<boolean>("expense", "delete", {
        id: expense.id,
        workspace_id: expense.workspaceId,
      });
      return true;
    },
  };
}
