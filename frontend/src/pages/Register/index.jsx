import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { validator } from '../../utils/validator';
import './Register.css';

/**
 * 注册页面
 */
const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    account: '',
    password: '',
    confirmPassword: '',
    nickname: ''
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
    
    const passwordValidation = validator.validatePassword(formData.password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }
    
    const confirmValidation = validator.validateConfirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (!confirmValidation.valid) {
      newErrors.confirmPassword = confirmValidation.message;
    }
    
    const nicknameValidation = validator.validateNickname(formData.nickname);
    if (!nicknameValidation.valid) {
      newErrors.nickname = nicknameValidation.message;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const result = await authApi.register({
        account: formData.account,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        nickname: formData.nickname
      });
      
      if (result.code === 200) {
        toast.success('注册成功，请登录');
        navigate('/login');
      }
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>语你相伴</h1>
          <p>AI情感陪护虚拟数字人</p>
        </div>
        
        <div className="register-card">
          <h2>创建账号</h2>
          <p className="register-subtitle">填写以下信息，开启您的陪伴之旅</p>
          
          <form onSubmit={handleSubmit} className="register-form">
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
              <label>昵称</label>
              <input
                type="text"
                name="nickname"
                className={`input ${errors.nickname ? 'input-error' : ''}`}
                placeholder="请输入昵称（2-16个字符）"
                value={formData.nickname}
                onChange={handleChange}
              />
              {errors.nickname && <span className="error-text">{errors.nickname}</span>}
            </div>
            
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                name="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="至少8位，包含字母和数字/特殊字符"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label>确认密码</label>
              <input
                type="password"
                name="confirmPassword"
                className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="请再次输入密码"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary register-btn"
              disabled={loading}
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
          
          <div className="register-footer">
            <p>已有账号？ <Link to="/login">立即登录</Link></p>
          </div>
        </div>
        
        <div className="register-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
