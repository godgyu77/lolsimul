"use client";

import { useGameStore } from "@/store/gameStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewsArchiveView() {
  const { newsHistory } = useGameStore();

  // 최신순으로 정렬
  const sortedNews = [...newsHistory].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // 뉴스 타입별 색상
  const getNewsTypeColor = (type: string) => {
    switch (type) {
      case "transfer":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "match":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "contract":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "general":
      default:
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    }
  };

  // 뉴스 타입 한글명
  const getNewsTypeName = (type: string) => {
    switch (type) {
      case "transfer":
        return "이적";
      case "match":
        return "경기";
      case "contract":
        return "계약";
      case "general":
      default:
        return "일반";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent mb-2">
          뉴스 아카이브
        </h1>
        <p className="text-muted-foreground">
          게임 내 모든 뉴스를 시간순으로 확인하세요.
        </p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-cyber-blue" />
            뉴스 타임라인
          </CardTitle>
          <CardDescription>
            총 {sortedNews.length}개의 뉴스
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedNews.length > 0 ? (
            <div className="space-y-4">
              {sortedNews.map((news, index) => {
                const newsDate = new Date(news.date);
                const isRecent = index < 5; // 최근 5개는 강조

                return (
                  <div
                    key={news.id}
                    className={cn(
                      "relative pl-8 pb-6 border-l-2 border-border",
                      index !== sortedNews.length - 1 && "border-l-2",
                      isRecent && "border-l-primary"
                    )}
                  >
                    {/* 타임라인 점 */}
                    <div
                      className={cn(
                        "absolute left-[-6px] top-1 w-3 h-3 rounded-full border-2",
                        isRecent
                          ? "bg-primary border-primary"
                          : "bg-muted border-border"
                      )}
                    />

                    <div className="space-y-2">
                      {/* 날짜 및 타입 */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {newsDate.toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", getNewsTypeColor(news.type))}
                        >
                          {getNewsTypeName(news.type)}
                        </Badge>
                        {isRecent && (
                          <Badge variant="default" className="text-xs">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            최신
                          </Badge>
                        )}
                      </div>

                      {/* 제목 */}
                      <h3
                        className={cn(
                          "font-semibold text-lg",
                          isRecent && "text-primary"
                        )}
                      >
                        {news.title}
                      </h3>

                      {/* 내용 */}
                      {news.content && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {news.content}
                        </p>
                      )}

                      {/* 관련 팀 */}
                      {news.relatedTeamIds && news.relatedTeamIds.length > 0 && (
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-xs text-muted-foreground">관련 팀:</span>
                          <div className="flex gap-1">
                            {news.relatedTeamIds.map((teamId) => (
                              <Badge
                                key={teamId}
                                variant="outline"
                                className="text-xs"
                              >
                                {teamId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>아직 뉴스가 없습니다.</p>
              <p className="text-sm mt-2">게임을 진행하면 뉴스가 여기에 표시됩니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
