"use client";

import Link from "next/link";
import { register } from "@/app/actions/auth";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    setError(null);
    try {
      const response = await register(formData);
      if (response?.error) {
        setError(response.error);
      } else if (response?.redirectUrl) {
        window.location.href = response.redirectUrl;
      }
    } catch (err: any) {
      setError("Сталася непередбачена помилка");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-zinc-200 w-full max-w-md">
        <h1 className="text-3xl font-black text-center mb-6 font-serif">UNCULTURED</h1>
        <h2 className="text-xl font-bold text-center mb-8">Створити акаунт</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium mb-6">
            {error}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(new FormData(e.currentTarget));
          }} 
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Ім'я</label>
            <input 
              name="name"
              type="text" 
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black transition-all"
              placeholder="Микола Миколчук"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black transition-all"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1 transition-all">Пароль</label>
            <div className="relative">
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                required
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black text-black transition-all ${error && error.includes("Пароль") ? "border-red-500 bg-red-50" : "border-zinc-300"}`}
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
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Реєстрація..." : "Зареєструватися"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-zinc-500">
          Вже маєте акаунт?{" "}
          <Link href="/login" className="text-black font-bold hover:underline">
            Увійти
          </Link>
        </div>
      </div>
    </div>
  );
}
