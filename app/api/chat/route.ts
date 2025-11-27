import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LOL_SYSTEM_PROMPT, TRAIT_LIBRARY, ROSTER_DB } from "@/constants/systemPrompt";

// 재시도 가능한 HTTP 상태 코드
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

// 재시도 로직 (exponential backoff)
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // 재시도 불가능한 오류면 즉시 throw
      if (error?.status && !RETRYABLE_STATUS_CODES.includes(error.status)) {
        throw error;
      }
      
      // 마지막 시도면 throw
      if (attempt === maxRetries) {
        break;
      }
      
      // exponential backoff: 1초, 2초, 4초...
      const delay = initialDelay * Math.pow(2, attempt);
      console.log(`API 호출 실패 (시도 ${attempt + 1}/${maxRetries + 1}). ${delay}ms 후 재시도...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

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
  * 나이: ${player.age}세
  * 포지션: ${player.position}
  * 초기 특성: ${traitName}${traitInfo ? ` (${traitInfo.desc})` : ""}${roleModelInfo ? `\n${roleModelInfo}` : ""}
  * 등급: ${player.tier}
  * 소속: ${player.division || "2군"}
  * 스탯: 라인전 ${player.stats?.라인전 || 0}, 한타 ${player.stats?.한타 || 0}, 운영 ${player.stats?.운영 || 0}, 피지컬 ${player.stats?.피지컬 || 0}, 챔프폭 ${player.stats?.챔프폭 || 0}, 멘탈 ${player.stats?.멘탈 || 0}
  
[중요] 이 선수는 이미 캐릭터 생성이 완료되었습니다. 사용자에게 정보를 다시 묻지 말고, 다음 메시지를 출력하세요:${roleModelText ? `
"입력하신 정보(**닉네임**: ${player.nickname}, **나이**: ${player.age}세, **포지션**: ${player.position}, **특성**: ${traitName}, **롤모델**: ${roleModelText})로 캐릭터 생성을 완료했습니다. 이제 팀을 선택해주세요."` : `
"입력하신 정보(**닉네임**: ${player.nickname}, **나이**: ${player.age}세, **포지션**: ${player.position}, **특성**: ${traitName})로 캐릭터 생성을 완료했습니다. 이제 팀을 선택해주세요."`}
그 후 즉시 팀 선택 단계로 진행하세요.
`;
    }

    // 현재 팀의 ROSTER_DB 데이터 가져오기
    let rosterDbData = "";
    if (currentTeam) {
      const teamRoster = ROSTER_DB[currentTeam.id as keyof typeof ROSTER_DB];
      if (teamRoster) {
        rosterDbData = `
[중요] 현재 선택된 팀 "${currentTeam.name}" (${currentTeam.id})의 정확한 로스터 데이터는 아래 ROSTER_DB에서 가져와야 합니다:

팀명: ${teamRoster.teamName}
재정 등급: ${teamRoster.financialTier}
자금: ${teamRoster.money}억원

1군 로스터:
${teamRoster.roster
  .filter((p: any) => p.div === "1군" && p.role !== "SUB")
  .map((p: any) => `- ${p.role}: ${p.name} (나이: ${p.age}세, 계약: ${p.contract}년, 등급: ${p.stats.ovr}, 특성: ${p.traits.join(", ")})`)
  .join("\n")}

2군 로스터:
${teamRoster.roster
  .filter((p: any) => p.div === "2군")
  .map((p: any) => `- ${p.role}: ${p.name} (나이: ${p.age}세, 계약: ${p.contract}년, 등급: ${p.stats.ovr})`)
  .join("\n")}

[절대 규칙] 로스터를 출력할 때는 반드시 위 ROSTER_DB의 데이터를 그대로 사용하세요. 임의로 선수 이름을 변경하거나 생성하지 마세요.
예를 들어, 한화생명e스포츠(HLE)의 1군 로스터는 반드시:
- TOP: Zeus
- JGL: Kanavi
- MID: Zeka
- ADC: Gumayusi
- SPT: Delight
입니다. 다른 이름(HLE Viper, HLE Shadow 등)을 사용하면 안 됩니다.
`;
      }
    }

    // 사용자 메시지 구성
    const userMessage = `${gameStateText}${rosterDbData}

사용자 명령: ${command}

위 명령을 처리하고 응답하세요. 응답 형식은 시스템 프롬프트의 "II. [UI 렌더링 및 출력 가이드]"를 따라주세요.
[중요] 로스터를 출력할 때는 반드시 위에 제공된 ROSTER_DB 데이터를 정확히 사용하세요. 임의로 선수 이름을 변경하거나 생성하지 마세요.`;

    // Gemini API 호출 (재시도 로직 포함)
    const result = await retryWithBackoff(async () => {
      return await model.generateContent({
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
    }, 3, 1000); // 최대 3회 재시도, 초기 지연 1초

    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });
  } catch (error: any) {
    console.error("Chat API 오류:", error);
    
    // 재시도 가능한 오류인지 확인
    const isRetryable = error?.status && RETRYABLE_STATUS_CODES.includes(error.status);
    
    // 사용자에게 친화적인 오류 메시지
    let errorMessage = "API 호출 중 오류가 발생했습니다.";
    let statusCode = 500;
    
    if (error?.status === 503) {
      errorMessage = "서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요.";
      statusCode = 503;
    } else if (error?.status === 429) {
      errorMessage = "요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
      statusCode = 429;
    } else if (error?.status === 401) {
      errorMessage = "API 키가 유효하지 않습니다. API 키를 확인해주세요.";
      statusCode = 401;
    } else if (error?.status === 400) {
      errorMessage = "잘못된 요청입니다. 입력 내용을 확인해주세요.";
      statusCode = 400;
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "알 수 없는 오류",
        retryable: isRetryable,
      },
      { status: statusCode }
    );
  }
}

