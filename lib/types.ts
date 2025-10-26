export type Expense = {
  id: string;
  description: string;
  amount: number;
  status: "pending" | "paid";
  user_id: string;
  receipt_url?: string;
  created_at?: string;
};
