import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
});

export const getSongs = async () => {
  const res = await API.get("/songs");
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
  return res.data;
};
