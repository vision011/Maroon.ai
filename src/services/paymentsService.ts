import { mockRequest } from "./api";
import type { PaymentItem } from "@/types";

const ITEMS: PaymentItem[] = [
  {
    id: "p1",
    description: "Fall Tuition",
    amount: 750,
    dueDate: new Date(Date.now() + 9 * 86_400_000).toISOString(),
    category: "tuition",
  },
  {
    id: "p2",
    description: "Student Technology Fee",
    amount: 97.5,
    dueDate: new Date(Date.now() + 9 * 86_400_000).toISOString(),
    category: "fees",
  },
];

export const paymentsService = {
  getBalance: (): Promise<{ balanceDue: number; items: PaymentItem[] }> =>
    mockRequest("/payments/balance", {
      balanceDue: 847.5,
      items: ITEMS,
    }),
};
