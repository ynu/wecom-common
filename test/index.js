const { doesNotMatch } = require('assert');
const assert = require('assert');
const common = require('../index');

const { WecomError, getToken } = common;
describe('common', () => {
  describe('getToken 获取access_token', () => {
    it('输入错误corpid和secret，抛出异常', async () => {
      try {
        await getToken({
          corpId: 'xxx',
          secret: 'xxx',
        });
      } catch (err) {
        if (!(err instanceof WecomError)) throw err;
        else done();
      }
    });
  });
});