import api from './api';

/** Fire a lightweight event others can listen for to refetch */
function broadcast(type, payload) {
  try {
    window.dispatchEvent(
      new CustomEvent('ra:events:changed', { detail: { type, ...payload } })
    );
  } catch {
    // no-op in non-DOM environments (SSR/tests)
  }
}

/**
 * Fetch events in an optional time window.
 * @param {{from?: string|number|Date, to?: string|number|Date}} [opts]
 * @returns {Promise<any[]>} EventResponse[]
 */
export async function listEvents({ from, to } = {}) {
  const params = {};
  if (from) params.from = from;
  if (to) params.to = to;
  const { data } = await api.get('/api/events', { params });
  return data;
}

/**
 * Create an event and notify listeners.
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function createEvent(body) {
  const { data } = await api.post('/api/events', body);
  broadcast('create', { event: data });
  return data;
}

/**
 * Update an event and notify listeners.
 * @param {number|string} id
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function updateEvent(id, body) {
  const { data } = await api.put(`/api/events/${id}`, body);
  broadcast('update', { id, event: data });
  return data;
}

/**
 * Delete an event and notify listeners.
 * @param {number|string} id
 * @returns {Promise<void>}
 */
export async function deleteEvent(id) {
  await api.delete(`/api/events/${id}`);
  broadcast('delete', { id });
}

/**
 * @typedef {Object} UpcomingEvent
 * @property {number} id
 * @property {string} title
 * @property {string} start
 * @property {string} end
 * @property {string} type
 * @property {string} location
 * @property {string=} flyer
 */

/**
 * Fetch the next upcoming events.
 * Backend: GET /api/events/upcoming?limit=5
 * @param {number} [limit=5]
 * @returns {Promise<UpcomingEvent[]>}
 */
export async function listUpcoming(limit = 5) {
  const { data } = await api.get('/api/events/upcoming', { params: { limit } });
  return data;
}