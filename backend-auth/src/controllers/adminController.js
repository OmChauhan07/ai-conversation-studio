const { getAllUsers, updateUserRole, toggleUserStatus, deleteUser } = require('../services/adminService');

const sendError = (res, error) => {
  if (error.statusCode === 403) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  if (error.statusCode === 400 || error.statusCode === 404) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  return res.status(500).json({ success: false, message: 'Internal server error.' });
};

const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    return res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await updateUserRole(req.user.id, id, role);

    return res.json({
      success: true,
      message: 'User role updated successfully.',
      data: user,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const toggleStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await toggleUserStatus(req.user.id, id);
    return res.json({
      success: true,
      message: 'User status updated successfully.',
      data: user,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

const removeUser = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUser(req.user.id, id);
    return res.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  listUsers,
  changeUserRole,
  toggleStatus,
  removeUser,
};