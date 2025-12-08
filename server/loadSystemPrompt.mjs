import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// systemPrompt.ts 파일을 읽어서 LOL_SYSTEM_PROMPT 추출
export function loadSystemPrompt() {
  try {
    const systemPromptPath = join(__dirname, '../constants/systemPrompt.ts');
    const content = readFileSync(systemPromptPath, 'utf-8');
    
    // export const LOL_SYSTEM_PROMPT = `...` 패턴 찾기
    const match = content.match(/export const LOL_SYSTEM_PROMPT = `([\s\S]*?)`;/);
    if (match) {
      return match[1].trim();
    }
    
    // 백틱이 여러 줄에 걸쳐 있는 경우 처리
    const multiLineMatch = content.match(/export const LOL_SYSTEM_PROMPT = `([\s\S]*?)`;$/m);
    if (multiLineMatch) {
      return multiLineMatch[1].trim();
    }
    
    console.warn('LOL_SYSTEM_PROMPT를 찾을 수 없습니다. 기본 프롬프트를 사용합니다.');
    return null;
  } catch (error) {
    console.error('systemPrompt.ts 파일을 읽는 중 오류:', error);
    return null;
  }
}

