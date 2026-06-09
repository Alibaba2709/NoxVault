import {
  Types,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
  Schema,
  model,
  models,
} from "mongoose";

const expenseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["food", "transport", "leisure", "home", "health", "extra"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    spentAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export type ExpenseDocument = HydratedDocument<
  InferSchemaType<typeof expenseSchema>
> & {
  userId: Types.ObjectId;
};

export const ExpenseModel =
  (models.Expense as Model<ExpenseDocument> | undefined) ??
  model<ExpenseDocument>("Expense", expenseSchema);
