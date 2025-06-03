import { withSentryConfig } from "@sentry/nextjs";
import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
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

const withAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === "true",
});

export default withSentryConfig(
    withAnalyzer(nextConfig),
    {
        org: "autobrew",
        project: "autobrew_client",

        // Only print logs for uploading source maps in CI
        silent: !process.env.CI,

        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
        // This can increase your server load as well as your hosting bill.
        // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
        // side errors will fail.
        tunnelRoute: "/monitoring",

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,

        // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,
    }
);