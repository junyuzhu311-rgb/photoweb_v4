import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { getFeaturedPhotos, getCities } from '../api/photo';
import type { Photo, City } from '../api/photo';
import ParallaxHero from '../components/ParallaxHero';
import PhotoGrid from '../components/PhotoGrid';
import CityScroller from '../components/CityScroller';
import Footer from '../components/Footer';
import Skeleton from '../components/Skeleton';
import { slideUp } from '../utils/animation';

export default function HomePage() {
  const [heroPhoto, setHeroPhoto] = useState<Photo | null>(null);
  const [featured, setFeatured] = useState<Photo[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFeaturedPhotos(), getCities()]).then(([photos, cityData]) => {
      const hero = photos[Math.floor(Math.random() * photos.length)];
      setHeroPhoto(hero);
      setFeatured(photos.filter((p) => p.id !== hero.id));
      setCities(cityData);
      setLoading(false);
    });
  }, []);

  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
    [cities],
  );

  if (loading || !heroPhoto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-full h-screen" />
      </div>
    );
  }

  return (
    <main>
      <ParallaxHero photo={heroPhoto} />

      <motion.section
        className="max-w-7xl mx-auto px-6 py-20"
        variants={slideUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
      >
        <h2 className="text-white text-2xl font-light mb-8 tracking-wide">精选作品</h2>
        <PhotoGrid photos={featured} cols={3} />
      </motion.section>

      <motion.section
        className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-800/50"
        variants={slideUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <h2 className="text-white text-2xl font-light mb-8 tracking-wide">探索城市</h2>
        <CityScroller cities={sortedCities} />
      </motion.section>

      <Footer />
    </main>
  );
}
