"use client";

import { newVerification } from "@/app/actions/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";

function NewVerificationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (hasCalledRef.current) return;
    hasCalledRef.current = true;

    if (!token) {
      setError("Токен відсутній!");
      return;
    }

    newVerification(token)
      .then((data) => {
        if (data.success) {
          setSuccess(data.success);
        }
        if (data.error) {
          setError(data.error);
        }
      })
      .catch(() => {
        setError("Щось пішло не так!");
      });
  }, [token]);

  return (
    <div className="w-full max-w-md z-10 text-center">
      <div className="mb-8">
        <Link href="/" className="text-4xl font-black uppercase tracking-tighter font-serif inline-block mb-2">
          uncultured<span className="text-accent">.</span>
        </Link>
        <h1 className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">Підтвердження пошти</h1>
      </div>

      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
        {!success && !error && (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full" />
            <p className="text-zinc-500 font-bold tracking-widest uppercase text-sm">Перевірка токена...</p>
          </div>
        )}

        {success && (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-sm font-bold w-full">
              {success}
            </div>
            <Link href="/login" className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-accent dark:hover:bg-accent hover:text-white transition-colors shadow-lg shadow-black/10 dark:shadow-white/10 mt-2 block">
              Перейти до входу
            </Link>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold w-full">
              {error}
            </div>
            <Link href="/login" className="w-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors mt-2 block">
              Повернутись до входу
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0a0a0a] transition-colors p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <Suspense fallback={
        <div className="w-full max-w-md z-10 flex justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full" />
        </div>
      }>
        <NewVerificationForm />
      </Suspense>
    </div>
  );
}
