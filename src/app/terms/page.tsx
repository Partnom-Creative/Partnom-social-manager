import type { Metadata } from "next";
import { LegalDocLayout } from "@/app/(marketing)/legal-layout";

export const metadata: Metadata = {
  title: "Terms of Service — Social Hub",
  description: "Terms for using Social Hub.",
};

export default function TermsPage() {
  return (
    <LegalDocLayout title="Terms of Service">
      <p className="text-muted-foreground">Last updated: March 2026</p>

      <h2 className="mt-8 text-lg font-semibold">Agreement</h2>
      <p>
        By accessing or using Social Hub, you agree to these terms on behalf of
        yourself and, where applicable, your organization. If you do not agree,
        do not use the service.
      </p>

      <h2 className="mt-8 text-lg font-semibold">The service</h2>
      <p>
        Social Hub provides tools to manage clients, team access, and social
        media posting. Features depend on your configuration, connected
        platforms, and third-party APIs (which may change or become
        unavailable outside our control).
      </p>

      <h2 className="mt-8 text-lg font-semibold">Accounts and access</h2>
      <p>
        You are responsible for safeguarding login credentials and for activity
        under your account. Organization administrators may invite or remove
        users and control access to client workspaces.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Acceptable use</h2>
      <p>
        You will not use the service to violate law, platform rules, or third
        parties&apos; rights. You are responsible for content you schedule or
        publish and for obtaining any rights or consents required for that
        content.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Disclaimer</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties of any
        kind. We are not liable for indirect or consequential damages to the
        extent permitted by law.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Changes</h2>
      <p>
        We may update these terms; continued use after changes constitutes
        acceptance. Material changes may be communicated through the product or
        your organization.
      </p>
    </LegalDocLayout>
  );
}
