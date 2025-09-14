import { motion } from 'framer-motion';
import React from 'react';
import { cardHover } from './variants';

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    whileHover?: boolean;
    onClick?: () => void;
}

/**
 * Komponen kartu dengan animasi hover
 * Memberikan efek hover yang halus pada kartu
 */
export const AnimatedCard: React.FC<AnimatedCardProps> = ({ children, className = '', whileHover = true, onClick }) => {
    return (
        <motion.div
            variants={cardHover}
            initial="initial"
            whileHover={whileHover ? 'hover' : undefined}
            className={className}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {children}
        </motion.div>
    );
};

export default AnimatedCard;
