"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/** Full-screen splash shown on app boot before login/home */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), 1700);
    const t2 = setTimeout(() => onDone(), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-white"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
        className="flex h-24 w-24 items-center justify-center rounded-3xl text-white pay8-gradient-navy pay8-elev-2"
      >
        <span className="text-5xl font-bold">8</span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="mt-5 text-2xl font-bold tracking-tight text-foreground"
      >
        PAY8
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-1 text-xs text-muted-foreground"
      >
        Your money, your commute, one tap.
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 flex items-center gap-1.5 text-[10px] text-muted-foreground"
      >
        <span className="h-1 w-1 rounded-full bg-muted-foreground animate-pulse" />
        Regulated by the Bangko Sentral ng Pilipinas
      </motion.div>
    </motion.div>
  );
}
