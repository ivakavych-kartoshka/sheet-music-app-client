import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://sheet-music-app-npoe.onrender.com",
});

export const getSongs = async () => {
  const res = await API.get("/songs");
  return res.data;
};
