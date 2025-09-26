import { useState, useCallback, useMemo } from 'react';
import { ImageOff } from 'lucide-react';
import { generateBlurDataUrl } from '../utils/imageUtils';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function ImageWithFallback({ 
  src, 
  alt, 
  className = '', 
  priority = false
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setError] = useState(false);
  // Generate blur data URL once
  const [blurDataUrl] = useState(() => generateBlurDataUrl());
  
  // Add quality and size parameters to Unsplash URLs for better performance
  const optimizedSrc = (() => {
    if (!src || typeof src !== 'string' || !src.includes('unsplash.com')) return src;
    const url = new URL(src);
    url.searchParams.set('q', '85');
    url.searchParams.set('w', '800');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    return url.toString();
  })();

  // Memoize event handlers
  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError(true);
  }, []);

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div 
          className="absolute inset-0 bg-center bg-cover blur-lg animate-pulse"
          style={{ backgroundImage: `url(${blurDataUrl})` }}
        />
      )}
      {hasError ? (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <ImageOff className="w-12 h-12 text-gray-400" />
        </div>
      ) : (
        <img
          src={optimizedSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchpriority={priority ? 'high' : 'auto'}
          className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  );
}