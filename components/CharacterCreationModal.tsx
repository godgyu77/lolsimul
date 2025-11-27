"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { User, Sparkles, Star } from "lucide-react";
import { useGameStore } from "@/store/gameStore";
import { Position, Player } from "@/types";
import { TRAIT_LIBRARY } from "@/constants/systemPrompt";

export default function CharacterCreationModal() {
  const { createUserPlayer, gameMode, userPlayer, players, teams } = useGameStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number>(17);
  const [position, setPosition] = useState<Position | "">("");
  const [initialTrait, setInitialTrait] = useState<string>("");
  const [roleModelId, setRoleModelId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 클라이언트에서만 마운트 상태 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 선수 모드이고 userPlayer가 없을 때 모달 열기
  useEffect(() => {
    if (isMounted) {
      setIsOpen(gameMode === "PLAYER" && !userPlayer);
    }
  }, [isMounted, gameMode, userPlayer]);

  // C등급 특성 목록 필터링
  const cTierTraits = Object.entries(TRAIT_LIBRARY)
    .filter(([_, trait]) => trait.tier === "C")
    .map(([key, trait]) => ({ key, ...trait }));

  // 1군 선수만 필터링 (롤모델 선택용)
  const availableRoleModels = useMemo(() => {
    return players
      .filter((p) => p.division === "1군")
      .map((p) => {
        const team = teams.find((t) => t.id === p.teamId);
        return {
          ...p,
          teamName: team?.name || "무소속",
          teamAbbr: team?.abbreviation || "",
        };
      })
      .sort((a, b) => {
        // 팀명으로 먼저 정렬, 그 다음 닉네임으로 정렬
        if (a.teamName !== b.teamName) {
          return a.teamName.localeCompare(b.teamName);
        }
        return a.nickname.localeCompare(b.nickname);
      });
  }, [players, teams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nickname.trim()) {
      newErrors.nickname = "닉네임을 입력해주세요.";
    } else if (nickname.length > 20) {
      newErrors.nickname = "닉네임은 20자 이하여야 합니다.";
    }


    if (age < 17 || age > 19) {
      newErrors.age = "나이는 17~19세만 가능합니다.";
    }

    if (!position) {
      newErrors.position = "포지션을 선택해주세요.";
    }

    if (!initialTrait) {
      newErrors.initialTrait = "초기 특성을 선택해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    createUserPlayer({
      name: nickname.trim(), // 닉네임을 name으로도 사용
      nickname: nickname.trim(),
      position: position as Position,
      age,
      initialTrait,
      roleModelId: roleModelId || null,
    });

    setIsOpen(false);
  };

  // 서버 사이드 렌더링 시 또는 마운트 전에는 렌더링하지 않음
  if (!isMounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-cyber-purple/20 flex items-center justify-center">
              <User className="w-8 h-8 text-cyber-purple" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
            캐릭터 생성
          </h2>
          <p className="text-sm text-muted-foreground">
            선수 커리어 모드를 시작하기 위해 캐릭터를 생성하세요
          </p>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-4">
          {/* 닉네임 */}
          <div className="space-y-2">
            <label htmlFor="nickname" className="block text-white font-semibold text-base">
              닉네임 *
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                if (errors.nickname) setErrors({ ...errors, nickname: "" });
              }}
              placeholder="예: FakerJunior"
              className="w-full px-4 py-3 bg-input font-medium border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
              maxLength={20}
            />
            {errors.nickname && (
              <p className="text-sm text-red-400">{errors.nickname}</p>
            )}
          </div>

          {/* 나이 */}
          <div className="space-y-2">
            <label htmlFor="age" className="block text-white font-semibold text-base">
              나이 * (17~19세)
            </label>
            <input
              id="age"
              type="number"
              min={17}
              max={19}
              value={age}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 17;
                setAge(Math.max(17, Math.min(19, value)));
                if (errors.age) setErrors({ ...errors, age: "" });
              }}
              className="w-full px-4 py-3 bg-input font-medium border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
            />
            {errors.age && (
              <p className="text-sm text-red-400">{errors.age}</p>
            )}
          </div>

          {/* 포지션 */}
          <div className="space-y-2">
            <label htmlFor="position" className="block text-white font-semibold text-base">
              포지션 *
            </label>
            <select
              id="position"
              value={position}
              onChange={(e) => {
                setPosition(e.target.value as Position);
                if (errors.position) setErrors({ ...errors, position: "" });
              }}
              className="w-full px-4 py-3 bg-input font-medium border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
            >
              <option value="">포지션을 선택하세요</option>
              <option value="TOP">TOP (탑)</option>
              <option value="JGL">JGL (정글)</option>
              <option value="MID">MID (미드)</option>
              <option value="ADC">ADC (원딜)</option>
              <option value="SPT">SPT (서포터)</option>
            </select>
            {errors.position && (
              <p className="text-sm text-red-400">{errors.position}</p>
            )}
          </div>

          {/* 초기 특성 */}
          <div className="space-y-2">
            <label htmlFor="trait" className="block text-white font-semibold text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyber-purple" />
              초기 특성 * (C등급)
            </label>
            <select
              id="trait"
              value={initialTrait}
              onChange={(e) => {
                setInitialTrait(e.target.value);
                if (errors.initialTrait) setErrors({ ...errors, initialTrait: "" });
              }}
              className="w-full px-4 py-3 bg-input font-medium border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
            >
              <option value="">초기 특성을 선택하세요</option>
              {cTierTraits.map((trait) => (
                <option key={trait.key} value={trait.key}>
                  {trait.name} - {trait.desc}
                </option>
              ))}
            </select>
            {errors.initialTrait && (
              <p className="text-sm text-red-400">{errors.initialTrait}</p>
            )}
            {initialTrait && cTierTraits.find((t) => t.key === initialTrait) && (
              <p className="text-sm text-muted-foreground">
                {cTierTraits.find((t) => t.key === initialTrait)?.desc}
              </p>
            )}
          </div>

          {/* 롤모델 선택 */}
          <div className="space-y-2">
            <label htmlFor="roleModel" className="block text-white font-semibold text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              롤모델 (선택)
            </label>
            <select
              id="roleModel"
              value={roleModelId}
              onChange={(e) => {
                setRoleModelId(e.target.value);
              }}
              className="w-full px-4 py-3 bg-input font-medium border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
            >
              <option value="">롤모델을 선택하지 않음</option>
              {availableRoleModels.map((player) => (
                <option key={player.id} value={player.id}>
                  [{player.teamAbbr}] {player.nickname} - {player.position} ({player.tier})
                </option>
              ))}
            </select>
            {roleModelId && (
              <p className="text-sm text-muted-foreground">
                {(() => {
                  const selected = availableRoleModels.find((p) => p.id === roleModelId);
                  return selected
                    ? `${selected.teamName}의 ${selected.nickname} 선수를 롤모델로 선택했습니다.`
                    : "";
                })()}
              </p>
            )}
          </div>
        </div>

        {/* 안내 */}
        <div className="bg-muted/50 border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground text-center">
            생성된 캐릭터는 2군 신인으로 시작하며, 팀 선택 후 해당 팀의 2군 로스터에 등록됩니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            className="flex-1 gap-2 bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-blue/80 hover:to-cyber-purple/80"
            disabled={!nickname || !position || !initialTrait}
          >
            <User className="w-4 h-4" />
            캐릭터 생성
          </Button>
        </div>
      </div>
    </div>
  );
}

