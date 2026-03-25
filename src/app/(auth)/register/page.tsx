import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
        <p className="text-muted-foreground">Set up your company on Social Hub</p>
      </div>
      <RegisterForm />
    </div>
  );
}
