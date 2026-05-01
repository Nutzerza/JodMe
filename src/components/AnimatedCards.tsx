'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function AnimatedCards({ covers }: { covers: string[] }) {
    return (
        <div className="absolute inset-0 pointer-events-none opacity-20">
            {covers.map((cover, index) => (
                <motion.div
                    key={index}
                    className="absolute w-32 h-48 rounded-lg overflow-hidden"
                    style={{
                        left: `${15 + index * 15}%`,
                        top: `${20 + (index % 2) * 40}%`,
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 0.3, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                    <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="128px"
                        className="object-cover"
                    />
                </motion.div>
            ))}
        </div>
    );
}