"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { useTranslations } from "next-intl";

interface RegistrationWarningProps {
    role?: string;
    registrationEnabled?: boolean;
}

export function RegistrationWarning({ role, registrationEnabled }: RegistrationWarningProps) {
    const t = useTranslations("settings");

    useEffect(() => {
        if (role === "SUPERADMIN" && registrationEnabled) {
            // Delay toast slightly to wait for `<Toaster>` provider mount in layout
            const timer = setTimeout(() => {
                toast(t("registrationWarningTitle"), {
                    description: t("registrationWarningDesc"),
                    icon: <ShieldAlert className="text-amber-500 w-5 h-5" />,
                    duration: 8000,
                    position: "top-center",
                    action: {
                        label: t("registrationWarningAction"),
                        onClick: () => window.location.href = "/dashboard/settings"
                    }
                });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [role, registrationEnabled, t]);

    return null;
}
