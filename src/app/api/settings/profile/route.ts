import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SessionUser } from "@/lib/auth-types";

const updateProfileSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    currentPassword: z.string().optional(),
    newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  })
  .refine(
    (data) => {
      if (data.currentPassword && !data.newPassword) return false;
      if (!data.currentPassword && data.newPassword) return false;
      return true;
    },
    { message: "Both current and new password are required to change password" }
  );

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, currentPassword, newPassword } = parsed.data;

    if (currentPassword && newPassword) {
      const dbUser = await db.user.findUnique({
        where: { id: user.id },
        select: { hashedPassword: true },
      });

      if (!dbUser?.hashedPassword) {
        return NextResponse.json(
          { error: "No password set for this account" },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(currentPassword, dbUser.hashedPassword);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await db.user.update({
        where: { id: user.id },
        data: { name, hashedPassword },
      });
    } else {
      await db.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
