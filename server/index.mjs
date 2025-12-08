import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadSystemPrompt } from './loadSystemPrompt.mjs';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// systemPrompt.ts에서 LOL_SYSTEM_PROMPT 로드
const systemPrompt = loadSystemPrompt();
const DEFAULT_SYSTEM_PROMPT = systemPrompt || `You are a game assistant for LCK Manager Simulation.`;

// 재시도 가능한 HTTP 상태 코드
const RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504];

// 재시도 로직 (exponential backoff)
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
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

// 간단한 시즌 이벤트 계산 함수
function getSeasonEvent(date) {
  const month = date.getMonth() + 1;
  if (month >= 1 && month <= 3) return "kespa";
  if (month >= 4 && month <= 8) return "lck";
  if (month === 5) return "msi";
  if (month >= 9 && month <= 11) return "worlds";
  return "off";
}

app.post('/api/chat', async (req, res) => {
  try {
    const { apiKey, command, messageHistory = [], gameState } = req.body;

    // API Key 검증
    if (!apiKey) {
      return res.status(401).json({ error: "API 키가 필요합니다." });
    }

    if (!command) {
      return res.status(400).json({ error: "명령어가 필요합니다." });
    }

    // Google Generative AI 클라이언트 생성
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Gemini 2.5 Flash 모델 사용
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: DEFAULT_SYSTEM_PROMPT,
    });

    // 현재 게임 상태를 텍스트로 변환
    const currentTeam = gameState.teams?.find(
      (t) => t.id === gameState.currentTeamId
    );
    const currentDate = new Date(gameState.currentDate);
    
    // 현재 팀의 로스터 및 스태프 정보
    const team1Roster = currentTeam?.roster?.filter((p) => p.division === "1군") || [];
    const hasHeadCoach = gameState.rosters?.staff?.some((s) => s.role === "headCoach") || false;
    const currentSeasonEvent = getSeasonEvent(currentDate);
    
    // 게임 모드 및 선수 정보 추가
    let gameStateText = `
현재 게임 상태:
- 날짜: ${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(currentDate.getDate()).padStart(2, "0")}
- 게임 모드: ${gameState.gameMode === "PLAYER" ? "선수 커리어 모드" : gameState.gameMode === "MANAGER" ? "감독 모드" : "미선택"}
- 선택된 팀: ${currentTeam?.name || "없음"}
- 팀 자금: ${currentTeam ? (currentTeam.money / 100000000).toFixed(1) : 0}억원
- 1군 로스터: ${team1Roster.length}명 (필수: 5명 이상)
- 코칭스태프: ${gameState.rosters?.staff?.length || 0}명 (감독 필수: ${hasHeadCoach ? "있음" : "없음"})
- 현재 시즌 이벤트: ${currentSeasonEvent}
`;

    // 선수 커리어 모드이고 userPlayer가 이미 생성된 경우
    if (gameState.gameMode === "PLAYER" && gameState.userPlayer) {
      const player = gameState.userPlayer;
      gameStateText += `
- [선수 커리어 모드] 캐릭터 정보:
  * 닉네임: ${player.nickname}
  * 나이: ${player.age}세
  * 포지션: ${player.position}
  * 등급: ${player.tier}
  * 소속: ${player.division || "2군"}
`;
    }

    // 사용자 메시지 구성
    const userMessage = `${gameStateText}

사용자 명령: ${command}

위 명령을 처리하고 응답하세요.`;

    // 대화 히스토리와 현재 메시지 결합
    const contents = [
      ...messageHistory,
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ];

    // Gemini API 호출 (재시도 로직 포함)
    const result = await retryWithBackoff(async () => {
      return await model.generateContent({
        contents: contents,
        generationConfig: {
          temperature: 0.3,
        },
      });
    }, 3, 1000);

    const responseText = result.response.text();

    return res.json({ response: responseText });
  } catch (error) {
    console.error("Chat API 오류:", error);
    
    // 재시도 가능한 오류인지 확인
    const isRetryable = error?.status && RETRYABLE_STATUS_CODES.includes(error?.status);
    
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
    
    return res.status(statusCode).json({
      error: errorMessage,
      details: error instanceof Error ? error.message : "알 수 없는 오류",
      retryable: isRetryable,
    });
  }
});

app.listen(PORT, () => {
  console.log(`API 서버가 포트 ${PORT}에서 실행 중입니다.`);
});

