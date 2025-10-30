import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LogoAnimation() {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const hasSeenAnimation = localStorage.getItem("hasSeenLogoAnimation");
    
    if (!hasSeenAnimation) {
      setShowAnimation(true);
      localStorage.setItem("hasSeenLogoAnimation", "true");
      
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 2 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
          >
            <img
              src="/logo.png"
              alt="Made in Pune"
              className="w-48 h-auto"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
