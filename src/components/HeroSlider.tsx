import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlider() {
  // Memoize slides to prevent unnecessary re-renders
  const slides = useMemo(() => [
    {
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&q=80&w=1920',
      title: 'Step into Comfort',
      subtitle: 'Discover our collection of sustainable and comfortable footwear',
      link: '/collections/comfort'
    },
    {
      image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&q=80&w=1920',
      title: 'Summer Collection',
      subtitle: 'Light and breathable shoes for your active lifestyle',
      link: '/collections/summer'
    },
    {
      image: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?auto=format&q=80&w=1920',
      title: 'Eco-Friendly Materials',
      subtitle: 'Sustainable fashion for a better tomorrow',
      link: '/collections/sustainable'
    }
  ], []);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const intervalRef = useRef<NodeJS.Timeout>();

  // Memoize slide navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setDragDistance(0);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setDragDistance(0);
  }, [slides.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.pageX);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleDragEnd();
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    const threshold = window.innerWidth * 0.2;
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    } else {
      setDragDistance(0);
    }
  }, [dragDistance, nextSlide, prevSlide]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.pageX;
    const distance = currentX - dragStartX;
    setDragDistance(distance);
  }, [isDragging, dragStartX]);

  useEffect(() => {
    // Clear previous interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (!isDragging) {
      intervalRef.current = setInterval(nextSlide, 5000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDragging, nextSlide]);

  return (
    <div className="relative h-screen overflow-hidden"
         ref={sliderRef}
         onMouseDown={handleMouseDown}
         onMouseUp={handleDragEnd}
         onMouseLeave={handleMouseLeave}
         onMouseMove={handleMouseMove}
         style={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
      <div 
        className={`absolute inset-0 flex ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
        style={{ 
          transform: `translateX(calc(-${currentSlide * 100}% + ${dragDistance}px))`
        }}>
        {slides.map((slide, index) => (
          <div key={index} className="min-w-full h-full relative">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchpriority={index === 0 ? 'high' : 'auto'}
              decoding={index === 0 ? 'sync' : 'async'}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
              <div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
                <a 
                  href={slide.link}
                  className="inline-block bg-white text-black px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 text-black p-2 rounded-full hover:bg-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 text-black p-2 rounded-full hover:bg-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentSlide === index ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}