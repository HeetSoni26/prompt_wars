/**
 * @fileoverview Firebase ID token verification middleware.
 * Validates Bearer tokens on every protected route using Firebase Admin SDK.
 */

const admin = require('firebase-admin');

/**
 * Express middleware that verifies a Firebase ID token from Authorization header.
 * Attaches decoded user data to req.user on success.
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Next middleware
 */
async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };
    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'TokenExpired',
        message: 'Your session has expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      error: 'InvalidToken',
      message: 'Token verification failed. Please sign in again.',
    });
  }
}

module.exports = { verifyFirebaseToken };
