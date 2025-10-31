import * as lzutf8 from "lzutf8";

/**
 * makeQbjsUrl makes a QBJS URL.
 *
 * @see
 * https://github.com/boxgaming/qbjs/blob/814bee8d7579d77029b85f37cd2c64d6c60983b7/qbjs-ide.js#L469
 */
export function makeQbjsUrl(
  code: string,
  mode?: "play" | "auto",
): URL {
  const url = new URL("https://qbjs.org");
  const compressedCode = lzutf8.compress(code, { outputEncoding: "Base64" });

  let hash = "code=" + compressedCode;
  if (mode) {
    hash = "mode=" + mode + "&" + hash;
  }
  url.hash = hash;

  console.log({ url, code, compressedCode });
  return url;
}
