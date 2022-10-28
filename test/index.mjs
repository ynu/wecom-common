import { ok } from 'assert';
import { WecomError, getToken } from '../index.mjs';

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
      const token = await getToken();
      ok(token);
    });
  });
});