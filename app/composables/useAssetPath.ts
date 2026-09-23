export function useAssetPath() {
  const baseURL = useRuntimeConfig().app.baseURL;
  return (path: string) =>
    `${baseURL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
