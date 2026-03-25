import type { Metadata } from "next";
import { LegalDocLayout } from "@/app/(marketing)/legal-layout";

export const metadata: Metadata = {
  title: "Data deletion — Social Hub",
  description: "How to request removal of your Social Hub data.",
};

export default function DataDeletionPage() {
  return (
    <LegalDocLayout title="Data deletion">
      <p className="text-muted-foreground">Last updated: March 2026</p>

      <h2 className="mt-8 text-lg font-semibold">User data</h2>
      <p>
        If you use Social Hub as part of an agency, your organization&apos;s
        administrator can remove your access or delete your user record where
        the product supports it. Contact them first for account closure.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Organization data</h2>
      <p>
        Deleting an organization or client workspace may require administrator
        action in the product or support from your hosting provider. Encrypted
        OAuth tokens for disconnected accounts should be removed when accounts
        are deleted or disconnected in settings.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Platform connections</h2>
      <p>
        You can revoke Social Hub&apos;s access at any time from the relevant
        social network&apos;s security or apps settings (e.g. Facebook, Google,
        LinkedIn, X). Revoking tokens there stops new API use even if data
        remains in backups for a limited period per our infrastructure provider.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Data subject requests</h2>
      <p>
        To request export or deletion of personal data we hold about you,
        contact your agency administrator or email the address your
        organization has designated for this product. We will respond within a
        reasonable time and in line with applicable law.
      </p>

      <p className="mt-6 text-muted-foreground">
        For developer console submissions (Meta, LinkedIn, etc.), use this page
        URL as your on-file data deletion or user contact reference when a
        dedicated inbox is not yet published.
      </p>
    </LegalDocLayout>
  );
}
