"use client";

import { useState, useRef } from "react";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";

export function MediaInputManager({ initialMedia = [] }: { initialMedia?: any[] }) {
  const [media, setMedia] = useState<{ url: string; type: string }[]>(initialMedia);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addMedia = () => {
    setMedia([...media, { url: "", type: "IMAGE" }]);
  };

  const updateMedia = (index: number, field: "url" | "type", value: string) => {
    const newMedia = [...media];
    newMedia[index][field] = value;
    setMedia(newMedia);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      
      const newMedia = [...media];
      newMedia[index].url = data.url;
      if (file.type.startsWith('video/')) {
        newMedia[index].type = "VIDEO";
      } else {
        newMedia[index].type = "IMAGE";
      }
      setMedia(newMedia);
    } catch (err) {
      alert("Помилка завантаження файлу");
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-zinc-800 uppercase">Додаткові Медіа (Галерея)</label>
        <button type="button" onClick={addMedia} className="text-xs bg-zinc-200 hover:bg-zinc-300 text-black px-3 py-1 rounded font-bold uppercase flex items-center">
          + Додати
        </button>
      </div>

      <input type="hidden" name="mediaFiles" value={JSON.stringify(media)} />

      {media.map((item, index) => (
        <div key={index} className="flex space-x-2 items-center bg-zinc-50 p-2 border border-zinc-200 rounded">
          <select 
            value={item.type} 
            onChange={(e) => updateMedia(index, "type", e.target.value)}
            className="px-3 py-2 border border-zinc-300 rounded text-sm outline-none bg-white font-bold uppercase w-1/4"
          >
            <option value="IMAGE">Фото</option>
            <option value="VIDEO">Відео</option>
          </select>
          
          <div className="flex-1 flex space-x-2">
            <input 
              type="text" 
              value={item.url} 
              onChange={(e) => updateMedia(index, "url", e.target.value)}
              placeholder="URL посилання..."
              className="px-3 py-2 border border-zinc-300 rounded text-sm outline-none flex-1"
            />
            
            <input 
              type="file" 
              className="hidden" 
              ref={(el) => { fileInputRefs.current[index] = el; }}
              accept="image/*,video/*"
              onChange={(e) => handleUpload(index, e)}
            />
            
            <button
              type="button"
              onClick={() => fileInputRefs.current[index]?.click()}
              disabled={uploadingIndex === index}
              className="px-3 py-2 bg-black text-white rounded flex items-center justify-center text-[10px] font-bold uppercase disabled:opacity-50"
            >
              {uploadingIndex === index ? "..." : "Завантажити"}
            </button>
          </div>

          <ConfirmDeleteButton 
            onConfirm={() => removeMedia(index)} 
            itemType="це медіа" 
          />
        </div>
      ))}
      
      {media.length === 0 && (
        <p className="text-sm text-zinc-500 italic">Немає додаткових медіа.</p>
      )}
    </div>
  );
}
