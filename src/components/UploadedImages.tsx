import { X } from 'lucide-react';

interface UploadedImagesProps {
  images: string[];
  onRemove: (index: number) => void;
}

export function UploadedImages({ images, onRemove }: UploadedImagesProps) {
  if (images.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Attached Images ({images.length})</p>
      <div className="grid grid-cols-6 gap-2">
        {images.map((image, idx) => (
          <div key={idx} className="relative group">
            <img
              src={`data:image/jpeg;base64,${image}`}
              alt={`Attached ${idx}`}
              className="w-full h-16 object-cover rounded-lg"
            />
            <button
              onClick={() => onRemove(idx)}
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-elegant"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
