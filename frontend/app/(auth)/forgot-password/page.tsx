"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email обязателен");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.post("/auth/forgot-password", { email });
      setIsSent(true);
    } catch (err) {
      toast({
        title: "Ошибка",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-center">
            Письмо отправлено
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Если аккаунт с таким email существует, вы получите инструкции по сбросу пароля.
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
        <CardTitle className="text-xl font-semibold tracking-tight">
          Забыли пароль?
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Введите email для получения ссылки на сброс пароля
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                className={error ? "border-destructive pl-10" : "pl-10"}
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              "Отправить ссылку"
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Вспомнили пароль?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-primary hover:underline"
            >
              Войти
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
