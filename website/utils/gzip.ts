import pako from 'pako';

export const gzip = (data: string): string => {
  const arr = pako.gzip(data);
  return btoa(String.fromCharCode.apply(null, Array.from(arr)));
};

export const ungzip = (data: string): string => {
  const arr = Uint8Array.from(
    atob(data)
      .split('')
      .map((x) => x.charCodeAt(0)),
  );
  const d = pako.ungzip(arr);
  return String.fromCharCode.apply(null, Array.from(d));
};
