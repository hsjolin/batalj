import { Router } from "express";
import { getGroupBySlug, getContacts, getContactById, getInviteToken, markInviteTokenUsed } from "../db";
import { hashPassword, verifyPassword } from "../middleware/auth";

export default function authRouter(): Router {
    const router = Router();

    // POST /api/v1/auth/login
    router.post("/login", async (req, res) => {
        const { groupSlug, password } = req.body;

        if (!groupSlug || !password) {
            return res.status(400).json({ error: "Group slug and password required" });
        }

        const group = await getGroupBySlug(groupSlug);
        if (!group || !verifyPassword(password, group.password)) {
            return res.status(401).json({ error: "Invalid group ID or password" });
        }

        // Get contacts in group
        const contacts = await getContacts(group._id!.toString());
        if (contacts.length === 0) {
            return res.status(400).json({ error: "No contacts in group" });
        }

        // Set cookie to first contact as default
        res.cookie('contactId', contacts[0]._id!.toString(), {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            sameSite: 'lax'
        });

        res.json({
            success: true,
            groupSlug: group.slug,
            contactId: contacts[0]._id!.toString()
        });
    });

    // POST /api/v1/auth/switch-contact
    router.post("/switch-contact", async (req, res) => {
        const { contactId } = req.body;

        if (!contactId) {
            return res.status(400).json({ error: "Contact ID required" });
        }

        const contact = await getContactById(contactId);
        if (!contact) {
            return res.status(404).json({ error: "Contact not found" });
        }

        res.cookie('contactId', contactId, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });

        res.json({ success: true });
    });

    // GET /api/v1/auth/verify-token/:token
    router.get("/verify-token/:token", async (req, res) => {
        const { token } = req.params;

        const tokenData = await getInviteToken(token);
        if (!tokenData) {
            return res.status(404).json({ error: "Invalid or expired token" });
        }

        // Mark token as used
        await markInviteTokenUsed(token);

        // Get contacts in the group and set cookie to first one
        const contacts = await getContacts(tokenData.group._id!.toString());
        if (contacts.length > 0) {
            res.cookie('contactId', contacts[0]._id!.toString(), {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000,
                sameSite: 'lax'
            });
        }

        res.json({
            success: true,
            groupSlug: tokenData.group.slug,
            email: tokenData.email
        });
    });

    // POST /api/v1/auth/logout
    router.post("/logout", (req, res) => {
        res.clearCookie('contactId');
        res.json({ success: true });
    });

    // GET /api/v1/auth/me - Get current authenticated user
    router.get("/me", async (req, res) => {
        const contactId = (req as any).cookies?.contactId;

        if (!contactId) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const contact = await getContactById(contactId);
        if (!contact) {
            return res.status(401).json({ error: "Invalid authentication" });
        }

        res.json({ contact });
    });

    return router;
}
