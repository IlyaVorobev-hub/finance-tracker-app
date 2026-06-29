"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff, Loader2, Lock, CheckCircle, AlertCircle } from "lucide-react";
import apiClient, { getApiErrorMessage } from "@/lib/api";
import { ROUTES } from "@/lib/constants";

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Слабый", color: "bg-destructive" };
  if (score <= 2) return { score, label: "Нормальный", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Хороший", color: "bg-yellow-500" };
  return { score, label: "Надёжный", color: "bg-green-500" };
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const passwordChecks = useMemo(
    () => [
      { label: "Минимум 8 символов", met: password.length >= 8 },
      {
        label: "Заглавные и строчные буквы",
        met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      },
      { label: "Содержит цифру", met: /\d/.test(password) },
    ],
    [password]
  );

  if (!token) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-center">
            Неверная ссылка
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Ссылка для сброса пароля недействительна или отсутствует.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button asChild className="w-full" variant="outline">
            <Link href={ROUTES.FORGOT_PASSWORD}>Запросить новую ссылку</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-center">
            Пароль изменён
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Теперь вы можете войти с новым паролем.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button asChild className="w-full">
            <Link href={ROUTES.LOGIN}>Войти</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const validate = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = "Пароль обязателен";
    } else if (password.length < 8) {
      newErrors.password = "Пароль должен быть не менее 8 символов";
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      newErrors.password = "Пароль должен содержать заглавные и строчные буквы";
    } else if (!/\d/.test(password)) {
      newErrors.password = "Пароль должен содержать хотя бы одну цифру";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Подтвердите пароль";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await apiClient.post("/auth/reset-password", {
        token,
        new_password: password,
      });
      setIsSuccess(true);
      toast({
        title: "Пароль изменён",
        description: "Теперь вы можете войти с новым паролем.",
      });
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

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Новый пароль
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Придумайте надёжный пароль для вашего аккаунта
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Новый пароль
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Придумайте пароль"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={
                  errors.password ? "border-destructive pl-10 pr-10" : "pl-10 pr-10"
                }
                disabled={isLoading}
                autoComplete="new-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password}</p>
            )}
            {password.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-16">
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {passwordChecks.map((check) => (
                    <div
                      key={check.label}
                      className="flex items-center gap-1 text-xs"
                    >
                      {check.met ? (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-muted-foreground/50" />
                      )}
                      <span
                        className={
                          check.met
                            ? "text-foreground"
                            : "text-muted-foreground/70"
                        }
                      >
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Подтвердите пароль
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword)
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                className={
                  errors.confirmPassword
                    ? "border-destructive pl-10 pr-10"
                    : "pl-10 pr-10"
                }
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              "Сохранить пароль"
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
