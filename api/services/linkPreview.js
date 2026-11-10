// Resolves a visual preview for a public link: Open Graph / Twitter card image,
// falling back to the page icon. Fetches are short, capped, and refuse private hosts.
const axios = require('axios');
const dns = require('dns').promises;
const net = require('net');

const UA = 'Mozilla/5.0 (compatible; GDGOnCampusBIT/1.0; +https://gdgocbit.com)';
const TIMEOUT = 6000;
const MAX_BYTES = 700 * 1024;
const MAX_HOPS = 4;

const cache = new Map();
const TTL = 60 * 60 * 1000;
const MAX_CACHE = 400;

const PRIVATE_V4 = [
    /^0\./, /^10\./, /^127\./, /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
    /^192\.0\.0\./, /^192\.0\.2\./, /^198\.(18|19)\./, /^198\.51\.100\./, /^203\.0\.113\./,
    /^22[4-9]\./, /^23\d\./, /^24\d\./, /^25[0-5]\./,
];

const isPrivateV4 = (ip) => PRIVATE_V4.some((re) => re.test(ip));
const isPrivateV6 = (ip) => {
    const v = ip.toLowerCase();
    if (v === '::' || v === '::1') return true;
    if (/^f[cd][0-9a-f]{2}:/.test(v)) return true;     // fc00::/7
    if (/^fe[89ab][0-9a-f]:/.test(v)) return true;     // fe80::/10
    if (v.startsWith('::ffff:')) return isPrivateV4(v.slice(7));
    return false;
};
const isPrivateIp = (ip) => (net.isIP(ip) === 6 ? isPrivateV6(ip) : isPrivateV4(ip));

// Returns a safe URL object, or null when the target is not a public http(s) page.
const assertPublicUrl = async (raw) => {
    let url;
    try { url = new URL(raw); } catch { return null; }
    if (!/^https?:$/.test(url.protocol)) return null;
    if (url.port) return null; // only default 80/443 — no internal services
    const host = url.hostname.replace(/^\[|\]$/g, '');
    if (!host || /^(localhost|.*\.local|.*\.internal|.*\.home\.arpa)$/i.test(host)) return null;
    if (net.isIP(host)) return isPrivateIp(host) ? null : url;
    const records = await dns.lookup(host, { all: true }).catch(() => []);
    if (!records.length || records.some((r) => isPrivateIp(r.address))) return null;
    return url;
};

const decode = (value) => String(value || '')
    .replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"').replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/\s+/g, ' ').trim();

const attr = (tag, name) => {
    const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i');
    const match = tag.match(re);
    return match ? decode(match[2] ?? match[3] ?? match[4] ?? '') : '';
};

const absolutize = (href, base) => {
    if (!href) return '';
    try {
        const url = new URL(href, base);
        return /^https?:$/.test(url.protocol) ? url.toString() : '';
    } catch { return ''; }
};

const metaMap = (html) => {
    const map = new Map();
    for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
        const key = (attr(tag, 'property') || attr(tag, 'name')).toLowerCase();
        const content = attr(tag, 'content');
        if (key && content && !map.has(key)) map.set(key, content);
    }
    return map;
};

const linkHref = (html, rel) => {
    for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
        const value = attr(tag, 'rel').toLowerCase();
        if (value.split(/\s+/).includes(rel)) {
            const href = attr(tag, 'href');
            if (href) return href;
        }
    }
    return '';
};

const fetchHtml = async (start) => {
    let target = start;
    for (let hop = 0; hop < MAX_HOPS; hop++) {
        const safe = await assertPublicUrl(target);
        if (!safe) return null;
        const res = await axios.get(safe.toString(), {
            timeout: TIMEOUT,
            maxRedirects: 0,
            maxContentLength: MAX_BYTES,
            responseType: 'text',
            validateStatus: (status) => status >= 200 && status < 400,
            headers: {
                'User-Agent': UA,
                Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
                'Accept-Language': 'en-US,en;q=0.8',
            },
        });
        if (res.status >= 300) {
            const location = res.headers?.location;
            if (!location) return null;
            try { target = new URL(location, safe).toString(); } catch { return null; }
            continue;
        }
        if (!/text\/html|application\/xhtml/i.test(String(res.headers?.['content-type'] || ''))) return null;
        return { html: String(res.data || '').slice(0, MAX_BYTES), url: safe.toString() };
    }
    return null;
};

const scrape = async (start) => {
    const page = await fetchHtml(start);
    if (!page) return null;
    const metas = metaMap(page.html);
    const pick = (...keys) => {
        for (const key of keys) {
            const value = metas.get(key);
            if (value) return value;
        }
        return '';
    };
    const titleTag = decode((page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);

    const image = absolutize(
        pick('og:image:secure_url', 'og:image:url', 'og:image', 'twitter:image', 'twitter:image:src')
        || linkHref(page.html, 'image_src'),
        page.url,
    ).replace(/^http:/i, 'https:'); // mixed content would be blocked on our https pages
    const favicon = absolutize(linkHref(page.html, 'icon') || linkHref(page.html, 'apple-touch-icon'), page.url);

    return {
        url: page.url,
        image,
        favicon,
        title: (pick('og:title', 'twitter:title') || titleTag).slice(0, 120),
        description: pick('og:description', 'twitter:description', 'description').slice(0, 200),
        site: pick('og:site_name') || new URL(page.url).hostname.replace(/^www\./, ''),
    };
};

/** Preview metadata for a link, cached for an hour. Returns null when the page cannot be read. */
const resolvePreview = async (rawUrl) => {
    let key;
    try {
        const url = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
        if (!/^https?:$/.test(url.protocol)) return null;
        key = url.toString();
    } catch { return null; }

    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL) return hit.value;

    const value = await scrape(key).catch(() => null);
    if (!value) return null; // failures are not cached, so a retry works
    if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value);
    cache.set(key, { at: Date.now(), value });
    return value;
};

module.exports = { resolvePreview };
