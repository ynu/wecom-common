/**
 * 企业微信API-通用
 */
import axios from 'axios';
import Debug from 'debug';
import * as cache from 'memory-cache';
import { decrypt } from '@wecom/crypto';
import process = require('node:process');
import { WecomResponse } from './types';
const warn = Debug('wecom-common:warn');
const error = Debug('wecom-common:error');
const info = Debug('wecom-common:info');
const debug = Debug('wecom-common:debug');
//  console.log(ax);
 const {
   CORP_ID, // 企业微信ID
   SECRET, // 管理组secret
   ENCODING_AES_KEY, // 接收消息-EncodingAESKey
 } = process.env;
 export const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';
 
 export const post = axios.post<WecomResponse>;
 export const get = axios.get<WecomResponse>;

 export class WecomError extends Error {
  constructor (public code:number, message: string) {
    super(message);
    this.code = code;
  }
 }

 export type GetToken = {
  corpId?: string,
  secret?: string,
}

 /**
  * 获取access_token。
  * @param {String} secret 用于获取TOKEN的secret，默认为环境变量中的SECRET
  * @returns access_token
  * @seealso https://developer.work.weixin.qq.com/document/10013#第三步：获取access_token
  */
 export const getToken = async (options: GetToken): Promise<string> => {
   const secret = options?.secret || SECRET;
   const corpId = options?.corpId || CORP_ID;
 
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
    const { data } = await get(`${qyHost}/gettoken?corpid=${corpId}&corpsecret=${secret}`);
     if (!data.errcode) {
       debug(`获取token成功::${data.access_token}`);
       cache.put(tokenCacheKey, data.access_token, (data.expires_in - 20)*1000);
       return data.access_token;
     }
     warn('getToken出错:', data);
     throw new WecomError(data.errcode, data.errmsg);
   }
 };

/**
 * 获取session和userid
 * @param {String} code 临时登录凭证
 * @see https://developers.weixin.qq.com/miniprogram/dev/dev_wxwork/dev-doc/qywx-api/login/code2session.html
 */
export const code2session = async (code: string, options:GetToken) => {
    const access_token = await getToken(options);
    if (!access_token) {
        error('获取access_token失败');
        return {};
    }
    info(`access_token:${access_token}`);

    const res = await get(`${qyHost}/miniprogram/jscode2session?access_token=${access_token}&js_code=${code}&grant_type=authorization_code`);
    const result = res.data;
    if (!result.errcode) return result;

    error('code2session出错:', result);
    return {};
}

/**
 * 获取访问用户身份
 * @param {String} code 通过成员授权获取到的code，最大为512字节。每次成员授权带上的code将不一样，code只能使用一次，5分钟未被使用自动过期
 * @see https://developer.work.weixin.qq.com/document/path/91023
 */
 export const getuserinfo = async (code: string, options:GetToken) => {
   const access_token = await getToken(options);
   if (!access_token) {
     error('获取access_token失败');
     return {};
   }
   info(`access_token:${access_token}`);
   
   const res = await get(`${qyHost}/auth/getuserinfo?access_token=${access_token}&code=${code}`);
   const result = res.data;
   if (!result.errcode) return result;
   error('getuserinfo出错:', result);
   return {};
 }

/**
 * 获取访问用户敏感信息
 * @param {String} user_ticket 成员票据
 * @see https://developer.work.weixin.qq.com/document/path/91023
 */
export const getuserdetail = async (user_ticket: string, options:GetToken) => {
    const access_token = await getToken(options);
    if (!access_token) {
        error('获取access_token失败');
        return {};
    }
    info(`access_token:${access_token}`);
    const res = await post(`${qyHost}/auth/getuserdetail?access_token=${access_token}`, {user_ticket: user_ticket});
    const result = res.data;
    if (!result.errcode) return result;
    error('getuserdetail出错:', result);
    return {};
}
 
/**
 * 接收消息与事件-验证URL有效性
 * @param {String} echostr 加密的字符串
 * @param {Object} options 参数
 *  - @param {Function} success 验证成功后的处理函数，默认为云函数http方式返回
 *  - @param {Function} fail 验证失败后的处理函数，默认为云函数http方式返回
 *  - @param {String} encoding_aes_key 消息接收服务器EncodingAESKey，默认由ENCODING_AES_KEY获取
 */
export const verifyUrl = (
  echostr: string,
  options:any,
) => {
  const encoding_aes_key = options?.encoding_aes_key || ENCODING_AES_KEY;
  const corpId = options.corpId || CORP_ID;
  const success = options.success || ((message:any) => {
    return {
      isBase64Encoded: false,
      statusCode: 200,
      headers: {
        'Content-Type': 'text/text',
      },
      body: message,
    };
  });
  const fail = options.fail || (() => {
    return {
      isBase64Encoded: false,
      statusCode: 401,
      headers: {
        'Content-Type': 'text/text',
      },
    };
 });
  const { message, id } = decrypt(encoding_aes_key, echostr);
  if(id === corpId) {
    info(`URL验证成功, message=${message}`);
    return success(message);
  } else {
    info(`URL验证失败,当前配置corpId(${corpId})与URL中的corpId(${id}不一致)`);
    return fail();
  }
};

export * from './types';
