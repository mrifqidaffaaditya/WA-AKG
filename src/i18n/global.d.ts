import type { Locale } from "./config";
import type messages from "./messages/en.json";

// Type-safe translation keys: a typo or missing key in `t("...")` fails `tsc` / `next build`.
declare module "next-intl" {
    interface AppConfig {
        Locale: Locale;
        Messages: typeof messages;
    }
}
