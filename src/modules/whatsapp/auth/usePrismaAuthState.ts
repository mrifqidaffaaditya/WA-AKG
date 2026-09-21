import { prisma } from "@/lib/prisma";
import { AuthenticationCreds, AuthenticationState, BufferJSON, initAuthCreds, SignalDataTypeMap } from "@whiskeysockets/baileys";
import { logger } from "@/lib/logger";
import { encryptData, decryptData } from "@/lib/crypto";

export const usePrismaAuthState = async (sessionId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
    
    // Helper to read JSON with Buffer handling & transparent decryption
    const readData = async (type: string, id: string) => {
        try {
            const key = `${type}-${id}`;
            const data = await prisma.authState.findUnique({
                where: { sessionId_key: { sessionId, key } }
            });
            if (data && data.value) {
                const rawStr = typeof data.value === "string" ? data.value : JSON.stringify(data.value);
                const decryptedStr = decryptData(rawStr);
                return JSON.parse(decryptedStr, BufferJSON.reviver);
            }
            return null;
        } catch (error) {
            logger.error("Auth", 'Error reading auth state:', error);
            return null;
        }
    };

    // Helper to write data with encryption
    const writeData = async (type: string, id: string, data: any) => {
        try {
            const key = `${type}-${id}`;
            const jsonStr = JSON.stringify(data, BufferJSON.replacer);
            const value = encryptData(jsonStr);
            
            await prisma.authState.upsert({
                where: { sessionId_key: { sessionId, key } },
                create: { sessionId, key, value },
                update: { value }
            });
        } catch (error) {
             logger.error("Auth", 'Error writing auth state:', error);
        }
    };

    const removeData = async (type: string, id: string) => {
        try {
            const key = `${type}-${id}`;
             await prisma.authState.deleteMany({
                where: { sessionId, key }
            });
        } catch (error) {
            // ignore
        }
    }


    const creds: AuthenticationCreds = (await readData('creds', 'me')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data: { [key: string]: SignalDataTypeMap[typeof type] } = {};
                    await Promise.all(ids.map(async id => {
                        let value = await readData(type, id);
                        if (type === 'app-state-sync-key' && value) {
                            value = BufferJSON.reviver(null, value);
                        }
                        if (value) {
                            data[id] = value;
                        }
                    }));
                    return data;
                },
                set: async (data) => {
                     const tasks: Promise<void>[] = [];
                    for (const category in data) {
                        const categoryData = data[category as keyof typeof data];
                        if (!categoryData) continue;
                        
                        for (const id in categoryData) {
                            const value = categoryData[id];
                             if (value) {
                                tasks.push(writeData(category, id, value));
                            } else {
                                tasks.push(removeData(category, id));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: async () => {
            await writeData('creds', 'me', creds);
        }
    }
}
