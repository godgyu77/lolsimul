"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, X, ClipboardList } from "lucide-react";
import { useGameStore, ChatMessage } from "@/store/gameStore";
import { Card, CardContent } from "@/components/ui/card";

export default function GameChatInterface() {
  const { apiKey, messages, sendCommand, news, currentOptions, setCurrentOptions } = useGameStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
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

  // currentOptions가 변경될 때 모달 자동 표시 방지
  useEffect(() => {
    if (currentOptions.length > 0) {
      setShowOptionsModal(false); // 새 선택지가 오면 모달은 닫힌 상태로 시작
    } else {
      setShowOptionsModal(false); // 선택지가 없으면 모달도 닫음
    }
  }, [currentOptions]);

  const handleSend = async (command?: string) => {
    const commandToSend = command || input.trim();
    if (!commandToSend || isLoading || !apiKey) return;

    setInput("");
    setIsLoading(true);
    setCurrentOptions([]); // 선택지 초기화
    setShowOptionsModal(false); // 모달도 닫기

    try {
      await sendCommand(commandToSend);
    } catch (error) {
      console.error("명령 실행 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (value: string) => {
    setShowOptionsModal(false); // 모달 닫기
    handleSend(value); // 선택지 선택 시 선택지 초기화됨
  };

  const handleCloseModal = () => {
    setShowOptionsModal(false); // 모달만 닫고 버튼은 유지
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

  // Markdown 테이블을 HTML로 변환
  const renderMarkdownTable = (content: string): string => {
    // 테이블 패턴 찾기: | 컬럼1 | 컬럼2 | ... 형식
    const tableRegex = /(\|[^\n]+\|\n\|[:\-| ]+\|\n(?:\|[^\n]+\|\n?)+)/g;
    let processedContent = content;

    processedContent = processedContent.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n').filter(line => line.trim().startsWith('|'));
      if (lines.length < 2) return match;

      // 헤더와 구분선 분리
      const headerLine = lines[0];
      const dataLines = lines.slice(2); // 구분선 제외

      // 셀 파싱
      const parseCells = (line: string) => {
        return line.split('|').map(cell => cell.trim()).filter(cell => cell);
      };

      const headerCells = parseCells(headerLine);
      const dataRows = dataLines.map(parseCells).filter(row => row.length > 0);

      if (dataRows.length === 0) return match;

      // HTML 테이블 생성
      let html = '<div class="overflow-x-auto my-4"><table class="markdown-table whitespace-nowrap">';
      
      // 헤더
      html += '<thead><tr>';
      headerCells.forEach(cell => {
        html += `<th class="whitespace-nowrap">${cell}</th>`;
      });
      html += '</tr></thead>';

      // 바디
      html += '<tbody>';
      dataRows.forEach((row, rowIndex) => {
        const isTeam1 = row[0]?.includes('1군');
        const rowClass = isTeam1 ? 'team1' : 'team2';
        html += `<tr class="${rowClass}">`;
        row.forEach(cell => {
          html += `<td class="whitespace-nowrap">${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';

      return html;
    });

    return processedContent;
  };

  // 메시지 내용 렌더링 (테이블 변환 포함)
  const renderMessageContent = (content: string) => {
    // 먼저 테이블 변환
    let processedContent = renderMarkdownTable(content);
    // 나머지 줄바꿈 처리
    processedContent = processedContent.replace(/\n/g, '<br />');
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyber-blue" />
            <h2 className="text-base sm:text-lg font-bold">게임 진행</h2>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-4 space-y-3 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-2 sm:p-3 rounded-lg ${getMessageStyle(message.type)} max-w-[90%] ${
              message.type === "user" ? "text-right" : "text-left"
            }`}
          >
            {message.type === "news" && (
              <div className="text-xs font-semibold mb-1 opacity-70 text-white">뉴스</div>
            )}
            <div className="whitespace-pre-wrap break-words text-white">
              {renderMessageContent(message.content)}
            </div>
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

      {/* 선택지 모달 (PC/모바일 공통) */}
      {currentOptions.length > 0 && showOptionsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <Card className="w-full max-w-md bg-card border-border">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">작전 지시</h3>
                <button
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-accent rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>
              <div className="space-y-2">
                {currentOptions.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleOptionClick(option.value)}
                    variant="default"
                    className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90"
                    disabled={isLoading}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="p-3 sm:p-4 border-t border-border flex-shrink-0 relative">
        {/* 플로팅 버튼 (선택지가 있을 때만 표시) - 입력창 위에 배치 */}
        {currentOptions.length > 0 && (
          <div className="absolute bottom-full right-4 mb-2 z-40">
            <Button
              onClick={() => setShowOptionsModal(true)}
              className="h-12 px-5 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/90 hover:to-cyber-purple/90 shadow-lg animate-pulse hover:animate-none transition-all"
              size="lg"
            >
              <ClipboardList className="w-5 h-5 mr-2" />
              <span className="font-semibold">작전 지시</span>
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="명령어 입력..."
            className="flex-1 px-3 sm:px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            disabled={isLoading || !apiKey}
          />
          <Button
            onClick={() => handleSend()}
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

