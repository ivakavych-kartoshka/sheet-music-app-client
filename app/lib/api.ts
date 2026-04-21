import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
});

export type SongListItem = {
  _id: string;
  title: string;
  category?: string;
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

export const getSongs = async (params?: GetSongsParams) => {
  const res = await API.get<GetSongsResponse>("/songs", { params });
  return res.data;
};

export const getSongCategories = async () => {
  const res = await API.get<string[]>("/songs/categories");
  return res.data;
};
