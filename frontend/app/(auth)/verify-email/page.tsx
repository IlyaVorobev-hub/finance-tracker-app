"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    const verify = async () => {
      try {
        await apiClient.post(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus("success");
        toast({
          title: "Email подтверждён",
          description: "Ваш email успешно подтверждён.",
        });
      } catch (err) {
        setStatus("error");
        setErrorMessage(getApiErrorMessage(err));
      }
    };

    verify();
  }, [token, toast]);

  if (status === "loading") {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-center">
            Подтверждение email
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Проверяем вашу ссылку...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-center">
            Email подтверждён
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Теперь у вас полный доступ ко всем функциям.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button asChild className="w-full">
            <Link href={ROUTES.DASHBOARD}>Перейти к.dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (status === "no-token") {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <Mail className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-center">
            Проверьте почту
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Мы отправили ссылку для подтверждения на ваш email. Проверьте почту и перейдите по ссылке.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button asChild className="w-full" variant="outline">
            <Link href={ROUTES.LOGIN}>Вернуться к входу</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight text-center">
          Ошибка подтверждения
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center">
          {errorMessage || "Ссылка недействительна или истекла."}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col space-y-4 pt-2">
        <Button asChild className="w-full" variant="outline">
          <Link href={ROUTES.LOGIN}>Вернуться к входу</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
