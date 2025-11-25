"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Key, AlertCircle } from "lucide-react";
import { useGameStore } from "@/store/gameStore";

export default function ApiKeyModal() {
  const { setApiKey, apiKey } = useGameStore();
  const [inputKey, setInputKey] = useState("");
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 클라이언트에서만 마운트 상태 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마운트 후 localStorage 확인 및 모달 상태 설정
  useEffect(() => {
    if (isMounted) {
      // localStorage에서 API key 확인
      const savedKey = localStorage.getItem("gemini_api_key");
      if (savedKey) {
        setApiKey(savedKey);
        setIsOpen(false);
      } else {
        setIsOpen(!apiKey);
      }
    }
  }, [isMounted, apiKey, setApiKey]);

  const handleSubmit = () => {
    if (!inputKey.trim()) {
      setError("API 키를 입력해주세요.");
      return;
    }

    if (inputKey.length < 20) {
      setError("올바른 API 키 형식이 아닙니다.");
      return;
    }

    // API key 저장
    if (typeof window !== "undefined") {
      localStorage.setItem("gemini_api_key", inputKey);
    }
    setApiKey(inputKey);
    setIsOpen(false);
    setError("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // 서버 사이드 렌더링 시 또는 마운트 전에는 렌더링하지 않음
  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-md p-6 space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Key className="w-12 h-12 text-cyber-blue" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            Gemini API 키 입력
          </h2>
          <p className="text-sm text-muted-foreground">
            게임을 시작하기 위해 Gemini API 키가 필요합니다.
          </p>
        </div>

        {/* 입력 필드 */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            API 키
          </label>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              setError("");
            }}
            onKeyPress={handleKeyPress}
            placeholder="AIzaSy..."
            className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            autoFocus
          />
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            API 키는 브라우저에 안전하게 저장되며, 서버로 전송되지 않습니다.
          </p>
        </div>

        {/* 안내 */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-foreground">API 키 발급 방법:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Google AI Studio에 접속</li>
            <li>API 키 생성 메뉴 선택</li>
            <li>생성된 API 키를 복사하여 입력</li>
          </ol>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            className="flex-1 gap-2"
            disabled={!inputKey.trim()}
          >
            <Key className="w-4 h-4" />
            시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}

