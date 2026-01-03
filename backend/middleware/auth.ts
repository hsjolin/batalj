import { Request, Response, NextFunction } from "express";
import { getContactById } from "../db";
import crypto from "crypto";

/**
 * Hash a password using SHA256
 */
export function hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

/**
 * Middleware to require authentication via contactId cookie
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const contactId = (req as any).cookies?.contactId;

    if (!contactId) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    const contact = await getContactById(contactId);
    if (!contact) {
        return res.status(401).json({ error: "Invalid authentication" });
    }

    // Store contact in request context
    (req as any).currentContact = contact;
    next();
}

/**
 * Generate a secure random invite token
 */
export function generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex');
}
