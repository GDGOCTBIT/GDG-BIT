/** Hostname without `www.`, used as the small line under a link card title. */
export const linkHost = url => {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, '')
  } catch { return '' }
}
