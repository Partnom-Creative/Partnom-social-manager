import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default async function InviteErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ msg?: string }>;
}) {
  const { msg } = await searchParams;

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="py-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h2 className="text-xl font-bold">Connection Failed</h2>
            <p className="text-muted-foreground mt-2">
              {msg ||
                "There was an error connecting your account. Please try again or contact your agency."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
