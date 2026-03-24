import { API_BASE_URL } from "@/lib/constants";
import axios, { AxiosInstance, AxiosError } from "axios";

type ApiMethods = {
  get: <T>(endpoint: string) => Promise<T>;
  post: <T>(endpoint: string, data?: any) => Promise<T>;
  patch: <T>(endpoint: string, data?: any) => Promise<T>;
  delete: <T>(endpoint: string, data?: any) => Promise<T>;
};

export function ApiClient(
  baseURL: string,
  getToken?: () => string | null,
): ApiMethods {
  const client: AxiosInstance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  //  timeout: 15000, 
  });

  client.interceptors.request.use((config) => {
    const token = getToken ? getToken() : undefined;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method?.toLowerCase() === "get" && config.headers) {
      config.headers["Cache-Control"] = "no-store";
      config.headers["Pragma"] = "no-cache";
    }
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (err: AxiosError<{ error?: string }>) => {
      const message =
        err.response?.data?.error || err.message || "Request failed";
      return Promise.reject(new Error(message));
    },
  );

  return {
    get: async <T>(endpoint: string) => (await client.get<T>(endpoint)).data,
    post: async <T>(endpoint: string, data?: any) =>
      (await client.post<T>(endpoint, data)).data,
    patch: async <T>(endpoint: string, data?: any) =>
      (await client.patch<T>(endpoint, data)).data,
    delete: async <T>(endpoint: string, data?: any) =>
      (await client.delete<T>(endpoint, { data })).data,
  };
}
//if token is invalid or expired the new token will be fetch from the useStore file 
import { useAuthStore } from "@/store/userStore";
export const apiClient = ApiClient(
  API_BASE_URL,
  () => useAuthStore.getState().token,
);
