import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ExpenseModel } from "@/models/expense";
import { RecurringExpenseModel } from "@/models/recurring-expense";
import { UserModel } from "@/models/user";
import {
  allBudgetCategories,
  budgetCategoryLabels,
  type BudgetCategory,
  type CategoryBudgets,
  type DashboardData,
  type Expense,
  type RecurringExpense,
  type User,
} from "@/types/finance";

function toIsoString(value: unknown): string {
  return value instanceof Date ? value.toISOString() : new Date().toISOString();
}

function normalizeBudgets(budgets: unknown): CategoryBudgets {
  const source =
    typeof budgets === "object" && budgets !== null
      ? (budgets as Record<string, unknown>)
      : {};

  return allBudgetCategories.reduce(
    (result, category) => ({
      ...result,
      [category]:
        typeof source[category] === "number" &&
        Number.isInteger(source[category])
          ? source[category]
          : 0,
    }),
    {} as CategoryBudgets,
  );
}

function recurringToMonthlyAmount(expense: RecurringExpense): number {
  return expense.frequency === "annual"
    ? Math.round(expense.amount / 12)
    : expense.amount;
}

export async function getDashboardData(
  userId: string,
): Promise<DashboardData | null> {
  if (!Types.ObjectId.isValid(userId)) {
    return null;
  }

  await connectToDatabase();

  const userDocument = await UserModel.findById(userId).lean();

  if (!userDocument) {
    return null;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [recurringDocuments, expenseDocuments] = await Promise.all([
    RecurringExpenseModel.find({ userId }).sort({ dueDate: 1 }).lean(),
    ExpenseModel.find({
      userId,
      spentAt: {
        $gte: monthStart,
        $lt: nextMonthStart,
      },
    })
      .sort({ spentAt: -1 })
      .lean(),
  ]);

  const budgets = normalizeBudgets(userDocument.budgets);
  const user: User = {
    id: userDocument._id.toString(),
    name: userDocument.name,
    email: userDocument.email,
    monthlyIncome: userDocument.monthlyIncome,
    budgets,
    createdAt: toIsoString(userDocument.createdAt),
    updatedAt: toIsoString(userDocument.updatedAt),
  };

  const recurringExpenses: RecurringExpense[] = recurringDocuments.map(
    (expense) => ({
      id: expense._id.toString(),
      userId: expense.userId.toString(),
      name: expense.name,
      amount: expense.amount,
      frequency: expense.frequency,
      dueDate: expense.dueDate,
      category: expense.category as BudgetCategory,
      createdAt: toIsoString(expense.createdAt),
      updatedAt: toIsoString(expense.updatedAt),
    }),
  );

  const expenses: Expense[] = expenseDocuments.map((expense) => ({
    id: expense._id.toString(),
    userId: expense.userId.toString(),
    category: expense.category as BudgetCategory,
    description: expense.description,
    amount: expense.amount,
    spentAt: toIsoString(expense.spentAt),
    createdAt: toIsoString(expense.createdAt),
    updatedAt: toIsoString(expense.updatedAt),
  }));

  const spentByCategory = expenses.reduce(
    (result, expense) => ({
      ...result,
      [expense.category]: result[expense.category] + expense.amount,
    }),
    allBudgetCategories.reduce(
      (result, category) => ({ ...result, [category]: 0 }),
      {} as CategoryBudgets,
    ),
  );

  const monthlyRecurringTotal = recurringExpenses.reduce(
    (total, expense) => total + recurringToMonthlyAmount(expense),
    0,
  );
  const variableSpentThisMonth = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const realAvailableBudget = Math.max(
    0,
    user.monthlyIncome - monthlyRecurringTotal,
  );

  return {
    user,
    monthlyRecurringTotal,
    realAvailableBudget,
    variableSpentThisMonth,
    remainingAvailableBudget: Math.max(
      0,
      realAvailableBudget - variableSpentThisMonth,
    ),
    categories: allBudgetCategories.map((category) => {
        const limit = budgets[category];
        const spent = spentByCategory[category];
        const percentage = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;

        return {
          category,
          label: budgetCategoryLabels[category],
          limit,
          spent,
          remaining: Math.max(0, limit - spent),
          percentage,
        };
      }),
    recurringExpenses,
    recentExpenses: expenses.slice(0, 6),
  };
}
