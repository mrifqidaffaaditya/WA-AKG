import crypto from "crypto";
import { prisma } from "./prisma";
import { NextRequest } from "next/server";
import { auth } from "./auth";
import { logger } from "./logger";

// Role hierarchy for permission checks
const ROLE_HIERARCHY = {
    SUPERADMIN: 3,
    STAFF: 2,
    USER: 1
} as const;

type Role = keyof typeof ROLE_HIERARCHY;

/**
 * Validate API key from request header
 */
export async function validateApiKey(request: NextRequest) {
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { apiKey },
            select: { id: true, email: true, name: true, role: true }
        });

        return user;
    } catch (error) {
        logger.error("Auth", "API key validation error:", error);
        return null;
    }
}

/**
 * Get authenticated user from either session or API key
 */
export async function getAuthenticatedUser(request?: NextRequest) {
    // First try API key if request is provided
    if (request) {
        const apiKeyUser = await validateApiKey(request);
        if (apiKeyUser) {
            return { ...apiKeyUser, authMethod: "apiKey" as const };
        }
    }

    // Fall back to session auth
    const session = await auth();
    if (session?.user?.id) {
        // Fetch full user data including role
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, email: true, name: true, role: true }
        });

        if (user) {
            return { ...user, authMethod: "session" as const };
        }
    }

    return null;
}

/**
 * Check if user has required role level
 */
export {
    ROLE_HIERARCHY,
    hasRole,
    isAdmin,
    canAccessSession,
    isSessionOwner,
    getAccessibleSessions
} from "./session-access";
export type { Role } from "./session-access";

/**
 * Generate a cryptographically secure API key
 */
export function generateApiKey(): string {
    return `wag_${crypto.randomBytes(24).toString("base64url")}`;
}
