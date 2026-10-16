import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { LOCALE_COOKIE, resolveLocale } from "./config";

export default getRequestConfig(async () => {
    const store = await cookies();
    const locale = resolveLocale(store.get(LOCALE_COOKIE)?.value, process.env.DEFAULT_LANGUAGE);

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
        timeZone: process.env.TZ || "Asia/Jakarta",
    };
});
