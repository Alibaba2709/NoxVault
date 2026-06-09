import {
  type HydratedDocument,
  type InferSchemaType,
  type Model,
  Schema,
  model,
  models,
} from "mongoose";

const categoryBudgetsSchema = new Schema(
  {
    food: { type: Number, default: 0, min: 0 },
    transport: { type: Number, default: 0, min: 0 },
    leisure: { type: Number, default: 0, min: 0 },
    home: { type: Number, default: 0, min: 0 },
    health: { type: Number, default: 0, min: 0 },
    extra: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    monthlyIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
    budgets: {
      type: categoryBudgetsSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  },
);

export type UserDocument = HydratedDocument<InferSchemaType<typeof userSchema>>;

export const UserModel =
  (models.User as Model<UserDocument> | undefined) ??
  model<UserDocument>("User", userSchema);
