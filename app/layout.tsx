import "./globals.css";
import React from "react";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";


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
              {children}
            </Tooltip>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}