export function validateExpirationDate(expirationDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
    throw new Error("La fecha de vencimiento debe tener formato YYYY-MM-DD");
  }

  const parts = expirationDate.split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error("La fecha de vencimiento no es valida");
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    throw new Error("La fecha de vencimiento no es valida");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  if (parsedDate < today) {
    throw new Error("La fecha de vencimiento no puede ser anterior a hoy");
  }
}
