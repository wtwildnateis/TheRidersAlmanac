export function userIsStaff(hasAnyRole) {
  return !!hasAnyRole && hasAnyRole('ADMIN', 'MOD');
}

export function ownerByUsername(obj, user) {
  if (!obj || !user) return false;
  const possibles = [
    obj.authorUsername, obj.createdByUsername, obj.ownerUsername, obj.username
  ].filter(Boolean).map(String);
  return possibles.includes(user.username);
}

export function canEditPost(post, user, hasAnyRole) {
  // Allow owner or staff to edit
  return ownerByUsername(post, user) || userIsStaff(hasAnyRole);
}
export function canDeletePost(post, user, hasAnyRole) {
  // Allow owner or staff to delete
  return ownerByUsername(post, user) || userIsStaff(hasAnyRole);
}
export function canLockPost(post, user, hasAnyRole) {
  // Only staff can lock
  return userIsStaff(hasAnyRole);
}

export function canEditComment(comment, user, hasAnyRole) {
  return ownerByUsername(comment, user) || userIsStaff(hasAnyRole);
}
export function canDeleteComment(comment, user, hasAnyRole) {
  return ownerByUsername(comment, user) || userIsStaff(hasAnyRole);
}