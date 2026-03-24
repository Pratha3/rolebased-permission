import Cookies from "js-cookie";

const TOKEN_KEY = "auth_token";
const COOKIE_CONFIG = {
  expires: 7,

  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};
export const setAuthToken = (token: string): void => {
  Cookies.set(TOKEN_KEY, token, COOKIE_CONFIG);
};
export const getAuthToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};
export const removeAuthToken = (): void => {
  Cookies.remove(TOKEN_KEY);
};
export const hasAuthToken = (): boolean => {
  return !!Cookies.get(TOKEN_KEY);
};
