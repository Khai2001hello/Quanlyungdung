class NotificationService {
  // Send email notification (placeholder - integrate with actual email service)
  async sendEmail(to, subject, content) {
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('Content:', content);
    
    // TODO: Integrate with email service (nodemailer, SendGrid, etc.)
    // Example:
    // const transporter = nodemailer.createTransport({...});
    // await transporter.sendMail({ to, subject, html: content });
    
    return { success: true, message: 'Email sent (placeholder)' };
  }

  // Send booking confirmation
  async sendBookingConfirmation(booking) {
    const subject = 'Booking Confirmation';
    const content = `
      <h2>Booking Confirmed</h2>
      <p>Your booking has been created successfully.</p>
      <ul>
        <li>Room: ${booking.room.name}</li>
        <li>Date: ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li>Time: ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</li>
        <li>Status: ${booking.status}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, content);
  }

  // Send booking approval notification
  async sendBookingApproval(booking) {
    const subject = 'Booking Approved';
    const content = `
      <h2>Booking Approved</h2>
      <p>Your booking has been approved.</p>
      <ul>
        <li>Room: ${booking.room.name}</li>
        <li>Date: ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li>Time: ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, content);
  }

  // Send booking rejection notification
  async sendBookingRejection(booking, reason) {
    const subject = 'Booking Rejected';
    const content = `
      <h2>Booking Rejected</h2>
      <p>Your booking has been rejected.</p>
      <ul>
        <li>Room: ${booking.room.name}</li>
        <li>Date: ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li>Reason: ${reason}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, content);
  }

  // Send booking reminder (for scheduled reminders)
  async sendBookingReminder(booking) {
    const subject = 'Booking Reminder';
    const content = `
      <h2>Upcoming Booking Reminder</h2>
      <p>This is a reminder for your upcoming booking.</p>
      <ul>
        <li>Room: ${booking.room.name}</li>
        <li>Date: ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li>Time: ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, content);
  }

  // Send booking cancellation notification
  async sendBookingCancellation(booking, reason) {
    const subject = 'Booking Cancelled';
    const content = `
      <h2>Booking Cancelled</h2>
      <p>A booking has been cancelled.</p>
      <ul>
        <li>Room: ${booking.room.name}</li>
        <li>Date: ${new Date(booking.startTime).toLocaleDateString()}</li>
        <li>Reason: ${reason || 'Not specified'}</li>
      </ul>
    `;

    return await this.sendEmail(booking.user.email, subject, content);
  }
}

module.exports = new NotificationService();

