export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  return validTypes.includes(file.type);
};

export const generateUniqueId = (): string => {
  return 'id-' + Math.random().toString(36).substr(2, 16);
};

export const compressImage = async (
  file: File,
  options: { maxWidth?: number; quality?: number } = {}
): Promise<File> => {
  const maxWidth = options.maxWidth ?? 1280;
  const quality = options.quality ?? 0.7;

  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / imageBitmap.width);
  const targetWidth = Math.round(imageBitmap.width * scale);
  const targetHeight = Math.round(imageBitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || file), 'image/jpeg', quality)
  );

  return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
};