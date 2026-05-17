'use client'

import { useRef, useState } from 'react'
import { Camera, X, ImageIcon } from 'lucide-react'

interface PhotoUploadProps {
  label: string
  value?: string
  onChange?: (dataUrl: string | undefined) => void
}

export default function PhotoUpload({ label, value, onChange }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      onChange?.(result)
    }
    reader.readAsDataURL(file)
  }

  function handleRemove() {
    setPreview(undefined)
    onChange?.(undefined)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1"
            aria-label="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 flex flex-col items-center justify-center gap-2 text-blue-400 hover:bg-blue-100 transition-colors active:scale-[0.98]"
        >
          <Camera size={28} />
          <span className="text-xs font-medium">Tap to upload</span>
          <span className="text-xs text-gray-400 flex items-center gap-1"><ImageIcon size={10} /> Camera or Gallery</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  )
}
