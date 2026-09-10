import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let categoriesCache: string[] | null = null;
let categoriesInFlight: Promise<string[]> | null = null;

export type UserProfile = {
  _id: string;
  googleId?: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  createdAt?: string;
};

export type SongListItem = {
  _id: string;
  title: string;
  slug: string;
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
  slug?: string;
  category?: string;
  audioUrl?: string;
  sheetUrl?: string;
  sheetUrls?: string[];
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
  sheetUrl?: string;
  sheetUrls?: string[];
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

export const getSongBySlug = async (slug: string) => {
  const res = await API.get<SongDetailData>(`/songs/slug/${slug}`, {
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

export const uploadSheetFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await API.post<{ sheetUrl?: string }>("/songs/upload-sheet", formData);

  return response.data;
};

export const uploadSheetFiles = async (files: File[]) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const response = await API.post<{ sheetUrls?: string[] }>("/songs/upload-sheets", formData);

  return response.data;
};

// ===== USER & AUTH =====

export const login = async (email: string, password: string) => {
  const res = await API.post<{
    access_token: string;
    user?: UserProfile;
  }>("/auth/login", { email, password });
  return res.data;
};

export const setPassword = async (password: string) => {
  const res = await API.post<{ success: boolean }>("/auth/set-password", {
    password,
  });
  return res.data;
};

export const getMe = async () => {
  const res = await API.get<UserProfile>("/users/me");
  return res.data;
};

export const getFavoriteIds = async () => {
  const res = await API.get<{ songIds: string[] }>("/users/favorites/ids");
  return res.data.songIds;
};

export const getFavorites = async () => {
  const res = await API.get<SongListItem[]>("/users/favorites");
  return res.data;
};

export const addFavorite = async (songId: string) => {
  const res = await API.post(`/users/favorites/${songId}`);
  return res.data;
};

export const removeFavorite = async (songId: string) => {
  const res = await API.delete(`/users/favorites/${songId}`);
  return res.data;
};

export const checkFavorite = async (songId: string) => {
  const res = await API.get<{ isFavorite: boolean }>(`/users/favorites/check/${songId}`);
  return res.data.isFavorite;
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("access_token");
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getStoredUser = (): UserProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user_info");
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
};

export const saveUserSession = (token: string, user?: Partial<UserProfile>) => {
  localStorage.setItem("access_token", token);
  if (user) {
    localStorage.setItem("user_info", JSON.stringify(user));
  }
};

export const clearUserSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user_info");
};
