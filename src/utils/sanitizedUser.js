exports.sanitizedUser = (user) => {
  if (!user) return null;
  const obj = user.toJSON ? user.toJSON() : user;
  const { password, ...safeUser } = obj;
  return {
    id: safeUser.id,
    name: safeUser.name,
    email: safeUser.email,
    role: safeUser.role,
    followersCount: safeUser.followersCount,
    followingCount: safeUser.followingCount,
  };
};
