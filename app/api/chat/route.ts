import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LOL_SYSTEM_PROMPT, TRAIT_LIBRARY } from "@/constants/systemPrompt";

export async function POST(request: NextRequest) {
  try {
    const { apiKey, command, gameState } = await request.json();

    // API Key 검증
    if (!apiKey) {
      return NextResponse.json(
        { error: "API 키가 필요합니다." },
        { status: 401 }
      );
    }

    if (!command) {
      return NextResponse.json(
        { error: "명령어가 필요합니다." },
        { status: 400 }
      );
    }

    // Google Generative AI 클라이언트 생성 (사용자가 입력한 API Key 사용)
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gemini 2.5 Flash 모델 사용
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: LOL_SYSTEM_PROMPT,
    });

    // 현재 게임 상태를 텍스트로 변환
    const currentTeam = gameState.teams.find(
      (t: any) => t.id === gameState.currentTeamId
    );
    const currentDate = new Date(gameState.currentDate);
    
    // 게임 모드 및 선수 정보 추가
    let gameStateText = `
현재 게임 상태:
- 날짜: ${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(currentDate.getDate()).padStart(2, "0")}
- 게임 모드: ${gameState.gameMode === "PLAYER" ? "선수 커리어 모드" : gameState.gameMode === "MANAGER" ? "감독 모드" : "미선택"}
- 선택된 팀: ${currentTeam?.name || "없음"}
- 팀 자금: ${currentTeam ? (currentTeam.money / 100000000).toFixed(1) : 0}억원
- 로스터: ${currentTeam?.roster.length || 0}명
`;

    // 선수 커리어 모드이고 userPlayer가 이미 생성된 경우
    if (gameState.gameMode === "PLAYER" && gameState.userPlayer) {
      const player = gameState.userPlayer;
      const initialTrait = gameState.userPlayerInitialTrait;
      const traitInfo = initialTrait && TRAIT_LIBRARY[initialTrait as keyof typeof TRAIT_LIBRARY];
      const traitName = traitInfo ? traitInfo.name : initialTrait || "없음";
      
      // 롤모델 정보 가져오기
      let roleModelInfo = "";
      let roleModelText = "";
      if (gameState.userPlayerRoleModelId) {
        // players 배열에서 롤모델 찾기
        const roleModel = gameState.players?.find((p: any) => p.id === gameState.userPlayerRoleModelId);
        if (roleModel) {
          const roleModelTeam = gameState.teams.find((t: any) => t.id === roleModel.teamId);
          roleModelInfo = `  * 롤모델: ${roleModel.nickname}(${roleModel.name}) - ${roleModelTeam?.name || "무소속"} ${roleModel.position} (${roleModel.tier})`;
          roleModelText = `${roleModel.nickname}(${roleModel.name})`;
        }
      }
      
      gameStateText += `
- [선수 커리어 모드] 캐릭터 정보:
  * 닉네임: ${player.nickname}
  * 실명: ${player.name}
  * 나이: ${player.age}세
  * 포지션: ${player.position}
  * 초기 특성: ${traitName}${traitInfo ? ` (${traitInfo.desc})` : ""}${roleModelInfo ? `\n${roleModelInfo}` : ""}
  * 등급: ${player.tier}
  * 소속: ${player.division || "2군"}
  * 스탯: 라인전 ${player.stats?.라인전 || 0}, 한타 ${player.stats?.한타 || 0}, 운영 ${player.stats?.운영 || 0}, 피지컬 ${player.stats?.피지컬 || 0}, 챔프폭 ${player.stats?.챔프폭 || 0}, 멘탈 ${player.stats?.멘탈 || 0}
  
[중요] 이 선수는 이미 캐릭터 생성이 완료되었습니다. 사용자에게 정보를 다시 묻지 말고, 다음 메시지를 출력하세요:${roleModelText ? `
"입력하신 정보(**닉네임**: ${player.nickname}, **실명**: ${player.name}, **나이**: ${player.age}세, **포지션**: ${player.position}, **특성**: ${traitName}, **롤모델**: ${roleModelText})로 캐릭터 생성을 완료했습니다. 이제 팀을 선택해주세요."` : `
"입력하신 정보(**닉네임**: ${player.nickname}, **실명**: ${player.name}, **나이**: ${player.age}세, **포지션**: ${player.position}, **특성**: ${traitName})로 캐릭터 생성을 완료했습니다. 이제 팀을 선택해주세요."`}
그 후 즉시 팀 선택 단계로 진행하세요.
`;
    }

    // 사용자 메시지 구성
    const userMessage = `${gameStateText}

사용자 명령: ${command}

위 명령을 처리하고 응답하세요. 응답 형식은 시스템 프롬프트의 "II. [UI 렌더링 및 출력 가이드]"를 따라주세요.`;

    // Gemini API 호출 (스트리밍 지원)
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
      },
    });

    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Chat API 오류:", error);
    return NextResponse.json(
      {
        error: "API 호출 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

