"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, X, ClipboardList, Maximize2, Minimize2, Command, ArrowRight } from "lucide-react";
import { useGameStore, ChatMessage } from "@/store/gameStore";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TRAIT_LIBRARY } from "@/constants/systemPrompt";

interface GameChatInterfaceProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function GameChatInterface({ isExpanded = false, onToggleExpand }: GameChatInterfaceProps) {
  const { apiKey, messages, sendCommand, news, currentOptions, setCurrentOptions, userPlayer, gameMode, availableActions } = useGameStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 외부에서 제어하는 경우와 내부에서 제어하는 경우 모두 지원
  const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;
  const toggleExpand = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

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

  // 특성 키를 한글명으로 변환
  const convertTraitToKorean = (traitKey: string): string => {
    if (!traitKey || traitKey === '-' || traitKey.trim() === '') return '-';
    
    // **로 감싸진 경우 제거
    let cleanTraitKey = traitKey.replace(/\*\*/g, '').trim();
    
    // 여러 특성이 쉼표로 구분된 경우 처리
    const traits = cleanTraitKey.split(',').map(t => t.trim());
    const koreanTraits = traits.map(t => {
      const traitInfo = TRAIT_LIBRARY[t as keyof typeof TRAIT_LIBRARY];
      // 이미 한글이거나 TRAIT_LIBRARY에 없는 경우 그대로 반환
      if (traitInfo) {
        return traitInfo.name;
      }
      // 한글인지 확인 (한글이 포함되어 있으면 그대로 반환)
      if (/[가-힣]/.test(t)) {
        return t;
      }
      return t;
    });
    return koreanTraits.join(', ');
  };

  // 플레이어인지 확인 (닉네임으로 판단)
  const isUserPlayer = (nickname: string): boolean => {
    if (gameMode !== "PLAYER" || !userPlayer) return false;
    if (!nickname) return false;
    
    // **로 감싸진 경우와 일반 텍스트 모두 확인
    const cleanNickname = nickname.replace(/\*\*/g, '').trim();
    return cleanNickname === userPlayer.nickname;
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

      // 특성 컬럼 인덱스 찾기
      const traitColumnIndex = headerCells.findIndex(cell => 
        cell.includes('특성') || cell.toLowerCase().includes('trait')
      );
      
      // 닉네임 컬럼 인덱스 찾기
      const nicknameColumnIndex = headerCells.findIndex(cell => 
        cell.includes('닉네임') || cell.toLowerCase().includes('nickname')
      );

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
        
        // 플레이어인지 확인
        const nickname = nicknameColumnIndex !== -1 ? row[nicknameColumnIndex] : '';
        const isPlayer = isUserPlayer(nickname);
        
        // 플레이어인 경우 색상 강조 클래스 추가
        const playerClass = isPlayer ? 'user-player-row' : '';
        html += `<tr class="${rowClass} ${playerClass}">`;
        
        row.forEach((cell, cellIndex) => {
          let cellContent = cell;
          
          // 특성 컬럼인 경우 한글로 변환
          if (cellIndex === traitColumnIndex && traitColumnIndex !== -1) {
            cellContent = convertTraitToKorean(cell);
          }
          
          // **로 감싸진 텍스트 제거 (표시용)
          const displayContent = cellContent.replace(/\*\*/g, '');
          
          // 플레이어 행이고 닉네임 컬럼인 경우 색상 강조
          if (isPlayer && cellIndex === nicknameColumnIndex) {
            html += `<td class="whitespace-nowrap font-bold" style="color: hsl(280, 70%, 60%);">${displayContent}</td>`;
          } else if (isPlayer) {
            // 플레이어 행의 다른 셀도 약간 강조
            html += `<td class="whitespace-nowrap" style="color: hsl(280, 70%, 70%);">${displayContent}</td>`;
          } else {
            html += `<td class="whitespace-nowrap">${displayContent}</td>`;
          }
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
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleExpand}
            className="h-8 w-8"
            title={expanded ? "축소" : "확장"}
          >
            {expanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
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
        <div className="flex gap-2 items-end">
          {/* 작전지시 버튼 (availableActions가 있을 때만 표시) - 좌측 하단 */}
          {availableActions.length > 0 && (
            <Button
              onClick={() => setShowActionModal(true)}
              variant="outline"
              size="icon"
              className="shrink-0 h-10 w-10 sm:h-11 sm:w-11 mb-0 touch-manipulation"
              title="작전지시"
            >
              <Command className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}
          
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
        
        {/* 작전지시 모달 */}
        {availableActions.length > 0 && showActionModal && (
          <>
            {/* 배경 오버레이 (외부 클릭 시 닫기) */}
            <div 
              className="fixed inset-0 z-[45] bg-black/50 lg:z-40"
              onClick={() => setShowActionModal(false)}
            />
            {/* PC: 좌측 하단, 모바일: 화면 하단 중앙 (하단 탭 메뉴 위에 표시) */}
            <div className={cn(
              "fixed z-[50]",
              // PC: 좌측 하단 (입력창 기준)
              "lg:absolute lg:bottom-full lg:left-0 lg:mb-2 lg:w-[320px] lg:z-50",
              // 모바일: 화면 하단 중앙 (하단 탭 메뉴 z-40 위에 표시)
              "bottom-0 left-0 right-0 lg:right-auto lg:max-w-[calc(100vw-2rem)]",
              "max-h-[70vh] overflow-y-auto",
              // 모바일에서 하단 탭 메뉴 높이만큼 여백 추가
              "pb-16 lg:pb-0"
            )}>
              <Card className="bg-card border-border shadow-2xl rounded-t-2xl lg:rounded-lg">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                      작전지시
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowActionModal(false)}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {availableActions.map((action) => (
                      <Button
                        key={action.id}
                        onClick={async () => {
                          setShowActionModal(false);
                          await sendCommand(action.command);
                        }}
                        variant="outline"
                        className="w-full justify-start gap-2 sm:gap-3 h-auto py-3 sm:py-3.5 px-4 text-sm sm:text-base hover:bg-primary/20 hover:border-primary/50 active:bg-primary/30 transition-colors touch-manipulation"
                        disabled={isLoading}
                      >
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="flex-1 text-left">{action.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
        {!apiKey && (
          <p className="text-xs text-muted-foreground mt-2">
            API 키가 필요합니다.
          </p>
        )}
      </div>
    </div>
  );
}

