import "server-only";

import { createHash, randomBytes } from "crypto";

export function createClientPortalInviteToken() {
  return randomBytes(32).toString("base64url");
}

export function hashClientPortalInviteToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getClientPortalInviteExpiresAt() {
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
}
