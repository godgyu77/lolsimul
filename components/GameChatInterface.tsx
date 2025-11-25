"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare } from "lucide-react";
import { useGameStore, ChatMessage } from "@/store/gameStore";

export default function GameChatInterface() {
  const { apiKey, messages, sendCommand, news } = useGameStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 뉴스가 추가되면 채팅에 표시
  useEffect(() => {
    if (news.length > 0) {
      const latestNews = news[0];
      const newsMessage: ChatMessage = {
        id: `news-${latestNews.id}`,
        type: "news",
        content: `[NEWS] ${latestNews.title}\n${latestNews.content}`,
        timestamp: latestNews.date,
      };
      // 중복 방지 체크
      const exists = messages.some((m) => m.id === newsMessage.id);
      if (!exists) {
        useGameStore.getState().addMessage(newsMessage);
      }
    }
  }, [news, messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !apiKey) return;

    setInput("");
    setIsLoading(true);

    try {
      await sendCommand(input);
    } catch (error) {
      console.error("명령 실행 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageStyle = (type: ChatMessage["type"]) => {
    switch (type) {
      case "user":
        return "bg-primary/20 text-white ml-auto";
      case "news":
        return "bg-cyber-purple/20 text-white border-l-4 border-cyber-purple";
      case "game":
        return "bg-muted/50 text-white";
      case "system":
        return "bg-muted/50 text-white/80 text-sm";
      default:
        return "bg-muted/50 text-white";
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* 헤더 */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyber-blue" />
          <h2 className="text-lg font-bold">게임 진행</h2>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${getMessageStyle(message.type)} max-w-[90%] ${
              message.type === "user" ? "text-right" : "text-left"
            }`}
          >
            {message.type === "news" && (
              <div className="text-xs font-semibold mb-1 opacity-70 text-white">뉴스</div>
            )}
            <div className="whitespace-pre-wrap break-words text-white">{message.content}</div>
            <div className="text-xs opacity-50 mt-1 text-white/70">
              {message.timestamp.toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="명령어를 입력하세요... (예: 일정 진행, 로스터 확인)"
            className="flex-1 px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            disabled={isLoading || !apiKey}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || !apiKey}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!apiKey && (
          <p className="text-xs text-muted-foreground mt-2">
            API 키가 필요합니다.
          </p>
        )}
      </div>
    </div>
  );
}

