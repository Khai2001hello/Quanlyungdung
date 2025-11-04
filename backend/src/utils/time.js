class TimeUtil {
  // Format date to readable string
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    switch (format) {
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'YYYY-MM-DD HH:mm:ss':
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      case 'HH:mm':
        return `${hours}:${minutes}`;
      default:
        return d.toISOString();
    }
  }

  // Get start of day
  getStartOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // Get end of day
  getEndOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  // Get start of week
  getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Get end of week
  getEndOfWeek(date = new Date()) {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    return this.getEndOfDay(endOfWeek);
  }

  // Get start of month
  getStartOfMonth(date = new Date()) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  // Get end of month
  getEndOfMonth(date = new Date()) {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  // Calculate duration in hours
  getDurationInHours(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end - start) / (1000 * 60 * 60);
  }

  // Calculate duration in minutes
  getDurationInMinutes(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return (end - start) / (1000 * 60);
  }

  // Check if date is today
  isToday(date) {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  }

  // Check if date is in the past
  isPast(date) {
    return new Date(date) < new Date();
  }

  // Check if date is in the future
  isFuture(date) {
    return new Date(date) > new Date();
  }

  // Check if two time ranges overlap
  isTimeOverlap(start1, end1, start2, end2) {
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    return s1 < e2 && s2 < e1;
  }

  // Add hours to date
  addHours(date, hours) {
    const d = new Date(date);
    d.setHours(d.getHours() + hours);
    return d;
  }

  // Add days to date
  addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  // Get time ago string (e.g., "2 hours ago")
  getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    return this.formatDate(date, 'DD/MM/YYYY');
  }

  // Check if booking time is within business hours
  isBusinessHours(startTime, endTime, businessStart = 8, businessEnd = 22) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const startHour = start.getHours();
    const endHour = end.getHours();

    return startHour >= businessStart && endHour <= businessEnd;
  }
}

module.exports = new TimeUtil();

