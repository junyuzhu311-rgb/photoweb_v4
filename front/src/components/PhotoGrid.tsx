import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LazyLoad from 'react-lazyload';
import { slideUp, staggerContainer } from '../utils/animation';
import Skeleton from './Skeleton';
import type { Photo } from '../api/photo';

interface PhotoGridProps {
  photos: Photo[];
  cols?: 3 | 4;
}

export default function PhotoGrid({ photos, cols = 3 }: PhotoGridProps) {
  const gridCols = cols === 4 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <motion.div
      className={`grid ${gridCols} gap-4`}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {photos.map((photo) => (
        <motion.div key={photo.id} variants={slideUp} className="group">
          <Link to={`/photo/${photo.id}`} className="block overflow-hidden rounded-lg relative">
            <LazyLoad
              height={300}
              offset={200}
              placeholder={<Skeleton className="w-full aspect-[3/2]" />}
            >
              <motion.img
                src={photo.thumbnailUrl}
                alt={photo.title}
                className="w-full aspect-[3/2] object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
            </LazyLoad>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
              <div className="p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full backdrop-blur-sm bg-black/30">
                <h3 className="text-white font-medium text-sm">{photo.title}</h3>
                <p className="text-gray-300 text-xs mt-1">{photo.city}, {photo.country}</p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
