export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${String(bytes)} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}
