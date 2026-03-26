import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendClientInviteEmail } from "@/lib/invite-email";
import { getPublicBaseUrl } from "@/lib/public-base-url";
import crypto from "crypto";

function errorToMessage(err: unknown) {
  if (!err) return "Unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = session.user as { role?: string } | undefined;
  if (user?.role !== "ADMIN" && user?.role !== "MEMBER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, clientId } = await req.json();
  if (!email || !clientId) {
    return NextResponse.json({ error: "Email and clientId are required" }, { status: 400 });
  }

  const client = await db.client.findUnique({ where: { id: clientId } });
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invite = await db.clientInvite.create({
    data: { email: normalizedEmail, token, expiresAt, clientId },
  });

  const inviteUrl = `${getPublicBaseUrl()}/invite/${token}`;

  const sendResult = await sendClientInviteEmail({
    to: normalizedEmail,
    clientName: client.name,
    inviteUrl,
  });

  if (!sendResult.ok) {
    await db.clientInvite.delete({ where: { id: invite.id } });
    const providerMessage = errorToMessage(sendResult.error);
    return NextResponse.json(
      {
        error:
          `Could not send email via Resend. ` +
          `Check RESEND_API_KEY (and RESEND_FROM / verified domain). ` +
          `Provider message: ${providerMessage}`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ id: invite.id, token, inviteUrl }, { status: 201 });
}
