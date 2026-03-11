#!/usr/bin/env node
/**
 * Generate a random secret for NEXTAUTH_SECRET.
 * Run: node scripts/generate-secret.js
 * Copy the output into each app's .env as NEXTAUTH_SECRET=...
 */
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('base64');
console.log(secret);
