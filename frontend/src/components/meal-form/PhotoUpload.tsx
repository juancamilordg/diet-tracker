import { useRef } from 'react'

interface Props {
  photoUrl?: string
  onPhotoChange: (file: File) => void
}

export default function PhotoUpload({ photoUrl, onPhotoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative w-full h-56 rounded-xl overflow-hidden mb-8 bg-surface-container shadow-2xl group">
      {photoUrl ? (
        <img src={photoUrl} alt="Meal" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-outline-variant">add_a_photo</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
      <div className="absolute bottom-4 right-4">
        <button
          onClick={() => inputRef.current?.click()}
          className="bg-surface-bright/80 backdrop-blur-md text-on-surface px-4 py-2 rounded-full flex items-center gap-2 hover:bg-surface-container-highest transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">photo_camera</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">
            {photoUrl ? 'Change Photo' : 'Add Photo'}
          </span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onPhotoChange(file)
        }}
      />
    </div>
  )
}
