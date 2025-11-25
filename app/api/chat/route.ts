import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LOL_SYSTEM_PROMPT } from "@/constants/systemPrompt";

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
    
    const gameStateText = `
현재 게임 상태:
- 날짜: ${currentDate.getFullYear()}/${String(currentDate.getMonth() + 1).padStart(2, "0")}/${String(currentDate.getDate()).padStart(2, "0")}
- 선택된 팀: ${currentTeam?.name || "없음"}
- 팀 자금: ${currentTeam ? (currentTeam.money / 100000000).toFixed(1) : 0}억원
- 로스터: ${currentTeam?.roster.length || 0}명
`;

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

