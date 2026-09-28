import { mockRequest } from "./api";
import type { PaymentItem } from "@/types";
import { sum } from "@/utils/helpers";
import { lastPaymentDue } from "@/utils/academicCalendar";

/**
 * Sophia's first fall billing statement: due on the real Sept 24 date from the One Stop
 * calendar and still unpaid, so a $40 late fee has been added. Aid shows as a credit.
 */
const DUE_DATE = lastPaymentDue() ?? new Date(Date.now() - 4 * 86_400_000).toISOString();

const ITEMS: PaymentItem[] = [
  {
    id: "p1",
    description: "Fall Tuition (CSE, full-time, MN resident)",
    amount: 8017,
    dueDate: DUE_DATE,
    category: "tuition",
  },
  {
    id: "p2",
    description: "Student Services Fee",
    amount: 611.48,
    dueDate: DUE_DATE,
    category: "fees",
  },
  { id: "p3", description: "CSE Collegiate Fee", amount: 450, dueDate: DUE_DATE, category: "fees" },
  {
    id: "p4",
    description: "Transportation and Safety Fee",
    amount: 105.5,
    dueDate: DUE_DATE,
    category: "fees",
  },
  {
    id: "p5",
    description: "Federal Pell Grant (credit)",
    amount: -3698,
    dueDate: DUE_DATE,
    category: "other",
  },
  {
    id: "p6",
    description: "Minnesota State Grant (credit)",
    amount: -2150,
    dueDate: DUE_DATE,
    category: "other",
  },
  { id: "p7", description: "Late payment fee", amount: 40, dueDate: DUE_DATE, category: "fees" },
];

export const paymentsService = {
  getBalance: (): Promise<{ balanceDue: number; items: PaymentItem[] }> =>
    mockRequest("/payments/balance", {
      balanceDue: Math.round(sum(ITEMS.map((i) => i.amount)) * 100) / 100,
      items: ITEMS,
    }),
};
