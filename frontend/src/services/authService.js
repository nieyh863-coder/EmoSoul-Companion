import request from '../utils/request';

/**
 * 认证相关API
 */
export const authApi = {
  // 注册
  register: (data) => {
    return request.post('/auth/register', data);
  },

  // 登录
  login: (data) => {
    return request.post('/auth/login', data);
  },

  // 退出登录
  logout: () => {
    return request.post('/auth/logout');
  },

  // 刷新Token
  refreshToken: () => {
    return request.post('/auth/refresh');
  }
};

export default authApi;
