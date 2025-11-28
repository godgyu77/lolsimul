"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { X, Newspaper } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { NewsItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const newsTypeLabels: Record<NewsItem["type"], string> = {
  transfer: "이적",
  match: "경기",
  general: "일반",
  contract: "계약",
};

const newsTypeColors: Record<NewsItem["type"], string> = {
  transfer: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  match: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  general: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  contract: "bg-green-500/20 text-green-400 border-green-500/30",
};

export default function NewsModal({ isOpen, onClose }: NewsModalProps) {
  const { newsHistory, currentDate, getTeamById } = useGameStore();

  // currentDate 기준으로 뉴스 필터링 (현재 날짜 이전의 뉴스만 표시)
  const filteredNews = useMemo(() => {
    if (!newsHistory || newsHistory.length === 0) return [];

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);

    return newsHistory
      .filter((item) => {
        const newsDate = new Date(item.date);
        newsDate.setHours(0, 0, 0, 0);
        // 현재 날짜 이전 또는 같은 날짜의 뉴스만 표시
        return newsDate <= today;
      })
      .sort((a, b) => {
        // 최신순 정렬
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [newsHistory, currentDate]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center h-screen bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        // backdrop 클릭 시 모달 닫기
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden m-4 sm:m-0"
        onClick={(e) => {
          // 모달 내부 클릭 시 이벤트 전파 방지
          e.stopPropagation();
        }}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-cyber-purple shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent truncate">
                뉴스 아카이브
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                현재 날짜 기준: {formatDate(currentDate)} ({filteredNews.length}개)
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-10 w-10 sm:h-8 sm:w-8 shrink-0 touch-manipulation"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* 뉴스 목록 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {filteredNews.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center py-8 sm:py-12 text-muted-foreground px-4">
                <Newspaper className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 opacity-50" />
                <p className="text-base sm:text-lg font-medium">아직 새로운 소식이 없습니다.</p>
                <p className="text-xs sm:text-sm mt-2 opacity-70">
                  게임을 진행하면 뉴스가 생성됩니다.
                </p>
              </div>
            </div>
          ) : (
            filteredNews.map((item) => (
              <Card
                key={item.id}
                className="bg-muted/30 border-border hover:bg-muted/50 transition-colors"
              >
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <CardTitle className="text-base sm:text-lg font-semibold flex-1">
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        className={newsTypeColors[item.type]}
                        variant="outline"
                        className="text-xs"
                      >
                        {newsTypeLabels[item.type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(item.date)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap break-words">
                    {item.content}
                  </p>
                  {item.relatedTeamIds && item.relatedTeamIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        관련 팀:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.relatedTeamIds.map((teamId) => {
                          const team = getTeamById(teamId);
                          return team ? (
                            <Badge
                              key={teamId}
                              variant="outline"
                              className="text-xs touch-manipulation"
                            >
                              {team.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

