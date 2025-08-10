
export const PREVIEW_COOKIE = "cid_preview";

export const isPreviewMode = (): boolean => {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${PREVIEW_COOKIE}=1`));
};

export const enablePreviewMode = (hours: number = 3) => {
  const expires = new Date(Date.now() + hours * 60 * 60 * 1000).toUTCString();
  document.cookie = `${PREVIEW_COOKIE}=1; path=/; expires=${expires}; SameSite=Lax`;
};

export const disablePreviewMode = () => {
  document.cookie = `${PREVIEW_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
};
