const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string | null | undefined) {
  return Boolean(value && uuidPattern.test(value));
}

export function assertUuid(value: string | null | undefined, label: string) {
  if (!isUuid(value)) {
    throw new Error(`${label} is not ready yet. Create or select a workspace first.`);
  }
  return value;
}
