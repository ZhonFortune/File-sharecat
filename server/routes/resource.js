// api/resource
const express = require('express');
const router = express.Router();

const { getResources, getResourceNum, getTokenResource } = require('../controllers/resource');

router.get('/publicget', getResources);
router.get('/tokenget', getTokenResource);
router.get('/getnum', getResourceNum);

module.exports = router;