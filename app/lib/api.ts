import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

let categoriesCache: string[] | null = null;
let categoriesInFlight: Promise<string[]> | null = null;

export type SongListItem = {
  _id: string;
  title: string;
  category?: string;
};

export type SongLine = {
  lyric?: string;
  notes?: string;
};

export type SongSection = {
  title?: string;
  lines?: SongLine[];
};

export type SongDetailData = {
  _id?: string;
  title?: string;
  category?: string;
  audioUrl?: string;
  sections?: SongSection[];
};

export type GetSongsParams = {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
};

export type GetSongsResponse = {
  items: SongListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateSongLineInput = {
  lyric: string;
  notes: string;
};

export type CreateSongSectionInput = {
  title: string;
  lines: CreateSongLineInput[];
};

export type CreateSongInput = {
  title: string;
  category: string;
  sections: CreateSongSectionInput[];
  audioUrl?: string;
  images?: string[];
};

export type NormalizeSongInput = {
  rawText: string;
  title?: string;
  category?: string;
  audioUrl?: string;
};

export type NormalizeSongResponse = {
  payload: CreateSongInput;
  meta?: {
    sectionsCount?: number;
    linesCount?: number;
  };
};

export const getSongs = async (params?: GetSongsParams) => {
  const res = await API.get<GetSongsResponse>("/songs", { params });
  return res.data;
};

export const getSongCategories = async (forceRefresh = false) => {
  if (!forceRefresh && categoriesCache) {
    return categoriesCache;
  }

  if (!forceRefresh && categoriesInFlight) {
    return categoriesInFlight;
  }

  categoriesInFlight = API.get<string[]>("/songs/categories")
    .then((res) => {
      categoriesCache = Array.isArray(res.data) ? res.data : [];
      return categoriesCache;
    })
    .finally(() => {
      categoriesInFlight = null;
    });

  return categoriesInFlight;
};

export const createSong = async (payload: CreateSongInput) => {
  const res = await API.post("/songs", payload);
  return res.data;
};

export const normalizeSong = async (payload: NormalizeSongInput) => {
  const res = await API.post<NormalizeSongResponse>("/songs/normalize", payload);
  return res.data;
};

export const updateSong = async (id: string, payload: CreateSongInput) => {
  const res = await API.put(`/songs/${id}`, payload);
  return res.data;
};

export const deleteSong = async (id: string) => {
  const res = await API.delete<{ message: string }>(`/songs/${id}`);
  return res.data;
};

export const getSongById = async (id: string) => {
  const res = await API.get<SongDetailData>(`/songs/${id}`, {
    timeout: 10000,
  });
  return res.data;
};

export const uploadAudioFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post<{ audioUrl?: string }>("/songs/upload-audio", formData);

  return response.data;
};
