import { motion, useInView, Variants } from 'framer-motion';
import React, { useRef } from 'react';
import { scrollVariants } from './variants';

interface ScrollAnimationProps {
    children: React.ReactNode;
    className?: string;
    variants?: Variants;
    delay?: number;
    threshold?: number;
    once?: boolean;
}

/**
 * Komponen untuk animasi yang dipicu saat scroll
 * Elemen akan muncul dengan animasi ketika masuk ke viewport
 */
export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({
    children,
    className = '',
    variants = scrollVariants,
    delay = 0,
    threshold = 0.1,
    once = false,
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, {
        amount: threshold,
        once,
    });

    const animationVariants: Variants = {
        ...variants,
        visible: {
            ...variants.visible,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay,
            },
        },
    };

    return (
        <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={animationVariants} className={className}>
            {children}
        </motion.div>
    );
};

export default ScrollAnimation;
