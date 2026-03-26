/**
 * Sends the client connection invite email via Resend (if configured).
 */
export async function sendClientInviteEmail({
  to,
  clientName,
  inviteUrl,
}: {
  to: string;
  clientName: string;
  inviteUrl: string;
}): Promise<{ ok: true } | { ok: false; error: unknown }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: new Error("RESEND_API_KEY not configured") };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || "Social Hub <onboarding@resend.dev>";
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `Connect your social media accounts for ${clientName}`,
      html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Connect Your Social Media Accounts</h2>
            <p>You've been invited to connect your social media accounts for <strong>${clientName}</strong>.</p>
            <p>Click the button below to securely connect your accounts.</p>
            <a href="${inviteUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
              Connect Accounts
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 7 days.</p>
          </div>
        `,
    });

    // Resend frequently returns { error } instead of throwing.
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (e) {
    console.error("Failed to send invite email:", e);
    return { ok: false, error: e };
  }
}
