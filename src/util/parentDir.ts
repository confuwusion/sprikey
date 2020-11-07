export function parentDir(path: string): string {
  const directories: string[] = path.split(`/`);

  return directories[directories.length - 1] || `home`;
}
