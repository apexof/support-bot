import axios from "axios";
import { env } from "@/shared/config";

const client = axios.create({
  baseURL: env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

export default client;
