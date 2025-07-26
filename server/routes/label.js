// api/label
const express = require('express');
const router = express.Router();

const { getLabels,getLabelsCount } = require('../controllers/label');

router.get('/get', getLabels);
router.get('/getnum',getLabelsCount);

module.exports = router;