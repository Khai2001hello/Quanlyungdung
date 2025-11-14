import React from 'react';
import { Loader2, Github, Bot, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

const Loading = ({ fullscreen = false, type = 'robot3d' }) => {
  // 3D Robot Loading (như hình)
  const Robot3D = () => {
    return (
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Glow effect background */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)',
            filter: 'blur(40px)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Robot body - main container */}
        <motion.div
          className="relative z-10"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Robot head with goggles */}
          <div className="relative w-32 h-32">
            {/* Head base */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.5), inset 0 -5px 20px rgba(0, 0, 0, 0.2)'
              }}
              animate={{
                rotate: [-2, 2, -2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Face plate (darker area) */}
              <div className="absolute inset-x-6 top-10 bottom-6 bg-gradient-to-b from-blue-900/80 to-indigo-900/90 rounded-2xl" 
                   style={{ boxShadow: 'inset 0 4px 10px rgba(0, 0, 0, 0.5)' }}>
                
                {/* Glowing eyes */}
                <div className="absolute top-6 left-0 right-0 flex justify-center gap-4">
                  <motion.div
                    className="w-3 h-6 bg-cyan-400 rounded-full"
                    style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}
                    animate={{
                      opacity: [1, 0.3, 1],
                      scaleY: [1, 0.2, 1]
                    }}
                    transition={{
                      duration: 0.15,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="w-3 h-6 bg-cyan-400 rounded-full"
                    style={{ boxShadow: '0 0 20px rgba(34, 211, 238, 0.8)' }}
                    animate={{
                      opacity: [1, 0.3, 1],
                      scaleY: [1, 0.2, 1]
                    }}
                    transition={{
                      duration: 0.15,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut"
                    }}
                  />
                </div>

                {/* Mouth/speaker line */}
                <motion.div 
                  className="absolute bottom-4 left-6 right-6 h-1 bg-blue-400/50 rounded-full"
                  animate={{
                    scaleX: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Goggles on top */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                <motion.div
                  className="w-12 h-8 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full border-4 border-blue-400"
                  style={{ 
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.3)',
                    background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.8) 0%, rgba(96, 165, 250, 0.9) 100%)'
                  }}
                  animate={{
                    rotateZ: [-3, 3, -3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="w-12 h-8 bg-gradient-to-b from-blue-300 to-blue-500 rounded-full border-4 border-blue-400"
                  style={{ 
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.3)',
                    background: 'linear-gradient(135deg, rgba(147, 197, 253, 0.8) 0%, rgba(96, 165, 250, 0.9) 100%)'
                  }}
                  animate={{
                    rotateZ: [-3, 3, -3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Antenna */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-gradient-to-t from-blue-500 to-transparent"
                animate={{
                  scaleY: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full"
                  style={{ boxShadow: '0 0 15px rgba(34, 211, 238, 0.9)' }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>

              {/* Side highlights */}
              <div className="absolute top-8 left-2 w-1 h-8 bg-gradient-to-b from-blue-300/60 to-transparent rounded-full" />
              <div className="absolute top-8 right-2 w-1 h-8 bg-gradient-to-b from-blue-300/60 to-transparent rounded-full" />
            </motion.div>

            {/* Floating particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400/60 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-20, -60],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Bottom glow ring */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-2 rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.6) 0%, transparent 70%)',
            filter: 'blur(10px)'
          }}
          animate={{
            scaleX: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    );
  };

  // Other loading types...
  const spinVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const LoadingIcon = () => {
    if (type === 'robot3d') {
      return <Robot3D />;
    }

    switch(type) {
      case 'github':
        return (
          <motion.div variants={spinVariants} animate="animate" className="relative">
            <Github className="h-12 w-12 text-slate-700" />
            <motion.div
              variants={pulseVariants}
              animate="animate"
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-30"
            />
          </motion.div>
        );
      
      case 'calendar':
        return (
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <CalendarDays className="h-12 w-12 text-slate-700" />
          </motion.div>
        );
      
      default:
        return (
          <motion.div variants={spinVariants} animate="animate">
            <Loader2 className="h-12 w-12 text-indigo-600" />
          </motion.div>
        );
    }
  };

  if (fullscreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <LoadingIcon />
        
        {/* Loading text with animated dots */}
        <motion.div 
          className="mt-8 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xl font-medium text-slate-700">Đang tải</p>
          <motion.span
            className="text-slate-700"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            .
          </motion.span>
          <motion.span
            className="text-slate-700"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            .
          </motion.span>
          <motion.span
            className="text-slate-700"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          >
            .
          </motion.span>
        </motion.div>

        {/* Animated progress bar */}
        <div className="mt-6 w-64 h-1 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
            animate={{
              x: [-256, 256],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ width: '50%' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <LoadingIcon />
    </div>
  );
};

export default Loading;
