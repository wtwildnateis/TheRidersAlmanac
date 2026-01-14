export function extractApiMessage(e) {
  const data = e?.response?.data;
  return (
    (typeof data?.message === 'string' && data.message) ||
    (typeof data?.error === 'string' && data.error) ||
    (typeof e?.message === 'string' && e.message) ||
    JSON.stringify(data ?? { error: String(e) })
  );
}