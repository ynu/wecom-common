/**
 * 企业微信API-通用
 */
 const fetch = require('node-fetch');
 const warn = require('debug')('wecom-common:warn');
 const error = require('debug')('wecom-common:error');
 const info = require('debug')('wecom-common:info');
 const debug = require('debug')('wecom-common:debug');
 const cache = require('memory-cache');
 
 const {
   CORP_ID, // 企业微信ID
   SECRET, // 管理组secret
 } = process.env;
 const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';
 
 
 class WecomError extends Error {
  constructor (code, message) {
    super(message);
    this.code = code;
  }
 }

 /**
  * 获取access_token。
  * @param {String}} secret 用于获取TOKEN的secret，默认为环境变量中的SECRET
  * @returns access_token
  * @seealso https://developer.work.weixin.qq.com/document/10013#第三步：获取access_token
  */
 const getToken = async (options = {}) => {
   const secret = options.secret || SECRET;
   const corpId = options.corpId || CORP_ID;
 
   if (!corpId) {
    throw new WecomError(-1, '必须的参数corpId或环境变量CORP_ID(企业ID)未设置.')
   }
   if (!secret) {
    throw new WecomError(-1, '必须的参数secret未传入,或未设置环境变量SECRET')
   }

   const tokenCacheKey = `wecom-token::${corpId}::${secret}`;
   
   let token = cache.get(tokenCacheKey);
   if (token) {
     debug(`从cache获取token(secret:${secret})`);
     return token;
   } else {
     const res = await fetch(`${qyHost}/gettoken?corpid=${corpId}&corpsecret=${secret}`);
     const result = await res.json();
     if (!result.errcode) {
       debug(`获取token成功::${result.access_token}`);
       cache.put(tokenCacheKey, result.access_token, (result.expires_in - 20)*1000);
       return result.access_token;
     }
     warn('getToken出错:', result);
     throw new WecomError(result.errcode, result.errmsg);
   }
 };
 
 
 /**
  * 获取session和userid
  * @param {String} code 临时登录凭证
  * @see https://developers.weixin.qq.com/miniprogram/dev/dev_wxwork/dev-doc/qywx-api/login/code2session.html
  */
 const code2session = async (code) => {
   const access_token = await getToken();
   if (!access_token) {
     error('获取access_token失败');
     return {};
   }
   info(`access_token:${access_token}`);
   
   const res = await fetch(`${qyHost}/miniprogram/jscode2session?access_token=${access_token}&js_code=${code}&grant_type=authorization_code`);
   const result = await res.json();
   if (!result.errcode) return result;
 
   error('code2session出错:', result);
   return {};
 }
 
 
 module.exports = {
   getToken,
   code2session,
   WecomError,
 };
 
 