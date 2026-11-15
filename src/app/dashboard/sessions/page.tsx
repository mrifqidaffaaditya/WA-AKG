import { auth } from "@/lib/auth";
import { SessionManager } from "@/components/dashboard/session-manager";
import { getTranslations } from "next-intl/server";

export default async function SessionsPage() {
    const session = await auth();
    const t = await getTranslations("sessions");

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
            <SessionManager user={session?.user} />
        </div>
    );
}

