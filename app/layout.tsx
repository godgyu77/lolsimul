import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

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
          {/* 좌측 네비게이션 - 고정 너비 */}
          <Sidebar />
          
          {/* 중앙 대시보드 + 우측 채팅창 영역 */}
          <div className="flex flex-1 overflow-hidden min-w-0">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

