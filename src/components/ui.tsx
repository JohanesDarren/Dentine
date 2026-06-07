import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverLift?: boolean;
}

export function Card({ children, className, hoverLift = true }: CardProps) {
  return (
    <motion.div
      whileHover={hoverLift ? { y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" } : {}}
      transition={{ duration: 0.15 }}
      className={cn(
        "bg-surface rounded-xl border border-border-app p-6 shadow-sm",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

export const PageWrapper = ({ children, className }: { children: ReactNode; className?: string }) => (
  <motion.div
    variants={pageVariants as any}
    initial="initial"
    animate="animate"
    exit="exit"
    className={cn("w-full h-full", className)}
  >
    {children}
  </motion.div>
);

export function AnimatedList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.ul
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.05 },
        },
      }}
      className={className}
    >
      {children}
    </motion.ul>
  );
}

export function AnimatedListItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.li>
  );
}
