export function showUserName(x) {
  if (!x) return "user";

  return (
    x.authorUsername ||          // <-- from PostResponse
    x.authorName ||
    x.author?.username ||
    x.author?.name ||
    x.user?.username ||
    x.userName ||
    x.username ||
    x.createdByUsername ||
    x.createdBy?.username ||
    "user"
  );
}