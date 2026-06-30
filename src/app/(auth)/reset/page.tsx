"use client";

import Link from "next/link";
import { useState } from "react";
import { resetPassword } from "@/app/actions/auth";

export default function ResetPage() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await resetPassword(formData);
      
      if (response?.error) {
        setError(response.error);
      }
      if (response?.success) {
        setSuccess(response.success);
      }
    } catch (err) {
      setError("Сталася непередбачена помилка");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-6 font-serif uppercase tracking-tighter">
          uncultured<span className="text-red-500">.</span>
        </h1>
        <h2 className="text-xl font-bold text-center mb-4">Забули пароль?</h2>
        <p className="text-sm text-zinc-500 text-center mb-8">
          Введіть вашу електронну пошту, і ми надішлемо вам посилання для створення нового пароля.
        </p>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4 text-sm font-medium">{success}</div>}
        
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
              placeholder="user@example.com"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? "Відправка..." : "Відправити лист"}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/login" className="hover:text-black transition-colors font-medium">
            &larr; Повернутися до входу
          </Link>
        </div>
      </div>
    </div>
  );
}
