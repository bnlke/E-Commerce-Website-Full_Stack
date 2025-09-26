// Generate a tiny blurred placeholder
export function generateBlurDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 3;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Create a subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, 4, 3);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 4, 3);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Image dimensions for different viewports
export const imageSizes = {
  sm: '100vw',
  md: '50vw',
  lg: '33vw'
};