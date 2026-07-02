const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles');
const { listUsers, changeUserRole, toggleStatus, removeUser } = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/users', listUsers);
router.patch('/users/:id/role', changeUserRole);
router.patch('/users/:id/status', toggleStatus);
router.delete('/users/:id', removeUser);

module.exports = router;