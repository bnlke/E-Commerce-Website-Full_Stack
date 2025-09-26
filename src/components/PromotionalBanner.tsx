import { useState, useEffect } from 'react';

const promotions = [
  {
    id: 1,
    message: "Free shipping on orders over €50 (EU only). Free returns.",
    icon: "🚚",
    animation: "animate-slide-left"
  },
  {
    id: 2,
    message: "New Summer Collection - Shop Now!",
    icon: "☀️",
    animation: "animate-spin-slow"
  },
  {
    id: 3,
    message: "Get 10% off your first order with code WELCOME10",
    icon: "🎉",
    animation: "animate-bounce"
  }
];

export default function PromotionalBanner() {
  const [currentPromo, setCurrentPromo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promotions.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 text-white overflow-hidden h-10">
      <div className="container mx-auto relative h-full">
        <div className="absolute inset-0 flex items-center justify-center">
          {promotions.map((promo, index) => (
            <div
              key={promo.id}
              className={`absolute w-full text-center transition-all duration-500 flex items-center justify-center space-x-2
                ${index === currentPromo 
                  ? 'translate-y-0 opacity-100' 
                  : 'translate-y-10 opacity-0'}`}
            >
              <span className={`text-lg ${promo.animation}`}>{promo.icon}</span>
              <span className="font-medium tracking-wide">{promo.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}