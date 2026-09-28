/** Onboarding screens, in order. Stored on the profile so students can resume. */
export type OnboardingStep = "welcome" | "language" | "about" | "done";

export interface Student {
  /** Supabase Auth user id; owns the student's data. */
  id: string;
  /** UMN x500, e.g. "moha2048". */
  internetId: string;
  name: string;
  email: string;
  /** 7-digit UMN student ID number. */
  studentId?: string;
  program?: string;
  graduationYear?: number;
  /** ISO 639 code Goldy answers in, e.g. "es". Defaults to "en". */
  preferredLanguage: string;
  /** Short sentences at about a grade-6 reading level. */
  plainLanguage: boolean;
  /** Unset until the student answers. */
  transferStudent?: boolean;
  onboardingStep?: OnboardingStep;
  /** Unset until the student finishes onboarding. */
  onboardedAt?: string;
}

/** Profile fields the student can change after sign-up. `undefined` clears a field. */
export type ProfileUpdate = {
  [
    K in
      | "name"
      | "studentId"
      | "program"
      | "graduationYear"
      | "preferredLanguage"
      | "plainLanguage"
      | "transferStudent"
      | "onboardingStep"
      | "onboardedAt"
  ]?: Student[K] | undefined;
};

export interface SignUpDetails {
  fullName: string;
  internetId: string;
  password: string;
}

export interface AcademicItem {
  id: string;
  courseCode: string;
  title: string;
  dueDate: string;
  location: string;
  type: "assignment" | "exam" | "quiz" | "lab";
}

export interface PaymentItem {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  category: "tuition" | "fees" | "housing" | "other";
}

export interface ClubEvent {
  id: string;
  clubName: string;
  eventTitle: string;
  date: string;
  location: string;
  type: "meeting" | "social" | "workshop" | "career";
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  credits: number;
  meetingTime: string;
  location: string;
  grade?: string;
}

export interface AuthSession {
  student: Student;
  token: string;
}
