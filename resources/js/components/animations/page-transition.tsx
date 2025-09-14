import { motion } from 'framer-motion';
import React from 'react';
import { pageVariants } from './variants';

interface PageTransitionProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Komponen untuk animasi transisi halaman
 * Digunakan untuk memberikan animasi saat berpindah halaman
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children, className = '' }) => {
    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className={className}>
            {children}
        </motion.div>
    );
};

export default PageTransition;
