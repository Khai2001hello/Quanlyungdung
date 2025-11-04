class Validator {
  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  isValidPassword(password) {
    // At least 6 characters
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' };
    }

    // You can add more rules here
    // - At least one uppercase letter
    // - At least one lowercase letter
    // - At least one number
    // - At least one special character

    return { valid: true, message: 'Password is valid' };
  }

  // Validate phone number
  isValidPhoneNumber(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  // Validate date range
  isValidDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, message: 'Invalid date format' };
    }

    if (end <= start) {
      return { valid: false, message: 'End date must be after start date' };
    }

    return { valid: true, message: 'Date range is valid' };
  }

  // Validate time slot (must be in the future)
  isValidTimeSlot(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
      return { valid: false, message: 'Start time must be in the future' };
    }

    if (end <= start) {
      return { valid: false, message: 'End time must be after start time' };
    }

    // Check if booking is within business hours (8 AM - 10 PM)
    const startHour = start.getHours();
    const endHour = end.getHours();

    if (startHour < 8 || endHour > 22) {
      return { valid: false, message: 'Bookings must be between 8 AM and 10 PM' };
    }

    return { valid: true, message: 'Time slot is valid' };
  }

  // Validate booking duration (max 8 hours)
  isValidDuration(startTime, endTime, maxHours = 8) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = (end - start) / (1000 * 60 * 60);

    if (durationHours > maxHours) {
      return { valid: false, message: `Booking duration cannot exceed ${maxHours} hours` };
    }

    if (durationHours < 0.5) {
      return { valid: false, message: 'Booking duration must be at least 30 minutes' };
    }

    return { valid: true, message: 'Duration is valid' };
  }

  // Validate required fields
  validateRequiredFields(data, requiredFields) {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!data[field] || data[field] === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return {
        valid: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    return { valid: true, message: 'All required fields are present' };
  }

  // Sanitize string input
  sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    // Remove HTML tags and trim whitespace
    return str.replace(/<[^>]*>/g, '').trim();
  }

  // Validate MongoDB ObjectId
  isValidObjectId(id) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  }
}

module.exports = new Validator();

