"use client";

import { logout } from "@/app/actions/user";

export function LogoutButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const handleLogout = async () => {
    // Clear theme from localStorage
    localStorage.removeItem("theme");
    
    // Clear accent color cookie
    document.cookie = "accentColor=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    
    // Reset CSS variables to default
    document.documentElement.style.removeProperty('--accent');
    
    // Switch to system theme by removing dark class
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');

    // Proceed with server logout
    await logout();
  };

  return (
    <button onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
