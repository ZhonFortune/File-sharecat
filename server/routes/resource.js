// api/resource
const express = require('express');
const router = express.Router();

const { getResources, getResourceNum, getTokenResource } = require('../controllers/resource');
const { handlePushDownloadToken, handleDownload, } = require('../controllers/resource');

router.get('/publicget', getResources);
router.get('/tokenget', getTokenResource);
router.get('/getnum', getResourceNum);

router.post('/reqdownload', handlePushDownloadToken);
router.get('/download', handleDownload);

module.exports = router;