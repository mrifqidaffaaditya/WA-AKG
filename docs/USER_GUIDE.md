# 📖 WA-AKG User Manual

Welcome to the **WA-AKG** User Guide. This document provides step-by-step instructions on how to use the dashboard features effectively.

## 📋 Table of Contents
1.  [Dashboard Overview](#1-dashboard-overview)
2.  [Managing Sessions](#2-managing-sessions)
3.  [Sending Messages](#3-sending-messages)
4.  [Scheduling Messages](#4-scheduling-messages)
5.  [Auto-Replies](#5-auto-replies)
6.  [Broadcasts](#6-broadcasts)
7.  [Sticker Maker](#7-sticker-maker)
8.  [Contact Management](#8-contact-management)

---

## 1. Dashboard Overview
Upon logging in, you are greeted with the main dashboard.
-   **Sidebar**: Navigate between different modules (Sessions, Chat, Groups, etc.).
-   **Navbar**: Select your active **WhatsApp Session** and view the **Real-time Clock**.
-   **Notifications**: Click the bell icon to see system updates (if any).

---

## 2. Managing Sessions
Before you can send messages, you must connect a WhatsApp account.

1.  Navigate to **Dashboard** > **Sessions**.
2.  Click **"Add Session"**.
3.  Enter a unique **Session ID** (e.g., `marketing-main`).
4.  A QR Code will appear. Open WhatsApp on your phone > **Linked Devices** > **Link a Device**.
5.  Scan the QR Code.
6.  Once connected, the status will change to `CONNECTED`.
7.  **Important**: Select this session in the **Navbar** dropdown to make it active for other features.

---

## 3. Sending Messages
Send operational messages directly from the dashboard.

1.  Navigate to **Chat**.
2.  Select a contact from the list or click **"New Chat"** to enter a phone number manually.
3.  Type your message in the input box.
4.  (Optional) Click the **Paperclip** icon to attach an image.
5.  Press **Enter** or the **Send** button.

---

## 4. Scheduling Messages
Plan your communications ahead of time.

1.  Navigate to **Scheduler**.
2.  Click **"New Schedule"**.
3.  **Target**: Enter the destination phone number (e.g., `62812...`).
4.  **Message**: Type the content.
5.  **Date & Time**: Select when the message should be sent.
    -   *Note*: The system uses the **Timezone** configured in **Settings**.
6.  Click **"Save"**. The message will be queued and sent automatically.

---

## 5. Auto-Replies
Set up automated responses for common queries.

1.  Navigate to **Auto Reply**.
2.  Click **"Add Rule"**.
3.  **Keyword**: The text to trigger the reply (e.g., `!price`).
4.  **Match Type**:
    -   `EXACT`: Message must match exactly.
    -   `CONTAINS`: Message must contain the keyword.
    -   `STARTS_WITH`: Message must start with the keyword.
5.  **Response**: The reply message to send back.
6.  Click **"Save"**.

---

## 6. Broadcasts
Send bulk messages safely.

1.  Navigate to **Broadcast**.
2.  **Recipients**: Enter phone numbers separated by commas, or select a Group.
3.  **Message**: Enter your campaign message.
4.  **Delay**: The system automatically adds a random delay (10-30s) between messages to prevent WhatsApp bans.
5.  Click **"Send Broadcast"**.

---

## 7. Sticker Maker
Convert images to stickers easily.

1.  Navigate to **Tools** > **Sticker**.
2.  Upload an image.
3.  (Optional) Toggle "Remove Background" if you have an API key configured.
4.  Enter the recipient's phone number.
5.  Click **"Send Sticker"**.

---

## 8. Contact Management
View and manage your synced WhatsApp contacts.

1.  Navigate to **Contacts**.
2.  **Search**: Use the search bar to find contacts by Name, JID, or Phone Number.
3.  **Pagination Limit**: Use the dropdown next to the search bar to change the number of contacts displayed per page (up to 3000).
4.  **Session Filter**: The list automatically shows contacts synced with your currently active session.

---

## ⚙️ Settings
-   **System Settings**: Change the App Name, Logo, and global **Timezone**.
-   **Bot Settings**: Configure the bot name and default behaviors.

For technical setup, please refer to the [Database Setup Guide](./DATABASE_SETUP.md).
