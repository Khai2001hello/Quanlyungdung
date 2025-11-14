import { useState } from 'react';
import { AlertCircle, Mail, X } from 'lucide-react';
import { Button } from './ui/button';
import axios from '../api/axios';

export default function EmailVerificationBanner({ user }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Don't show banner if:
  // - User dismissed it
  // - Email is verified
  // - User logged in with Google
  if (!isVisible || user?.isEmailVerified || user?.provider === 'google') {
    return null;
  }

  const handleResendEmail = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('/auth/resend-verification');
      setMessage(response.data.message || 'Email xác thực đã được gửi lại!');
      
      // Auto-hide message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email chưa được xác thực
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Vui lòng xác thực email để sử dụng đầy đủ tính năng đặt phòng họp. 
              Kiểm tra hộp thư <strong>{user?.email}</strong> (bao gồm cả thư mục spam).
            </p>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="bg-white hover:bg-yellow-50 text-yellow-800 border-yellow-300"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang gửi...' : 'Gửi lại email xác thực'}
            </Button>
            {message && (
              <span className={`text-sm ${message.includes('lỗi') ? 'text-red-600' : 'text-green-600'}`}>
                {message}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 ml-3 text-yellow-400 hover:text-yellow-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
