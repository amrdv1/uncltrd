"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/ui/ConfirmDeleteButton";

export function MediaInputManager({ initialMedia = [] }: { initialMedia?: any[] }) {
  const [media, setMedia] = useState<{ url: string; type: string }[]>(initialMedia);

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-zinc-800 uppercase">Додаткові Медіа (Галерея)</label>
        <button type="button" onClick={addMedia} className="text-xs bg-zinc-200 hover:bg-zinc-300 text-black px-3 py-1 rounded font-bold uppercase flex items-center">
          <Plus size={14} className="mr-1" /> Додати
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
          
          <input 
            type="url" 
            value={item.url} 
            onChange={(e) => updateMedia(index, "url", e.target.value)}
            placeholder="URL посилання..."
            className="px-3 py-2 border border-zinc-300 rounded text-sm outline-none flex-1"
          />

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
