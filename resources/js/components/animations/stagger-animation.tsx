import { motion } from 'framer-motion';
import React from 'react';
import { childVariants, containerVariants } from './variants';

interface StaggerAnimationProps {
    children: React.ReactNode;
    className?: string;
    childClassName?: string;
    staggerDelay?: number;
}

/**
 * Komponen untuk animasi stagger (berurutan)
 * Anak-anak elemen akan muncul secara berurutan dengan delay
 */
export const StaggerAnimation: React.FC<StaggerAnimationProps> = ({ children, className = '', childClassName = '', staggerDelay = 0.1 }) => {
    const customContainerVariants = {
        ...containerVariants,
        visible: {
            ...containerVariants.visible,
            transition: {
                ...containerVariants.visible.transition,
                staggerChildren: staggerDelay,
            },
        },
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={customContainerVariants} className={className}>
            {React.Children.map(children, (child, index) => (
                <motion.div key={index} variants={childVariants} className={childClassName}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
};

export default StaggerAnimation;
