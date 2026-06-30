"use client";

import { useState, useRef } from "react";
import { Upload, FileVideo, RefreshCw, Copy, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function GifConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("video/")) {
        setError("Будь ласка, оберіть відео файл (mp4, mov, webm).");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResultUrl(null);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResultUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("convertToGif", "true");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Помилка конвертації");
      }

      setResultUrl(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = () => {
    if (!resultUrl) return;
    
    // In dev, window.location.origin is fine. We can also just copy the absolute path
    const fullUrl = window.location.origin + resultUrl;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2 font-antapani">Конвертор GIF</h1>
      <p className="text-zinc-500 mb-8 font-bold uppercase tracking-widest text-xs">Завантажте відео, щоб автоматично перетворити його на GIF і отримати посилання</p>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm">
        
        {/* Upload Area */}
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${file ? 'border-accent/50 bg-accent/5' : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'}`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/mp4,video/quicktime,video/webm" 
            className="hidden" 
            disabled={isUploading}
          />
          
          {file ? (
            <>
              <div className="w-16 h-16 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-4">
                <FileVideo size={32} />
              </div>
              <p className="font-bold text-lg">{file.name}</p>
              <p className="text-zinc-500 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              
              {!isUploading && !resultUrl && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResultUrl(null); setError(null); }}
                  className="mt-4 text-xs font-bold uppercase tracking-widest text-red-500 hover:underline"
                >
                  Вибрати інший файл
                </button>
              )}
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mb-4">
                <Upload size={32} />
              </div>
              <p className="font-bold text-lg mb-2">Натисніть для вибору файлу</p>
              <p className="text-zinc-500 text-sm">MP4, MOV, WEBM (до 50MB)</p>
            </>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-500/20">
            Помилка: {error}
          </div>
        )}

        {/* Action Button */}
        {file && !resultUrl && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleConvert}
              disabled={isUploading}
              className="bg-black text-white dark:bg-white dark:text-black px-12 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[250px]"
            >
              {isUploading ? (
                <>
                  <RefreshCw size={20} className="mr-3 animate-spin" />
                  Конвертація...
                </>
              ) : (
                "СТВОРИТИ GIF"
              )}
            </button>
          </div>
        )}

        {/* Result Area */}
        {resultUrl && (
          <div className="mt-10 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-xl mb-6">Готово! Ваша GIF-ка:</h3>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/2 aspect-video bg-zinc-100 dark:bg-black rounded-2xl overflow-hidden relative border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                <Image 
                  src={resultUrl} 
                  alt="Converted GIF" 
                  fill 
                  className="object-contain" 
                  unoptimized 
                />
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Посилання</label>
                  <div className="flex relative">
                    <input 
                      type="text" 
                      readOnly 
                      value={window.location.origin + resultUrl} 
                      className="w-full bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 pr-14 outline-none text-sm font-medium"
                    />
                    <button 
                      onClick={handleCopy}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                      title="Скопіювати"
                    >
                      {copied ? <CheckCircle size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Ви можете скопіювати це посилання і вставити його в поле "URL Обкладинки" під час створення статті, або використовувати будь-де в інтернеті.
                </p>

                <button 
                  onClick={() => { setFile(null); setResultUrl(null); }}
                  className="mt-auto inline-flex self-start px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-black dark:text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-colors"
                >
                  Конвертувати інше відео
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
