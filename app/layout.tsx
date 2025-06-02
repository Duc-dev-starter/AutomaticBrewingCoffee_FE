import "./globals.css";
import React from "react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SignalRProvider } from "@/contexts/signalR";
import { ErrorBoundary } from "@sentry/nextjs";
import { CustomFallback } from "@/components/common";


const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter'
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} remove-scrollbar font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Tooltip>
              <SignalRProvider>
                <ErrorBoundary fallback={<CustomFallback />}>
                  {children}
                </ErrorBoundary>
              </SignalRProvider>
            </Tooltip>
          </TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}