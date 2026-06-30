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
      <div className="w-full">
        {!success && !error && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-md mb-6 text-sm font-medium text-center">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-sm font-medium text-center">
            {error}
          </div>
        )}

        {(success || error) && (
          <Link href="/login" className="w-full block text-center bg-black text-white font-bold py-3 rounded-md hover:bg-zinc-800 transition-all">
            Повернутися до входу
          </Link>
        )}
      </div>
  );
}

export default function NewVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-6 font-serif">UNCULTURED</h1>
        <h2 className="text-xl font-bold text-center mb-8">Підтвердження пошти</h2>

        <Suspense fallback={
          <div className="flex justify-center my-8">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
          </div>
        }>
          <NewVerificationForm />
        </Suspense>

        <div className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/" className="hover:text-black transition-colors">
            &larr; Повернутися на сайт
          </Link>
        </div>
      </div>
    </div>
  );
}
