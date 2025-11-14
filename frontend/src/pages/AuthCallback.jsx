import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import { toast } from 'sonner';
import Loading from '../components/Loading';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Đăng nhập Google thất bại: ' + error);
      navigate('/login');
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        authUtils.setToken(token);
        authUtils.setUser(user);
        toast.success('Đăng nhập Google thành công!');
        navigate('/rooms');
      } catch (err) {
        toast.error('Lỗi xử lý dữ liệu đăng nhập');
        navigate('/login');
      }
    } else {
      toast.error('Thiếu thông tin đăng nhập');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <Loading fullscreen type="github" />;
};

export default AuthCallback;

