# WA-AKG Documentation

Welcome to the WA-AKG documentation directory!

## Available Documentation

### 📚 [API Documentation](./API_DOCUMENTATION.md)
Complete API reference covering all endpoints in the WA-AKG system:
- Authentication & API Keys
- Session Management
- Messaging (Send, Broadcast, Stickers)
- Chat & Contact Management
- Groups
- Auto-Reply Rules
- Scheduled Messages
- Webhooks
- Notifications
- User Management
- System Settings
- Status/Stories

### ⚡ [API Quick Reference](./API-QUICK-REFERENCE.md)
Quick reference guide with:
- Common API operations
- curl command examples
- Code snippets (JavaScript/TypeScript & Python)
- JID formats and constants
- Tips and best practices

### 📖 [User Guide](./USER_GUIDE.md)
End-user documentation for using the WA-AKG dashboard

### 🗄️ [Database Setup](./DATABASE_SETUP.md)
Database schema and setup instructions

### 🔄 [Update Guide](./UPDATE_GUIDE.md)
Instructions for updating WA-AKG to the latest version

## Getting Started

### 1. Authentication
- Generate an API key from the dashboard (Settings → API Key)
- Include it in all requests: `X-API-Key: ak_your-api-key`

### 2. Create a Session
- POST to `/api/sessions` to create a WhatsApp connection
- Scan the QR code provided
- Wait for the session to connect

### 3. Send Messages
- POST to `/api/chat/send` with sessionId, jid, and message
- Support for text, images, videos, stickers, and more

### 4. Automate with Webhooks
- Create webhooks to receive real-time events
- Handle incoming messages, connection updates, etc.

## API Structure

```
/api
├── /auth/[...nextauth]      # Authentication
├── /sessions                 # Session management
├── /chat                     # Messaging & chats
├── /messages                 # Broadcast, spam, stickers
├── /contacts                 # Contact management
├── /groups                   # Group management
├── /autoreplies              # Auto-reply rules
├── /scheduler                # Scheduled messages
├── /webhooks                 # Webhook management
├── /notifications            # Notification system
├── /users                    # User management
├── /user/api-key             # API key management
├── /settings/system          # System settings
├── /system/check-updates     # Update checker
└── /status/update            # WhatsApp status/stories
```

## Key Concepts

### Sessions
Each session represents a WhatsApp connection. You can have multiple sessions for different WhatsApp accounts.

### JID (Jabber ID)
WhatsApp identifier format:
- Individual: `6281234567890@s.whatsapp.net`
- Group: `120363123456789@g.us`
- Status: `status@broadcast`

### Roles
- **SUPERADMIN**: Full system access
- **OWNER**: Manage own resources
- **STAFF**: Limited access

### Webhooks
Receive real-time events for:
- Incoming/outgoing messages
- Connection status
- Group updates
- QR code changes

## Support

For issues or questions:
- GitHub: [mrifqidaffaaditya/WA-AKG](https://github.com/mrifqidaffaaditya/WA-AKG)
- Issues: [GitHub Issues](https://github.com/mrifqidaffaaditya/WA-AKG/issues)

## License

See the main repository for license information.
