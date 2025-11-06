export const normalizeDateTime = (v) => {
  // Stryker disable next-line ConditionalExpression : behavior is identical for falsy v
  if (!v) return v;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00`;
  return v;
};