/**
 * 企业微信API响应结果
 */
export type WecomResponse = {
  /**
   * 错误码，0表示成功
   */
  errcode: number;

  /**
   * 错误信息
   */
  errmsg: string;

  /**
   * 具体数据
   */
  [key: string]: any,
};