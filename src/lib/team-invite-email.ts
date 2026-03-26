/**
 * Sends team join invite email (set password) via Resend when configured.
 */
export async function sendTeamInviteEmail({
  to,
  organizationName,
  inviteUrl,
}: {
  to: string;
  organizationName: string;
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
      subject: `You're invited to join ${organizationName} on Social Hub`,
      html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Join your team</h2>
            <p>You've been invited to collaborate on <strong>${organizationName}</strong> in Social Hub.</p>
            <p>Click the button below to create your password and activate your account.</p>
            <a href="${inviteUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
              Accept invitation
            </a>
            <p style="color: #666; font-size: 14px;">This link expires in 7 days.</p>
          </div>
        `,
    });
    if (error) return { ok: false, error };
    return { ok: true };
  } catch (e) {
    console.error("Failed to send team invite email:", e);
    return { ok: false, error: e };
  }
}
