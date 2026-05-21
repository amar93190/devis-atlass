import { Resend } from "resend";

export const FROM_EMAIL = process.env.RESEND_FROM ?? "support@atlassign.fr";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY est manquant");
    _resend = new Resend(key);
  }
  return _resend;
}
