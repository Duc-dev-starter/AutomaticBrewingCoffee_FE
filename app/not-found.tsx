"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { AlertCircle, ArrowLeft, Coffee, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function NotFound() {
    const [scrollY, setScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex flex-col">
            {/* Background Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full opacity-20 blur-3xl" />
            <div className="absolute top-40 -left-20 w-80 h-80 bg-sky-300 rounded-full opacity-20 blur-3xl" />
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-sky-500 rounded-full opacity-10 blur-3xl" />

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="inline-block mb-6"
                    >
                        <div className="bg-white/30 backdrop-blur-sm p-6 rounded-full">
                            <AlertCircle size={64} className="text-white" />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-md"
                    >
                        404
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-3xl md:text-4xl font-bold text-white mb-6 drop-shadow-md"
                    >
                        Trang không tìm thấy
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-lg md:text-xl text-white mb-10 leading-relaxed drop-shadow max-w-2xl mx-auto"
                    >
                        Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Giống như một tách cà phê hoàn hảo,
                        đôi khi chúng ta cần thử lại.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <Link href="/">
                            <Button size="lg" className="bg-white hover:bg-sky-50 text-sky-600 font-medium">
                                <Home className="mr-2 h-4 w-4" /> Trang chủ
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-white text-sky-600 hover:bg-white/20"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="mt-16 relative"
                    >
                        <div className="w-full max-w-md mx-auto h-[2px] bg-white/20" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-sky-400 px-4">
                            <Coffee className="h-6 w-6 text-white" />
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-sky-900/30 backdrop-blur-sm text-sky-100 py-6 mt-auto">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Coffee className="h-5 w-5 mr-2" />
                        <span className="font-semibold">Automatic Brewing Coffee</span>
                    </div>
                    <p className="text-sky-200/70 text-sm">
                        © {new Date().getFullYear()} Automatic Brewing Coffee. Đã đăng ký bản quyền.
                    </p>
                </div>
            </footer>
        </div>
    )
}
