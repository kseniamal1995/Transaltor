import { verifyToken } from "@clerk/backend";
import { cookies } from "next/headers";

export async function requireUserId(): Promise<string> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("__session")?.value;

  if (!sessionToken) {
    throw new Error("Unauthorized");
  }

  const verified = await verifyToken(sessionToken, {
    secretKey: process.env.CLERK_SECRET_KEY!,
  });

  if (!verified?.sub) {
    throw new Error("Unauthorized");
  }

  return verified.sub;
}
