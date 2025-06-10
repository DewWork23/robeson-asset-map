export function getBasePath() {
  return process.env.NODE_ENV === 'production' ? '/robeson-asset-map' : '';
}

export function withBasePath(path: string) {
  const basePath = getBasePath();
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}