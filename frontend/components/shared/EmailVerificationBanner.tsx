"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Mail, Loader2, X } from "lucide-react";
import apiClient, { getApiErrorMessage } from "@/lib/api";

export function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!user || user.email_verified || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    setIsSending(true);
    try {
      await apiClient.post("/auth/resend-verification");
      toast({
        title: "Письмо отправлено",
        description: "Проверьте почту для подтверждения email.",
      });
    } catch (err) {
      toast({
        title: "Ошибка",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Подтвердите ваш email для полного доступа к функциям.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isSending}
              className="border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Отправить повторно"
              )}
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
