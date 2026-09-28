import { mockRequest } from "./api";
import { demoDate } from "./demo";
import type { ClubEvent } from "@/types";

const EVENTS: ClubEvent[] = [
  {
    id: "e1",
    clubName: "SHPE",
    eventTitle: "First General Meeting & Free Tacos",
    date: demoDate(1, 18, 0),
    location: "Keller Hall 3-180",
    type: "meeting",
  },
  {
    id: "e2",
    clubName: "CSE Career Center",
    eventTitle: "Fall Tech Career Fair",
    date: demoDate(2, 13, 0),
    location: "McNamara Alumni Center",
    type: "career",
  },
  {
    id: "e3",
    clubName: "La Raza Student Cultural Center",
    eventTitle: "Hispanic Heritage Month Celebration",
    date: demoDate(3, 17, 30),
    location: "Coffman Union Great Hall",
    type: "social",
  },
  {
    id: "e4",
    clubName: "Women in Computer Science",
    eventTitle: "Intro to Git Workshop & Hack Night",
    date: demoDate(5, 19, 0),
    location: "Walter Library 402",
    type: "workshop",
  },
];

export const clubsService = {
  getEvents: (): Promise<ClubEvent[]> => mockRequest("/clubs/events", EVENTS),
};
