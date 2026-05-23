import { useState } from 'react';
import { motion } from 'framer-motion';

interface ImageWithZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageWithZoom({ src, alt, className = '' }: ImageWithZoomProps) {
  const [zoomed, setZoomed] = useState(false);

  return (
    <>
      <motion.img
        src={src}
        alt={alt}
        className={`cursor-zoom-in ${className}`}
        onClick={() => setZoomed(true)}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.3 }}
      />

      {zoomed && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center cursor-zoom-out"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setZoomed(false)}
        >
          <motion.img
            src={src}
            alt={alt}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </>
  );
}
