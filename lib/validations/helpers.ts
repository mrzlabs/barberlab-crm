import { z } from "zod";

// Los checkboxes de FormData llegan como strings ("true"/"false"/"on").
// z.coerce.boolean() usa Boolean(valor): cualquier string no vacío — incluido
// "false" — se convierte en true. Este helper interpreta el valor literal.
export function formBool(fallback = false) {
  return z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return fallback;
    if (typeof v === "boolean") return v;
    return v === "true" || v === "on" || v === "1";
  }, z.boolean());
}
