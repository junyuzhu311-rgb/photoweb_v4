import api from './request';
import { mockApi } from '../mock/data';

export interface Photo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  takenAt: string;
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: number;
  description: string;
}

export interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  photoCount: number;
}

const useMock = !import.meta.env.VITE_API_BASE_URL;

export async function getPhotos(params?: { city?: string; sort?: 'newest' | 'oldest' }): Promise<Photo[]> {
  if (useMock) return mockApi.getPhotos(params);
  const res = await api.get<Photo[]>('/photos', { params });
  return res.data;
}

export async function getPhotoById(id: string): Promise<Photo | undefined> {
  if (useMock) return mockApi.getPhotoById(id);
  const res = await api.get<Photo>(`/photos/${id}`);
  return res.data;
}

export async function getCities(): Promise<City[]> {
  if (useMock) return mockApi.getCities();
  const res = await api.get<City[]>('/cities');
  return res.data;
}

export async function getPhotosByCity(cityName: string): Promise<Photo[]> {
  if (useMock) return mockApi.getPhotosByCity(cityName);
  const res = await api.get<Photo[]>(`/photos/city/${cityName}`);
  return res.data;
}

export async function getFeaturedPhotos(): Promise<Photo[]> {
  if (useMock) return mockApi.getFeaturedPhotos();
  const res = await api.get<Photo[]>('/photos/featured');
  return res.data;
}
