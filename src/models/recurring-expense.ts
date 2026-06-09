import {
  Types,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
  Schema,
  model,
  models,
} from "mongoose";

const recurringExpenseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    frequency: {
      type: String,
      enum: ["monthly", "annual"],
      default: "monthly",
      required: true,
    },
    dueDate: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    category: {
      type: String,
      enum: [
        "food",
        "transport",
        "leisure",
        "home",
        "health",
        "subscriptions",
        "extra",
      ],
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type RecurringExpenseDocument = HydratedDocument<
  InferSchemaType<typeof recurringExpenseSchema>
> & {
  userId: Types.ObjectId;
};

export const RecurringExpenseModel =
  (models.RecurringExpense as Model<RecurringExpenseDocument> | undefined) ??
  model<RecurringExpenseDocument>(
    "RecurringExpense",
    recurringExpenseSchema,
  );
