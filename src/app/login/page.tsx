"use client";

import Link from "next/link";
import { login } from "@/app/actions/auth";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await login(formData, formData.get("code") as string);
      
      if (response?.error) {
        setError(response.error);
      }
      if (response?.success) {
        setSuccess(response.success);
      }
      if (response?.twoFactor) {
        setShowTwoFactor(true);
      }
      if (response?.redirectUrl) {
        window.location.href = response.redirectUrl;
      }
    } catch (err) {
      setError("Сталася непередбачена помилка");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-6 font-serif">UNCULTURED</h1>
        <h2 className="text-xl font-bold text-center mb-8">Вхід в систему</h2>
        
        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}
        {success && <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4 text-sm font-medium">{success}</div>}
        
        <form action={handleSubmit} className="space-y-4">
          {showTwoFactor && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Код авторизації (2FA)</label>
              <input 
                name="code"
                type="text" 
                required
                className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black text-center font-mono tracking-widest text-lg"
                placeholder="123456"
                maxLength={6}
              />
            </div>
          )}

          <div className={showTwoFactor ? "hidden" : "space-y-4"}>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input 
                name="email"
                id="email"
                type="email" 
                className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black"
                placeholder="admin@uncultured.media"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1 transition-all">Пароль</label>
              <div className="relative">
                <input 
                  name="password"
                  id="password"
                  type={showPassword ? "text" : "password"} 
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
          </div>
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (showTwoFactor ? "Підтвердження..." : "Вхід...") : (showTwoFactor ? "Підтвердити" : "Увійти")}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="hover:text-black transition-colors">
            &larr; Повернутися на сайт
          </Link>
        </div>
      </div>
    </div>
  );
}
