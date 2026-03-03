import { prisma } from "./prisma";
import { NextRequest } from "next/server";
import { auth } from "./auth";

// Role hierarchy for permission checks
const ROLE_HIERARCHY = {
    SUPERADMIN: 3,
    OWNER: 2,
    STAFF: 1
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
        console.error("API key validation error:", error);
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
export function hasRole(userRole: string, requiredRole: Role): boolean {
    const userLevel = ROLE_HIERARCHY[userRole as Role] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    return userLevel >= requiredLevel;
}

/**
 * Check if user is admin (SUPERADMIN or has admin privileges)
 */
export function isAdmin(userRole: string): boolean {
    return userRole === "SUPERADMIN";
}

/**
 * Check if user can access a session
 * - SUPERADMIN can access all sessions
 * - Other users can only access their own sessions
 */
export async function canAccessSession(userId: string, userRole: string, sessionId: string): Promise<boolean> {
    if (isAdmin(userRole)) {
        return true;
    }

    // Check if session belongs to user
    const session = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId, userId },
                { sessionId: sessionId, userId }
            ]
        }
    });

    return !!session;
}

/**
 * Get sessions that user can access
 * - SUPERADMIN sees all
 * - Others see only their own
 */
export async function getAccessibleSessions(userId: string, userRole: string) {
    if (isAdmin(userRole)) {
        return prisma.session.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                botConfig: true,
                webhooks: true,
                _count: {
                    select: {
                        contacts: true,
                        messages: true,
                        groups: true,
                        autoReplies: true,
                        scheduledMessages: true
                    }
                }
            }
        });
    }

    return prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            botConfig: true,
            webhooks: true,
            _count: {
                select: {
                    contacts: true,
                    messages: true,
                    groups: true,
                    autoReplies: true,
                    scheduledMessages: true
                }
            }
        }
    });
}

/**
 * Generate a new API key
 */
export function generateApiKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "wag_"; // Prefix for easy identification
    for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
