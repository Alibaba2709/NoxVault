export type CurrencyCode = "EUR";

export type BudgetCategory =
  | "food"
  | "transport"
  | "leisure"
  | "home"
  | "health"
  | "subscriptions"
  | "extra";

export type RecurringFrequency = "monthly" | "annual";

export const budgetCategoryLabels: Record<BudgetCategory, string> = {
  food: "Cibo",
  transport: "Trasporti",
  leisure: "Svago",
  home: "Casa",
  health: "Salute",
  subscriptions: "Abbonamenti",
  extra: "Extra",
};

export const primaryBudgetCategories: BudgetCategory[] = [
  "food",
  "leisure",
  "home",
];

export const allBudgetCategories = Object.keys(
  budgetCategoryLabels,
) as BudgetCategory[];

export type CategoryBudgets = Record<BudgetCategory, number>;

export interface User {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  budgets: CategoryBudgets;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  dueDate: number;
  category: BudgetCategory;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  spentAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  monthlyIncome: number;
  budgets: Partial<CategoryBudgets>;
}

export interface EconomyOnboardingInput {
  userId: string;
  monthlyIncome: number;
  budgets: Partial<CategoryBudgets>;
}

export interface CreateRecurringExpenseInput {
  userId: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  dueDate: number;
  category: BudgetCategory;
}

export interface CreateExpenseInput {
  userId: string;
  category: BudgetCategory;
  description: string;
  amount: number;
  spentAt?: string;
}

export interface CategoryProgressData {
  category: BudgetCategory;
  label: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface DashboardData {
  user: User;
  monthlyRecurringTotal: number;
  realAvailableBudget: number;
  variableSpentThisMonth: number;
  remainingAvailableBudget: number;
  categories: CategoryProgressData[];
  recurringExpenses: RecurringExpense[];
  recentExpenses: Expense[];
}
