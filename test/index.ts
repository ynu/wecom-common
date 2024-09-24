import { ok } from 'assert';
import {WecomError, getToken, getuserinfo, getuserdetail, structureAuthorizeLink} from '../index';
import { describe, it } from 'node:test';

const {
  CORP_ID,
  SECRET,
} = process.env;

const options = {
  corpId: CORP_ID || '',
  secret: SECRET || '',
};

describe('wecom-common 测试', () => {
  describe('getToken 获取access_token', () => {
    it('输入错误corpid和secret，抛出异常', async () => {
      try {
        await getToken({
          corpId: 'xxx',
          secret: 'xxx',
        });
      } catch (err) {
        if (!(err instanceof WecomError)) throw err;
      }
    });
    it('获取访问用户身份', async () => {
      try {
        const userinfo = await getuserinfo("",{
          corpId: '',
          secret: '',
        });
        console.log(userinfo)
      } catch (err) {
        if (!(err instanceof WecomError)) throw err;
      }
    });
    it('获取访问用户敏感信息', async () => {
      try {
        const userinfo = await getuserdetail("",{
          corpId: '',
          secret: '',
        });
        console.log(userinfo)
      } catch (err) {
        if (!(err instanceof WecomError)) throw err;
      }
    });
    it('构造网页授权链接', async () => {
      try {
        const authorizeLink = {
          corpId: '',
          redirect_uri: '',
          scope: '',
          state: '',
          agentid: '',
        }
        const link = await structureAuthorizeLink(authorizeLink);
        console.log(link)
      } catch (err) {
        if (!(err instanceof WecomError)) throw err;
      }
    });
    it('通过环境变量输入参数，正常获取token', async () => {
      const token = await getToken(options);
      console.log('**', token)
      ok(token);
    });
  });
});