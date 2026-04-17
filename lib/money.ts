export function formatInr(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error("formatInr: amount must be an integer (rupees, not paise)");
  }
  if (paise < 0) {
    throw new Error("formatInr: amount must be non-negative");
  }
  return `₹${paise.toLocaleString("en-IN")}`;
}
