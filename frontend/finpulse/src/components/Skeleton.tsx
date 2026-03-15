import { motion } from "framer-motion";

export default function Skeleton({ className }: { className?: string }) {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`animate-pulse rounded-2xl bg-white/5 ${className}`} 
        />
    );
}
