import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
              F
            </div>
            <span className="text-xl font-bold">{APP_NAME}</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Платформа управления финансами и репетиторством
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
