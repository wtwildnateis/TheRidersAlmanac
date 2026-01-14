import api from './api';

// posts
export async function feed({ page = 0, size = 20, tags = [], match = 'OR' } = {}) {
  const params = { page, size, match };
  if (Array.isArray(tags) && tags.length) params.tags = tags; // array of slugs
  const { data } = await api.get('/api/forum/posts', { params });
  return data;
}

export async function getPost(id) {
  const { data } = await api.get(`/api/forum/posts/${id}`);
  return data; // postResponse
}

export async function createPost(body) {
  const { data } = await api.post('/api/forum/posts', body);
  return data;
}

export async function updatePost(id, body) {
  const { data } = await api.put(`/api/forum/posts/${id}`, body);
  return data;
}

export async function deletePost(id) {
  await api.delete(`/api/forum/posts/${id}`);
}

export async function togglePostLock(id, locked) {
  const { data } = await api.put(`/api/forum/posts/${id}`, { locked });
  return data; // PostResponse
}

// comments
export async function listComments(postId, {page=0,size=20}={}) {
  const { data } = await api.get(`/api/forum/posts/${postId}/comments`, { params:{ page, size }});
  return data; // PageResponse<CommentResponse>
}

export async function addComment(body) {
  const { data } = await api.post('/api/forum/comments', body);
  return data;
}

export async function updateComment(id, body) {
  const { data } = await api.put(`/api/forum/comments/${id}`, body);
  return data;
}

export async function deleteComment(id) {
  await api.delete(`/api/forum/comments/${id}`);
}

// tags
export async function listTags() {
  const { data } = await api.get('/api/forum/tags');
  return (data || []).map(t => ({
    id: t.id,
    slug: t.slug,
    label: t.label,
  }));
}

export async function listDisabledTags() {
  const { data } = await api.get('/api/forum/tags/disabled');
  return (data || []).map(t => ({
    id: t.id,
    slug: t.slug,
    label: t.label,
  }));
}

export async function listTopTags(limit = 5) {
  const { data } = await api.get('/api/forum/tags/top', { params: { limit } });
  return (data || []).map(t => ({
    id: t.id,
    slug: t.slug,
    label: t.label,
  }));
}

export async function createTag(body) {
  const { data } = await api.post('/api/forum/tags', body);
  return data;
}

// "Delete" == disable
export async function deleteTag(id) {
  await api.patch(`/api/forum/tags/${id}`, { enabled: false });
}

export async function enableTag(id) {
  await api.patch(`/api/forum/tags/${id}`, { enabled: true });
}

export async function togglePostHidden(id, hidden) {
  const { data } = await api.put(`/api/forum/posts/${id}`, { hidden });
  return data; // PostResponse
}

// --- trending ---
export async function trending({ window = "7d", limit = 5 } = {}) {
  const { data } = await api.get('/api/forum/posts/trending', { params: { window, limit } });
  return data; // Page/List of PostResponse (light)
}