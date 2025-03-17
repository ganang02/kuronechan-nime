"use client"

import { motion } from "framer-motion"

export default function MaintenanceAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          stroke="#FF6B00"
          strokeWidth="4"
          strokeDasharray="565"
          initial={{ strokeDashoffset: 565 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
        />

        {/* Gear teeth */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const x1 = 100 + 70 * Math.cos(angle)
          const y1 = 100 + 70 * Math.sin(angle)
          const x2 = 100 + 90 * Math.cos(angle)
          const y2 = 100 + 90 * Math.sin(angle)

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#FF6B00"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 2 + i * 0.1,
              }}
            />
          )
        })}

        {/* Inner gear */}
        <motion.circle
          cx="100"
          cy="100"
          r="60"
          stroke="#FF6B00"
          strokeWidth="4"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
        />

        {/* Rotating inner gear */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ originX: "100px", originY: "100px" }}
        >
          {/* Inner gear teeth */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const x1 = 100 + 40 * Math.cos(angle)
            const y1 = 100 + 40 * Math.sin(angle)
            const x2 = 100 + 60 * Math.cos(angle)
            const y2 = 100 + 60 * Math.sin(angle)

            return (
              <motion.line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#FF6B00"
                strokeWidth="6"
                strokeLinecap="round"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: 2.5 + i * 0.1,
                }}
              />
            )
          })}

          {/* Center circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="20"
            fill="#FF6B00"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 3,
              duration: 0.5,
              type: "spring",
            }}
          />

          {/* Wrench handle */}
          <motion.rect
            x="90"
            y="70"
            width="20"
            height="60"
            rx="5"
            fill="#FF6B00"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 0.5 }}
          />
        </motion.g>

        {/* Sparkles */}
        {[...Array(5)].map((_, i) => {
          const angle = (i * 72 * Math.PI) / 180
          const x = 100 + 110 * Math.cos(angle)
          const y = 100 + 110 * Math.sin(angle)

          return (
            <motion.g key={i}>
              <motion.circle
                cx={x}
                cy={y}
                r="3"
                fill="#FFFFFF"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  delay: 3.5 + i * 0.2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 3,
                }}
              />
            </motion.g>
          )
        })}
      </motion.svg>
    </div>
  )
}

