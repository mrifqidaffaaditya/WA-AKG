import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
    const spec = createSwaggerSpec({
        apiFolder: "src/app/api",
        definition: {
            openapi: "3.0.0",
            info: {
                title: "WA-AKG API Documentation",
                version: "1.2.0",
                description: `
# WhatsApp AI Gateway - Complete API Reference

Professional WhatsApp Gateway with **64 API endpoints** for complete WhatsApp automation.

## 🔐 Authentication
All endpoints require authentication via:
1. **API Key Header**: \`X-API-Key: your-api-key\`
2. **Session Cookie**: \`next-auth.session-token\` (automatically sent by browser)

## 📋 Common Parameters
- **sessionId**: Unique session identifier (e.g., "mysession-01")
- **jid**: WhatsApp JID format:
  - Personal: \`628123456789@s.whatsapp.net\`
  - Group: \`120363123456789@g.us\`

## 📊 Rate Limits
- Phone check: Max 50 numbers per request
- Broadcast: 10-20s random delay between messages
- Message history: Max 100 messages
                `,
            },
            servers: [
                {
                    url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
                    description: "API Server",
                },
            ],
            components: {
                securitySchemes: {
                    ApiKeyAuth: { 
                        type: "apiKey", 
                        in: "header", 
                        name: "X-API-Key",
                        description: "API Key for authentication"
                    },
                    SessionAuth: { 
                        type: "apiKey", 
                        in: "cookie", 
                        name: "next-auth.session-token",
                        description: "Session cookie (browser only)"
                    }
                },
                schemas: {
                    // Common Schemas
                    Error: { 
                        type: "object", 
                        properties: { 
                            error: { type: "string", example: "Unauthorized" } 
                        } 
                    },
                    Success: { 
                        type: "object", 
                        properties: { 
                            success: { type: "boolean", example: true }, 
                            message: { type: "string", example: "Operation successful" } 
                        } 
                    },
                    Session: {
                        type: "object",
                        properties: {
                            id: { type: "string", example: "clx123abc" },
                            name: { type: "string", example: "Marketing Bot" },
                            sessionId: { type: "string", example: "marketing-1" },
                            status: { type: "string", enum: ["Connected", "Disconnected", "Connecting"], example: "Connected" },
                            userId: { type: "string" },
                            createdAt: { type: "string", format: "date-time" },
                            updatedAt: { type: "string", format: "date-time" }
                        }
                    },
                    Message: {
                        type: "object",
                        properties: {
                            text: { type: "string", example: "Hello! How can I help you?" }
                        }
                    },
                    Contact: {
                        type: "object",
                        properties: {
                            jid: { type: "string", example: "628123456789@s.whatsapp.net" },
                            name: { type: "string", example: "John Doe" },
                            notify: { type: "string" },
                            profilePic: { type: "string", nullable: true }
                        }
                    }
                },
                responses: {
                    Unauthorized: {
                        description: "Unauthorized - Invalid or missing API key",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { error: "Unauthorized" }
                            }
                        }
                    },
                    Forbidden: {
                        description: "Forbidden - Access denied",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { error: "Forbidden - Cannot access this session" }
                            }
                        }
                    },
                    NotFound: {
                        description: "Resource not found",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { error: "Session not found" }
                            }
                        }
                    },
                    SessionNotReady: {
                        description: "Session not connected or ready",
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Error" },
                                example: { error: "Session not ready" }
                            }
                        }
                    }
                }
            },
            security: [{ ApiKeyAuth: [] }, { SessionAuth: [] }],
            paths: {
                // ==================== SESSIONS ====================
                "/sessions": {
                    get: { 
                        tags: ["Sessions"], 
                        summary: "List all accessible sessions", 
                        description: "Get all sessions accessible to the authenticated user (role-based filtering)",
                        responses: { 
                            200: { 
                                description: "List of sessions",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Session" }
                                        }
                                    }
                                }
                            },
                            401: { $ref: "#/components/responses/Unauthorized" }
                        } 
                    },
                    post: { 
                        tags: ["Sessions"], 
                        summary: "Create new WhatsApp session", 
                        description: "Creates a new WhatsApp session for QR code pairing",
                        requestBody: { 
                            required: true,
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["name"], 
                                        properties: { 
                                            name: { type: "string", example: "Sales Bot", description: "Display name for the session" }, 
                                            sessionId: { type: "string", example: "sales-01", description: "Unique session ID (auto-generated if not provided)" } 
                                        } 
                                    },
                                    example: {
                                        name: "Marketing Bot",
                                        sessionId: "marketing-1"
                                    }
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { 
                                description: "Session created successfully",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Session" }
                                    }
                                }
                            },
                            400: { description: "Invalid request body" },
                            401: { $ref: "#/components/responses/Unauthorized" }
                        } 
                    }
                },
                
                "/sessions/{id}/qr": {
                    get: { 
                        tags: ["Sessions"], 
                        summary: "Get QR code for pairing", 
                        description: "Retrieve QR code (string and base64 image) for WhatsApp pairing",
                        parameters: [
                            { 
                                name: "id", 
                                in: "path", 
                                required: true, 
                                schema: { type: "string" },
                                description: "Session ID",
                                example: "sales-01"
                            }
                        ], 
                        responses: { 
                            200: { 
                                description: "QR code generated",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                qr: { type: "string", description: "QR code string" },
                                                base64: { type: "string", description: "Base64 data URL for image" }
                                            }
                                        },
                                        example: {
                                            success: true,
                                            qr: "2@AbCdEfGhIjKlMnOp...",
                                            base64: "data:image/png;base64,iVBORw0KGgo..."
                                        }
                                    }
                                }
                            },
                            400: { description: "Already connected" },
                            404: { description: "QR not available yet" }
                        } 
                    }
                },

                "/sessions/{id}/bot-config": {
                    get: { 
                        tags: ["Sessions"], 
                        summary: "Get bot configuration", 
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], 
                        responses: { 200: { description: "Bot configuration retrieved" } } 
                    },
                    put: { 
                        tags: ["Sessions"], 
                        summary: "Update bot configuration", 
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object",
                                        properties: {
                                            enabled: { type: "boolean" },
                                            botMode: { type: "string", enum: ["OWNER", "WHITELIST", "ALL"] },
                                            autoReplyMode: { type: "string", enum: ["OWNER", "WHITELIST", "ALL"] },
                                            enableSticker: { type: "boolean" },
                                            botName: { type: "string" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Configuration updated" } } 
                    }
                },

                "/sessions/{id}/settings": {
                    patch: { 
                        tags: ["Sessions"], 
                        summary: "Update session settings", 
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object",
                                        properties: {
                                            config: {
                                                type: "object",
                                                properties: {
                                                    readReceipts: { type: "boolean" },
                                                    rejectCalls: { type: "boolean" }
                                                }
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Settings updated" } } 
                    },
                    delete: { 
                        tags: ["Sessions"], 
                        summary: "Delete session and logout", 
                        description: "Permanently deletes session and logs out from WhatsApp",
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], 
                        responses: { 
                            200: { 
                                description: "Session deleted",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            } 
                        } 
                    }
                },

                // ==================== MESSAGING ====================
                "/chat/send": {
                    post: { 
                        tags: ["Messaging"], 
                        summary: "Send message (text/media/sticker)", 
                        description: "Universal endpoint for sending text, images, videos, documents, and stickers",
                        requestBody: { 
                            required: true,
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "message"], 
                                        properties: { 
                                            sessionId: { type: "string", example: "sales-01" }, 
                                            jid: { type: "string", example: "628123456789@s.whatsapp.net" }, 
                                            message: { 
                                                type: "object",
                                                description: "Message content (text, image, sticker, etc.)",
                                                oneOf: [
                                                    {
                                                        properties: {
                                                            text: { type: "string", example: "Hello!" }
                                                        }
                                                    },
                                                    {
                                                        properties: {
                                                            image: { 
                                                                type: "object",
                                                                properties: {
                                                                    url: { type: "string", example: "https://example.com/image.jpg" }
                                                                }
                                                            },
                                                            caption: { type: "string", example: "Check this out" }
                                                        }
                                                    }
                                                ]
                                            } 
                                        } 
                                    },
                                    examples: {
                                        text: {
                                            summary: "Text message",
                                            value: {
                                                sessionId: "sales-01",
                                                jid: "628123456789@s.whatsapp.net",
                                                message: { text: "Hello, how can I help you?" }
                                            }
                                        },
                                        image: {
                                            summary: "Image with caption",
                                            value: {
                                                sessionId: "sales-01",
                                                jid: "628123456789@s.whatsapp.net",
                                                message: {
                                                    image: { url: "https://example.com/product.jpg" },
                                                    caption: "New product available!"
                                                }
                                            }
                                        }
                                    }
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { 
                                description: "Message sent",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/Success" }
                                    }
                                }
                            },
                            503: { $ref: "#/components/responses/SessionNotReady" }
                        } 
                    }
                },

                "/messages/broadcast": {
                    post: { 
                        tags: ["Messaging"], 
                        summary: "Broadcast message to multiple recipients", 
                        description: "Send same message to multiple contacts with anti-ban delays (10-20s random)",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "recipients", "message"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            recipients: { 
                                                type: "array", 
                                                items: { type: "string" },
                                                example: ["628123456789@s.whatsapp.net", "628987654321@s.whatsapp.net"]
                                            },
                                            message: { type: "string", example: "Flash Sale! 50% off" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { 
                                description: "Broadcast started (background processing)",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                message: { type: "string", example: "Broadcast started in background" }
                                            }
                                        }
                                    }
                                }
                            } 
                        } 
                    }
                },

                "/messages/poll": { 
                    post: { 
                        tags: ["Messaging"], 
                        summary: "Send poll message", 
                        description: "Create interactive poll (2-12 options, single or multiple choice)",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "question", "options"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            question: { type: "string", example: "What's your favorite product?" },
                                            options: { 
                                                type: "array", 
                                                items: { type: "string" },
                                                minItems: 2,
                                                maxItems: 12,
                                                example: ["Product A", "Product B", "Product C"]
                                            },
                                            selectableCount: { type: "integer", minimum: 1, example: 1 }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Poll sent" } } 
                    } 
                },

                "/messages/location": { 
                    post: { 
                        tags: ["Messaging"], 
                        summary: "Send location", 
                        description: "Share GPS coordinates with optional name and address",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "latitude", "longitude"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            latitude: { type: "number", minimum: -90, maximum: 90, example: -6.2088 },
                                            longitude: { type: "number", minimum: -180, maximum: 180, example: 106.8456 },
                                            name: { type: "string", example: "Office" },
                                            address: { type: "string", example: "Jakarta, Indonesia" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Location sent" } } 
                    } 
                },

                "/messages/contact": { 
                    post: { 
                        tags: ["Messaging"], 
                        summary: "Send contact card", 
                        description: "Share one or multiple contact vCards",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "contacts"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            contacts: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    required: ["displayName", "vcard"],
                                                    properties: {
                                                        displayName: { type: "string" },
                                                        vcard: { type: "string" }
                                                    }
                                                }
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Contact sent" } } 
                    } 
                },

                "/messages/react": { 
                    post: { 
                        tags: ["Messaging"], 
                        summary: "React to message with emoji", 
                        description: "Add emoji reaction to a message (empty string removes reaction)",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "messageId", "emoji"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            messageId: { type: "string", example: "3EB0ABCD1234567890" },
                                            emoji: { type: "string", example: "👍", description: "Emoji or empty string to remove" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Reaction sent" } } 
                    } 
                },

                "/messages/forward": { 
                    post: { 
                        tags: ["Messaging"], 
                        summary: "Forward message", 
                        description: "Forward a message to one or multiple chats",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "fromJid", "messageId", "toJids"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            fromJid: { type: "string", description: "Source chat JID" },
                                            messageId: { type: "string" },
                                            toJids: { 
                                                type: "array", 
                                                items: { type: "string" },
                                                description: "Recipient JIDs"
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Message forwarded" } } 
                    } 
                },

                "/messages/delete": { 
                    delete: { 
                        tags: ["Messaging"], 
                        summary: "Delete message for everyone", 
                        description: "Delete message (only works for messages < 7 minutes old)",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "messageId"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            messageId: { type: "string" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { description: "Message deleted" },
                            400: { description: "Message too old (> 7 minutes)" }
                        } 
                    } 
                },

                // ==================== CHAT MANAGEMENT ====================
                "/chat/{sessionId}": { 
                    get: { 
                        tags: ["Chat"], 
                        summary: "Get chat list with contacts", 
                        description: "Retrieve all contacts with last message for a session",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 
                            200: { 
                                description: "Chat list",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/Contact" }
                                        }
                                    }
                                }
                            } 
                        } 
                    } 
                },

                "/chat/{sessionId}/{jid}": { 
                    get: { 
                        tags: ["Chat"], 
                        summary: "Get message history", 
                        description: "Fetch up to 100 messages for a chat (enriched with participant info for groups)",
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }, 
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded JID" }
                        ], 
                        responses: { 200: { description: "Message history (max 100 messages)" } } 
                    } 
                },

                "/chat/check": { 
                    post: { 
                        tags: ["Chat"], 
                        summary: "Check if numbers exist on WhatsApp", 
                        description: "Validate phone numbers (max 50 per request)",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "numbers"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            numbers: { 
                                                type: "array", 
                                                items: { type: "string" },
                                                maxItems: 50,
                                                example: ["628123456789", "628987654321"]
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { 
                                description: "Validation results",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                results: {
                                                    type: "array",
                                                    items: {
                                                        type: "object",
                                                        properties: {
                                                            number: { type: "string" },
                                                            exists: { type: "boolean" },
                                                            jid: { type: "string", nullable: true },
                                                            error: { type: "string", nullable: true }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } 
                        } 
                    } 
                },

                "/chat/read": { 
                    put: { 
                        tags: ["Chat"], 
                        summary: "Mark messages as read", 
                        description: "Mark specific messages or entire chat as read",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            messageIds: { 
                                                type: "array", 
                                                items: { type: "string" },
                                                description: "Optional: specific message IDs to mark"
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Marked as read" } } 
                    } 
                },

                "/chat/archive": { 
                    put: { 
                        tags: ["Chat"], 
                        summary: "Archive/unarchive chat", 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "archive"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            archive: { type: "boolean", description: "true to archive, false to unarchive" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Chat archived/unarchived" } } 
                    } 
                },

                "/chat/mute": { 
                    put: { 
                        tags: ["Chat"], 
                        summary: "Mute/unmute chat", 
                        description: "Mute chat with optional duration (default 8 hours)",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "mute"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            mute: { type: "boolean" },
                                            duration: { type: "integer", description: "Duration in seconds (default: 8 hours)", example: 3600 }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Chat muted/unmuted" } } 
                    } 
                },

                "/chat/pin": { 
                    put: { 
                        tags: ["Chat"], 
                        summary: "Pin/unpin chat", 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "pin"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            pin: { type: "boolean" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Chat pinned/unpinned" } } 
                    } 
                },

                "/chat/presence": { 
                    post: { 
                        tags: ["Chat"], 
                        summary: "Send presence (typing/recording)", 
                        description: "Show typing, recording, or online status",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "presence"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            presence: { 
                                                type: "string", 
                                                enum: ["composing", "recording", "paused", "available", "unavailable"],
                                                example: "composing"
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Presence sent" } } 
                    } 
                },

                "/chat/profile-picture": { 
                    post: { 
                        tags: ["Chat"], 
                        summary: "Get profile picture URL", 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { 
                                description: "Profile picture URL",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                jid: { type: "string" },
                                                profilePicUrl: { type: "string", nullable: true }
                                            }
                                        }
                                    }
                                }
                            } 
                        } 
                    } 
                },

                // ==================== GROUPS ====================
                "/groups": { 
                    get: { 
                        tags: ["Groups"], 
                        summary: "List all groups", 
                        parameters: [
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "List of groups" } } 
                    } 
                },
                
                "/groups/create": { 
                    post: { 
                        tags: ["Groups"], 
                        summary: "Create new group", 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "subject", "participants"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            subject: { type: "string", maxLength: 100, example: "VIP Customers" },
                                            participants: { 
                                                type: "array", 
                                                items: { type: "string" },
                                                example: ["628123456789@s.whatsapp.net"]
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Group created" } } 
                    } 
                },

                "/groups/{jid}/subject": { 
                    put: { 
                        tags: ["Groups"], 
                        summary: "Update group name", 
                        description: "Update group subject (max 100 characters, requires admin)",
                        parameters: [
                            { name: "jid", in: "path", required: true, schema: { type: "string" }, description: "URL-encoded group JID" }
                        ], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "subject"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            subject: { type: "string", maxLength: 100 }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { description: "Subject updated" },
                            403: { description: "Bot must be admin" }
                        } 
                    } 
                },

                "/groups/{jid}/members": { 
                    put: { 
                        tags: ["Groups"], 
                        summary: "Manage group members", 
                        description: "Add, remove, promote, or demote group members",
                        parameters: [
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "action", "participants"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            action: { 
                                                type: "string", 
                                                enum: ["add", "remove", "promote", "demote"],
                                                example: "add"
                                            },
                                            participants: { 
                                                type: "array", 
                                                items: { type: "string" }
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Members updated" } } 
                    } 
                },

                "/groups/{jid}/invite": { 
                    get: { 
                        tags: ["Groups"], 
                        summary: "Get invite code", 
                        description: "Retrieve group invite link",
                        parameters: [
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }, 
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 
                            200: { 
                                description: "Invite code",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                success: { type: "boolean" },
                                                inviteCode: { type: "string" },
                                                inviteUrl: { type: "string", example: "https://chat.whatsapp.com/AbCdEfGh" }
                                            }
                                        }
                                    }
                                }
                            } 
                        } 
                    },
                    put: { 
                        tags: ["Groups"], 
                        summary: "Revoke invite code", 
                        description: "Generate new invite code (invalidates old one)",
                        parameters: [
                            { name: "jid", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId"],
                                        properties: {
                                            sessionId: { type: "string" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Invite code revoked, new code generated" } } 
                    } 
                },



                // ==================== CONTACTS ====================
                "/contacts": { 
                    get: { 
                        tags: ["Contacts"], 
                        summary: "List contacts", 
                        description: "Paginated contact list with search",
                        parameters: [
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } },
                            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
                            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
                            { name: "search", in: "query", schema: { type: "string" }, description: "Search by name, notify, jid" }
                        ], 
                        responses: { 
                            200: { 
                                description: "Paginated contacts",
                                content: {
                                    "application/json": {
                                        schema: {
                                            type: "object",
                                            properties: {
                                                data: { 
                                                    type: "array", 
                                                    items: { $ref: "#/components/schemas/Contact" } 
                                                },
                                                meta: {
                                                    type: "object",
                                                    properties: {
                                                        total: { type: "integer" },
                                                        page: { type: "integer" },
                                                        limit: { type: "integer" },
                                                        totalPages: { type: "integer" }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } 
                        } 
                    } 
                },

                // ==================== PROFILE ====================
                "/profile": { 
                    get: { 
                        tags: ["Profile"], 
                        summary: "Get own profile", 
                        description: "Retrieve bot's WhatsApp profile and status",
                        parameters: [
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "Profile information" } } 
                    } 
                },

                // ==================== AUTO REPLY ====================
                "/autoreplies": {
                    get: { 
                        tags: ["Auto Reply"], 
                        summary: "List auto-reply rules", 
                        parameters: [
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "List of auto-reply rules" } } 
                    },
                    post: { 
                        tags: ["Auto Reply"], 
                        summary: "Create auto-reply rule", 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "keyword", "response"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            keyword: { type: "string", example: "price" },
                                            response: { type: "string", example: "Our prices start at $10" },
                                            matchType: { 
                                                type: "string", 
                                                enum: ["EXACT", "CONTAINS", "STARTS_WITH"],
                                                default: "EXACT"
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Rule created" } } 
                    }
                },

                "/autoreplies/{id}": {
                    get: { 
                        tags: ["Auto Reply"], 
                        summary: "Get auto-reply rule", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "Auto-reply rule details" } } 
                    },
                    put: { 
                        tags: ["Auto Reply"], 
                        summary: "Update auto-reply rule", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        properties: {
                                            keyword: { type: "string" },
                                            response: { type: "string" },
                                            matchType: { type: "string", enum: ["EXACT", "CONTAINS", "STARTS_WITH"] }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Rule updated" } } 
                    },
                    delete: { 
                        tags: ["Auto Reply"], 
                        summary: "Delete auto-reply rule", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "Rule deleted" } } 
                    }
                },

                // ==================== SCHEDULER ====================
                "/scheduler": {
                    get: { 
                        tags: ["Scheduler"], 
                        summary: "List scheduled messages", 
                        parameters: [
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "List of scheduled messages" } } 
                    },
                    post: { 
                        tags: ["Scheduler"], 
                        summary: "Schedule message", 
                        description: "Schedule message with timezone support",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "content", "sendAt"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            jid: { type: "string" },
                                            content: { type: "string" },
                                            sendAt: { type: "string", format: "date-time", example: "2024-01-18T10:00:00" },
                                            mediaUrl: { type: "string", nullable: true }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                    }
                },

                "/scheduler/{id}": {
                    get: { 
                        tags: ["Scheduler"], 
                        summary: "Get scheduled message", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "Scheduled message details" } } 
                    },
                    put: { 
                        tags: ["Scheduler"], 
                        summary: "Update scheduled message", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        properties: {
                                            content: { type: "string" },
                                            sendAt: { type: "string", format: "date-time" },
                                            jid: { type: "string" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Scheduled message updated" } } 
                    },
                    delete: { 
                        tags: ["Scheduler"], 
                        summary: "Delete scheduled message", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "Scheduled message deleted" } } 
                    }
                },

                // ==================== WEBHOOKS ====================
                "/webhooks": {
                    get: { 
                        tags: ["Webhooks"], 
                        summary: "List webhooks", 
                        responses: { 200: { description: "List of user's webhooks" } } 
                    },
                    post: { 
                        tags: ["Webhooks"], 
                        summary: "Create webhook", 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["name", "url", "events"],
                                        properties: {
                                            name: { type: "string", example: "CRM Integration" },
                                            url: { type: "string", format: "uri", example: "https://crm.example.com/webhook" },
                                            secret: { type: "string", nullable: true },
                                            sessionId: { type: "string", nullable: true, description: "Optional: filter by session" },
                                            events: { 
                                                type: "array", 
                                                items: { type: "string" },
                                                example: ["message.upsert", "message.delete"]
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Webhook created" } } 
                    }
                },

                "/webhooks/{id}": {
                    get: { 
                        tags: ["Webhooks"], 
                        summary: "Get webhook", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "Webhook details" } } 
                    },
                    put: { 
                        tags: ["Webhooks"], 
                        summary: "Update webhook", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        properties: {
                                            name: { type: "string" },
                                            url: { type: "string", format: "uri" },
                                            events: { type: "array", items: { type: "string" } },
                                            isActive: { type: "boolean" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Webhook updated" } } 
                    },
                    delete: { 
                        tags: ["Webhooks"], 
                        summary: "Delete webhook", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "Webhook deleted" } } 
                    }
                },

                // ==================== USERS ====================
                "/users": {
                    get: { 
                        tags: ["Users"], 
                        summary: "List users (SUPERADMIN only)", 
                        responses: { 200: { description: "List of users" } } 
                    },
                    post: { 
                        tags: ["Users"], 
                        summary: "Create user (SUPERADMIN only)", 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["name", "email", "password"],
                                        properties: {
                                            name: { type: "string", minLength: 2 },
                                            email: { type: "string", format: "email" },
                                            password: { type: "string", minLength: 6 },
                                            role: { 
                                                type: "string", 
                                                enum: ["SUPERADMIN", "OWNER", "STAFF"],
                                                default: "OWNER"
                                            }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 
                            200: { description: "User created" },
                            400: { description: "Email already exists" }
                        } 
                    }
                },

                "/users/{id}": {
                    get: { 
                        tags: ["Users"], 
                        summary: "Get user (SUPERADMIN only)", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "User details" } } 
                    },
                    put: { 
                        tags: ["Users"], 
                        summary: "Update user (SUPERADMIN only)", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        properties: {
                                            name: { type: "string" },
                                            email: { type: "string" },
                                            password: { type: "string" },
                                            role: { type: "string", enum: ["SUPERADMIN", "OWNER", "STAFF"] }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "User updated" } } 
                    },
                    delete: { 
                        tags: ["Users"], 
                        summary: "Delete user (SUPERADMIN only)", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "User deleted" } } 
                    }
                },

                "/user/api-key": {
                    get: {
                        tags: ["Users"],
                        summary: "Get current API key",
                        responses: { 200: { description: "API key" } }
                    },
                    post: {
                        tags: ["Users"],
                        summary: "Generate new API key",
                        responses: { 200: { description: "New API key generated" } }
                    },
                    delete: {
                        tags: ["Users"],
                        summary: "Revoke API key",
                        responses: { 200: { description: "API key revoked" } }
                    }
                },
                // ==================== LABELS ====================
                "/labels": {
                    get: { 
                        tags: ["Labels"], 
                        summary: "List all labels", 
                        description: "Get all labels with chat count",
                        parameters: [
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "List of labels" } } 
                    },
                    post: { 
                        tags: ["Labels"], 
                        summary: "Create label", 
                        description: "Create new label with color (0-19 index)",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "name"],
                                        properties: {
                                            sessionId: { type: "string" },
                                            name: { type: "string", example: "Important" },
                                            color: { type: "integer", minimum: 0, maximum: 19, example: 0, description: "Color index (0-19)" }
                                        }
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Label created" } } 
                    }
                },
                // ==================== LABELS ====================
                // "/labels": {
                //     get: { 
                //         tags: ["Labels"], 
                //         summary: "List labels", 
                //         parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }],
                //         responses: { 200: { description: "List of labels" } } 
                //     },
                //     post: { 
                //         tags: ["Labels"], 
                //         summary: "Create label", 
                //         requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "sessionId"], properties: { name: { type: "string" }, sessionId: { type: "string" }, color: { type: "integer" } } } } } },
                //         responses: { 200: { description: "Label created" } } 
                //     }
                // },
                "/labels/{id}": {
                    put: { 
                        tags: ["Labels"], summary: "Update label", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                        requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, color: { type: "integer" } } } } } },
                        responses: { 200: { description: "Label updated" } } 
                    },
                    delete: { 
                        tags: ["Labels"], summary: "Delete label", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
                        responses: { 200: { description: "Label deleted" } } 
                    }
                },
                "/labels/chat-labels": {
                    get: { 
                        tags: ["Labels"], summary: "Get chat labels", parameters: [{ name: "jid", in: "query", required: true, schema: { type: "string" } }, { name: "sessionId", in: "query", required: true, schema: { type: "string" } }],
                        responses: { 200: { description: "Chat labels" } } 
                    },
                    put: { 
                        tags: ["Labels"], summary: "Update chat labels", 
                        requestBody: { content: { "application/json": { schema: { type: "object", required: ["jid", "sessionId", "action", "labelIds"], properties: { jid: { type: "string" }, sessionId: { type: "string" }, labelIds: { type: "array", items: { type: "string" } }, action: { type: "string", enum: ["add", "remove"] } } } } } },
                        responses: { 200: { description: "Chat labels updated" } } 
                    }
                },

                // ==================== NOTIFICATIONS ====================
                "/notifications": {
                    get: { tags: ["Notifications"], summary: "List notifications", responses: { 200: { description: "List of notifications" } } },
                    post: { tags: ["Notifications"], summary: "Create notification", responses: { 200: { description: "Notification created" } } }
                },
                "/notifications/read": {
                    patch: { tags: ["Notifications"], summary: "Mark notifications as read", responses: { 200: { description: "Marked as read" } } }
                },
                "/notifications/delete": {
                    delete: { tags: ["Notifications"], summary: "Delete notifications", responses: { 200: { description: "Deleted" } } }
                },

                // ==================== SYSTEM ====================
                "/settings/system": {
                    get: { tags: ["System"], summary: "Get system settings", responses: { 200: { description: "System settings" } } },
                    post: { tags: ["System"], summary: "Update system settings", responses: { 200: { description: "Settings updated" } } }
                },
                "/status/update": {
                    post: { tags: ["System"], summary: "Update status", responses: { 200: { description: "Status updated" } } }
                },
                "/system/check-updates": {
                    get: { tags: ["System"], summary: "Check for updates", responses: { 200: { description: "Update status" } } }
                },
                "/contacts/block": {
                     post: { tags: ["Contacts"], summary: "Block contact", responses: { 200: { description: "Contact blocked" } } }
                },
                "/contacts/unblock": {
                     post: { tags: ["Contacts"], summary: "Unblock contact", responses: { 200: { description: "Contact unblocked" } } }
                }
            },
        },
    });
    return spec;
};
