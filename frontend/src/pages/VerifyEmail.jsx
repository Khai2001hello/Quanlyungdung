import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from '../api/axios';
import { Button } from '../components/ui/button';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Xác thực email thành công!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.');
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Đang xác thực email...
            </h2>
            <p className="text-gray-600">
              Vui lòng chờ trong giây lát.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Xác thực thành công! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
            </p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Đăng nhập ngay
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Xác thực thất bại
            </h2>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Quay lại đăng nhập
              </Button>
              <p className="text-sm text-gray-500">
                Hoặc đăng nhập và yêu cầu gửi lại email xác thực mới.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
