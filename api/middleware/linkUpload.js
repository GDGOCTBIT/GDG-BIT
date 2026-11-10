const multer = require('multer');

// Link card previews: one image, capped so a stray camera file is rejected before it reaches Cloudinary.
module.exports = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 6 * 1024 * 1024, files: 1 },
}).single('file');
