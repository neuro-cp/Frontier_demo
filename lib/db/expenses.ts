"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Expense } from "@/lib/expenseTypes";
import { centsToMoneyString, moneyStringToCents } from "@/lib/db/money";
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
      const { data, error } = await supabase.from("expenses").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) return console.error("Unable to load expenses.", error), [];
      return ((data ?? []) as DbExpense[]).map(dbToExpense);
    },
    async createExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => [...c, expense]), expense;
      const { data, error } = await supabase.from("expenses").insert({ workspace_id: expense.workspaceId, description: expense.description, category: expense.category, amount_cents: moneyStringToCents(expense.amount) }).select("*").single();
      if (error) return console.error("Unable to create expense.", error), null;
      return dbToExpense(data as DbExpense);
    },
    async updateExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => c.map((e) => keyOf(e) === keyOf(expense) ? expense : e)), expense;
      if (!expense.id) return null;
      const { data, error } = await supabase.from("expenses").update({ description: expense.description, category: expense.category, amount_cents: moneyStringToCents(expense.amount) }).eq("id", expense.id).select("*").single();
      if (error) return console.error("Unable to update expense.", error), null;
      return dbToExpense(data as DbExpense);
    },
    async deleteExpense(expense: ExpenseRow) {
      if (!useDb) return setLocalExpenses((c) => c.filter((e) => keyOf(e) !== keyOf(expense))), true;
      if (!expense.id) return false;
      const { error } = await supabase.from("expenses").delete().eq("id", expense.id);
      if (error) return console.error("Unable to delete expense.", error), false;
      return true;
    },
  };
}
