import { verifyCanvasToken } from "./canvas.functions";

/**
 * The student's own Canvas access token. It stays in this browser (never in our database) and
 * is sent only to our server functions, which pass it straight to Canvas.
 */
const STORAGE_KEY = "maroon.canvasToken";

export const CANVAS_TOKEN_URL = "https://canvas.umn.edu/profile/settings";

export const canvasService = {
  token(): string | null {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  },

  /** Checks the token with Canvas before saving it. Resolves to the student's Canvas name. */
  async connect(rawToken: string): Promise<string> {
    const token = rawToken.trim();
    if (!token) throw new Error("Paste your Canvas access token first.");
    const user = await verifyCanvasToken({ data: token });
    if (!user) {
      throw new Error(
        "Canvas didn't accept that token. Copy it again and make sure it's complete.",
      );
    }
    window.localStorage.setItem(STORAGE_KEY, token);
    return user.name;
  },

  disconnect(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage blocked: nothing was saved.
    }
  },
};
