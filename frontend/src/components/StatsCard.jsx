import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  gradient = 'from-blue-500 to-purple-600',
  trend,
  description,
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn("relative group", className)}
    >
      <Card className="relative overflow-hidden border-slate-200/50 bg-white/60 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
        
        <div className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                {trend && (
                  <span className={cn(
                    "text-xs font-semibold px-2 py-1 rounded-full",
                    trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                  </span>
                )}
              </div>
              {description && (
                <p className="text-xs text-slate-500 mt-2">{description}</p>
              )}
            </div>
            
            {Icon && (
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
