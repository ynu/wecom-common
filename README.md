# wecom-common
企业微信基础SDK，包括获取token等操作

## 安装
```
npm i wecom-common
```

## 使用

### 引入包
```
const { WecomError, getToken, code2session } = require('../index');
```

### getToken 获取access_token
```
const token = await getToken({
  corpId: 'xxx',
  secret: 'xxx',
});
```
#### 参数
- options
  - corpId 企业Id，若不设置则由环境变量`CORP_ID`中读取；
  - secret 密钥, 若不设置则由环境变量`SECRET`中读取；
#### 返回值
- 返回`token`

### WecomError
异常类，当获取出错时抛出此异常，`code`变量记录服务器返回的错误代码。

## 注意
1. 为保证能在腾讯云云函数中使用，需要兼容`node v12.16`版本，因此`node-fetch`只能使用v2版本(`node v12` 不支持ES moudle)；
2. `mocha`的测试用例只能在本地运行，且需要传入相关的环境变量。参考格式如下:
```
clear && export CORP_ID=xxxx && export SECRET=xxxxx && mocha
```