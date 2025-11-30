"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, ClipboardList, Maximize2, Minimize2 } from "lucide-react";
import { useGameStore, ChatMessage } from "@/store/gameStore";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TRAIT_LIBRARY } from "@/constants/systemPrompt";

interface GameChatInterfaceProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  hideHeader?: boolean; // 헤더 숨김 옵션
  hideInput?: boolean; // 입력창 숨김 옵션 (하단만 표시용)
  hideMessages?: boolean; // 메시지 영역 숨김 옵션 (입력창만 표시용)
}

export default function GameChatInterface({ isExpanded = false, onToggleExpand, hideHeader = false, hideInput = false, hideMessages = false }: GameChatInterfaceProps) {
  const { messages, news, currentOptions, setCurrentOptions, gameMode, userPlayer } = useGameStore();
  const [isLoading] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 외부에서 제어하는 경우와 내부에서 제어하는 경우 모두 지원
  const expanded = isExpanded !== undefined ? isExpanded : internalExpanded;
  const toggleExpand = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

  // 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 뉴스가 추가되면 채팅에 표시 (무한 루프 방지: news만 의존성으로 사용)
  useEffect(() => {
    if (news.length > 0) {
      const latestNews = news[0];
      const newsMessageId = `news-${latestNews.id}`;
      
      // 중복 방지: 현재 메시지 목록에서 확인
      const currentMessages = useGameStore.getState().messages;
      const exists = currentMessages.some((m) => m.id === newsMessageId);
      
      if (!exists) {
        const newsMessage: ChatMessage = {
          id: newsMessageId,
          type: "news",
          content: `[NEWS] ${latestNews.title}\n${latestNews.content}`,
          timestamp: latestNews.date,
        };
        useGameStore.getState().addMessage(newsMessage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [news]); // messages를 의존성에서 제거하여 무한 루프 방지

  // currentOptions가 변경될 때 모달 자동 표시 방지
  useEffect(() => {
    if (currentOptions.length > 0) {
      setShowOptionsModal(false); // 새 선택지가 오면 모달은 닫힌 상태로 시작
    } else {
      setShowOptionsModal(false); // 선택지가 없으면 모달도 닫음
    }
  }, [currentOptions]);

  const handleOptionClick = useCallback((value: string) => {
    setShowOptionsModal(false); // 모달 닫기
    // 선택지 클릭은 GameInputFooter에서 처리
    const { sendCommand } = useGameStore.getState();
    sendCommand(value);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowOptionsModal(false); // 모달만 닫고 버튼은 유지
  }, []);

  const getMessageStyle = (type: ChatMessage["type"]) => {
    switch (type) {
      case "user":
        return "bg-gradient-to-r from-cyber-blue/30 to-cyber-blue/20 text-white ml-auto border border-cyber-blue/40 shadow-lg shadow-cyber-blue/10";
      case "news":
        return "bg-gradient-to-r from-cyber-purple/30 to-cyber-purple/20 text-white border-l-4 border-cyber-purple shadow-lg shadow-cyber-purple/10";
      case "game":
        return "bg-card/80 text-foreground border border-border/50 shadow-md";
      case "system":
        return "bg-muted/60 text-muted-foreground text-sm border border-border/30";
      default:
        return "bg-muted/50 text-foreground border border-border/50";
    }
  };

  // 특성 키를 한글명으로 변환 (useCallback으로 메모이제이션)
  const convertTraitToKorean = useCallback((traitKey: string): string => {
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
  }, []);

  // 플레이어인지 확인 (닉네임으로 판단) (useCallback으로 메모이제이션)
  const isUserPlayer = useCallback((nickname: string): boolean => {
    if (gameMode !== "PLAYER" || !userPlayer) return false;
    if (!nickname) return false;
    
    // **로 감싸진 경우와 일반 텍스트 모두 확인
    const cleanNickname = nickname.replace(/\*\*/g, '').trim();
    return cleanNickname === userPlayer.nickname;
  }, [gameMode, userPlayer]);

  // Markdown 테이블을 HTML로 변환 (useCallback으로 메모이제이션)
  const renderMarkdownTable = useCallback((content: string): string => {
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
  }, [convertTraitToKorean, isUserPlayer]);

  // 메시지 내용 렌더링 (테이블 변환 및 스타일링 포함) (useMemo로 메모이제이션)
  const renderMessageContent = useCallback((content: string): React.ReactElement => {
    // 먼저 테이블 변환
    let processedContent = renderMarkdownTable(content);
    
    // 1. 구분선(---)을 시각적 구분선으로 변환 (줄바꿈 처리 전에)
    processedContent = processedContent.replace(
      /^---+\s*$/gm,
      '<hr class="content-divider" />'
    );
    
    // 2. [STATUS] 정보를 독립적인 블록으로 변환 (여러 줄 지원)
    processedContent = processedContent.replace(
      /\[STATUS\]\s*([^\n<]+(?:\n(?!\[|$|---|<hr)[^\n<]+)*)/g,
      (match, statusContent) => {
        const cleanContent = statusContent.trim().replace(/\n/g, '<br />');
        return `<div class="status-block"><div class="status-label">[STATUS]</div><div class="status-content">${cleanContent}</div></div>`;
      }
    );
    
    // 3. [알림] 정보를 아이콘과 배경색으로 강조 (여러 줄 지원)
    processedContent = processedContent.replace(
      /\[알림\]\s*([^\n<]+(?:\n(?!\[|$|---|<hr)[^\n<]+)*)/g,
      (match, notificationContent) => {
        const cleanContent = notificationContent.trim().replace(/\n/g, '<br />');
        return `<div class="notification-block"><span class="notification-icon">🔔</span><span class="notification-content">${cleanContent}</span></div>`;
      }
    );
    
    // 4. 제목 스타일링 (**[제목]** 형식) - 제목 패턴을 먼저 처리
    processedContent = processedContent.replace(
      /\*\*\[([^\]]+)\]\*\*/g,
      '<h3 class="report-section-title">[$1]</h3>'
    );
    
    // 5. 일반 굵은 글씨 강조 (제목이 아닌 경우, **로 감싸진 텍스트)
    processedContent = processedContent.replace(
      /\*\*([^*\n<]+)\*\*/g,
      '<strong class="text-emphasis">$1</strong>'
    );
    
    // 6. 마크다운 헤더 제거 (###, ##, # 처리)
    processedContent = processedContent.replace(
      /^#{1,6}\s+(.+)$/gm,
      '<strong class="text-emphasis">$1</strong>'
    );
    
    // 7. 남아있는 마크다운 문법 제거 (처리되지 않은 **, ### 등)
    processedContent = processedContent.replace(/\*\*/g, '');
    processedContent = processedContent.replace(/^#{1,6}\s*/gm, '');
    
    // 8. 줄바꿈 처리 (이미 처리된 부분 제외)
    processedContent = processedContent.replace(/\n/g, '<br />');
    
    return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
  }, [renderMarkdownTable]);

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* 헤더 (hideHeader가 false일 때만 표시) */}
      {!hideHeader && (
        <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 border-b border-border flex-shrink-0 bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-cyber-blue flex-shrink-0" />
              <h2 className="text-sm sm:text-base md:text-lg font-bold truncate">게임 진행</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpand}
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
              title={expanded ? "축소" : "확장"}
            >
              {expanded ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 메시지 영역 - 중앙 정렬 및 폭 제한 */}
      {!hideMessages && (
        <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 scroll-smooth">
          <div className="flex items-center justify-center min-h-full">
            <div className="w-full max-w-[1200px] px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 space-y-2 sm:space-y-3 relative">
            {messages.map((message) => {
              const messageStyle = getMessageStyle(message.type);
              const isUser = message.type === "user";
              
              // 리포트 형식 감지: AI 메시지(message.type === "game" 또는 "system")는 모두 리포트 형식으로 표시
              // 사용자 메시지는 일반 말풍선으로 표시
              const isReport = !isUser && (message.type === "game" || 
                message.type === "system" ||
                message.content.includes("[STATUS]") || 
                message.content.includes("REPORT") ||
                message.content.includes("리포트") ||
                message.content.includes("GM OFFICE") ||
                message.content.includes("재정") ||
                message.content.includes("순위표") ||
                message.content.includes("선수단 명단") ||
                message.content.includes("시범경기") ||
                message.content.includes("정규시즌") ||
                message.content.includes("시즌") ||
                message.content.includes("경기 결과") ||
                message.content.includes("환영합니다") ||
                message.content.includes("게임을 시작") ||
                message.content.includes("명령어를 입력"));
              
              return (
                <div
                  key={message.id}
                  className={`message-enter ${
                    isReport 
                      ? "w-full p-4 sm:p-5 md:p-6 bg-card border border-border rounded-lg shadow-sm my-2 transition-all duration-300 hover:shadow-md" 
                      : `p-2 sm:p-2.5 md:p-3 rounded-lg ${messageStyle} transition-all duration-200 ${
                          isUser ? "text-right" : "text-left"
                        }`
                  }`}
                  style={!isReport && isUser ? { 
                    maxWidth: "fit-content", 
                    width: "auto", 
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "0"
                  } : !isReport ? { 
                    maxWidth: "fit-content", 
                    width: "auto", 
                    display: "inline-block" 
                  } : {}}
                >
                  {message.type === "news" && (
                    <div className="text-xs font-semibold mb-1 opacity-90 text-cyber-purple-300">📰 뉴스</div>
                  )}
                  {isReport && (
                    <div className="mb-4 pb-3 border-b-2 border-primary/30">
                      <div className="text-sm sm:text-base font-bold text-primary uppercase tracking-wider mb-1">
                        GM OFFICE REPORT
                      </div>
                    </div>
                  )}
                  <div className={`whitespace-pre-wrap break-words text-foreground ${
                    isReport ? "text-sm sm:text-base leading-relaxed space-y-2" : "text-xs sm:text-sm"
                  }`}>
                    {renderMessageContent(message.content)}
                  </div>
                  <div className={`text-[10px] sm:text-xs opacity-60 mt-1 text-muted-foreground ${
                    isReport ? "text-right" : ""
                  }`}>
                    {message.timestamp.toLocaleTimeString("ko-KR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

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
                    className="w-full bg-gradient-to-r from-cyber-blue/90 to-cyber-purple/90 hover:from-cyber-blue hover:to-cyber-purple text-white font-semibold border-2 border-cyber-blue/50 hover:border-cyber-blue shadow-lg shadow-cyber-blue/20 transition-all"
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

    </div>
  );
}

