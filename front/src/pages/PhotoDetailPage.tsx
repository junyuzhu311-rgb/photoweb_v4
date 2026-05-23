import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPhotoById, getPhotosByCity } from '../api/photo';
import type { Photo } from '../api/photo';
import ImageWithZoom from '../components/ImageWithZoom';
import PhotoGrid from '../components/PhotoGrid';
import Skeleton from '../components/Skeleton';
import { slideUp } from '../utils/animation';

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [related, setRelated] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPhotoById(id).then((data) => {
      if (data) {
        setPhoto(data);
        getPhotosByCity(data.city).then((cityPhotos) => {
          setRelated(cityPhotos.filter((p) => p.id !== data.id).slice(0, 3));
        });
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-6 flex items-center justify-center">
        <Skeleton className="w-full max-w-4xl h-[70vh]" />
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="min-h-screen pt-20 px-6 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400">照片未找到</p>
        <button onClick={() => navigate('/')} className="btn-base rounded-lg text-sm">
          返回首页
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-20">
      {/* Back button */}
      <div className="max-w-4xl mx-auto px-6 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-base rounded-lg text-sm backdrop-blur-md bg-dark/40"
        >
          &larr; 返回
        </button>
      </div>

      {/* Full photo */}
      <motion.div
        className="max-w-4xl mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ImageWithZoom
          src={photo.url}
          alt={photo.title}
          className="w-full rounded-lg object-cover max-h-[70vh]"
        />
      </motion.div>

      {/* Metadata */}
      <motion.div
        className="max-w-4xl mx-auto px-6 mt-8"
        variants={slideUp}
        initial="hidden"
        animate="visible"
      >
        <div className="card-base p-6">
          <h1 className="text-white text-xl font-light mb-1">{photo.title}</h1>
          <p className="text-gray-400 text-sm mb-6">{photo.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 text-xs">拍摄地点</span>
              <p className="text-gray-200">{photo.city}, {photo.country}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">拍摄时间</span>
              <p className="text-gray-200">{photo.takenAt}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">相机</span>
              <p className="text-gray-200">{photo.camera}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">镜头</span>
              <p className="text-gray-200">{photo.lens}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">光圈</span>
              <p className="text-gray-200">{photo.aperture}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">快门</span>
              <p className="text-gray-200">{photo.shutter}</p>
            </div>
            <div>
              <span className="text-gray-500 text-xs">ISO</span>
              <p className="text-gray-200">{photo.iso}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Related photos */}
      {related.length > 0 && (
        <motion.section
          className="max-w-7xl mx-auto px-6 mt-16"
          variants={slideUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-white text-lg font-light mb-6">
            同城市推荐
            <span className="text-gray-500 text-sm ml-2">{photo.city}</span>
          </h2>
          <PhotoGrid photos={related} cols={3} />
        </motion.section>
      )}
    </main>
  );
}
