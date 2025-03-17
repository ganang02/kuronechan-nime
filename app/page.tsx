"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Instagram, Twitter, Youtube } from "lucide-react"
import MaintenanceAnimation from "@/components/maintenance-animation"

export default function MaintenancePage() {
  const [count, setCount] = useState(0)

  // Animation for the floating effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=100&width=100')] bg-repeat"></div>
      </div>

      {/* Orange glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-orange-500 opacity-20 blur-[100px]"></div>

      {/* Content container */}
      <motion.div
        className="z-10 max-w-4xl w-full px-6 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex flex-col items-center text-center">
          {/* Animated Maintenance Logo */}
          <motion.div
            className="mb-8"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 3,
              ease: "easeInOut",
            }}
          >
            <div className="relative w-64 h-64 mb-4">
              <MaintenanceAnimation />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 text-orange-500"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            メンテナンス中
          </motion.h1>

          {/* Subtitle */}
          <motion.h2
            className="text-3xl md:text-4xl font-semibold mb-6 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Under Maintenance
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-lg text-gray-300 mb-8 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            We're currently upgrading our servers to bring you an even better anime experience! Please check back soon.
            We'll be back online shortly.
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="w-full max-w-md h-3 bg-gray-800 rounded-full mb-8 overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <motion.div className="h-full bg-orange-500 rounded-full" style={{ width: `${count}%` }} />
          </motion.div>

          {/* Estimated time */}
          <motion.div
            className="flex items-center justify-center mb-12 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Clock className="w-5 h-5 mr-2 text-orange-500" />
            <p>
              Estimated completion: <span className="font-semibold">2 hours</span>
            </p>
          </motion.div>

          {/* Social links */}
          <motion.div
            className="flex space-x-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <SocialIcon icon={<Twitter className="w-5 h-5" />} />
            <SocialIcon icon={<Instagram className="w-5 h-5" />} />
            <SocialIcon icon={<Youtube className="w-5 h-5" />} />
          </motion.div>
        </div>
      </motion.div>

      {/* Floating particles */}
      <Particles />
    </div>
  )
}

function SocialIcon({ icon }) {
  return (
    <motion.a
      href="#"
      className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-black hover:bg-orange-400 transition-colors"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.a>
  )
}

function Particles() {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-orange-500"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
          }}
          animate={{
            y: [0, -Math.random() * 100 - 50],
            opacity: [0.1, 0.8, 0],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </>
  )
}

