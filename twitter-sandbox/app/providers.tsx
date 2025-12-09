"use client"

import NextTopLoader from 'nextjs-toploader'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import * as React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <>
            <NextTopLoader color="#0ea5e9" height={2} showSpinner={false} crawlSpeed={200} speed={300} zIndex={60} />

            <AnimatePresence mode="wait" initial={false}
            >
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </>
    )
}
