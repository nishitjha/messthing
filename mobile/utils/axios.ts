import axios from "axios";

const instance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL
    : "http://172.17.35.19:8080",
  withCredentials: true
});

export default instance;
