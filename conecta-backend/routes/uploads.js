const express = require('express');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');
const { upload, fileUrl, deleteByUrl } = require('../middleware/upload');

const router = express.Router();

router.use(authMiddleware);

// Wrapper que captura erros do multer (tipo de arquivo, tamanho, etc.)
function uploadSingle(field) {
  return (req, res, next) => {
    upload.single(field)(req, res, (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: `Arquivo "${field}" não enviado` });
      next();
    });
  };
}

/**
 * @swagger
 * /uploads/avatar:
 *   post:
 *     summary: Faz upload do avatar do usuário autenticado
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar atualizado, retorna a URL
 */
router.post('/avatar', uploadSingle('file'), (req, res) => {
  const url = fileUrl(req, req.file.filename);

  const previous = db.prepare('SELECT avatar_url FROM users WHERE id = ?').get(req.user.id);
  if (previous?.avatar_url) deleteByUrl(previous.avatar_url);

  db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(url, req.user.id);
  return res.json({ avatar_url: url });
});

/**
 * @swagger
 * /uploads/avatar:
 *   delete:
 *     summary: Remove o avatar do usuário autenticado
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar removido
 */
router.delete('/avatar', (req, res) => {
  const previous = db.prepare('SELECT avatar_url FROM users WHERE id = ?').get(req.user.id);
  if (previous?.avatar_url) deleteByUrl(previous.avatar_url);

  db.prepare('UPDATE users SET avatar_url = NULL WHERE id = ?').run(req.user.id);
  return res.json({ message: 'Avatar removido' });
});

/**
 * @swagger
 * /uploads/services/{serviceId}/images:
 *   get:
 *     summary: Lista as imagens de um serviço
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de imagens
 *       404:
 *         description: Serviço não encontrado
 */
router.get('/services/:serviceId/images', (req, res) => {
  const service = db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.serviceId);
  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });

  const images = db
    .prepare('SELECT * FROM service_images WHERE service_id = ? ORDER BY created_at')
    .all(req.params.serviceId);
  return res.json(images);
});

/**
 * @swagger
 * /uploads/services/{serviceId}/images:
 *   post:
 *     summary: Adiciona uma imagem a um serviço (somente o dono)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagem adicionada
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Serviço não encontrado
 */
router.post('/services/:serviceId/images', uploadSingle('file'), (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.serviceId);
  if (!service) {
    deleteByUrl(fileUrl(req, req.file.filename));
    return res.status(404).json({ error: 'Serviço não encontrado' });
  }
  if (service.user_id !== req.user.id) {
    deleteByUrl(fileUrl(req, req.file.filename));
    return res.status(403).json({ error: 'Acesso negado' });
  }

  const url = fileUrl(req, req.file.filename);
  const result = db
    .prepare('INSERT INTO service_images (service_id, url) VALUES (?, ?)')
    .run(req.params.serviceId, url);

  const image = db.prepare('SELECT * FROM service_images WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(image);
});

/**
 * @swagger
 * /uploads/services/{serviceId}/images/{imageId}:
 *   delete:
 *     summary: Remove uma imagem de um serviço (somente o dono)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Imagem removida
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Imagem ou serviço não encontrado
 */
router.delete('/services/:serviceId/images/:imageId', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.serviceId);
  if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });
  if (service.user_id !== req.user.id) return res.status(403).json({ error: 'Acesso negado' });

  const image = db
    .prepare('SELECT * FROM service_images WHERE id = ? AND service_id = ?')
    .get(req.params.imageId, req.params.serviceId);
  if (!image) return res.status(404).json({ error: 'Imagem não encontrada' });

  deleteByUrl(image.url);
  db.prepare('DELETE FROM service_images WHERE id = ?').run(req.params.imageId);
  return res.json({ message: 'Imagem removida' });
});

/**
 * @swagger
 * /uploads/documents:
 *   get:
 *     summary: Lista documentos de verificação do usuário autenticado
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos
 */
router.get('/documents', (req, res) => {
  const docs = db
    .prepare('SELECT type, url, created_at FROM provider_documents WHERE user_id = ?')
    .all(req.user.id);
  return res.json(docs);
});

/**
 * @swagger
 * /uploads/documents/{type}:
 *   post:
 *     summary: Envia ou substitui um documento de verificação
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documento enviado
 */
router.post('/documents/:type', uploadSingle('file'), (req, res) => {
  const { type } = req.params;
  const url = fileUrl(req, req.file.filename);

  const existing = db
    .prepare('SELECT url FROM provider_documents WHERE user_id = ? AND type = ?')
    .get(req.user.id, type);
  if (existing?.url) deleteByUrl(existing.url);

  db.prepare(
    'INSERT INTO provider_documents (user_id, type, url) VALUES (?, ?, ?) ON CONFLICT(user_id, type) DO UPDATE SET url = excluded.url, created_at = CURRENT_TIMESTAMP'
  ).run(req.user.id, type, url);

  return res.json({ type, url });
});

/**
 * @swagger
 * /uploads/documents/{type}:
 *   delete:
 *     summary: Remove um documento de verificação
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documento removido
 *       404:
 *         description: Documento não encontrado
 */
router.delete('/documents/:type', (req, res) => {
  const { type } = req.params;
  const existing = db
    .prepare('SELECT url FROM provider_documents WHERE user_id = ? AND type = ?')
    .get(req.user.id, type);
  if (!existing) return res.status(404).json({ error: 'Documento não encontrado' });

  deleteByUrl(existing.url);
  db.prepare('DELETE FROM provider_documents WHERE user_id = ? AND type = ?').run(req.user.id, type);
  return res.json({ message: 'Documento removido' });
});

module.exports = router;
