export default function HeroSliderSkeleton() {
  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gray-300 animate-pulse">
      <div className="h-full flex items-center px-8 md:px-16">
        <div className="max-w-3xl w-full space-y-4">
          {/* Badge */}
          <div className="w-40 h-8 bg-gray-400 rounded-full"></div>
          
          {/* Title */}
          <div className="space-y-3">
            <div className="w-3/4 h-12 bg-gray-400 rounded"></div>
            <div className="w-1/2 h-12 bg-gray-400 rounded"></div>
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <div className="w-full h-6 bg-gray-400 rounded"></div>
            <div className="w-2/3 h-6 bg-gray-400 rounded"></div>
          </div>
          
          {/* Button */}
          <div className="w-48 h-12 bg-gray-400 rounded-lg"></div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
        ))}
      </div>
    </div>
  )
}

