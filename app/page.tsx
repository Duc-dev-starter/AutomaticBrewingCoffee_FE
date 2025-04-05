"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Coffee, ChevronRight, Clock, Droplets, Thermometer, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: "url('/placeholder.svg?height=800&width=1600&text=Coffee+Beans+Background')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-sky-300 rounded-full opacity-20 blur-3xl" />

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-block mb-6"
            >
              <div className="bg-white/30 backdrop-blur-sm p-4 rounded-full">
                <Coffee size={48} className="text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-md"
            >
              Automatic Brewing Coffee
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-white mb-8 leading-relaxed drop-shadow"
            >
              Chào mừng đến với tương lai của pha chế cà phê. Hệ thống thông minh của chúng tôi mang đến tách cà phê
              hoàn hảo mỗi lần, với kiểm soát nhiệt độ chính xác, chiết xuất tối ưu và hồ sơ pha chế tùy chỉnh.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/login">
                <Button size="lg" className="bg-white hover:bg-sky-50 text-sky-600 font-medium">
                  Đăng Nhập <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-sky-800 mb-4">Pha Chế Xuất Sắc</h2>
            <p className="text-sky-700 max-w-2xl mx-auto">
              Hệ thống pha chế tự động của chúng tôi kết hợp công nghệ tiên tiến với nghệ thuật pha chế cà phê để mang
              đến trải nghiệm đặc biệt.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div
              variants={fadeInUp}
              className="bg-sky-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-sky-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Thermometer className="text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-3">Nhiệt Độ Chính Xác</h3>
              <p className="text-sky-700">
                Duy trì nhiệt độ pha chế tối ưu giữa 90°C và 96°C để chiết xuất hoàn hảo mỗi lần.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-sky-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-sky-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Clock className="text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-3">Thời Gian Thông Minh</h3>
              <p className="text-sky-700">
                Kiểm soát chính xác thời gian pha chế cho các loại cà phê khác nhau, đảm bảo chiết xuất và hương vị lý
                tưởng.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="bg-sky-50 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-sky-100 w-12 h-12 rounded-full flex items-center justify-center mb-6">
                <Droplets className="text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold text-sky-800 mb-3">Chất Lượng Nước</h3>
              <p className="text-sky-700">
                Hệ thống lọc tích hợp đảm bảo chất lượng nước tối ưu để mang lại điều tốt nhất từ hạt cà phê của bạn.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-sky-600 to-sky-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Award className="h-16 w-16 mx-auto mb-6 text-sky-200" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Sẵn Sàng Trải Nghiệm Cà Phê Hoàn Hảo?</h2>
            <p className="text-sky-100 max-w-2xl mx-auto mb-8">
              Đăng nhập để tùy chỉnh cài đặt, theo dõi hệ thống của bạn và thưởng thức tách cà phê hoàn hảo.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 font-medium">
                Đăng Nhập Ngay <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-sky-900 text-sky-200 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Coffee className="h-6 w-6 mr-2" />
            <span className="font-semibold text-lg">Automatic Brewing Coffee</span>
          </div>
          <p className="text-sky-400/70 text-sm">
            © {new Date().getFullYear()} Automatic Brewing Coffee. Đã đăng ký bản quyền.
          </p>
        </div>
      </footer>
    </div>
  )
}

