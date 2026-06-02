export function normalizePhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function maskPhone(phone: string) {
  if (phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}
