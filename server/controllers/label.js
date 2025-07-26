const { mongoose } = require('../utils/db_connect');

async function getLabels(req, res) {
  // 从数据库中获取标签组
  let labelsList = [];
  try {
    const labels = mongoose.connection.db.collection('labels');
    labelsList = await labels.find().toArray();
  } catch (error) {
    return res.status(500).send({
      code: 500,
      message: '获取标签组失败: 服务器错误',
    });
  }

  return res.status(200).send({
    code: 200,
    message: '获取标签组成功',
    data: labelsList
  })
}

// 获取标签组/标签数量
async function getLabelsCount(req, res) {
  // 从数据库中获取标签组
  let labelsList = [];
  try {
    const labels = mongoose.connection.db.collection('labels');
    labelsList = await labels.find().toArray();
    const groupCount = labelsList.length;
    const labelCount = labelsList.reduce((count, label) => count + label.options.length, 0);
    return res.status(200).send({
      code: 200,
      message: '获取标签组成功',
      data: {
        groupCount,
        labelCount
      }
    })
  } catch (error) {
    return res.status(500).send({
      code: 500,
      message: '获取标签组失败: 服务器错误',
    });
  }
}

module.exports = {
  getLabels,
  getLabelsCount,
}