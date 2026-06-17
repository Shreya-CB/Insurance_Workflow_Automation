import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" }
});


/*import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Optional: Automatically add token for all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});*/
