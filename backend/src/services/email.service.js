const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendVerificationEmail(user, token) {
    try {
      const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
      const verificationLink = `${clientURL}/verify-email/${token}`;
      
      const mailOptions = {
        from: `"Meeting Room System" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '📧 Xác thực địa chỉ email của bạn',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">Chào mừng đến với Meeting Room System! 🎉</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác thực địa chỉ email của bạn để hoàn tất quá trình đăng ký.</p>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin-bottom: 20px;">Click vào nút bên dưới để xác thực email:</p>
              <a href="${verificationLink}" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;">
                ✅ Xác thực Email
              </a>
            </div>
            
            <p style="color: #64748b; font-size: 14px;">
              Hoặc copy link này vào trình duyệt:<br/>
              <a href="${verificationLink}" style="color: #3b82f6; word-break: break-all;">
                ${verificationLink}
              </a>
            </p>
            
            <p style="color: #ef4444; font-size: 14px;">
              ⚠️ Link này sẽ hết hạn sau <strong>24 giờ</strong>.
            </p>
            
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.<br/><br/>
              Trân trọng,<br/>
              <strong>Meeting Room Management System</strong>
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending verification email:', error);
      throw error;
    }
  }

  async sendBookingCreatedEmail(booking) {
    try {
      const { user, room, startTime, endTime, purpose } = booking;
      
      const mailOptions = {
        from: `"Meeting Room System" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '✅ Đặt phòng họp thành công - Chờ phê duyệt',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e293b;">Đặt phòng họp thành công!</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Yêu cầu đặt phòng họp của bạn đã được ghi nhận và đang chờ phê duyệt từ quản trị viên.</p>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #475569;">📋 Thông tin đặt phòng:</h3>
              <p><strong>🏢 Phòng:</strong> ${room.name} (${room.type})</p>
              <p><strong>📅 Thời gian bắt đầu:</strong> ${new Date(startTime).toLocaleString('vi-VN')}</p>
              <p><strong>⏰ Thời gian kết thúc:</strong> ${new Date(endTime).toLocaleString('vi-VN')}</p>
              <p><strong>📝 Mục đích:</strong> ${purpose || 'Không có'}</p>
              <p><strong>📊 Trạng thái:</strong> <span style="color: #f59e0b;">⏳ Chờ phê duyệt</span></p>
            </div>
            
            <p>Bạn sẽ nhận được thông báo khi yêu cầu được phê duyệt hoặc từ chối.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Trân trọng,<br/>
              <strong>Meeting Room Management System</strong>
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Booking created email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending booking created email:', error);
    }
  }

  async sendBookingApprovedEmail(booking) {
    try {
      const { user, room, startTime, endTime } = booking;
      
      const mailOptions = {
        from: `"Meeting Room System" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '✅ Đặt phòng họp đã được phê duyệt',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Đặt phòng đã được phê duyệt! 🎉</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Yêu cầu đặt phòng họp của bạn đã được <strong style="color: #10b981;">phê duyệt</strong>.</p>
            
            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="margin-top: 0; color: #047857;">📋 Thông tin cuộc họp:</h3>
              <p><strong>🏢 Phòng:</strong> ${room.name}</p>
              <p><strong>📅 Thời gian:</strong> ${new Date(startTime).toLocaleString('vi-VN')} - ${new Date(endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            
            <p>Vui lòng đến đúng giờ và chuẩn bị đầy đủ tài liệu cần thiết.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Trân trọng,<br/>
              <strong>Meeting Room Management System</strong>
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Booking approved email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending booking approved email:', error);
    }
  }

  async sendBookingRejectedEmail(booking, reason) {
    try {
      const { user, room, startTime, endTime } = booking;
      
      const mailOptions = {
        from: `"Meeting Room System" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '❌ Đặt phòng họp đã bị từ chối',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ef4444;">Đặt phòng đã bị từ chối</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Rất tiếc, yêu cầu đặt phòng họp của bạn đã bị <strong style="color: #ef4444;">từ chối</strong>.</p>
            
            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="margin-top: 0; color: #b91c1c;">📋 Thông tin đặt phòng:</h3>
              <p><strong>🏢 Phòng:</strong> ${room.name}</p>
              <p><strong>📅 Thời gian:</strong> ${new Date(startTime).toLocaleString('vi-VN')} - ${new Date(endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
              ${reason ? `<p><strong>💬 Lý do:</strong> ${reason}</p>` : ''}
            </div>
            
            <p>Vui lòng liên hệ quản trị viên để biết thêm chi tiết hoặc đặt lại phòng khác.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Trân trọng,<br/>
              <strong>Meeting Room Management System</strong>
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Booking rejected email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending booking rejected email:', error);
    }
  }

  async sendBookingCancelledEmail(booking) {
    try {
      const { user, room, startTime, endTime } = booking;
      
      const mailOptions = {
        from: `"Meeting Room System" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '🔔 Đặt phòng họp đã bị hủy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #64748b;">Đặt phòng đã bị hủy</h2>
            <p>Xin chào <strong>${user.fullName}</strong>,</p>
            <p>Đặt phòng họp của bạn đã được hủy thành công.</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #475569;">📋 Thông tin đặt phòng đã hủy:</h3>
              <p><strong>🏢 Phòng:</strong> ${room.name}</p>
              <p><strong>📅 Thời gian:</strong> ${new Date(startTime).toLocaleString('vi-VN')} - ${new Date(endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            
            <p>Nếu cần đặt phòng khác, vui lòng tạo yêu cầu mới trên hệ thống.</p>
            <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
              Trân trọng,<br/>
              <strong>Meeting Room Management System</strong>
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Booking cancelled email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending booking cancelled email:', error);
    }
  }
}

module.exports = new EmailService();
