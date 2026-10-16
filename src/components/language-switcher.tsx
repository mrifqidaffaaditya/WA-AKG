"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locales, localeNames } from "@/i18n/config";
import { setUserLocale } from "@/i18n/actions";

export function LanguageSwitcher({ className }: { className?: string }) {
    const t = useTranslations("language");
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onChange = (value: string) => {
        startTransition(async () => {
            try {
                await setUserLocale(value);
                router.refresh();
            } catch {
                toast.error(t("changeFailed"));
            }
        });
    };

    return (
        <Select value={locale} onValueChange={onChange} disabled={isPending}>
            <SelectTrigger size="sm" aria-label={t("label")} className={className}>
                <Languages className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" align="end">
                {locales.map((l) => (
                    <SelectItem key={l} value={l} lang={l}>
                        {localeNames[l]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
