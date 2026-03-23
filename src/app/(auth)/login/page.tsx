import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Social Hub</h1>
        <p className="text-muted-foreground">Sign in to manage your clients&apos; social media</p>
      </div>
      <LoginForm />
    </div>
  );
}
