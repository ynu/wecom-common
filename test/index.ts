import { ok } from 'assert';
import { WecomError, getToken } from '../index';
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
    it('通过环境变量输入参数，正常获取token', async () => {
      const token = await getToken(options);
      console.log('**', token)
      ok(token);
    });
  });
});