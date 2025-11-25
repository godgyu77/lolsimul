"use client";

import { useGameStore } from "@/store/gameStore";
import { NewsItem } from "@/types";
import { Newspaper, Trophy, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewsSidebar() {
  const { news } = useGameStore();

  const getNewsIcon = (type: NewsItem["type"]) => {
    switch (type) {
      case "match":
        return Trophy;
      case "transfer":
        return Users;
      case "contract":
        return Users;
      default:
        return FileText;
    }
  };

  const getNewsColor = (type: NewsItem["type"]) => {
    switch (type) {
      case "match":
        return "text-cyber-blue";
      case "transfer":
        return "text-cyber-purple";
      case "contract":
        return "text-cyber-green";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-cyber-blue" />
          <h2 className="text-lg font-bold">뉴스</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {news.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            뉴스가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {news.map((item) => {
              const Icon = getNewsIcon(item.type);
              const colorClass = getNewsColor(item.type);

              return (
                <div
                  key={item.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5", colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {item.date.toLocaleDateString("ko-KR", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            item.type === "match" && "bg-cyber-blue/20 text-cyber-blue",
                            item.type === "transfer" && "bg-cyber-purple/20 text-cyber-purple",
                            item.type === "contract" && "bg-cyber-green/20 text-cyber-green",
                            item.type === "general" && "bg-muted text-muted-foreground"
                          )}
                        >
                          {item.type === "match"
                            ? "경기"
                            : item.type === "transfer"
                            ? "이적"
                            : item.type === "contract"
                            ? "계약"
                            : "일반"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold mb-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

