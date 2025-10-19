import * as lzutf8 from "lzutf8";

/**
 * makeQbjsUrl makes a QBJS URL.
 */
export function makeQbjsUrl(
  code: string,
  mode?: "play" | "auto",
): URL {
  const url = new URL("https://qbjs.org");
  const compressedCode = lzutf8.compress(code);
  url.searchParams.set("code", compressedCode);
  if (mode) {
    url.searchParams.set("mode", mode);
  }

  return url;
}
