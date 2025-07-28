// admin/login.js
const express = require('express');
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { login,isLoggedIn } = require('../controllers/admin/verify');
const { labelsOperate, getTokenResource, publicResourceUpload
    , publicResourceDelete, publicResourceUpdate
} = require('../controllers/admin/operate');

router.post('/login', login);
router.get('/islogin', isLoggedIn);

// 管理员操作
router.post('/oper/label', labelsOperate);
router.get('/oper/resource/token/get', getTokenResource);
router.post('/oper/resource/upload', upload.single('file'), publicResourceUpload);
router.post('/oper/resource/delete', publicResourceDelete);
router.post('/oper/resource/update', publicResourceUpdate);

module.exports = router;