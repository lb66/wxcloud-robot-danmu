const cloud = require('wx-server-sdk')
const tencentcloud = require("tencentcloud-sdk-nodejs");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
//聊天机器人
const NlpClient = tencentcloud.nlp.v20190408.Client;
const clientConfig = {
  credential: {
    secretId: "AKIDomERCmF94iJnBRb4AuTwsRBt1qgEZsBK",
    secretKey: "Sl65tW021nALajhY5NQK0TlqgmgaQO9g",
  },
  region: "ap-guangzhou",
  profile: {
    httpProfile: {
      endpoint: "nlp.tencentcloudapi.com",
    },
  },
};
const client = new NlpClient(clientConfig);

exports.main = async (event, context) => {
  let result = '已收到消息～'
  try {
    // 内容安全检查-云调用
    await cloud.openapi.security.msgSecCheck({
      content: event.Content
    })
    // 获取用户个人信息-数据库
    const res = (await db.collection('user').where({
      _id: event.FromUserName
    }).get()).data
    if (res.length !== 0) {
      // 添加用户发送的信息-数据库
      await cloud.database().collection('mess').add({
        data: {
          text: event.Content,
          openid: event.FromUserName,
          flag: false,
          date: db.serverDate(),
          nickName: res[0].nickName,
          avatarUrl: res[0].avatarUrl
        }
      })
    } else {
      // 找不到用户个人信息
      result = '未授权用户信息，发送无效'
    }
  } catch (e) {
    // 安全检查不通过后，catch异常
    result = '消息未通过安全检查'
  }
  //聊天机器人回复
  await  client.ChatBot({"Query": event.Content}).then(
    (data) => {
      console.log(data);
      result=data.Reply
    },
    (err) => {
      console.error("error", err);
    }
  );
  // 发送客服回复消息-云调用
  await cloud.openapi.customerServiceMessage.send({
    touser: event.FromUserName,
    msgtype: 'text',
    text: {
      content: result
    }
  })
  return 'success'
}
