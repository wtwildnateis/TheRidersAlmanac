function eventOwnerMatchesUser(event, user) {
  if (!event || !user) return false;

  const eventUsernames = [
    event.createdByUsername,
    event.createdBy,
    event.ownerUsername,
    event.authorUsername,
    event.author,
  ].filter(Boolean).map(String);

  const eventIds = [
    event.createdById,
    event.ownerId,
    event.userId,
    event.authorId,
  ].filter(id => id !== null && id !== undefined);

  const usernameMatch = eventUsernames.some(u => u === user.username);
  const idMatch = eventIds.some(id => String(id) === String(user.id));
  return usernameMatch || idMatch;
}
// only owner of event can edit
export function canEditEvent(event, user) {
    return eventOwnerMatchesUser(event, user);
}
// owner of event and staff can delete
export function canDeleteEvent(event, user, hasAnyRoleFn) {
  if (!user) return false;
  const isStaff = hasAnyRoleFn ? hasAnyRoleFn('ADMIN', 'MOD') : false;
  const isOwner = eventOwnerMatchesUser(event, user);
  if (event?.locked) return isStaff;
  return isOwner || isStaff;
}