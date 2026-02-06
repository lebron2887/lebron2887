import { Button } from './Button';
import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import { imageToBase64 } from '@/lib/storage';
import { UserTier, TIER_LIMITS } from '@/lib/utils';

interface ImageUploaderProps {
  onImagesSelected: (images: string[]) => void;
  currentTier: UserTier;
  imagesUsed: number;
}

export function ImageUploader({
  onImagesSelected,
  currentTier,
  imagesUsed,
}: ImageUploaderProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const limit = TIER_LIMITS[currentTier].images;
  const remaining = limit === Infinity ? 'Unlimited' : limit - imagesUsed;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const totalImages = selectedImages.length + newFiles.length;

    if (limit !== Infinity && totalImages > limit) {
      alert(`You can only upload ${limit} images per month. You have ${remaining} remaining.`);
      return;
    }

    setSelectedImages([...selectedImages, ...newFiles]);

    // Create previews
    for (const file of newFiles) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    const base64Images = await Promise.all(
      selectedImages.map((file) => imageToBase64(file))
    );
    onImagesSelected(base64Images);
    setSelectedImages([]);
    setPreviews([]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Upload Images</label>
        <span className="text-xs text-muted-foreground">
          {remaining} remaining
        </span>
      </div>

      <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-elegant cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id="image-input"
          disabled={limit !== Infinity && imagesUsed >= limit}
        />
        <label htmlFor="image-input" className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">Click to upload images</p>
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((preview, idx) => (
            <div key={idx} className="relative">
              <img
                src={preview}
                alt={`Preview ${idx}`}
                className="w-full h-20 object-cover rounded-lg"
              />
              <button
                onClick={() => removeImage(idx)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedImages.length > 0 && (
        <Button onClick={handleUpload} className="w-full">
          Upload {selectedImages.length} Image{selectedImages.length !== 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}
