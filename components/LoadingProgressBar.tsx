"use client";

import { useState, useEffect, useRef } from "react";

interface LoadingProgressBarProps {
  isLoading: boolean;
}

export default function LoadingProgressBar({ isLoading }: LoadingProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // 로딩 시작: 0%에서 시작하고 표시
      setProgress(0);
      setIsVisible(true);

      // Trickle 알고리즘: 점진적으로 느려지는 가짜 진행률
      let currentProgress = 0;
      const updateProgress = () => {
        // 진행률에 따라 증가폭 계산
        let increment: number;
        
        if (currentProgress < 20) {
          // 0-20%: 빠르게 증가 (1-3%)
          increment = 1 + Math.random() * 2;
        } else if (currentProgress < 50) {
          // 20-50%: 중간 속도 (0.5-1.5%)
          increment = 0.5 + Math.random() * 1;
        } else if (currentProgress < 80) {
          // 50-80%: 느리게 증가 (0.2-0.8%)
          increment = 0.2 + Math.random() * 0.6;
        } else {
          // 80-95%: 매우 느리게 증가 (0.05-0.3%)
          increment = 0.05 + Math.random() * 0.25;
        }

        // 랜덤성 추가 (약간의 변동)
        increment *= (0.8 + Math.random() * 0.4);

        currentProgress = Math.min(currentProgress + increment, 95); // 최대 95%
        setProgress(currentProgress);
      };

      // 주기적으로 진행률 업데이트 (약 100ms마다)
      intervalRef.current = setInterval(updateProgress, 100);
    } else {
      // 로딩 완료: 즉시 100%로 설정
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setProgress(100);

      // 200-500ms 대기 후 숨김
      completionTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        setProgress(0); // 다음 로딩을 위해 초기화
      }, 300); // 300ms 대기 (200-500ms 사이의 중간값)
    }

    // cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (completionTimeoutRef.current) {
        clearTimeout(completionTimeoutRef.current);
      }
    };
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center gap-4 w-full max-w-md">
        {/* 진행 바 */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* 텍스트 */}
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            AI 응답 처리 중...
          </div>
          <div className="text-sm text-muted-foreground">
            {progress < 95 ? "잠시만 기다려주세요" : "거의 완료되었습니다"}
          </div>
        </div>
      </div>
    </div>
  );
}

