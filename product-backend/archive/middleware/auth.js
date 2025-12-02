// Deprecated: auth middleware is inlined in `server.js`.
// Keep a harmless stub to avoid import errors.
module.exports = function auth(req, res, next) {
  res.status(410).json({ message: 'Auth middleware moved to server.js; use that server.' });
};
