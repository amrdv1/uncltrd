"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { setNewPassword } from "@/app/actions/auth";
import { Eye, EyeOff } from "lucide-react";

function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm font-medium text-center">
        Відсутній токен скидання пароля!
      </div>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await setNewPassword(formData, token);
      
      if (response?.error) {
        setError(response.error);
      }
      if (response?.success) {
        setSuccess(response.success);
        if (response.redirectUrl) {
          setTimeout(() => {
            window.location.href = response.redirectUrl;
          }, 2000);
        }
      }
    } catch (err) {
      setError("Сталася непередбачена помилка");
    } finally {
      setIsPending(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-green-50 text-green-500 p-3 rounded-md mb-6 text-sm font-medium w-full text-center">
          {success}
        </div>
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent rounded-full mb-2" />
        <p className="text-sm text-zinc-500">Перенаправлення на сторінку входу...</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Новий пароль</label>
        <div className="relative">
          <input 
            name="password"
            type={showPassword ? "text" : "password"} 
            required
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black transition-all"
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">Підтвердіть пароль</label>
        <div className="relative">
          <input 
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"} 
            required
            className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black transition-all"
            placeholder="••••••••"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {isPending ? "Збереження..." : "Зберегти новий пароль"}
      </button>
    </form>
  );
}

export default function NewPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-6 font-serif uppercase tracking-tighter">
          uncultured<span className="text-red-500">.</span>
        </h1>
        <h2 className="text-xl font-bold text-center mb-8">Створення пароля</h2>
        
        <Suspense fallback={
          <div className="flex justify-center my-8">
            <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent rounded-full" />
          </div>
        }>
          <NewPasswordForm />
        </Suspense>
        
        <div className="mt-8 text-center text-sm text-zinc-500">
          <Link href="/login" className="hover:text-black transition-colors font-medium">
            &larr; Повернутися до входу
          </Link>
        </div>
      </div>
    </div>
  );
}
