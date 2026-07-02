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
  status: true,
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

const toggleUserStatus = async (actorId, targetUserId) => {
  if (actorId === targetUserId) {
    throw createHttpError(403, 'Forbidden');
  }
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, status: true },
  });
  if (!user) throw createHttpError(404, 'User not found.');
  
  const nextStatus = user.status === 'Active' ? 'Suspended' : 'Active';
  
  const updatedUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { status: nextStatus },
    select: userSelect,
  });
  return updatedUser;
};

const deleteUser = async (actorId, targetUserId) => {
  if (actorId === targetUserId) {
    throw createHttpError(403, 'Cannot delete yourself.');
  }
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw createHttpError(404, 'User not found.');

  // Clean up related data across backend-ai tables
  await prisma.$executeRawUnsafe(`DELETE FROM "Feedback" WHERE "userId" = $1`, targetUserId);
  await prisma.$executeRawUnsafe(`DELETE FROM "UploadedDocument" WHERE "userId" = $1`, targetUserId);
  await prisma.$executeRawUnsafe(`DELETE FROM "PromptRun" WHERE "promptId" IN (SELECT id FROM "Prompt" WHERE "userId" = $1)`, targetUserId);
  await prisma.$executeRawUnsafe(`DELETE FROM "Prompt" WHERE "userId" = $1`, targetUserId);
  await prisma.$executeRawUnsafe(`DELETE FROM "Message" WHERE "conversationId" IN (SELECT id FROM "Conversation" WHERE "userId" = $1)`, targetUserId);
  await prisma.$executeRawUnsafe(`DELETE FROM "Conversation" WHERE "userId" = $1`, targetUserId);

  await prisma.user.delete({ where: { id: targetUserId } });
  return true;
};

module.exports = {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
};