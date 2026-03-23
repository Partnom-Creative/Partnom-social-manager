import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        <p className="text-muted-foreground">Set up your agency on Social Hub</p>
      </div>
      <RegisterForm />
    </div>
  );
}
