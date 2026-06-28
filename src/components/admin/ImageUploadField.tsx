"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";

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

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setUrl(data.url);
    } catch (err) {
      alert("Помилка завантаження файлу");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ImageIcon size={16} className="text-zinc-400" />
        </div>
        <input 
          name={name}
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={`pl-10 ${className}`}
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
        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold uppercase disabled:opacity-50 hover:bg-accent transition-colors"
      >
        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
      </button>
    </div>
  );
}
