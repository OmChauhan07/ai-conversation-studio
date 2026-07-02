const { prisma } = require('../config/database');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
};

const getProfileByUserId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });

  if (!user) {
    throw createHttpError(404, 'User not found.');
  }

  return user;
};

const updateProfileByUserId = async (userId, payload) => {
  const updateData = {};

  if (typeof payload.name === 'string') {
    const trimmedName = payload.name.trim();

    if (!trimmedName) {
      throw createHttpError(400, 'Name cannot be empty.');
    }

    updateData.name = trimmedName;
  }

  if (Object.keys(updateData).length === 0) {
    throw createHttpError(400, 'No valid profile fields provided.');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: profileSelect,
  });

  return user;
};

module.exports = {
  getProfileByUserId,
  updateProfileByUserId,
};