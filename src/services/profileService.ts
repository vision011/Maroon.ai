import type { PostgrestError } from "@supabase/supabase-js";
import { requireSupabase } from "@/lib/supabase";
import type { OnboardingStep, ProfileUpdate, Student } from "@/types";

/** A row of `public.profiles` (see supabase/migrations). */
interface ProfileRow {
  id: string;
  internet_id: string;
  email: string;
  full_name: string;
  student_number: string | null;
  program: string | null;
  graduation_year: number | null;
  preferred_language: string;
  plain_language: boolean;
  transfer_student: boolean | null;
  onboarding_step: string | null;
  onboarded_at: string | null;
}

const COLUMNS =
  "id, internet_id, email, full_name, student_number, program, graduation_year, " +
  "preferred_language, plain_language, transfer_student, onboarding_step, onboarded_at";

const STEPS: readonly OnboardingStep[] = ["welcome", "language", "about", "done"];

function toStudent(row: ProfileRow): Student {
  const step = STEPS.find((s) => s === row.onboarding_step);
  return {
    id: row.id,
    internetId: row.internet_id,
    name: row.full_name,
    email: row.email,
    ...(row.student_number ? { studentId: row.student_number } : {}),
    ...(row.program ? { program: row.program } : {}),
    ...(row.graduation_year ? { graduationYear: row.graduation_year } : {}),
    preferredLanguage: row.preferred_language,
    plainLanguage: row.plain_language,
    ...(row.transfer_student !== null ? { transferStudent: row.transfer_student } : {}),
    ...(step ? { onboardingStep: step } : {}),
    ...(row.onboarded_at ? { onboardedAt: row.onboarded_at } : {}),
  };
}

/** Only keys present in the update are sent; `undefined` clears optional fields. */
function toRow(update: ProfileUpdate): Partial<ProfileRow> {
  const row: Partial<ProfileRow> = {};
  if ("name" in update && update.name) row.full_name = update.name.trim();
  if ("studentId" in update) row.student_number = update.studentId?.trim() || null;
  if ("program" in update) row.program = update.program?.trim() || null;
  if ("graduationYear" in update) row.graduation_year = update.graduationYear ?? null;
  if ("preferredLanguage" in update) row.preferred_language = update.preferredLanguage ?? "en";
  if ("plainLanguage" in update) row.plain_language = update.plainLanguage ?? false;
  if ("transferStudent" in update) row.transfer_student = update.transferStudent ?? null;
  if ("onboardingStep" in update) row.onboarding_step = update.onboardingStep ?? null;
  if ("onboardedAt" in update) row.onboarded_at = update.onboardedAt ?? null;
  return row;
}

function friendlyError(error: PostgrestError): Error {
  if (error.code === "23505" && error.message.includes("student_number")) {
    return new Error("That student ID is already linked to another account.");
  }
  if (error.code === "23514") return new Error("Some of those details aren't valid.");
  return new Error(error.message);
}

export const profileService = {
  /** The signed-in student's profile, or null if they have no account row. */
  async get(userId: string): Promise<Student | null> {
    const { data, error } = await requireSupabase()
      .from("profiles")
      .select(COLUMNS)
      .eq("id", userId)
      .maybeSingle<ProfileRow>();
    if (error) throw friendlyError(error);
    return data ? toStudent(data) : null;
  },

  async update(userId: string, update: ProfileUpdate): Promise<Student> {
    const { data, error } = await requireSupabase()
      .from("profiles")
      .update(toRow(update))
      .eq("id", userId)
      .select(COLUMNS)
      .single<ProfileRow>();
    if (error) throw friendlyError(error);
    return toStudent(data);
  },
};
