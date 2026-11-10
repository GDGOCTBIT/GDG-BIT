const Settings = require('../models/settingsModel.js');
const { getChapterInfo } = require('../services/gdgCommunity.js');
const { serverError } = require('../utils/crudFactory.js');

// The platforms the admin can edit. `icon` points at files in client/public.
const PLATFORMS = [
    { key: 'community', label: 'GDG Community', icon: '/brand/gdg-mark-256.png', url: 'https://gdg.community.dev/gdg-on-campus-bengal-institute-of-technology-kolkata-india/' },
    { key: 'instagram', label: 'Instagram', icon: '/insta.png', url: 'https://www.instagram.com/gdgocbit' },
    { key: 'linkedin', label: 'LinkedIn', icon: '/linkedin.png', url: 'https://www.linkedin.com/company/gdgocbit' },
    { key: 'github', label: 'GitHub', icon: '/github.png', url: 'https://github.com/GDGOCBIT' },
    { key: 'discord', label: 'Discord', icon: '/discord.png', url: 'https://discord.gg/JbEsNVn5Ka' },
    { key: 'x', label: 'X', icon: '/x.png', url: 'https://x.com/gdgocbit' },
    { key: 'youtube', label: 'YouTube', icon: '/youtube.svg', url: '' },
    { key: 'email', label: 'Email', icon: '/mail.png', url: '' },
];

const load = async () => (await Settings.findOne({ key: 'site' })) || new Settings({ key: 'site' });

// Saved value wins (even an empty one, which hides the link); otherwise the default.
const resolve = (doc) => PLATFORMS.map((p) => {
    const saved = doc.socials?.get?.(p.key);
    return { key: p.key, label: p.label, icon: p.icon, url: saved !== undefined ? saved : p.url, default: p.url };
});

const members = async (doc) => {
    if (doc.membersOverride != null) return { count: doc.membersOverride, source: 'admin' };
    const info = await getChapterInfo();
    return { count: info?.members || 0, source: 'gdg' };
};

const links = (doc) => (doc.importantLinks || [])
    .filter((link) => link.title && link.url)
    .sort((a, b) => a.order - b.order)
    .map((link) => ({ _id: String(link._id), title: link.title, url: link.url, description: link.description || '', image: link.image || '' }));

// Public: only links that have a URL.
exports.publicSettings = async (req, res) => {
    try {
        const doc = await load();
        const m = await members(doc);
        res.status(200).json({ success: true, socials: resolve(doc).filter((s) => s.url).map(({ key, label, icon, url }) => ({ key, label, icon, url })), links: links(doc), members: m.count });
    } catch (e) { serverError(res, e); }
};

// Admin: everything, including empty links, so they can be filled in.
exports.adminSettings = async (req, res) => {
    try {
        const doc = await load();
        const live = (await getChapterInfo())?.members || 0;
        res.status(200).json({ success: true, socials: resolve(doc), links: links(doc), members: { override: doc.membersOverride, live } });
    } catch (e) { serverError(res, e); }
};

const cleanUrl = (u) => {
    const v = String(u || '').trim();
    if (!v) return '';
    if (/^mailto:/i.test(v)) return v;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`; // bare email address
    const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
    try { return new URL(withProto).toString().replace(/\/$/, ''); } catch { return null; }
};

exports.saveSettings = async (req, res) => {
    try {
        const doc = await load();
        if (req.body.socials && typeof req.body.socials === 'object') {
            for (const p of PLATFORMS) {
                if (req.body.socials[p.key] === undefined) continue;
                const url = cleanUrl(req.body.socials[p.key]);
                if (url === null) return res.status(400).json({ success: false, msg: `${p.label}: that doesn't look like a valid link!` });
                doc.socials.set(p.key, url);
            }
        }
        if ('membersOverride' in req.body) {
            const v = req.body.membersOverride;
            doc.membersOverride = v === '' || v === null ? null : Math.max(0, Math.round(Number(v)));
            if (Number.isNaN(doc.membersOverride)) return res.status(400).json({ success: false, msg: 'Members must be a number!' });
        }
        if (Array.isArray(req.body.links)) {
            const next = [];
            for (const [index, raw] of req.body.links.entries()) {
                const title = String(raw?.title || '').trim().slice(0, 80);
                const description = String(raw?.description || '').trim().slice(0, 160);
                const value = String(raw?.url || '').trim();
                const imageValue = String(raw?.image || '').trim();
                if (!title && !value && !description && !imageValue) continue;
                if (!title || !value) return res.status(400).json({ success: false, msg: 'Every important link needs a title and URL.' });
                const url = cleanUrl(value);
                if (!url || /^mailto:/i.test(url)) return res.status(400).json({ success: false, msg: `Important link ${index + 1}: add a valid web URL.` });
                const image = imageValue ? cleanUrl(imageValue) : '';
                if (image === null || /^mailto:/i.test(image)) return res.status(400).json({ success: false, msg: `Important link ${index + 1}: add a valid image URL.` });
                next.push({ title, url, description, image, order: index });
            }
            doc.importantLinks = next;
        }
        await doc.save();
        res.status(200).json({ success: true, msg: 'Settings saved!' });
    } catch (e) { serverError(res, e); }
};
