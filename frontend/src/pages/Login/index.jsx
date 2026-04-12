import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { validator } from '../../utils/validator';
import './Login.css';

/**
 * 登录页面
 */
const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 如果已登录，跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    const accountValidation = validator.validateAccount(formData.account);
    if (!accountValidation.valid) {
      newErrors.account = accountValidation.message;
    }
    
    if (!formData.password) {
      newErrors.password = '密码不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const result = await authApi.login({
        account: formData.account,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      
      if (result.code === 200) {
        login(result.data.user, result.data.token);
        toast.success('登录成功');
        navigate('/');
      }
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>语你相伴</h1>
          <p>AI情感陪护虚拟数字人</p>
        </div>
        
        <div className="login-card">
          <h2>欢迎回来</h2>
          <p className="login-subtitle">登录您的账号，开启陪伴之旅</p>
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>账号</label>
              <input
                type="text"
                name="account"
                className={`input ${errors.account ? 'input-error' : ''}`}
                placeholder="请输入手机号或邮箱"
                value={formData.account}
                onChange={handleChange}
              />
              {errors.account && <span className="error-text">{errors.account}</span>}
            </div>
            
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                name="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <span>记住我</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary login-btn"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
          
          <div className="login-footer">
            <p>还没有账号？ <Link to="/register">立即注册</Link></p>
          </div>
        </div>
        
        <div className="login-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
