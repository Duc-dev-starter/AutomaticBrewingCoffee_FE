/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [],
    },
    async headers() {
        return [
            {
                source: "/(.*)", // Áp dụng cho tất cả các route
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "DENY", // Ngăn clickjacking
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff", // Ngăn trình duyệt đoán kiểu file
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin", // Kiểm soát thông tin referrer
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload", // Chỉ dùng nếu web chạy HTTPS
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=()", // Giới hạn các API nhạy cảm
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
