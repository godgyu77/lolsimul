"use client";

import { StaffInfo } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGameStore } from "@/store/gameStore";

interface StaffTableProps {
  staff: StaffInfo[];
  onStaffClick?: (staffId: string) => void;
}

export default function StaffTable({ staff, onStaffClick }: StaffTableProps) {
  const { currentDate } = useGameStore();

  // 직책 이름 매핑
  const roleNames: Record<StaffInfo["role"], string> = {
    headCoach: "감독",
    assistantCoach: "코치",
    analyst: "분석가",
    manager: "매니저",
  };

  // 계약 만료가 당해년도인지 확인
  const isContractExpiring = (contractEndsAt: number): boolean => {
    return contractEndsAt === currentDate.getFullYear();
  };

  // 능력치 색상 결정
  const getSkillColor = (skill: number): string => {
    if (skill >= 90) return "text-yellow-400 font-bold";
    if (skill >= 80) return "text-blue-400";
    if (skill >= 70) return "text-green-400";
    if (skill >= 60) return "text-yellow-500";
    return "text-orange-400";
  };

  if (staff.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        등록된 코칭스태프가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full max-h-[calc(100vh-300px)]">
      <div className="px-6 py-4 border-b border-border flex-shrink-0">
        <h2 className="text-xl font-bold">코칭스태프</h2>
        <p className="text-sm text-muted-foreground mt-1">
          총 {staff.length}명
        </p>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                직책
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                이름
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                능력치
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                연봉
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                계약기간
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((member) => {
              const isExpiring = isContractExpiring(member.contractEndsAt);

              return (
                <tr
                  key={member.id}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    onStaffClick && "cursor-pointer hover:bg-muted/50"
                  )}
                  onClick={() => onStaffClick?.(member.id)}
                >
                  <td className="px-4 py-3 text-sm">
                    <Badge variant="outline" className="text-xs">
                      {roleNames[member.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {member.name}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold", getSkillColor(member.skill))}>
                        {member.skill}
                      </span>
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            member.skill >= 90
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                              : member.skill >= 80
                              ? "bg-blue-400"
                              : member.skill >= 70
                              ? "bg-green-400"
                              : member.skill >= 60
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          )}
                          style={{ width: `${member.skill}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {member.salary.toFixed(1)}억원
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={cn(
                        isExpiring && "text-red-400 font-semibold"
                      )}
                    >
                      ~{member.contractEndsAt}년
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

