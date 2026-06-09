import {
  allBudgetCategories,
  type BudgetCategory,
  type RecurringFrequency,
} from "@/types/finance";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isPositiveCents(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function isBudgetCategory(value: unknown): value is BudgetCategory {
  return (
    typeof value === "string" &&
    allBudgetCategories.includes(value as BudgetCategory)
  );
}

export function isRecurringFrequency(
  value: unknown,
): value is RecurringFrequency {
  return value === "monthly" || value === "annual";
}
