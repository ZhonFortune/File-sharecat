// admin/login.js
const express = require('express');
const router = express.Router();

const { login,isLoggedIn } = require('../controllers/admin/verify');
const { labelsOperate, getTokenResource } = require('../controllers/admin/operate');

router.post('/login', login);
router.get('/islogin', isLoggedIn);

// 管理员操作
router.post('/oper/label', labelsOperate);
router.get('/oper/resource/token/get', getTokenResource);

module.exports = router;