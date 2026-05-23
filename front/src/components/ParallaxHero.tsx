import { motion, useScroll, useTransform } from 'framer-motion';
import type { Photo } from '../api/photo';

interface ParallaxHeroProps {
  photo: Photo;
}

export default function ParallaxHero({ photo }: ParallaxHeroProps) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -150], { clamp: false });
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{ y }}
      >
        <motion.img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover"
          style={{ opacity }}
        />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <motion.div
        className="absolute bottom-10 left-0 right-0 text-center z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="inline-block backdrop-blur-md bg-dark/40 rounded-lg px-8 py-4">
          <h1 className="text-white text-3xl md:text-5xl font-light tracking-wide">
            PHOTOGRAPHER
          </h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base font-light max-w-md">
            {photo.description}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {photo.city}, {photo.country}
          </p>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-gray-500 text-2xl">&darr;</span>
      </motion.div>
    </section>
  );
}
