export default function Hero() {
  return (
    <div className="relative h-screen">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1549298916-b41d501d3772"
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      
      <div className="relative h-full flex items-center justify-center text-center text-white px-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Step into Comfort
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Discover our collection of sustainable and comfortable footwear
          </p>
          <button className="bg-white text-black px-8 py-3 rounded-md text-lg font-medium hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
}