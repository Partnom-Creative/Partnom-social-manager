import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password, orgName } = await req.json();

    if (!name || !email || !password || !orgName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const hashedPassword = await hash(password, 12);
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const org = await db.organization.create({
      data: {
        name: orgName,
        slug: slug + "-" + Date.now().toString(36),
        users: {
          create: {
            name,
            email,
            hashedPassword,
            role: "ADMIN",
          },
        },
      },
    });

    return NextResponse.json({ success: true, organizationId: org.id }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
