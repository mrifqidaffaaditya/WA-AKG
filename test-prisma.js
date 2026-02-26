import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
    const messages = await prisma.message.findMany({
        take: 10,
        include: { session: { select: { sessionId: true } } }
    });
    console.log(messages.map(m => ({
        id: m.id,
        sessionIdStr: m.session.sessionId,
        keyId: m.keyId,
        remoteJid: m.remoteJid,
        senderJid: m.senderJid,
        pushName: m.pushName
    })));
}
test();
