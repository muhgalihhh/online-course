// Export all animation components and variants
export { default as AnimatedButton } from './animated-button';
export { default as AnimatedCard } from './animated-card';
export { default as PageTransition } from './page-transition';
export { default as ScrollAnimation } from './scroll-animation';
export { default as StaggerAnimation } from './stagger-animation';

// Export variants for custom usage
export * from './variants';

// Re-export motion for convenience
export { AnimatePresence, motion } from 'framer-motion';
