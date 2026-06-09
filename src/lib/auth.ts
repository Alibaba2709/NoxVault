import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const sessionCookieName = "noxvault_session";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get(sessionCookieName)?.value ?? null;
}

export function attachSessionCookie(
  response: NextResponse,
  userId: string,
): NextResponse {
  response.cookies.set(sessionCookieName, userId, sessionCookieOptions);

  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(sessionCookieName, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });

  return response;
}
