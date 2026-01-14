export function slugify(s = '') {
  return String(s)
    .normalize('NFD').replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'tag';
}