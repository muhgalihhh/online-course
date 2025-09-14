import { motion } from 'framer-motion';
import React from 'react';
import { buttonVariants } from './variants';

interface AnimatedButtonProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

/**
 * Komponen button dengan animasi
 * Memberikan feedback visual saat hover dan klik
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({ children, className = '', onClick, disabled = false, type = 'button' }) => {
    return (
        <motion.button
            variants={buttonVariants}
            initial="initial"
            whileHover={!disabled ? 'hover' : undefined}
            whileTap={!disabled ? 'tap' : undefined}
            className={className}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
