const { getRedisClient } = require('../config/redis');
const Autosave = require('../models/Autosave');
const env = require('../config/env');
const { sanitizeContentHtml, sanitizePlainText } = require('./sanitize.service');
const AppError = require('../utils/AppError');

function redisKey(documentId, editorId) {
  return `autosave:${documentId}:${editorId}`;
}

/**
 * Persist an autosave snapshot. Tries Redis first (fast, ephemeral);
 * transparently falls back to a MongoDB TTL collection if Redis is
 * disabled or unreachable, so autosave/draft-recovery keeps working
 * even without Redis provisioned.
 */
async function saveAutosave({ documentId, editorId, title, contentHtml, contentJson, clientVersion }) {
  const payload = {
    document: documentId,
    editor: editorId,
    title: sanitizePlainText(title || ''),
    contentHtml: sanitizeContentHtml(contentHtml || ''),
    contentJson: contentJson || null,
    clientVersion: clientVersion || 0,
    savedAt: new Date().toISOString(),
  };

  const redis = await getRedisClient();
  if (redis) {
    await redis.set(redisKey(documentId, editorId), JSON.stringify(payload), {
      EX: env.AUTOSAVE_TTL_SECONDS,
    });
    return { ...payload, source: 'redis' };
  }

  const saved = await Autosave.findOneAndUpdate(
    { document: documentId, editor: editorId },
    { $set: { ...payload, createdAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return { ...saved.toObject(), source: 'mongo' };
}

async function getAutosave(documentId, editorId) {
  const redis = await getRedisClient();
  if (redis) {
    const raw = await redis.get(redisKey(documentId, editorId));
    return raw ? { ...JSON.parse(raw), source: 'redis' } : null;
  }
  const doc = await Autosave.findOne({ document: documentId, editor: editorId });
  return doc ? { ...doc.toObject(), source: 'mongo' } : null;
}

async function clearAutosave(documentId, editorId) {
  const redis = await getRedisClient();
  if (redis) {
    await redis.del(redisKey(documentId, editorId));
    return;
  }
  await Autosave.deleteOne({ document: documentId, editor: editorId });
}

/**
 * Conflict detection: compares the client's known base version against
 * the document's currentRevision. If someone else saved in between,
 * the client must resolve (merge / overwrite / discard) before saving.
 */
function detectConflict(clientBaseVersion, documentCurrentRevision) {
  if (clientBaseVersion === undefined || clientBaseVersion === null) return false;
  return clientBaseVersion < documentCurrentRevision;
}

async function saveWithConflictCheck(params, documentCurrentRevision) {
  const hasConflict = detectConflict(params.clientVersion, documentCurrentRevision);
  if (hasConflict) {
    throw AppError.conflict('Document was modified elsewhere since your last known version', {
      yourVersion: params.clientVersion,
      currentVersion: documentCurrentRevision,
    });
  }
  return saveAutosave(params);
}

module.exports = { saveAutosave, getAutosave, clearAutosave, detectConflict, saveWithConflictCheck };
