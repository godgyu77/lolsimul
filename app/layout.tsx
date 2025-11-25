import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* 좌측 사이드바 */}
          <Sidebar />
          
          {/* 메인 컨텐츠 영역 */}
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* 중앙 메인 콘텐츠 - HeaderStatus와 ActionFooter는 page.tsx에서 처리 */}
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

