import React, { useRef, useState } from 'react';
import { compressImage, validateImageFile } from '../utils/helpers';

const UploadImage: React.FC<{ onImageUpload: (file: File) => void }> = ({ onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateImageFile(file)) return alert('Invalid image type');
    const compressed = await compressImage(file, { maxWidth: 1280, quality: 0.7 });
    setSelectedImage(compressed);
    setPreviewUrl(URL.createObjectURL(compressed));
    onImageUpload(compressed);
  };

  return (
    <div className="upload-image">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        style={{ display: 'none' }}
      />
      <div className="tiles">
        <button type="button" className="tile" onClick={() => inputRef.current?.click()}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>📷</div>
            <div className="title">Take Photo</div>
          </div>
        </button>
        <label className="tile" style={{ cursor: 'pointer' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>📁</div>
            <div className="title">Upload File</div>
          </div>
          <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        </label>
        <div className="tile" style={{ display: previewUrl ? 'flex' : 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24 }}>✅</div>
            <div className="title">{selectedImage ? `${Math.round(selectedImage.size / 1024)} KB` : 'Ready'}</div>
          </div>
        </div>
      </div>
      {previewUrl && (
        <div className="image-preview" style={{ marginTop: 12 }}>
          <img src={previewUrl} alt="Preview" style={{ maxHeight: '220px', maxWidth: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
        </div>
      )}
    </div>
  );
};

export default UploadImage;