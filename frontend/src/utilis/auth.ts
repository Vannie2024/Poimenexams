export function getCurrentUser() {
  const user = localStorage.getItem("user");

  if (!user) return null;

  return JSON.parse(user);
}

export function isAdmin() {
  const user = getCurrentUser();

  return user?.role === "ADMIN";
}