import { motion } from 'framer-motion';
import { scaleOnTap } from '../utils/animation';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

export default function Button({ children, href, className = '', ...props }: ButtonProps) {
  const classes = `btn-base rounded-lg ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        variants={scaleOnTap}
        initial="initial"
        whileTap="tap"
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={classes}
      variants={scaleOnTap}
      initial="initial"
      whileTap="tap"
      {...props}
    >
      {children}
    </motion.button>
  );
}
