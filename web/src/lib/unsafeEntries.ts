export const unsafeEntries = Object.entries as <T>(o: T) => {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
