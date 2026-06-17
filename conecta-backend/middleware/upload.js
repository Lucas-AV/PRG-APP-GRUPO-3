const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Garante que a pasta uploads/ existe
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const hash = crypto.randomBytes(8).toString('hex');
    const stamp = Date.now();
    cb(null, `${stamp}-${hash}${ext}`);
  },
});

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIMES.has(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não suportado (use JPEG, PNG, WEBP ou GIF)'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Helper que retorna a URL absoluta do arquivo enviado
function fileUrl(req, filename) {
  const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/uploads/${filename}`;
}

// Helper para apagar um arquivo a partir da URL (ignora se já não existe)
function deleteByUrl(url) {
  if (!url) return;
  const filename = path.basename(url);
  const filepath = path.join(UPLOADS_DIR, filename);
  fs.promises.unlink(filepath).catch(() => {});
}

module.exports = { upload, fileUrl, deleteByUrl, UPLOADS_DIR };
