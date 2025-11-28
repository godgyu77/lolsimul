import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LCK Manager Simulation",
  description: "LCK 매니지먼트 시뮬레이션 게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden bg-background">
          {/* 메인 콘텐츠 영역 */}
          <div className="flex flex-1 overflow-hidden min-w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

