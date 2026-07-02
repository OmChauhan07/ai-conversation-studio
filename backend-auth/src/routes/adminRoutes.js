const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/authorizeRoles');
const { listUsers, changeUserRole } = require('../controllers/adminController');

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/users', listUsers);
router.patch('/users/:id/role', changeUserRole);

module.exports = router;