"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "./config";

export async function setUserLocale(locale: string) {
    if (!isLocale(locale)) {
        throw new Error(`Unsupported locale: ${locale}`);
    }

    const store = await cookies();
    store.set(LOCALE_COOKIE, locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
    });
}
