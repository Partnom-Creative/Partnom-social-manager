import type { Metadata } from "next";
import { LegalDocLayout } from "@/app/(marketing)/legal-layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Social Hub",
  description: "How Social Hub collects and uses data.",
};

export default function PrivacyPage() {
  return (
    <LegalDocLayout title="Privacy Policy">
      <p className="text-muted-foreground">Last updated: March 2026</p>

      <h2 className="mt-8 text-lg font-semibold">Overview</h2>
      <p>
        Social Hub is a business tool for marketing agencies to manage social
        media on behalf of their clients. This policy describes what we
        process when you use the service, connect social accounts, and use invite
        links.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Data we process</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Account data:</strong> name, email, password hash, role, and
          organization membership.
        </li>
        <li>
          <strong>Client and workspace data:</strong> client names, team access
          rules, and content you create in the product (drafts, scheduled posts).
        </li>
        <li>
          <strong>OAuth tokens:</strong> when users connect X, LinkedIn,
          YouTube, or Instagram, we store encrypted access and refresh tokens to
          publish on your behalf and refresh credentials as permitted by each
          platform.
        </li>
        <li>
          <strong>Invite and email:</strong> we send transactional emails (e.g.
          team and client invites) when you use those features and when email is
          configured.
        </li>
        <li>
          <strong>Technical data:</strong> standard logs and cookies needed for
          authentication and security (e.g. session cookies).
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">How we use data</h2>
      <p>
        We use this information to provide the service: sign-in, collaboration,
        scheduling and publishing posts, and connecting social accounts per your
        instructions. We do not sell your personal information.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Third-party platforms</h2>
      <p>
        When you connect a social network, that platform&apos;s terms and
        privacy policy also apply to data shared with them. We only request the
        permissions needed to read and publish content you configure in Social
        Hub.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Retention and deletion</h2>
      <p>
        We retain data while your account is active and as needed to comply with
        law. You can request deletion of your account and associated data; see{" "}
        <a href="/data-deletion" className="text-primary underline">
          Data deletion
        </a>
        .
      </p>

      <h2 className="mt-8 text-lg font-semibold">Contact</h2>
      <p>
        For privacy questions, contact your organization administrator or the
        email address provided by your agency for this product.
      </p>
    </LegalDocLayout>
  );
}
