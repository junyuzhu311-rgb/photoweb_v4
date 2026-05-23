import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { City } from '../api/photo';

interface CityScrollerProps {
  cities: City[];
}

export default function CityScroller({ cities }: CityScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-6 py-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {cities.map((city) => (
          <Link
            key={city.name}
            to={`/portfolio?city=${encodeURIComponent(city.name)}`}
          >
            <motion.div
              className="card-base px-6 py-3 whitespace-nowrap cursor-pointer flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-gray-200 font-normal text-sm">{city.name}</span>
              <span className="text-gray-500 text-xs ml-2">{city.photoCount} 张</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
