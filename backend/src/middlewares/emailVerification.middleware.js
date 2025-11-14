/**
 * Middleware to check if user's email is verified
 * - Google OAuth users are auto-verified (skip check)
 * - Local auth users must verify email before booking
 */
const checkEmailVerified = (req, res, next) => {
  const user = req.user;

  // Skip check for admin (admin can do everything)
  if (user.role === 'admin') {
    return next();
  }

  // Skip check for Google OAuth users (already verified)
  if (user.provider === 'google') {
    return next();
  }

  // Check if email is verified for local auth users
  if (!user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Vui lòng xác thực email trước khi đặt phòng. Kiểm tra hộp thư của bạn hoặc yêu cầu gửi lại email xác thực.',
      code: 'EMAIL_NOT_VERIFIED'
    });
  }

  next();
};

module.exports = {
  checkEmailVerified
};
