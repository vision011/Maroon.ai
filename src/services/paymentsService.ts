import { mockRequest } from "./api";
import type { PaymentItem } from "@/types";
import { nextPaymentDue } from "@/utils/academicCalendar";

/** Sample charges, due on the real next fall due date from the One Stop calendar. */
const DUE_DATE = nextPaymentDue() ?? new Date(Date.now() + 9 * 86_400_000).toISOString();

const ITEMS: PaymentItem[] = [
  {
    id: "p1",
    description: "Fall Tuition",
    amount: 750,
    dueDate: DUE_DATE,
    category: "tuition",
  },
  {
    id: "p2",
    description: "Student Technology Fee",
    amount: 97.5,
    dueDate: DUE_DATE,
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
