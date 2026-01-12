'use server'

/**
 * Performs a HEAD request to check if the url exists.
 *
 * @param {string} url target url.
 */
export async function urlExists(url: string): Promise<boolean> {
  const response = await fetch(url, { method: "HEAD" });
  return response.ok;
}