export function isFormatOk(repository: string): boolean {
  return /^[\w-]+\/[\w-]+$/.test(repository);
}
