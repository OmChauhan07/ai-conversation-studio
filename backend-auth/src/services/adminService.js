const { prisma } = require('../config/database');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isVerified: true,
  createdAt: true,
};

const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: userSelect,
  });

  return users;
};

const updateUserRole = async (actorId, targetUserId, nextRole) => {
  if (!['ADMIN', 'USER'].includes(nextRole)) {
    throw createHttpError(400, 'Invalid role.');
  }

  if (actorId === targetUserId) {
    throw createHttpError(403, 'Forbidden');
  }

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: nextRole },
    select: userSelect,
  });

  return updatedUser;
};

module.exports = {
  getAllUsers,
  updateUserRole,
};