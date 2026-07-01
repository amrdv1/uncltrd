"use client";

import { useState, useRef } from "react";

import { toast } from "sonner";

export function ImageUploadField({ 
  name, 
  defaultValue = "", 
  placeholder = "https://example.com/image.jpg",
  className = "" 
}: { 
  name: string;
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("convertToGif", "true");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await res.json();
      setUrl(data.url);
    } catch (err: any) {
      toast.error(`Помилка завантаження файлу: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <div className="relative flex-1">
        <input 
          name={name}
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`${className}`}
          placeholder={placeholder}
        />
      </div>
      
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef}
        accept="image/*,video/*"
        onChange={handleUpload}
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold uppercase disabled:opacity-50 hover:bg-accent transition-colors text-[10px]"
      >
        {isUploading ? "..." : "ЗАВАНТАЖИТИ"}
      </button>
    </div>
  );
}
