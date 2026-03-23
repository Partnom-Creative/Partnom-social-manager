import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

  const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/${token}`;

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Social Hub <onboarding@resend.dev>",
        to: email,
        subject: `Connect your social media accounts for ${client.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Connect Your Social Media Accounts</h2>
            <p>You've been invited to connect your social media accounts for <strong>${client.name}</strong>.</p>
            <p>Click the button below to securely connect your accounts.</p>
            <a href="${inviteUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
              Connect Accounts
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 7 days.</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Failed to send invite email:", e);
    }
  }

  return NextResponse.json({ id: invite.id, token, inviteUrl }, { status: 201 });
}
