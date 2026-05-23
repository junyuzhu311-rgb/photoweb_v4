import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { getCities, getPhotos, getPhotosByCity } from '../api/photo';
import type { City, Photo } from '../api/photo';
import PhotoGrid from '../components/PhotoGrid';
import Skeleton from '../components/Skeleton';
function FitBounds({ cities }: { cities: City[] }) {
  const map = useMap();
  useEffect(() => {
    if (cities.length > 0) {
      const bounds = cities.map((c) => [c.latitude, c.longitude] as [number, number]);
      if (bounds.length === 1) {
        map.setView(bounds[0], 10);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [cities, map]);
  return null;
}

function CitySidebar({
  cities,
  selectedCity,
  onSelect,
}: {
  cities: City[];
  selectedCity: string | null;
  onSelect: (name: string) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, City[]>();
    cities.forEach((c) => {
      const arr = map.get(c.country) || [];
      arr.push(c);
      map.set(c.country, arr);
    });
    return Array.from(map.entries());
  }, [cities]);

  return (
    <nav className="space-y-4">
      <h3 className="text-white font-medium text-sm tracking-wide mb-4">城市列表</h3>
      {grouped.map(([country, cityList]) => (
        <div key={country}>
          <h4 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">
            {country}
          </h4>
          {cityList.map((city) => (
            <button
              key={city.name}
              onClick={() => onSelect(city.name)}
              className={`block w-full text-left px-3 py-2 text-sm transition-all duration-300 rounded-lg ${
                selectedCity === city.name
                  ? 'text-white bg-white/5'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {city.name}
              <span className="text-gray-600 text-xs ml-2">({city.photoCount})</span>
            </button>
          ))}
        </div>
      ))}
    </nav>
  );
}

type ViewMode = 'map' | 'list';

export default function PortfolioPage() {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city');

  const [viewMode, setViewMode] = useState<ViewMode>(cityParam ? 'list' : 'map');
  const [cities, setCities] = useState<City[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(cityParam);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCities().then((data) => {
      setCities(data);
      if (cityParam) {
        setSelectedCity(cityParam);
        getPhotosByCity(cityParam).then(setPhotos);
      } else {
        getPhotos().then(setPhotos);
      }
      setLoading(false);
    });
  }, [cityParam]);

  const handleCityClick = (cityName: string) => {
    setSelectedCity(cityName);
    getPhotosByCity(cityName).then(setPhotos);
  };

  const handleSortChange = (s: 'newest' | 'oldest') => {
    setSort(s);
    const params = selectedCity ? { city: selectedCity, sort: s } : { sort: s };
    getPhotos(params).then(setPhotos);
  };

  const sortedCities = useMemo(
    () => [...cities].sort((a, b) => a.name.localeCompare(b.name)),
    [cities],
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-6">
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20">
      {/* View toggle */}
      <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center justify-between">
        <div className="flex gap-1 bg-dark/40 rounded-lg p-1 backdrop-blur-sm">
          {(['map', 'list'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-md text-sm transition-all duration-300 ${
                viewMode === mode ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {mode === 'map' ? '地图视图' : '列表视图'}
            </button>
          ))}
        </div>

        {viewMode === 'list' && (
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
            className="bg-dark/40 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-gray-600"
          >
            <option value="newest">最新</option>
            <option value="oldest">最早</option>
          </select>
        )}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-6"
          >
            <div className="max-w-7xl mx-auto">
              <div className="h-[60vh] rounded-lg overflow-hidden border border-gray-800/50">
                <MapContainer
                  center={[35, 40]}
                  zoom={3}
                  className="w-full h-full"
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <FitBounds cities={sortedCities} />
                  {sortedCities.map((city) => (
                    <CircleMarker
                      key={city.name}
                      center={[city.latitude, city.longitude]}
                      radius={Math.max(6, city.photoCount * 2)}
                      pathOptions={{
                        fillColor: '#ffffff',
                        fillOpacity: 0.3,
                        color: '#d4d4d4',
                        weight: 1,
                      }}
                      eventHandlers={{
                        click: () => handleCityClick(city.name),
                        mouseover: (e) => {
                          e.target.setStyle({ fillOpacity: 0.6 });
                          e.target.setRadius(Math.max(8, city.photoCount * 2.5));
                        },
                        mouseout: (e) => {
                          e.target.setStyle({ fillOpacity: 0.3 });
                          e.target.setRadius(Math.max(6, city.photoCount * 2));
                        },
                      }}
                    >
                      <Popup className="!bg-dark !text-gray-200 !border-gray-700">
                        <span className="text-sm">{city.name} ({city.photoCount} 张)</span>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>

              {selectedCity && photos.length > 0 && (
                <motion.div
                  className="mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-white text-lg font-light mb-4">
                    {selectedCity} <span className="text-gray-500 text-sm">({photos.length} 张照片)</span>
                  </h3>
                  <PhotoGrid photos={photos} cols={3} />
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto px-6"
          >
            <div className="flex gap-8">
              {/* Sidebar */}
              <aside className="hidden md:block w-56 flex-shrink-0">
                <div className="sticky top-24">
                  <CitySidebar
                    cities={sortedCities}
                    selectedCity={selectedCity}
                    onSelect={handleCityClick}
                  />
                </div>
              </aside>

              {/* Mobile dropdown */}
              <div className="md:hidden w-full mb-6">
                <select
                  value={selectedCity || ''}
                  onChange={(e) => handleCityClick(e.target.value)}
                  className="w-full bg-dark/40 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-300"
                >
                  <option value="">全部城市</option>
                  {sortedCities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.photoCount})
                    </option>
                  ))}
                </select>
              </div>

              {/* Photo grid */}
              <div className="flex-1">
                {selectedCity && (
                  <h3 className="text-white text-lg font-light mb-4">
                    {selectedCity} <span className="text-gray-500 text-sm">({photos.length} 张)</span>
                  </h3>
                )}
                <PhotoGrid photos={photos} cols={4} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
