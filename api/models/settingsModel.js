const mongoose = require('mongoose');

// Single document holding site-wide settings edited from the admin dashboard.
const SettingsSchema = mongoose.Schema({
    key: { type: String, default: 'site', unique: true },
    socials: { type: Map, of: String, default: {} },   // platform key -> url ('' hides the link)
    adminEmails: { type: [String], default: [] },     // emails granted admin before they have an account
    revokedEmails: { type: [String], default: [] },   // ADMIN_EMAILS owners an admin removed from the website (never the first one)
    membersOverride: { type: Number, default: null },  // null = use the live count from gdg.community.dev
    importantLinks: [{
        title: { type: String, trim: true, maxlength: 80 },
        url: { type: String, trim: true, maxlength: 500 },
        category: { type: String, trim: true, maxlength: 40 },
        description: { type: String, trim: true, maxlength: 160 },
        image: { type: String, trim: true, maxlength: 1000 },
        order: { type: Number, default: 0 },
    }],
});

module.exports = mongoose.model('Settings', SettingsSchema);
