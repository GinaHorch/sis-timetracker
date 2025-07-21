export function toDataURL(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      resolve(dataURL);
    };
    
    img.onerror = function() {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    // Handle CORS and ensure proper loading
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}