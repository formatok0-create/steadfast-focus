import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, X } from 'lucide-react';

interface ImagePickerProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
  label?: string;
}

export const ImagePicker = ({ value, onChange, label = 'Logo / Image' }: ImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 500KB after compression
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop lourde (max 5 Mo)');
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      // Compress via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) { h = (h / w) * MAX; w = MAX; }
        else { w = (w / h) * MAX; h = MAX; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/webp', 0.8);
        onChange(compressed);
        setLoading(false);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Logo"
              className="w-14 h-14 rounded-xl object-cover border border-border"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onChange(undefined)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
            >
              <X size={10} />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-14 h-14 rounded-xl border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors bg-muted/30"
          >
            {loading ? (
              <motion.div
                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <ImagePlus size={18} className="text-muted-foreground" />
            )}
          </motion.button>
        )}
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">
            {value ? 'Image ajoutée' : 'Facultatif — ajoute un logo'}
          </p>
          {value && (
            <button
              onClick={() => inputRef.current?.click()}
              className="text-[10px] text-primary font-medium mt-0.5"
            >
              Changer
            </button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
};
