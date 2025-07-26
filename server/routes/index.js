// api
const express = require('express');
const router = express.Router();

const labelAPI = require('./label');
const resourceAPI = require('./resource');
const adminAPI = require('./admin');

router.use('/label', labelAPI);
router.use('/resource', resourceAPI);
router.use('/admin', adminAPI);

module.exports = router;