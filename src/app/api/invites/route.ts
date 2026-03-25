import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendClientInviteEmail } from "@/lib/invite-email";
import { getPublicBaseUrl } from "@/lib/public-base-url";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, clientId } = await req.json();
  if (!email || !clientId) {
    return NextResponse.json({ error: "Email and clientId are required" }, { status: 400 });
  }

  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await db.clientInvite.create({
    data: { email, token, expiresAt, clientId },
  });

  const inviteUrl = `${getPublicBaseUrl()}/invite/${token}`;

  await sendClientInviteEmail({ to: email, clientName: client.name, inviteUrl });

  return NextResponse.json({ id: invite.id, token, inviteUrl }, { status: 201 });
}
