import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { ExpenseRow } from "@/lib/db/expenses";

export type ExpenseActionsRepository = {
  createExpense: (expense: ExpenseRow) => Promise<ExpenseRow | null>;
  updateExpense: (expense: ExpenseRow) => Promise<ExpenseRow | null>;
  deleteExpense: (expense: ExpenseRow) => Promise<boolean>;
};

function validateExpense(expense: ExpenseRow) {
  return {
    ...expense,
    workspaceId: requireText(expense.workspaceId, "Workspace"),
    description: requireText(expense.description, "Expense description"),
    category: requireText(expense.category, "Expense category"),
    amount: requireText(expense.amount, "Expense amount"),
  };
}

export async function createExpenseAction(
  repository: ExpenseActionsRepository,
  expense: ExpenseRow
): Promise<ActionResult<ExpenseRow>> {
  try {
    const created = await repository.createExpense(validateExpense(expense));
    return created ? ok(created) : fail("Unable to create expense.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create expense.");
  }
}

export async function updateExpenseAction(
  repository: ExpenseActionsRepository,
  expense: ExpenseRow
): Promise<ActionResult<ExpenseRow>> {
  try {
    requireText(expense.id, "Expense");
    const updated = await repository.updateExpense(validateExpense(expense));
    return updated ? ok(updated) : fail("Unable to update expense.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update expense.");
  }
}

export async function deleteExpenseAction(
  repository: ExpenseActionsRepository,
  expense: ExpenseRow
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteExpense(validateExpense(expense));
    return deleted ? ok(true) : fail("Unable to delete expense.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete expense.");
  }
}

export const createExpense = createExpenseAction;
export const updateExpense = updateExpenseAction;
export const deleteExpense = deleteExpenseAction;
