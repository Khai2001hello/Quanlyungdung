// Theme colors and configurations
export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      500: '#64748b',
      700: '#334155',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      700: '#b45309',
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      700: '#b91c1c',
    },
  },
  gradients: {
    primary: 'from-blue-500 to-purple-600',
    dark: 'from-slate-900 to-slate-700',
    light: 'from-slate-50 via-white to-slate-100',
    card: 'from-white/80 to-slate-50/50',
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg shadow-slate-200/50',
    xl: 'shadow-xl shadow-slate-300/50',
    '2xl': 'shadow-2xl shadow-slate-400/50',
    glow: 'shadow-lg shadow-blue-500/20',
  },
  animations: {
    fadeIn: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    },
    slideIn: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    },
  },
  spacing: {
    page: 'px-4 sm:px-6 lg:px-8 py-8',
    section: 'space-y-6',
    card: 'p-6',
  },
  borderRadius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },
  
  // Helper methods
  getStatusStyle: (status) => {
    const styles = {
      available: {
        label: 'Còn trống',
        badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        icon: '✓',
        color: 'emerald',
        text: 'Còn trống'
      },
      pending: {
        label: 'Chờ duyệt',
        badge: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: '⏳',
        color: 'amber',
        text: 'Chờ duyệt'
      },
      confirmed: {
        label: 'Đã phê duyệt',
        badge: 'bg-green-100 text-green-700 border-green-200',
        icon: '✅',
        color: 'green',
        text: 'Đã phê duyệt'
      },
      booked: {
        label: 'Đã đặt',
        badge: 'bg-rose-100 text-rose-700 border-rose-200',
        icon: '🔒',
        color: 'rose',
        text: 'Đã đặt'
      },
      cancelled: {
        label: 'Đã hủy',
        badge: 'bg-red-100 text-red-700 border-red-200',
        icon: '❌',
        color: 'red',
        text: 'Đã hủy'
      },
      maintenance: {
        label: 'Bảo trì',
        badge: 'bg-slate-200 text-slate-700 border-slate-300',
        icon: '🔧',
        color: 'slate',
        text: 'Bảo trì'
      }
    };
    return styles[status] || styles.available;
  },

  getRoomTypeStyle: (type) => {
    const normalized = type?.toLowerCase() || '';
    
    if (normalized.includes('lớn') || normalized === 'large') {
      return {
        label: 'Phòng lớn',
        badge: 'bg-purple-100 text-purple-700',
        icon: '🏢',
        capacityRange: '21-50 người'
      };
    }
    
    if (normalized.includes('trung') || normalized === 'medium') {
      return {
        label: 'Phòng trung bình',
        badge: 'bg-blue-100 text-blue-700',
        icon: '🏠',
        capacityRange: '11-20 người'
      };
    }
    
    return {
      label: 'Phòng nhỏ',
      badge: 'bg-cyan-100 text-cyan-700',
      icon: '📦',
      capacityRange: '1-10 người'
    };
  }
};

// Keep standalone exports for backward compatibility
export const getStatusStyle = theme.getStatusStyle;
export const getRoomTypeStyle = theme.getRoomTypeStyle;
