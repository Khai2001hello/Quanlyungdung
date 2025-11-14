import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card } from './ui/card';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-center py-16 ${className}`}
    >
      <Card className="max-w-md w-full bg-white/60 backdrop-blur-sm border-slate-200/50">
        <div className="p-12 text-center">
          {/* Animated icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2 
            }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
              <div className="relative w-20 h-20 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon className="h-10 w-10 text-slate-400" />
              </div>
            </div>
          </motion.div>

          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Action button */}
          {actionLabel && onAction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                onClick={onAction}
                className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {actionLabel}
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default EmptyState;
