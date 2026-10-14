/** Strip things that look like personal numbers (NIN, phone, card) before a query leaves the server. */
export function redact(text: string): string {
  return text
    .replace(/\b\d{8}-\d{5}-\d{5}-\d{2}\b/g, "[NIN]")
    .replace(/(\+?255|0)[67]\d{8}\b/g, "[SIMU]")
    .replace(/\b\d{9,}\b/g, "[NAMBA]")
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[EMAIL]")
    .slice(0, 500);
}
