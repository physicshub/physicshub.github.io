import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import ReactDOM from "react-dom";  // <-- IMPORTANT
import "@/styles/portal.css";

export default function PhysicsPortal({ onComplete }) {
  const controls = useAnimation();

  useEffect(() => {
    async function sequence() {
      await controls.start("focus");
      await controls.start("warp");

      onComplete?.();

      await controls.start("fadeOut");
    }

    sequence();
  }, [controls, onComplete]);

  const portalVariants = {
    start: {
      scale: 0.2,
      opacity: 0,
      filter: "blur(10px)"
    },
    focus: {
      scale: 0.55,
      opacity: 1,
      rotate: 12,
      filter: "blur(2px)",
      transition: { duration: 0.5, ease: "easeOut" }
    },
    warp: {
      scale: 4.5,
      opacity: 1,
      rotate: 0,
      filter: "blur(0px)",
      transition: { duration: 1.1, ease: "easeInOut" }
    },
    fadeOut: {
      opacity: 0,
      transition: { duration: 0.4 }
    }
  };

  const portalUI = (
    <motion.div
      className="portal-overlay"
      variants={portalVariants}
      initial="start"
      animate={controls}
    >
      <div className="portal-core">
        {Array.from({ length: 20 }).map((_, idx) => (
          <motion.div
            key={idx}
            className="portal-object"
            initial={{
              x: (Math.random() - 0.5) * 250,
              y: (Math.random() - 0.5) * 250,
              scale: 0
            }}
            animate={{
              x: (Math.random() - 0.5) * 250,
              y: (Math.random() - 0.5) * 250,
              scale: 1
            }}
            transition={{
              duration: 1.3,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );

  // 🔥 ALWAYS render portal at document.body
  return ReactDOM.createPortal(portalUI, document.body);
}
