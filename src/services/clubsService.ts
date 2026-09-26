import { mockRequest } from "./api";
import type { ClubEvent } from "@/types";

const EVENTS: ClubEvent[] = [
  {
    id: "e1",
    clubName: "NSBE",
    eventTitle: "Chapter Meeting & Resume Review",
    date: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    location: "Lind Hall 302",
    type: "career",
  },
  {
    id: "e2",
    clubName: "Blockchain Club",
    eventTitle: "Smart Contract Workshop",
    date: new Date(Date.now() + 4 * 86_400_000).toISOString(),
    location: "Walter Library 402",
    type: "workshop",
  },
];

export const clubsService = {
  getEvents: (): Promise<ClubEvent[]> => mockRequest("/clubs/events", EVENTS),
};
