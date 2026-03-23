import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth-types";

const updateOrgSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    const organization = await db.organization.findUnique({
      where: { id: user.organizationId },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ user, organization });
  } catch (error) {
    console.error("Error loading settings:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateOrgSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const organization = await db.organization.update({
      where: { id: user.organizationId },
      data: { name: parsed.data.name },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
