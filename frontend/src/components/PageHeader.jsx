import { motion } from 'framer-motion';
import { Badge } from './ui/badge';

const PageHeader = ({ 
  icon: Icon,
  title,
  description,
  badge,
  actions,
  gradient = "from-blue-500/5 to-purple-500/5"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 relative"
    >
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-3xl blur-3xl`}></div>
      
      {/* Glass card */}
      <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          {/* Left side - Icon & Text */}
          <div className="flex items-center gap-4 flex-1">
            {Icon && (
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  {title}
                </h1>
                {badge && (
                  <Badge className="bg-blue-100 text-blue-700 text-sm px-3 py-1">
                    {badge}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-slate-600 text-sm mt-1">{description}</p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          {actions && (
            <div className="flex items-center gap-2 sm:ml-auto flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PageHeader;
