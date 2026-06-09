export function euroInputToCents(value: FormDataEntryValue | null): number {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".");
  const euros = Number(normalized);

  if (!Number.isFinite(euros)) {
    return 0;
  }

  return Math.round(euros * 100);
}
