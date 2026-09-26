export interface Student {
  name: string;
  studentId: string;
  email: string;
  program?: string;
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
