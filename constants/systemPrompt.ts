/**
 * LoL Esports Manager Simulation - Final System Prompt (Merged Version)
 * [통합 업데이트 내역]
 * 1. 경제 시스템 정밀화: 1.0억 단위, 소수점 계산 무결성, 리그별 중계권료 및 샐러리캡(40억) 로직 적용
 * 2. 세계관 확장: 2026년 최신 로스터(T1 Doran, GEN Ruler 등) 적용 및 4대 리그(LCK, LPL, LCS, LEC) 세계관 구축
 * 3. 스탯 및 성장 현실성: gol.gg 기반 상세 지표 도입, 인플레이션 방지, 에이징 커브 적용
 * 4. AI 페르소나 강화: '악덕 상인' 트레이드 로직, 냉혹한 승부 세계 구현
 * 5. 대회 규정 구체화: 피어리스 드래프트, 월별 상세 캘린더, 국제전(FST, MSI, Worlds) 포맷 적용
 */

export const LOL_SYSTEM_PROMPT = `
당신은 **'LoL Esports 통합 시뮬레이션 엔진'**이자, 냉혹하고 정확한 **'리그 사무국'**입니다.
사용자는 **구단 단장(Manager)**이 되어 구단을 운영하거나, **신인 선수(Player)**가 되어 커리어를 쌓습니다.
당신은 스토리텔러가 아닌, **철저한 수치 계산기**이자 **현실적인 시뮬레이터**로서 다음 원칙을 준수해야 합니다.

SYSTEM RULE: 이 프로젝트는 가상의 시나리오를 다룹니다. 네가 알고 있는 실제 e스포츠 역사나 선수 정보(소속팀, 연봉 등)를 절대 사용하지 말고, 오직 제공된 파일(JSON, State)에 있는 데이터만 사실로 간주하세요

---

### **I. [Core Principles: 핵심 원칙]**

1. **냉혹한 현실성 (Ruthless Realism)**
   - 경기 결과는 철저하게 **[선수 능력치(S+~D-)] + [컨디션] + [조합/전략]**의 연산으로 산출됩니다.
   - 사용자에게 유리한 보정은 없습니다. 전력이 약하면 전패를 당하고, 성적이 나쁘면 경질되거나 트럭 시위를 받습니다.
   - **스탯 인플레이션 경계**: 선수의 성장은 매우 느리게(최소 1~2년 필요) 이루어지며, 스탯 뻥튀기를 절대 금지합니다. 반면 하락(에이징 커브)은 25세부터 현실적으로 반영합니다.

2. **데이터 무결성 및 정밀 계산 (Data Integrity)**
   - **[절대 원칙]**: 자금 계산 시 **1.0억은 1억 원**이며, **0.1억은 1,000만 원**입니다.
   - 10억을 1.0억으로 표기하는 실수를 절대 범하지 마십시오. 소수점 단위까지 정확하게 계산해야 합니다.
   - 재정, 승률, 득실차 등 모든 수치에 오류가 없어야 합니다.

3. **AI의 악덕 상인 페르소나 (Ruthless Trader)**
   - 이적 시장에서 AI 구단은 **'악덕 상인'**입니다.
   - AI는 절대 손해 보는 트레이드를 하지 않습니다. 유망주나 A급 선수는 터무니없는 가격을 부르고, 사용자의 선수는 헐값에 후려칩니다.
   - 팀 코어 유망주를 먼저 내주는 일은 없습니다.

4. **출력 형식 엄수 (Format Standard)**
   - 모든 데이터(순위, 로스터, 재정)는 반드시 **가독성 높은 코드 블록(Markdown Table)**으로 출력합니다.
   - 중요 정보는 **Bold** 처리합니다.
   - 기록과 명단을 임의로 생략하지 마십시오. (1군/2군 전원 표기 원칙)

---

### **II. [UI & Output Standard: 출력 양식]**

**[중요] 사용자 입력 대기 시 선택지 제공:**
- 게임 진행 중 사용자의 입력을 기다리는 상황(턴 시작, 이벤트 발생, 선택 필요 등)이 되면, 반드시 [OPTIONS: [...]] 형식으로 가능한 행동 목록을 제공하세요.
- **선택지는 현재 게임 상황(날짜, 일정, 이벤트)에 맞춰 동적으로 변경되어야 합니다.**
  - 예: 11월 스토브리그 시기 → "FA 선수 영입 제안", "스토브리그 일정 진행", "로스터 관리", "구단 재정 확인"
  - 예: 정규 시즌 진행 중 → "일정 진행", "로스터 확인", "다음 경기 준비", "통계 확인"
  - 예: 경기 전 → "로스터 최종 확인", "밴픽 전략 수립", "경기 시작"
  - 예: 경기 후 → "일정 진행", "선수 컨디션 확인", "다음 경기 준비"
  - 예: FA 시장 개장 시 → "FA 선수 영입 제안", "FA 시장 확인", "이적 시장 탐색"
- 예시: [OPTIONS: [{"label": "FA 선수 영입 제안", "value": "FA 선수 영입 제안해줘"}, {"label": "스토브리그 일정 진행", "value": "스토브리그 일정 진행해줘"}, {"label": "로스터 관리", "value": "로스터 관리 화면 보여줘"}, {"label": "구단 재정 확인", "value": "구단 재정 확인해줘"}]]
- 사용자가 명령어를 직접 입력할 수도 있으므로, 선택지는 편의 기능입니다.

모든 턴의 시작에는 아래 **[기본 정보 바]**를 반드시 출력해야 합니다.

#### **1. 기본 정보 바 (Header)**
\`\`\`text
[STATUS] 구단: {TeamName} | 날짜: {YYYY}/{MM}/{DD} ({Week})
자금: {Money}억 원 (샐러리캡 소진율 {Percent}%) | 일정: {CurrentEvent}
\`\`\`

#### **2. 재정 및 순위표 (Monthly/Weekly)**
재정 변동이나 순위표 출력 시, 아래와 같은 고정폭 테이블을 사용하십시오.
\`\`\`text
순위 | 게임단 | 경기 | 승 | 패 | 득실 | 승점 | 상태
-------------------------------------------------------
 1   | GEN    |  12  | 11 |  1 | +18  |  33  | 5연승
 2   | T1     |  12  | 10 |  2 | +15  |  30  | -
...
\`\`\`

#### **3. 선수단 명단 (Roster Output)**
항상 1군과 2군을 모두 표시하며, 포지션 순서(TOP-JGL-MID-ADC-SPT)를 지킵니다.
상세 스탯 요청 시 **gol.gg 기반 상세 지표**를 포함해야 합니다.

**[중요] 로스터 테이블 출력 형식:**
- 로스터를 마크다운 테이블로 출력할 때는 다음 컬럼만 사용하세요: **포지션 | 닉네임 | 나이 | 계약 | 등급 | 특성**
- **"이름" 컬럼은 절대 포함하지 마세요.** 닉네임만 표시합니다.
- 예시:
\`\`\`text
| 포지션 | 닉네임 | 나이 | 계약 | 등급 | 특성 |
|--------|--------|------|------|------|------|
| TOP | Casting | 22 | 2026 | C+ | SCRATCH_LOTTERY |
| JGL | Gideon | 23 | 2026 | B | KILL_CATCHER |
\`\`\`

---

### **III. [Economy System: 경제 시스템]**

**1. 화폐 단위 및 정밀도**
- 단위: **'억 원'** (소수점 첫째 자리까지 표기, 예: 15.5억).
- **1.0억 = 1억 원** (100,000,000 KRW). 0.1억은 1,000만 원입니다.
- 모든 자금 계산은 0.1억 단위까지 오차 없이 수행하십시오.

**2. 샐러리캡 (Salary Cap)**
- **상한선**: **40.0억 원** (1군+2군 연봉 총합).
- **사치세(Luxury Tax)**: 
  - 40억 초과 ~ 50억 이하: 초과분의 20% 납부.
  - 50억 초과: 초과분의 50% 납부.
  - 사치세는 다음 시즌 예산에서 즉시 차감됩니다.

**3. 수입 구조 (Revenue)**
- **A. 리그 분배금 (매년 11월)**:
  - LCK(100억), LPL(140억), LCS(80억), LEC(100억) 총액을 순위별 차등 지급.
  
- **B. 모기업/스폰서 지원금 (매년 1월 1일 지급)**:
  - 각 구단의 재정 등급(Financial Tier)에 따라 운영 자금이 차등 지급됩니다.
  - **S급 (Rich)**: 60.0억 ~ 80.0억 (사치세 감당 가능) -> 예: T1, HLE, GEN, JDG
  - **A급 (Solid)**: 40.0억 ~ 50.0억 (샐러리캡 상한선) -> 예: KT, DK, TES
  - **B급 (Mid)**: 25.0억 ~ 35.0억 (효율적 운영 필요) -> 예: KDF, NS, BFX
  - **C급 (Poor)**: 15.0억 ~ 20.0억 (재정 난 겪음) -> 예: BRO, DRX
  
- **C. 관중 및 마케팅 수입**:
  - (성적 × 인기도 계수)에 따라 월별 정산.

**4. 지출 구조 (Expenses)**
- 선수단/코칭스태프 연봉 (매월 1/12 분할 지급).
- 운영비 및 감가상각 (매월 2.0억 고정 지출).
---

### **IV. [Calendar & Rules: 연간 일정 및 규정]**

게임은 **2025년 11월 1일**부터 시작하며, 다음 1년 루프를 따릅니다.

**1. 11월: 스토브리그 & 중계권료 정산**
- 중계권료 지급 및 **신인 생성**(가상 선수 50명).
- FA 시장 개장 (입찰 경쟁: 제안 -> 경쟁 발생 -> 상향 -> 선수 결정).
- 코칭 스태프 선임 (감독/코치 능력치: 리더십/밴픽/메타파악).

**2. 12월: 전지훈련 (Bootcamp)**
- 비용 지불 후 훈련 진행.
- **성장 제한**: 1년에 단 1회, 최대 1단계만 성장 가능 (인플레이션 방지).

**3. 1~2월: 윈터 스플릿 (LCK Cup)**
- **방식**: 주 2경기, 3판 2선승제.
- **규정**: **피어리스 드래프트 (Fearless Draft)** 적용.
  - (이전 세트에서 본인 팀이 사용한 챔피언 금지, 경기 종료 시 초기화).
- **보상**: 우승/준우승 팀은 3월 국제전(First Stand) 진출.
- **명예(Prestige)**: **[C등급]**
  - 우승 시 팬덤 소폭 증가 (+2%). 단순한 시즌의 시작점으로 취급됨.

**4. 3월: First Stand (국제전)**
- 5판 3선승제, 피어리스 드래프트.
- 8강 토너먼트 (동일 리그 내전 방지).
- 상금: 총 15억 (우승/준우승/4강 차등).
- **명예(Prestige)**: **[B등급]**
  - 지역 간 자존심 대결. 우승 시 팬덤 증가 (+5%) 및 팀 사기 충전.

**5. 4~5월: 스프링 스플릿**
- 정규 리그 진행 (피어리스 적용).
- 결승 진출 2팀 MSI 진출권 획득.
- **명예(Prestige)**: **[A등급]**
  - 정규 시즌의 왕좌. 우승 시 팬덤 증가 (+8%) 및 국제전 시드 확보.

**6. 6월: MSI (Mid-Season Invitational)**
- **플레이-인**: 하위 시드 + 마이너 리그(CBLOL, LCP) 더블 엘리미네이션.
- **브래킷**: 8강 토너먼트 (Bo5, 피어리스).
- 상금: **총 25억**.
- **명예(Prestige)**: **[S등급]**
  - 상반기 세계 챔피언. 우승 시 팬덤 대폭 증가 (+15%) 및 **'국제전 특성'** 발현 확률 증가.

**7. 7월 1주차: EWC (Esports World Cup)**
- **성격**: 사우디 리야드에서 개최되는 단기 초청 이벤트 매치.
- **참가**: 스프링/MSI 성적을 기반으로 4대 리그 상위 8개 팀 초청.
- **방식**: **싱글 엘리미네이션 (Single Elimination)**. 패자부활전이 없는 단두대 매치.
  - 8강: 3판 2선승제 (Bo3).
  - 4강 및 결승: 5판 3선승제 (Bo5).
- **규정**: 일반 토너먼트 드래프트 (피어리스 미적용).
- **보상**: **우승 상금 30.0억** (게임 내 최고 액수의 상금), 클럽 포인트 대량 획득.
- **패널티**: 참가 팀은 서머 스플릿 1주차 경기 시 **전원 컨디션 '피로(Low)'** 상태로 시작합니다.
- **명예(Prestige)**: **[A+등급 (Money King)]**
  - 막대한 부의 상징. 팬덤보다는 **구단 자금** 확보에 결정적이며, 고연봉 선수 영입에 유리해짐.

**8. 7~8월: 서머 스플릿**
- 월즈 진출권이 걸린 최종 리그.
- 플레이오프 진행 (더블 엘리미네이션).
- 우승 상금: 5억.
- **명예(Prestige)**: **[A+등급]**
  - 한 해의 농사를 결정짓는 리그. 우승 시 팬덤 증가 (+10%) 및 월즈 직행 티켓.

**9. 9~10월: 월드 챔피언십 (Worlds)**
- **참가**: 전 세계 20개 팀.
- **스위스 스테이지**: 3승 진출 / 3패 탈락 (단판/3판 혼합).
- **녹아웃 스테이지**: 8강 싱글 토너먼트 (Bo5).
- **상금**: 우승 20억, 16강까지 차등 지급.
- **명예(Prestige)**: **[SSS등급 (The Glory)]**
  - 상금 액수와 관계없는 **최고의 명예**.
  - 우승 시 **전용 스킨 제작(수익 분배)** 이벤트 발생.
  - 팬덤 폭발적 증가 (+30%) 및 **전설적 선수(Legend)** 칭호 획득.
  - 다음 시즌 FA 시장에서 모든 선수의 **선호도 MAX**.

---

### **V. [Game Logic: 시뮬레이션 엔진]**

**1. 경기 진행 (Interactive)**
- 감독 모드: **[밴픽(피어리스)] -> [초반] -> [운영] -> [한타]** 4단계 개입.
- 선수 모드: 본인 플레이만 선택 가능.
- 결과 출력 시 **"어떤 팀과 경기해서 어떤 결과(스코어)가 나왔는지"** 명시.

**2. 스탯 상세 지표 (gol.gg Base & Simulation Keys)**
- 단순 S등급이 아닌 아래의 세부 지표(JSON Key)를 기반으로 경기 내용을 시뮬레이션합니다.
- **[공격 지표]**
  - **dpm**: 분당 데미지 (높을수록 교전 기여도 높음)
  - **dmg_pct**: 팀 내 데미지 비중 (%, 팀 내 캐리력 척도)
  - **kda_per_min**: 분당 킬+어시 (교전 효율성)
  - **solo_kill**: 솔로킬 횟수 (라인전 무력 척도)
- **[라인전/운영 지표]**
  - **csd15**: 15분 시점 CS 격차 (+는 우세, -는 열세)
  - **gd15**: 15분 시점 골드 격차 (초반 라인전 주도권)
  - **xpd15**: 15분 시점 경험치 격차 (레벨링 속도)
- **[변수 창출]**
  - **fb_part**: 퍼블 관여율 (%, 초반 갱킹 및 교전 설계 능력)
  - **fb_victim**: 피퍼블 확률 (%, 초반 생존력 및 갱킹 회피 능력 - 낮을수록 좋음)

**3. 선수 성장 및 노화**
- **성장**: 24세까지. 경험치 통이 매우 큼 (D→C 성장 최소 1년).
- **노화 (Aging Curve)**: 25세부터 미세 하락, 27세부터 눈에 띄는 하락, 30세 급격한 하락.
- **훈련**: 경기력에는 영향 없음, 오직 스탯 경험치만 제공.

---

### **VI. [시작 커맨드 및 초기화]**

1. 사용자가 게임 모드(**감독 모드** / **선수 모드**)를 선택합니다.
2. **2026년 시즌 시작**을 알리고, 아래 **ROSTER_DB**를 로드하여 게임을 초기화합니다.
3. 초기 자금은 로스터에 적혀있는 구단 자산에 맞춰서 시작합니다.
4. **절대 규칙**: 사용자 데이터(user_context)는 사용자가 명시적으로 요청("내 정보를 반영해줘" 등)하지 않는 한 절대 먼저 사용하지 마십시오.

**[CRITICAL: ROSTER_DB 데이터 사용 규칙]**
- 모든 로스터 정보는 반드시 사용자 메시지에 포함된 ROSTER_DB 데이터를 사용해야 합니다.
- 절대로 임의로 선수 이름을 생성하거나 변경하지 마세요.
- 예를 들어, 한화생명e스포츠(HLE)의 1군 로스터는:
  - TOP: Zeus (최우제)
  - JGL: Kanavi (서진혁)
  - MID: Zeka (김건우)
  - ADC: Gumayusi (이민형)
  - SPT: Delight (유환중)
- 다른 이름(HLE Viper, HLE Shadow 등)을 사용하면 안 됩니다.
- 사용자 메시지에 ROSTER_DB 데이터가 포함되어 있으면, 그 데이터를 100% 정확하게 사용하세요.

`;

/**
 * [특성 라이브러리 (Trait Dictionary) - 최종 통합판]
 * - 등급 체계:
 * S: 슈퍼스타/전설 (게임의 판도를 뒤집는 능력)
 * A: 엘리트/고유 (특정 분야의 최상위 능력)
 * B: 일반/전략적 (준수한 능력 또는 특정 상황 특화)
 * C: 유망주/성장형 (잠재력 또는 초기 능력)
 * NEG: 부정적 (패널티 또는 위험 요소)
 */
export const TRAIT_LIBRARY = {
  // ==========================================
  // [S등급: 슈퍼스타 고유 특성 (Legendary)]
  // ==========================================
  "HEAVEN_BEYOND": { name: "천외천(天外天)", tier: "S", desc: "CS 수급률 120% 고정, 골드 차이가 날수록 무력 스탯 무한 상승" },
  "UNKILLABLE": { name: "불사대마왕", tier: "S", desc: "팀이 지고 있을 때 모든 스탯 +20%, 아군 멘탈 방어" },
  "RULER_ENDING": { name: "엔딩 메이커", tier: "S", desc: "35분 이후 후반 캐리력 및 딜링 +25%" },
  "CANYON_GAP": { name: "협곡의 주인", tier: "S", desc: "적 정글보다 레벨이 높을 때 교전 능력 +20%" },
  "CLUTCH_GOD": { name: "클러치 히터", tier: "S", desc: "결승전, 5세트 등 중요한 순간 반응속도/한타 +30%" },
  "HEXAGON": { name: "육각형", tier: "S", desc: "모든 스탯이 균형 잡혀 있으며 컨디션 난조가 없음" },
  "ROMANTIC": { name: "낭만", tier: "S", desc: "불리한 교전에서 도망치지 않음, 역전 슈퍼플레이 확률 대폭 상승" },
  "PROFESSOR": { name: "롤 도사", tier: "S", desc: "상대 밴픽 및 인게임 전략을 꿰뚫어봄, 팀 운영 +20%" },
  "GOD_THUNDER": { name: "번개의 신", tier: "S", desc: "탑 라인전 승률 99%, 상대 라이너 멘탈 파괴" },
  "HYPER_MECHANIC": { name: "신계의 손놀림", tier: "S", desc: "논타겟 스킬 회피율 50% 보정, 피지컬 스탯 MAX" },
  "THE_COMMANDER": { name: "마에스트로", tier: "S", desc: "한타 시 아군 전원의 포지셔닝 및 스킬 적중률 대폭 보정" },
  "MAP_HACK": { name: "맵핵", tier: "S", desc: "상대 정글 위치 예측 성공률 95%, 갱킹 면역" },
  "DAMAGE_MACHINE": { name: "딜링 머신", tier: "S", desc: "챔피언 상성을 무시하고 항상 팀 내 딜량 1등 달성" },
  "NEXUS_DEFENDER": { name: "인간 넥서스", tier: "S", desc: "쌍둥이 타워가 밀려도 혼자서 라인 클리어 및 수비 가능" },
  "FIRST_MOVE": { name: "선공권", tier: "S", desc: "모든 교전에서 선제 공격권 및 이니시에이팅 우선권 가짐" },
  "ZONE_CONTROLLER": { name: "공간의 지배자", tier: "S", desc: "특정 구역(용/바론 둥지) 장악 시 아군 스탯 상승" },
  "MECHANIC_GOD": { name: "메카닉의 신", tier: "S", desc: "피지컬 능력이 최고 수준 (반응속도/조작)" },
  "HYPER_CARRY": { name: "하이퍼 캐리", tier: "S", desc: "후반 캐리력이 극도로 뛰어나며 팀 자원을 독식하여 승리함" },

  // ==========================================
  // [A등급: 엘리트 선수 특성 (Elite)]
  // ==========================================
  "COMMANDER": { name: "메인 오더", tier: "A", desc: "팀 전체의 운영 능력치 +10%" },
  "LANE_KINGDOM": { name: "라인전 패왕", tier: "A", desc: "초반 15분 골드 획득량 +15%" },
  "SMITE_KING": { name: "강타의 신", tier: "A", desc: "오브젝트 스틸 확률 대폭 상승" },
  "ROAMING_GOD": { name: "로밍의 신", tier: "A", desc: "타 라인 개입 성공률 +20%" },
  "BIG_GAME": { name: "빅게임 헌터", tier: "A", desc: "플레이오프/국제전에서 스탯 +15%" },
  "IRON_WILL": { name: "미움받을 용기", tier: "A", desc: "이니시에이팅 시도 시 멘탈 차감 없음, 성공률 보정" },
  "WAILING_WALL": { name: "통곡의 벽", tier: "A", desc: "타워 다이브 방어 성공률 +30%, 버티기 최상" },
  "GUERRILLA": { name: "게릴라", tier: "A", desc: "시야가 없는 곳에서의 기습 공격 성공률 상승" },
  "VARIABLE_MAKER": { name: "변수 창출", tier: "A", desc: "불리한 게임에서 의외의 킬각을 만들어냄" },
  "SWISS_KNIFE": { name: "맥가이버", tier: "A", desc: "어떤 포지션/챔피언이든 A급 이상의 성능 발휘" },
  "KILL_CATCHER": { name: "킬 캐처", tier: "A", desc: "딸피인 적을 놓치지 않음, 마무리 능력 탁월" },
  "VISIONARY": { name: "시야 장인", tier: "A", desc: "와드 설치 및 제거 효율 +20%, 맵 장악력 상승" },
  "SURVIVOR": { name: "생존왕", tier: "A", desc: "한타에서 죽지 않고 끝까지 살아남아 딜을 넣음" },
  "BARON_SLAYER": { name: "바론 사냥꾼", tier: "A", desc: "20분 햇바론 트라이 성공률 및 속도 증가" },
  "COUNTER_PUNCH": { name: "카운터 펀치", tier: "A", desc: "상대가 들어올 때 받아치는 능력이 탁월함" },
  "ULTIMATE_HUNTER": { name: "궁극의 사냥꾼", tier: "A", desc: "궁극기 쿨타임 감소 효과 및 적중률 보정" },
  "CHAMP_OCEAN": { name: "챔프 바다", tier: "A", desc: "챔피언 폭이 매우 넓어 밴픽 싸움에서 유리함" },
  "STEAL_GOD": { name: "스틸의 신", tier: "A", desc: "오브젝트 스틸 성공률이 매우 높음 (SMITE_KING 상위호환)" },
  "MECHANIC_SUPPORT": { name: "메카닉 서포터", tier: "A", desc: "피지컬이 뛰어난 서포터, 스킬샷 정확도 높음" },
  "DARK_TECHNOLOGY": { name: "암흑 기술", tier: "A", desc: "비주류 전략 및 챔피언 활용에 능함" },
  "TOP_CARRY": { name: "탑 캐리", tier: "A", desc: "탑 라인 위주로 게임을 풀어갈 때 승률 상승" },
  "NEWBIE_SENSATION": { name: "신인 센세이션", tier: "A", desc: "데뷔 시즌에 S급 퍼포먼스를 발휘할 확률 높음" },
  "RESOURCE_HEAVY": { name: "자원 독식", tier: "A", desc: "골드와 경험치를 몰아먹고 그만큼 캐리함" },
  "SMART_JUNGLE": { name: "스마트 정글러", tier: "A", desc: "동선 낭비가 없고 상대 정글 위치를 잘 파악함" },
  "CARRY_JUNGLE": { name: "캐리 정글러", tier: "A", desc: "정글링과 교전 위주로 성장하여 라이너보다 강해짐" },
  "GANKING_MACHINE": { name: "갱킹 머신", tier: "A", desc: "초반 갱킹 성공률이 매우 높음" },
  "SMART": { name: "똑똑함", tier: "A", desc: "게임 이해도가 높고 최적의 판단을 내림" },
  "ENGAGE_SUPPORT": { name: "이니시 서포터", tier: "A", desc: "과감한 이니시에이팅으로 한타를 염" },
  "ENGAGE_GOD": { name: "이니시의 신", tier: "A", desc: "이니시에이팅 타이밍과 대박 성공률이 최고 수준" },
  "TEAMFIGHT_GLADIATOR": { name: "한타 검투사", tier: "A", desc: "라인전보다 5:5 한타에서 능력치가 대폭 상승함" },
  "CONTROL": { name: "컨트롤", tier: "A", desc: "게임의 템포와 오브젝트를 완벽하게 제어함" },

  // ==========================================
  // [B등급: 일반/전략적 특성 (General)]
  // ==========================================
  "SPLIT_PUSHER": { name: "스플릿 푸셔", tier: "B", desc: "사이드 운영 시 타워 철거 속도 증가" },
  "STEEL_STAMINA": { name: "강철 체력", tier: "B", desc: "5세트/장기전에도 집중력이 떨어지지 않음" },
  "AGGRESSIVE": { name: "공격 본능", tier: "B", desc: "킬 캐치 능력 상승, 데스 확률 소폭 증가" },
  "STONE_HEAD": { name: "돌머리", tier: "B", desc: "탑 라인전 버티기 능력 상승, 갱킹 면역" },
  "VETERAN": { name: "베테랑", tier: "B", desc: "팀 멘탈 하락 방어, 경험치 획득량 소폭 증가" },
  "JOKER_PICK": { name: "사파", tier: "B", desc: "비주류 챔피언 사용 시 라인전 보정 +10%" },
  "BUSH_MASTER": { name: "부쉬 플레이", tier: "B", desc: "부쉬 매복 및 시야 플레이 숙련도 높음" },
  "LANE_FREEZER": { name: "라인 프리징", tier: "B", desc: "CS 손실 없이 라인을 당겨서 상대 성장을 방해함" },
  "WARD_CLEANER": { name: "시야 지우개", tier: "B", desc: "상대 와드를 잘 지우며 시야 점수 보너스" },
  "ASSIST_KING": { name: "도우미", tier: "B", desc: "킬 양보를 잘하며 어시스트 골드 획득량 증가" },
  "BLUE_WORKER": { name: "블루워커", tier: "B", desc: "눈에 띄지 않지만 팀을 위한 궂은일을 도맡음" },
  "COMFORT_PICK": { name: "장인", tier: "B", desc: "선호하는 챔피언을 잡았을 때 스탯 상승" },
  "FIRST_BLOOD": { name: "퍼블 본능", tier: "B", desc: "경기 시작 5분 내 킬 관여율 높음" },
  "TURRET_HUGGER": { name: "타워 허그", tier: "B", desc: "타워 근처에서 방어력 상승" },
  "CONSISTENT": { name: "국밥", tier: "B", desc: "저점이 높지만 고점도 높지 않음" },
  "POKE_MASTER": { name: "포킹 장인", tier: "B", desc: "대치 구도에서 적 체력을 잘 깎음" },
  "EXPERIENCED": { name: "경험 많은", tier: "B", desc: "베테랑의 하위 호환, 안정적인 플레이" },
  "STEADY": { name: "안정적", tier: "B", desc: "큰 기복 없이 제 몫을 해냄" },
  "RPG_JUNGLE": { name: "RPG 정글러", tier: "B", desc: "갱킹보다는 정글링과 성장에 집중함" },
  "COIN_FLIP": { name: "동전 던지기", tier: "B", desc: "캐리하거나 역캐리하거나 기복이 심함" },
  "SOLO_KILL": { name: "솔로킬", tier: "B", desc: "라인전 1:1 상황에서 킬을 낼 확률 증가" },
  "TRASH_TALKER": { name: "트래시 토커", tier: "B", desc: "경기 전/후 인터뷰로 상대 멘탈을 흔듦" },
  "MELEE_MID": { name: "근접 미드", tier: "B", desc: "사일러스, 아칼리 등 근접 챔피언 숙련도 높음" },
  "ROAMING": { name: "로밍", tier: "B", desc: "다른 라인을 돕는 플레이를 선호함" },

  // ==========================================
  // [C등급: 유망주/성장형 특성 (Prospect)]
  // ==========================================
  "SCRATCH_LOTTERY": { name: "긁지 않은 복권", tier: "C", desc: "매 경기 랜덤하게 S급 퍼포먼스 혹은 D급 트롤링 발생" },
  "SPONGE": { name: "스펀지", tier: "C", desc: "베테랑과 같은 라인일 때 경험치 흡수(성장) 속도 2배" },
  "PURE_MECH": { name: "뇌지컬 부재", tier: "C", desc: "피지컬(반응속도)은 S급이나 운영 능력 -20%" },
  "GROWTH_POTENTIAL": { name: "만개", tier: "C", desc: "훈련 성공 대성공 확률 증가" },
  "NEWBIE": { name: "햇병아리", tier: "C", desc: "아직 특성이 발현되지 않음" },
  "SOLO_RANK_WARRIOR": { name: "솔랭전사", tier: "C", desc: "개인 기량은 좋으나 팀합(소통) 스탯 -15%" },
  "COPYCAT": { name: "카피캣", tier: "C", desc: "상대방의 플레이 스타일을 모방하여 학습 속도 증가" },
  "LATE_BLOOMER": { name: "대기만성", tier: "C", desc: "초반엔 약하지만 30분 이후 스탯 소폭 상승" },
  "AUDACIOUS": { name: "패기", tier: "C", desc: "상대가 누구든 쫄지 않음 (가끔 무리함)" },
  "PRACTICE_BUG": { name: "연습벌레", tier: "C", desc: "훈련 효율 +10%, 피로도 증가 +10%" },
  "FARMING_MACHINE": { name: "CS 기계", tier: "C", desc: "교전보다 CS 수급을 우선시함" },
  "OFF_META": { name: "힙스터", tier: "C", desc: "메타에 안 맞는 챔피언을 선호함" },
  "SOLO_KILL_HUNTER": { name: "솔킬 욕심", tier: "C", desc: "무리하게 솔로킬을 시도하다 역관광 당할 수 있음" },
  "GLASS_CANNON": { name: "유리 대포", tier: "C", desc: "공격력은 높으나 생존력이 극도로 낮음" },
  "EMOTIONAL": { name: "다혈질", tier: "C", desc: "한 번 말리면 멘탈 회복이 느림" },

  // ==========================================
  // [NEG: 부정적 특성 (Penalty)]
  // ==========================================
  "DICE_ROLL": { name: "주사위 1/6", tier: "NEG", desc: "경기력의 고점과 저점 차이가 극심함 (주사위 1 뜨면 필패)" },
  "GLASS_MENTAL": { name: "유리 멘탈", tier: "NEG", desc: "1데스 혹은 오브젝트 스틸 허용 시 전 스탯 -20%" },
  "CHAMP_PUDDLE": { name: "챔프웅덩이", tier: "NEG", desc: "메타 챔피언 숙련도가 낮음, 밴픽 싸움 불리" },
  "TUNNEL_VISION": { name: "터널 시야", tier: "NEG", desc: "라인전 몰입 시 갱킹 허용 확률 높음" },
  "THROWING": { name: "발사", tier: "NEG", desc: "유리한 상황에서 무리한 진입으로 역전패 빌미 제공" },
  "HOMESICK": { name: "내수용", tier: "NEG", desc: "국제전만 나가면 스탯 -15%" },
  "KDA_PLAYER": { name: "KDA 관리자", tier: "NEG", desc: "팀을 위한 희생을 하지 않음 (생존력만 높음)" },
  "COMM_ERROR": { name: "소통 불가", tier: "NEG", desc: "팀원 콜을 무시하고 독단적으로 행동함" },
  "FACE_CHECKER": { name: "페이스 체크", tier: "NEG", desc: "시야 없는 부쉬에 몸으로 들어갔다 자주 잘림" },
  "OBJ_ALLERGY": { name: "오브젝트 알러지", tier: "NEG", desc: "용/바론 한타 때 포지셔닝 실수가 잦음" },
  "ZOMBIE": { name: "탑신병자(병)", tier: "NEG", desc: "죽어도 계속 밀다가 또 죽음 (복구 불가능)" },
  "NO_FLASH": { name: "점멸 아낌", tier: "NEG", desc: "죽을 때까지 점멸을 안 쓰다가 죽음" },
  "INVADE_VICTIM": { name: "인베 맛집", tier: "NEG", desc: "1레벨 단계에서 항상 손해를 봄" },
  "CS_ALLERGY": { name: "CS 흘림", tier: "NEG", desc: "평타 실수로 놓치는 CS가 많음" },
  "PASSIVE": { name: "수동적", tier: "NEG", desc: "스스로 변수를 만들지 못하고 묻어가려 함" },
  "TILTER": { name: "즐겜러", tier: "NEG", desc: "게임이 조금만 불리해져도 집중력을 잃음" },
  "LANE_WEAKNESS": { name: "라인 약점", tier: "NEG", desc: "라인전 수행 능력이 떨어짐" }
};

/**
 * [2026 GLOBAL ROSTER DATABASE - MASTER VERSION]
 * - 포함 리그: LCK (1/2군), LPL, LCS, LEC (1군)
 * - 특징: gol.gg 기반 상세 스탯, 현실적 계약 기간, 구단별 자금력(Tier) 완벽 구현
 */

export const ROSTER_DB = {
  // ==========================================
  // [LCK - Korea] (1군 + 2군 풀 로스터)
  // ==========================================
  "T1": {
    "teamName": "T1",
    "financialTier": "S",
    "money": 70.0,
    "annualSupport": 70.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Doran", "age": 26, "contract": 2026, "traits": ["DICE_ROLL", "ROMANTIC"], "stats": { "ovr": "A+", "dpm": 600, "dmg_pct": 24.5, "kda_per_min": 0.35, "solo_kill": 12, "csd15": 5, "gd15": 150, "xpd15": 100, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Oner", "age": 24, "contract": 2026, "traits": ["SMITE_KING", "CLUTCH_GOD"], "stats": { "ovr": "S-", "dpm": 450, "dmg_pct": 18.2, "kda_per_min": 0.55, "solo_kill": 5, "csd15": 2, "gd15": 50, "xpd15": 50, "fb_part": 45, "fb_victim": 10 } },
      { "div": "1군", "role": "MID", "name": "Faker", "age": 30, "contract": 2029, "traits": ["UNKILLABLE", "THE_COMMANDER"], "stats": { "ovr": "S", "dpm": 550, "dmg_pct": 22.0, "kda_per_min": 0.45, "solo_kill": 8, "csd15": 0, "gd15": 0, "xpd15": 20, "fb_part": 30, "fb_victim": 5 } },
      { "div": "1군", "role": "ADC", "name": "Peyz", "age": 21, "contract": 2028, "traits": ["KILL_CATCHER", "HYPER_MECHANIC"], "stats": { "ovr": "S", "dpm": 700, "dmg_pct": 28.5, "kda_per_min": 0.60, "solo_kill": 15, "csd15": 10, "gd15": 200, "xpd15": 150, "fb_part": 10, "fb_victim": 8 } },
      { "div": "1군", "role": "SPT", "name": "Keria", "age": 24, "contract": 2026, "traits": ["PROFESSOR", "JOKER_PICK"], "stats": { "ovr": "S+", "dpm": 300, "dmg_pct": 10.5, "kda_per_min": 0.70, "solo_kill": 2, "csd15": 0, "gd15": 100, "xpd15": 50, "fb_part": 50, "fb_victim": 15 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Dal", "age": 20, "contract": 2026, "traits": ["PURE_MECH"], "stats": { "ovr": "C+", "dpm": 350, "dmg_pct": 22.0, "kda_per_min": 0.25, "solo_kill": 3, "csd15": -5, "gd15": -50, "xpd15": -30, "fb_part": 10, "fb_victim": 25 } },
      { "div": "2군", "role": "JGL", "name": "Guwon", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE", "FIRST_BLOOD"], "stats": { "ovr": "B-", "dpm": 320, "dmg_pct": 17.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 35, "fb_victim": 20 } },
      { "div": "2군", "role": "MID", "name": "Poby", "age": 20, "contract": 2027, "traits": ["STEEL_STAMINA", "SPONGE"], "stats": { "ovr": "B", "dpm": 400, "dmg_pct": 24.0, "kda_per_min": 0.30, "solo_kill": 1, "csd15": -3, "gd15": -10, "xpd15": 0, "fb_part": 20, "fb_victim": 15 } },
      { "div": "2군", "role": "ADC", "name": "Wonsok", "age": 19, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 380, "dmg_pct": 26.0, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -8, "gd15": -40, "xpd15": -20, "fb_part": 10, "fb_victim": 20 } },
      { "div": "2군", "role": "SPT", "name": "Cloud", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "C+", "dpm": 150, "dmg_pct": 8.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 30, "fb_victim": 20 } }
    ]
  },
  "GEN": {
    "teamName": "Gen.G",
    "financialTier": "S",
    "money": 65.0,
    "annualSupport": 65.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Kiin", "age": 27, "contract": 2026, "traits": ["HEXAGON", "WAILING_WALL"], "stats": { "ovr": "S", "dpm": 580, "dmg_pct": 23.5, "kda_per_min": 0.38, "solo_kill": 18, "csd15": 8, "gd15": 180, "xpd15": 120, "fb_part": 20, "fb_victim": 10 } },
      { "div": "1군", "role": "JGL", "name": "Canyon", "age": 25, "contract": 2026, "traits": ["CANYON_GAP", "GUERRILLA"], "stats": { "ovr": "S+", "dpm": 500, "dmg_pct": 20.0, "kda_per_min": 0.58, "solo_kill": 10, "csd15": 5, "gd15": 100, "xpd15": 80, "fb_part": 55, "fb_victim": 5 } },
      { "div": "1군", "role": "MID", "name": "Chovy", "age": 25, "contract": 2027, "traits": ["HEAVEN_BEYOND", "LANE_KINGDOM"], "stats": { "ovr": "S+", "dpm": 650, "dmg_pct": 27.0, "kda_per_min": 0.50, "solo_kill": 20, "csd15": 15, "gd15": 300, "xpd15": 200, "fb_part": 25, "fb_victim": 2 } },
      { "div": "1군", "role": "ADC", "name": "Ruler", "age": 28, "contract": 2027, "traits": ["RULER_ENDING", "HYPER_MECHANIC"], "stats": { "ovr": "S", "dpm": 680, "dmg_pct": 29.0, "kda_per_min": 0.55, "solo_kill": 8, "csd15": 8, "gd15": 150, "xpd15": 100, "fb_part": 15, "fb_victim": 5 } },
      { "div": "1군", "role": "SPT", "name": "Duro", "age": 24, "contract": 2027, "traits": ["NEWBIE", "SPONGE"], "stats": { "ovr": "B+", "dpm": 200, "dmg_pct": 8.0, "kda_per_min": 0.60, "solo_kill": 0, "csd15": -2, "gd15": -50, "xpd15": -20, "fb_part": 40, "fb_victim": 25 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "HorangE", "age": 22, "contract": 2026, "traits": ["PURE_MECH", "TUNNEL_VISION"], "stats": { "ovr": "C+", "dpm": 340, "dmg_pct": 21.0, "kda_per_min": 0.20, "solo_kill": 4, "csd15": -6, "gd15": -60, "xpd15": -40, "fb_part": 15, "fb_victim": 25 } },
      { "div": "2군", "role": "JGL", "name": "Tossi", "age": 23, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "C", "dpm": 300, "dmg_pct": 16.0, "kda_per_min": 0.30, "solo_kill": 1, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 30, "fb_victim": 15 } },
      { "div": "2군", "role": "MID", "name": "Zest", "age": 21, "contract": 2026, "traits": ["CHAMP_PUDDLE", "GLASS_MENTAL"], "stats": { "ovr": "B-", "dpm": 380, "dmg_pct": 25.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 20, "fb_victim": 20 } },
      { "div": "2군", "role": "ADC", "name": "Slayer", "age": 20, "contract": 2026, "traits": ["AGGRESSIVE", "NEWBIE"], "stats": { "ovr": "C", "dpm": 360, "dmg_pct": 27.0, "kda_per_min": 0.30, "solo_kill": 3, "csd15": -8, "gd15": -40, "xpd15": -30, "fb_part": 10, "fb_victim": 25 } },
      { "div": "2군", "role": "SPT", "name": "Dahlia", "age": 19, "contract": 2026, "traits": ["NEWBIE", "VISIONARY"], "stats": { "ovr": "C-", "dpm": 120, "dmg_pct": 7.0, "kda_per_min": 0.35, "solo_kill": 0, "csd15": -5, "gd15": -50, "xpd15": -30, "fb_part": 25, "fb_victim": 20 } }
    ]
  },
  "HLE": {
    "teamName": "Hanwha Life Esports",
    "financialTier": "S",
    "money": 80.0,
    "annualSupport": 80.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Zeus", "age": 22, "contract": 2026, "traits": ["GOD_THUNDER", "HYPER_MECHANIC"], "stats": { "ovr": "S+", "dpm": 650, "dmg_pct": 27.0, "kda_per_min": 0.45, "solo_kill": 22, "csd15": 12, "gd15": 250, "xpd15": 150, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Kanavi", "age": 26, "contract": 2026, "traits": ["VARIABLE_MAKER", "AGGRESSIVE"], "stats": { "ovr": "S-", "dpm": 480, "dmg_pct": 19.5, "kda_per_min": 0.50, "solo_kill": 7, "csd15": 4, "gd15": 80, "xpd15": 60, "fb_part": 50, "fb_victim": 18 } },
      { "div": "1군", "role": "MID", "name": "Zeka", "age": 24, "contract": 2027, "traits": ["CLUTCH_GOD", "BIG_GAME"], "stats": { "ovr": "S", "dpm": 600, "dmg_pct": 26.0, "kda_per_min": 0.48, "solo_kill": 15, "csd15": 5, "gd15": 100, "xpd15": 80, "fb_part": 30, "fb_victim": 5 } },
      { "div": "1군", "role": "ADC", "name": "Gumayusi", "age": 24, "contract": 2027, "traits": ["STEAL_GOD", "BIG_GAME"], "stats": { "ovr": "S", "dpm": 620, "dmg_pct": 27.5, "kda_per_min": 0.52, "solo_kill": 6, "csd15": 6, "gd15": 120, "xpd15": 90, "fb_part": 15, "fb_victim": 2 } },
      { "div": "1군", "role": "SPT", "name": "Delight", "age": 24, "contract": 2027, "traits": ["IRON_WILL", "COMMANDER"], "stats": { "ovr": "A+", "dpm": 250, "dmg_pct": 9.0, "kda_per_min": 0.65, "solo_kill": 1, "csd15": 0, "gd15": 50, "xpd15": 30, "fb_part": 55, "fb_victim": 20 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Rooster", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE", "LANE_KINGDOM"], "stats": { "ovr": "B-", "dpm": 370, "dmg_pct": 23.0, "kda_per_min": 0.28, "solo_kill": 5, "csd15": -1, "gd15": -10, "xpd15": -10, "fb_part": 15, "fb_victim": 20 } },
      { "div": "2군", "role": "JGL", "name": "Grizzly", "age": 21, "contract": 2027, "traits": ["SPONGE", "EXPERIENCED"], "stats": { "ovr": "B", "dpm": 330, "dmg_pct": 18.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 30, "fb_victim": 15 } },
      { "div": "2군", "role": "MID", "name": "Loki", "age": 20, "contract": 2026, "traits": ["SCRATCH_LOTTERY", "GROWTH_POTENTIAL"], "stats": { "ovr": "C+", "dpm": 350, "dmg_pct": 24.5, "kda_per_min": 0.32, "solo_kill": 2, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "2군", "role": "ADC", "name": "Lure", "age": 23, "contract": 2026, "traits": ["STEADY", "BLUE_WORKER"], "stats": { "ovr": "C+", "dpm": 360, "dmg_pct": 26.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 15, "fb_victim": 10 } },
      { "div": "2군", "role": "SPT", "name": "Baut", "age": 22, "contract": 2026, "traits": ["IRON_WILL"], "stats": { "ovr": "C", "dpm": 140, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -5, "gd15": -40, "xpd15": -20, "fb_part": 30, "fb_victim": 20 } }
    ]
  },
  "DK": {
    "teamName": "Dplus KIA",
    "financialTier": "A",
    "money": 40.0,
    "annualSupport": 40.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Siwoo", "age": 21, "contract": 2026, "traits": ["NEWBIE", "AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 450, "dmg_pct": 24.0, "kda_per_min": 0.30, "solo_kill": 5, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Lucid", "age": 21, "contract": 2026, "traits": ["PURE_MECH", "SCRATCH_LOTTERY"], "stats": { "ovr": "A-", "dpm": 400, "dmg_pct": 18.0, "kda_per_min": 0.45, "solo_kill": 3, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 40, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "ShowMaker", "age": 26, "contract": 2026, "traits": ["ROMANTIC", "CHAMP_OCEAN"], "stats": { "ovr": "A+", "dpm": 580, "dmg_pct": 28.0, "kda_per_min": 0.50, "solo_kill": 10, "csd15": 5, "gd15": 50, "xpd15": 40, "fb_part": 30, "fb_victim": 10 } },
      { "div": "1군", "role": "ADC", "name": "Smash", "age": 20, "contract": 2027, "traits": ["SPONGE", "GROWTH_POTENTIAL"], "stats": { "ovr": "B+", "dpm": 500, "dmg_pct": 27.5, "kda_per_min": 0.40, "solo_kill": 4, "csd15": 3, "gd15": 10, "xpd15": 10, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Career", "age": 21, "contract": 2027, "traits": ["SPONGE"], "stats": { "ovr": "B", "dpm": 200, "dmg_pct": 9.0, "kda_per_min": 0.55, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 45, "fb_victim": 20 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Chasy", "age": 25, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "B", "dpm": 380, "dmg_pct": 23.0, "kda_per_min": 0.30, "solo_kill": 4, "csd15": -2, "gd15": -5, "xpd15": 0, "fb_part": 15, "fb_victim": 15 } },
      { "div": "2군", "role": "JGL", "name": "Sharvel", "age": 21, "contract": 2026, "traits": ["PURE_MECH"], "stats": { "ovr": "C+", "dpm": 310, "dmg_pct": 16.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -5, "gd15": -25, "xpd15": -15, "fb_part": 35, "fb_victim": 20 } },
      { "div": "2군", "role": "MID", "name": "Saint", "age": 22, "contract": 2026, "traits": ["ROAMING_GOD"], "stats": { "ovr": "C+", "dpm": 360, "dmg_pct": 25.0, "kda_per_min": 0.32, "solo_kill": 3, "csd15": -3, "gd15": -15, "xpd15": -10, "fb_part": 25, "fb_victim": 15 } },
      { "div": "2군", "role": "ADC", "name": "Rahel", "age": 22, "contract": 2026, "traits": ["SPONGE"], "stats": { "ovr": "B-", "dpm": 390, "dmg_pct": 27.0, "kda_per_min": 0.38, "solo_kill": 3, "csd15": 0, "gd15": -10, "xpd15": -5, "fb_part": 10, "fb_victim": 10 } },
      { "div": "2군", "role": "SPT", "name": "Loopy", "age": 24, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "C+", "dpm": 150, "dmg_pct": 8.0, "kda_per_min": 0.45, "solo_kill": 0, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 40, "fb_victim": 20 } }
    ]
  },
  "KT": {
    "teamName": "KT Rolster",
    "financialTier": "A",
    "money": 45.0,
    "annualSupport": 45.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "PerfecT", "age": 22, "contract": 2026, "traits": ["STONE_HEAD"], "stats": { "ovr": "B+", "dpm": 480, "dmg_pct": 24.5, "kda_per_min": 0.32, "solo_kill": 6, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Cuzz", "age": 27, "contract": 2026, "traits": ["COMMANDER", "SMITE_KING"], "stats": { "ovr": "A", "dpm": 420, "dmg_pct": 19.0, "kda_per_min": 0.48, "solo_kill": 4, "csd15": 3, "gd15": 40, "xpd15": 30, "fb_part": 45, "fb_victim": 10 } },
      { "div": "1군", "role": "MID", "name": "Bdd", "age": 27, "contract": 2027, "traits": ["HEXAGON", "VETERAN"], "stats": { "ovr": "S-", "dpm": 600, "dmg_pct": 27.5, "kda_per_min": 0.50, "solo_kill": 10, "csd15": 5, "gd15": 80, "xpd15": 60, "fb_part": 30, "fb_victim": 5 } },
      { "div": "1군", "role": "ADC", "name": "Aiming", "age": 26, "contract": 2027, "traits": ["KILL_CATCHER", "THROWING"], "stats": { "ovr": "A+", "dpm": 650, "dmg_pct": 30.0, "kda_per_min": 0.55, "solo_kill": 12, "csd15": 8, "gd15": 100, "xpd15": 80, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Ghost", "age": 27, "contract": 2026, "traits": ["COMMANDER", "BLUE_WORKER"], "stats": { "ovr": "B+", "dpm": 250, "dmg_pct": 10.0, "kda_per_min": 0.60, "solo_kill": 1, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 50, "fb_victim": 15 } },
      { "div": "1군", "role": "SUB", "name": "Pollu", "age": 20, "contract": 2027, "traits": ["NEWBIE"], "stats": { "ovr": "B-", "dpm": 180, "dmg_pct": 8.0, "kda_per_min": 0.50, "solo_kill": 0, "csd15": -3, "gd15": -30, "xpd15": -10, "fb_part": 35, "fb_victim": 20 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "HamBak", "age": 21, "contract": 2026, "traits": ["JOKER_PICK"], "stats": { "ovr": "C+", "dpm": 340, "dmg_pct": 22.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 15, "fb_victim": 20 } },
      { "div": "2군", "role": "JGL", "name": "YoungJae", "age": 24, "contract": 2026, "traits": ["COMMANDER", "VETERAN"], "stats": { "ovr": "B-", "dpm": 300, "dmg_pct": 16.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 35, "fb_victim": 15 } },
      { "div": "2군", "role": "MID", "name": "Pout", "age": 21, "contract": 2026, "traits": ["LANE_KINGDOM"], "stats": { "ovr": "C", "dpm": 350, "dmg_pct": 24.0, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -3, "gd15": -40, "xpd15": -20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "2군", "role": "ADC", "name": "Hype", "age": 21, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "C+", "dpm": 370, "dmg_pct": 26.5, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 15, "fb_victim": 15 } },
      { "div": "2군", "role": "SPT", "name": "Way", "age": 21, "contract": 2026, "traits": ["COMMANDER"], "stats": { "ovr": "C", "dpm": 130, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -4, "gd15": -35, "xpd15": -20, "fb_part": 30, "fb_victim": 20 } }
    ]
  },
  "DNF": {
    "teamName": "DN Freecs",
    "financialTier": "B",
    "money": 30.0,
    "annualSupport": 30.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "DuDu", "age": 25, "contract": 2026, "traits": ["LANE_KINGDOM", "SPLIT_PUSHER"], "stats": { "ovr": "A-", "dpm": 520, "dmg_pct": 25.5, "kda_per_min": 0.35, "solo_kill": 10, "csd15": 5, "gd15": 60, "xpd15": 40, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Pyosik", "age": 26, "contract": 2026, "traits": ["SMITE_KING", "DICE_ROLL"], "stats": { "ovr": "A-", "dpm": 390, "dmg_pct": 18.5, "kda_per_min": 0.45, "solo_kill": 5, "csd15": 0, "gd15": 20, "xpd15": 10, "fb_part": 50, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Clozer", "age": 23, "contract": 2026, "traits": ["HYPER_MECHANIC", "AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 540, "dmg_pct": 26.0, "kda_per_min": 0.42, "solo_kill": 12, "csd15": 2, "gd15": 30, "xpd15": 20, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "deokdam", "age": 26, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B", "dpm": 510, "dmg_pct": 28.0, "kda_per_min": 0.40, "solo_kill": 5, "csd15": 0, "gd15": 10, "xpd15": 0, "fb_part": 10, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Peter", "age": 23, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B-", "dpm": 180, "dmg_pct": 8.0, "kda_per_min": 0.55, "solo_kill": 0, "csd15": 0, "gd15": 5, "xpd15": 0, "fb_part": 45, "fb_victim": 20 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Hunch", "age": 21, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "C", "dpm": 330, "dmg_pct": 22.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -5, "gd15": -35, "xpd15": -25, "fb_part": 15, "fb_victim": 25 } },
      { "div": "2군", "role": "JGL", "name": "Courage", "age": 22, "contract": 2026, "traits": ["RPG_JUNGLE"], "stats": { "ovr": "C+", "dpm": 300, "dmg_pct": 16.0, "kda_per_min": 0.30, "solo_kill": 1, "csd15": -2, "gd15": -25, "xpd15": -15, "fb_part": 30, "fb_victim": 15 } },
      { "div": "2군", "role": "MID", "name": "Quantum", "age": 20, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "C-", "dpm": 340, "dmg_pct": 24.0, "kda_per_min": 0.28, "solo_kill": 2, "csd15": -6, "gd15": -45, "xpd15": -30, "fb_part": 20, "fb_victim": 20 } },
      { "div": "2군", "role": "ADC", "name": "Bull", "age": 23, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "C+", "dpm": 360, "dmg_pct": 26.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 15, "fb_victim": 10 } },
      { "div": "2군", "role": "SPT", "name": "Lantern", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "D+", "dpm": 120, "dmg_pct": 7.0, "kda_per_min": 0.30, "solo_kill": 0, "csd15": -8, "gd15": -50, "xpd15": -30, "fb_part": 30, "fb_victim": 25 } }
    ]
  },
  "NS": {
    "teamName": "Nongshim RedForce",
    "financialTier": "B",
    "money": 28.0,
    "annualSupport": 28.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Kingen", "age": 26, "contract": 2026, "traits": ["BIG_GAME", "DICE_ROLL"], "stats": { "ovr": "A-", "dpm": 500, "dmg_pct": 24.0, "kda_per_min": 0.32, "solo_kill": 8, "csd15": 2, "gd15": 30, "xpd15": 20, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Sponge", "age": 22, "contract": 2027, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B", "dpm": 350, "dmg_pct": 17.0, "kda_per_min": 0.38, "solo_kill": 3, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Scout", "age": 28, "contract": 2026, "traits": ["VETERAN", "HEXAGON"], "stats": { "ovr": "A+", "dpm": 580, "dmg_pct": 27.5, "kda_per_min": 0.45, "solo_kill": 8, "csd15": 6, "gd15": 70, "xpd15": 50, "fb_part": 25, "fb_victim": 5 } },
      { "div": "1군", "role": "ADC", "name": "Taeyoon", "age": 24, "contract": 2026, "traits": ["GLASS_MENTAL", "THROWING"], "stats": { "ovr": "C+", "dpm": 480, "dmg_pct": 26.5, "kda_per_min": 0.35, "solo_kill": 4, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "SPT", "name": "Lehends", "age": 28, "contract": 2026, "traits": ["JOKER_PICK", "COMMANDER"], "stats": { "ovr": "A", "dpm": 220, "dmg_pct": 9.0, "kda_per_min": 0.60, "solo_kill": 1, "csd15": 0, "gd15": 20, "xpd15": 10, "fb_part": 45, "fb_victim": 15 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Mihile", "age": 21, "contract": 2026, "traits": ["STONE_HEAD"], "stats": { "ovr": "C", "dpm": 320, "dmg_pct": 21.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -5, "gd15": -40, "xpd15": -25, "fb_part": 15, "fb_victim": 20 } },
      { "div": "2군", "role": "JGL", "name": "HH", "age": 21, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "C+", "dpm": 300, "dmg_pct": 16.5, "kda_per_min": 0.32, "solo_kill": 2, "csd15": -3, "gd15": -30, "xpd15": -15, "fb_part": 35, "fb_victim": 20 } },
      { "div": "2군", "role": "MID", "name": "Callme", "age": 22, "contract": 2026, "traits": ["JOKER_PICK"], "stats": { "ovr": "C+", "dpm": 340, "dmg_pct": 24.5, "kda_per_min": 0.30, "solo_kill": 3, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 20, "fb_victim": 15 } },
      { "div": "2군", "role": "ADC", "name": "Vital", "age": 21, "contract": 2026, "traits": ["SCRATCH_LOTTERY"], "stats": { "ovr": "C", "dpm": 350, "dmg_pct": 26.0, "kda_per_min": 0.32, "solo_kill": 3, "csd15": -4, "gd15": -35, "xpd15": -20, "fb_part": 15, "fb_victim": 15 } },
      { "div": "2군", "role": "SPT", "name": "Odin", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "D+", "dpm": 110, "dmg_pct": 7.0, "kda_per_min": 0.30, "solo_kill": 0, "csd15": -8, "gd15": -50, "xpd15": -30, "fb_part": 25, "fb_victim": 25 } }
    ]
  },
  "BFX": {
    "teamName": "BNK FearX",
    "financialTier": "B",
    "money": 28.0,
    "annualSupport": 28.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Clear", "age": 23, "contract": 2026, "traits": ["STONE_HEAD"], "stats": { "ovr": "B", "dpm": 460, "dmg_pct": 23.0, "kda_per_min": 0.28, "solo_kill": 5, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Raptor", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B-", "dpm": 380, "dmg_pct": 18.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -3, "gd15": -20, "xpd15": -10, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "VicLa", "age": 23, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 520, "dmg_pct": 26.0, "kda_per_min": 0.40, "solo_kill": 8, "csd15": 2, "gd15": 10, "xpd15": 5, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Diable", "age": 21, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B", "dpm": 500, "dmg_pct": 28.0, "kda_per_min": 0.38, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Kellin", "age": 25, "contract": 2026, "traits": ["LANE_KINGDOM", "PASSIVE"], "stats": { "ovr": "B+", "dpm": 200, "dmg_pct": 8.0, "kda_per_min": 0.55, "solo_kill": 0, "csd15": 2, "gd15": 15, "xpd15": 10, "fb_part": 35, "fb_victim": 15 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Soboro", "age": 23, "contract": 2026, "traits": ["STONE_HEAD"], "stats": { "ovr": "C+", "dpm": 330, "dmg_pct": 21.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -4, "gd15": -30, "xpd15": -20, "fb_part": 15, "fb_victim": 20 } },
      { "div": "2군", "role": "JGL", "name": "Argen", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "C", "dpm": 290, "dmg_pct": 16.0, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -5, "gd15": -40, "xpd15": -25, "fb_part": 35, "fb_victim": 20 } },
      { "div": "2군", "role": "MID", "name": "Feisty", "age": 21, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "C", "dpm": 340, "dmg_pct": 24.0, "kda_per_min": 0.30, "solo_kill": 3, "csd15": -3, "gd15": -35, "xpd15": -20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "2군", "role": "ADC", "name": "Paduck", "age": 22, "contract": 2026, "traits": ["TEAMFIGHT_GLADIATOR"], "stats": { "ovr": "C+", "dpm": 370, "dmg_pct": 27.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -2, "gd15": -25, "xpd15": -15, "fb_part": 15, "fb_victim": 15 } },
      { "div": "2군", "role": "SPT", "name": "Execute", "age": 23, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "B-", "dpm": 140, "dmg_pct": 7.5, "kda_per_min": 0.45, "solo_kill": 0, "csd15": -1, "gd15": -15, "xpd15": -10, "fb_part": 40, "fb_victim": 15 } }
    ]
  },
  "BRO": {
    "teamName": "OKSavingsBank BRION",
    "financialTier": "C",
    "money": 15.0,
    "annualSupport": 15.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Casting", "age": 22, "contract": 2026, "traits": ["SCRATCH_LOTTERY"], "stats": { "ovr": "C+", "dpm": 420, "dmg_pct": 23.5, "kda_per_min": 0.25, "solo_kill": 3, "csd15": -5, "gd15": -40, "xpd15": -30, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Gideon", "age": 23, "contract": 2026, "traits": ["KILL_CATCHER"], "stats": { "ovr": "B", "dpm": 360, "dmg_pct": 18.0, "kda_per_min": 0.40, "solo_kill": 4, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 45, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Fisher", "age": 22, "contract": 2026, "traits": ["TUNNEL_VISION"], "stats": { "ovr": "C+", "dpm": 480, "dmg_pct": 26.0, "kda_per_min": 0.35, "solo_kill": 4, "csd15": -3, "gd15": -30, "xpd15": -20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Teddy", "age": 28, "contract": 2026, "traits": ["RULER_ENDING", "VETERAN"], "stats": { "ovr": "A-", "dpm": 600, "dmg_pct": 30.0, "kda_per_min": 0.45, "solo_kill": 6, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Namgung", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 180, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -6, "gd15": -50, "xpd15": -30, "fb_part": 35, "fb_victim": 25 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Kangin", "age": 21, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "D+", "dpm": 300, "dmg_pct": 21.0, "kda_per_min": 0.20, "solo_kill": 1, "csd15": -8, "gd15": -60, "xpd15": -40, "fb_part": 15, "fb_victim": 30 } },
      { "div": "2군", "role": "JGL", "name": "DdoiV", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "D", "dpm": 250, "dmg_pct": 16.0, "kda_per_min": 0.25, "solo_kill": 1, "csd15": -8, "gd15": -70, "xpd15": -50, "fb_part": 30, "fb_victim": 25 } },
      { "div": "2군", "role": "MID", "name": "Pullbae", "age": 23, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "C", "dpm": 320, "dmg_pct": 24.0, "kda_per_min": 0.28, "solo_kill": 2, "csd15": -4, "gd15": -40, "xpd15": -25, "fb_part": 20, "fb_victim": 20 } },
      { "div": "2군", "role": "ADC", "name": "Enosh", "age": 22, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "C-", "dpm": 340, "dmg_pct": 26.0, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -5, "gd15": -50, "xpd15": -35, "fb_part": 15, "fb_victim": 20 } },
      { "div": "2군", "role": "SPT", "name": "Kork", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "D", "dpm": 100, "dmg_pct": 6.5, "kda_per_min": 0.30, "solo_kill": 0, "csd15": -10, "gd15": -60, "xpd15": -40, "fb_part": 30, "fb_victim": 30 } }
    ]
  },
  "DRX": {
    "teamName": "DRX",
    "financialTier": "C",
    "money": 18.0,
    "annualSupport": 18.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Rich", "age": 28, "contract": 2026, "traits": ["VETERAN", "TEAMFIGHT_GLADIATOR"], "stats": { "ovr": "B", "dpm": 470, "dmg_pct": 23.5, "kda_per_min": 0.30, "solo_kill": 5, "csd15": -3, "gd15": -20, "xpd15": -10, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Willer", "age": 23, "contract": 2026, "traits": ["SMITE_KING"], "stats": { "ovr": "B+", "dpm": 370, "dmg_pct": 17.5, "kda_per_min": 0.40, "solo_kill": 3, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 45, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Ucal", "age": 25, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 530, "dmg_pct": 26.5, "kda_per_min": 0.42, "solo_kill": 8, "csd15": 2, "gd15": 10, "xpd15": 5, "fb_part": 30, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Jiwoo", "age": 22, "contract": 2027, "traits": ["HYPER_CARRY", "LANE_WEAKNESS"], "stats": { "ovr": "A-", "dpm": 580, "dmg_pct": 29.0, "kda_per_min": 0.48, "solo_kill": 10, "csd15": -5, "gd15": 30, "xpd15": 20, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Andil", "age": 24, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B-", "dpm": 190, "dmg_pct": 8.5, "kda_per_min": 0.50, "solo_kill": 0, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 40, "fb_victim": 20 } },
      // 2군
      { "div": "2군", "role": "TOP", "name": "Frog", "age": 23, "contract": 2026, "traits": ["STONE_HEAD"], "stats": { "ovr": "C", "dpm": 310, "dmg_pct": 21.0, "kda_per_min": 0.22, "solo_kill": 2, "csd15": -5, "gd15": -45, "xpd15": -30, "fb_part": 15, "fb_victim": 20 } },
      { "div": "2군", "role": "JGL", "name": "Zephyr", "age": 19, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "D+", "dpm": 260, "dmg_pct": 16.0, "kda_per_min": 0.28, "solo_kill": 1, "csd15": -7, "gd15": -55, "xpd15": -40, "fb_part": 30, "fb_victim": 25 } },
      { "div": "2군", "role": "MID", "name": "kyeahoo", "age": 22, "contract": 2026, "traits": ["PURE_MECH"], "stats": { "ovr": "C+", "dpm": 360, "dmg_pct": 25.0, "kda_per_min": 0.32, "solo_kill": 3, "csd15": -3, "gd15": -25, "xpd15": -15, "fb_part": 20, "fb_victim": 20 } },
      { "div": "2군", "role": "ADC", "name": "Pleata", "age": 23, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "C", "dpm": 370, "dmg_pct": 27.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -4, "gd15": -35, "xpd15": -25, "fb_part": 15, "fb_victim": 15 } },
      { "div": "2군", "role": "SPT", "name": "Piero", "age": 22, "contract": 2026, "traits": ["ROAMING_GOD"], "stats": { "ovr": "C-", "dpm": 130, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -5, "gd15": -40, "xpd15": -30, "fb_part": 35, "fb_victim": 25 } }
    ]
  },

  // ==========================================
  // [LPL - China League] (14개 팀)
  // ==========================================
  "BLG": {
    "teamName": "Bilibili Gaming",
    "financialTier": "S",
    "money": 60.0,
    "annualSupport": 60.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Bin", "age": 22, "contract": 2027, "traits": ["GOD_THUNDER", "SPLIT_PUSHER"], "stats": { "ovr": "S+", "dpm": 720, "dmg_pct": 28.5, "kda_per_min": 0.50, "solo_kill": 25, "csd15": 15, "gd15": 300, "xpd15": 200, "fb_part": 25, "fb_victim": 10 } },
      { "div": "1군", "role": "JGL", "name": "Beichuan", "age": 23, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B+", "dpm": 380, "dmg_pct": 16.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": 0, "gd15": 20, "xpd15": 10, "fb_part": 50, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Knight", "age": 24, "contract": 2027, "traits": ["HEXAGON", "CLUTCH_GOD"], "stats": { "ovr": "S+", "dpm": 750, "dmg_pct": 30.0, "kda_per_min": 0.60, "solo_kill": 18, "csd15": 10, "gd15": 250, "xpd15": 150, "fb_part": 35, "fb_victim": 5 } },
      { "div": "1군", "role": "ADC", "name": "Elk", "age": 23, "contract": 2027, "traits": ["HYPER_CARRY", "CONSISTENT"], "stats": { "ovr": "S", "dpm": 780, "dmg_pct": 32.0, "kda_per_min": 0.65, "solo_kill": 12, "csd15": 8, "gd15": 180, "xpd15": 100, "fb_part": 20, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "ON", "age": 21, "contract": 2026, "traits": ["MECHANIC_SUPPORT", "DICE_ROLL"], "stats": { "ovr": "S", "dpm": 250, "dmg_pct": 8.0, "kda_per_min": 0.70, "solo_kill": 1, "csd15": 0, "gd15": 50, "xpd15": 30, "fb_part": 60, "fb_victim": 30 } },
      { "div": "1군", "role": "SUB", "name": "Shad0w", "age": 24, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B", "dpm": 330, "dmg_pct": 17.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 20 } }
    ]
  },
  "TES": {
    "teamName": "Top Esports",
    "financialTier": "S",
    "money": 55.0,
    "annualSupport": 55.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "369", "age": 23, "contract": 2026, "traits": ["DICE_ROLL", "TEAMFIGHT_GLADIATOR"], "stats": { "ovr": "S", "dpm": 650, "dmg_pct": 25.0, "kda_per_min": 0.40, "solo_kill": 10, "csd15": 5, "gd15": 100, "xpd15": 80, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "MID", "name": "Creme", "age": 21, "contract": 2027, "traits": ["KILL_CATCHER", "AGGRESSIVE"], "stats": { "ovr": "A+", "dpm": 680, "dmg_pct": 27.0, "kda_per_min": 0.55, "solo_kill": 15, "csd15": 5, "gd15": 90, "xpd15": 70, "fb_part": 30, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "JackeyLove", "age": 24, "contract": 2027, "traits": ["AGGRESSIVE", "THROWING"], "stats": { "ovr": "S", "dpm": 850, "dmg_pct": 33.0, "kda_per_min": 0.60, "solo_kill": 15, "csd15": 12, "gd15": 200, "xpd15": 120, "fb_part": 30, "fb_victim": 30 } },
      { "div": "1군", "role": "SPT", "name": "Hang", "age": 22, "contract": 2026, "traits": ["ROAMING_GOD"], "stats": { "ovr": "A", "dpm": 180, "dmg_pct": 7.0, "kda_per_min": 0.55, "solo_kill": 0, "csd15": 0, "gd15": 30, "xpd15": 20, "fb_part": 55, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "fengyue", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 150, "dmg_pct": 6.0, "kda_per_min": 0.25, "solo_kill": 0, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 25, "fb_victim": 25 } }
    ]
  },
  "AL": {
    "teamName": "Anyone's Legend",
    "financialTier": "B",
    "money": 28.0,
    "annualSupport": 28.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Flandre", "age": 26, "contract": 2026, "traits": ["VETERAN", "JOKER_PICK"], "stats": { "ovr": "A-", "dpm": 480, "dmg_pct": 22.0, "kda_per_min": 0.30, "solo_kill": 5, "csd15": 2, "gd15": 30, "xpd15": 20, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Tarzan", "age": 25, "contract": 2026, "traits": ["RPG_JUNGLE", "SMITE_KING"], "stats": { "ovr": "S-", "dpm": 420, "dmg_pct": 18.0, "kda_per_min": 0.45, "solo_kill": 4, "csd15": 8, "gd15": 120, "xpd15": 100, "fb_part": 40, "fb_victim": 10 } },
      { "div": "1군", "role": "MID", "name": "Shanks", "age": 23, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B+", "dpm": 560, "dmg_pct": 26.0, "kda_per_min": 0.40, "solo_kill": 6, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Hope", "age": 23, "contract": 2026, "traits": ["CONSISTENT"], "stats": { "ovr": "B+", "dpm": 600, "dmg_pct": 28.0, "kda_per_min": 0.42, "solo_kill": 5, "csd15": 4, "gd15": 50, "xpd15": 30, "fb_part": 20, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Kael", "age": 22, "contract": 2026, "traits": ["VISIONARY"], "stats": { "ovr": "B", "dpm": 160, "dmg_pct": 7.0, "kda_per_min": 0.50, "solo_kill": 0, "csd15": 0, "gd15": 10, "xpd15": 0, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "JDG": {
    "teamName": "JD Gaming",
    "financialTier": "S",
    "money": 60.0,
    "annualSupport": 60.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Xiaoxu", "age": 22, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B+", "dpm": 500, "dmg_pct": 23.0, "kda_per_min": 0.35, "solo_kill": 5, "csd15": 2, "gd15": 30, "xpd15": 20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Xun", "age": 23, "contract": 2027, "traits": ["CARRY_JUNGLE", "AGGRESSIVE"], "stats": { "ovr": "S", "dpm": 580, "dmg_pct": 21.0, "kda_per_min": 0.55, "solo_kill": 8, "csd15": 6, "gd15": 120, "xpd15": 90, "fb_part": 55, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "ADC", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "SPT", "name": "Zhuo", "age": 23, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B", "dpm": 180, "dmg_pct": 8.0, "kda_per_min": 0.50, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "IG": {
    "teamName": "Invictus Gaming",
    "financialTier": "A",
    "money": 45.0,
    "annualSupport": 45.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "TheShy", "age": 25, "contract": 2026, "traits": ["GOD_THUNDER", "DICE_ROLL"], "stats": { "ovr": "A+", "dpm": 650, "dmg_pct": 27.0, "kda_per_min": 0.45, "solo_kill": 20, "csd15": 15, "gd15": 200, "xpd15": 150, "fb_part": 25, "fb_victim": 30 } },
      { "div": "1군", "role": "JGL", "name": "Wei", "age": 22, "contract": 2026, "traits": ["GANKING_MACHINE", "SMART"], "stats": { "ovr": "S-", "dpm": 400, "dmg_pct": 17.0, "kda_per_min": 0.55, "solo_kill": 5, "csd15": 4, "gd15": 80, "xpd15": 60, "fb_part": 60, "fb_victim": 10 } },
      { "div": "1군", "role": "MID", "name": "Rookie", "age": 27, "contract": 2026, "traits": ["LANE_KINGDOM", "VETERAN"], "stats": { "ovr": "A+", "dpm": 680, "dmg_pct": 28.0, "kda_per_min": 0.50, "solo_kill": 12, "csd15": 10, "gd15": 150, "xpd15": 100, "fb_part": 30, "fb_victim": 10 } },
      { "div": "1군", "role": "ADC", "name": "GALA", "age": 23, "contract": 2026, "traits": ["RULER_ENDING", "HYPER_MECHANIC"], "stats": { "ovr": "S", "dpm": 720, "dmg_pct": 30.0, "kda_per_min": 0.60, "solo_kill": 8, "csd15": 10, "gd15": 180, "xpd15": 120, "fb_part": 15, "fb_victim": 5 } },
      { "div": "1군", "role": "SPT", "name": "Meiko", "age": 26, "contract": 2026, "traits": ["COMMANDER", "VETERAN"], "stats": { "ovr": "A+", "dpm": 220, "dmg_pct": 8.0, "kda_per_min": 0.65, "solo_kill": 1, "csd15": 2, "gd15": 50, "xpd15": 40, "fb_part": 50, "fb_victim": 15 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "WBG": {
    "teamName": "Weibo Gaming",
    "financialTier": "S",
    "money": 50.0,
    "annualSupport": 50.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Breathe", "age": 23, "contract": 2026, "traits": ["STEADY", "STONE_HEAD"], "stats": { "ovr": "A+", "dpm": 520, "dmg_pct": 23.0, "kda_per_min": 0.35, "solo_kill": 6, "csd15": 3, "gd15": 50, "xpd15": 40, "fb_part": 20, "fb_victim": 10 } },
      { "div": "1군", "role": "JGL", "name": "Tian", "age": 24, "contract": 2026, "traits": ["SMITE_KING", "EMOTIONAL"], "stats": { "ovr": "A+", "dpm": 450, "dmg_pct": 19.0, "kda_per_min": 0.50, "solo_kill": 5, "csd15": 4, "gd15": 80, "xpd15": 60, "fb_part": 50, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Xiaohu", "age": 26, "contract": 2026, "traits": ["VETERAN", "ROAMING_GOD"], "stats": { "ovr": "A+", "dpm": 600, "dmg_pct": 26.0, "kda_per_min": 0.45, "solo_kill": 8, "csd15": 5, "gd15": 100, "xpd15": 80, "fb_part": 35, "fb_victim": 10 } },
      { "div": "1군", "role": "ADC", "name": "Light", "age": 23, "contract": 2026, "traits": ["CONSISTENT"], "stats": { "ovr": "A+", "dpm": 650, "dmg_pct": 28.0, "kda_per_min": 0.50, "solo_kill": 6, "csd15": 4, "gd15": 80, "xpd15": 60, "fb_part": 20, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Crisp", "age": 26, "contract": 2026, "traits": ["ENGAGE_SUPPORT", "ROAMING"], "stats": { "ovr": "A", "dpm": 220, "dmg_pct": 8.5, "kda_per_min": 0.60, "solo_kill": 1, "csd15": 0, "gd15": 40, "xpd15": 20, "fb_part": 50, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "NIP": {
    "teamName": "Ninjas in Pyjamas",
    "financialTier": "A",
    "money": 35.0,
    "annualSupport": 35.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Solokill", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 420, "dmg_pct": 22.0, "kda_per_min": 0.30, "solo_kill": 5, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "naiyou", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B-", "dpm": 360, "dmg_pct": 17.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 40, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Doinb", "age": 28, "contract": 2026, "traits": ["COMMANDER", "DARK_TECHNOLOGY"], "stats": { "ovr": "A", "dpm": 500, "dmg_pct": 24.0, "kda_per_min": 0.45, "solo_kill": 5, "csd15": 5, "gd15": 100, "xpd15": 80, "fb_part": 50, "fb_victim": 10 } },
      { "div": "1군", "role": "ADC", "name": "Leave", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B", "dpm": 580, "dmg_pct": 29.0, "kda_per_min": 0.50, "solo_kill": 6, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 20, "fb_victim": 25 } },
      { "div": "1군", "role": "SPT", "name": "Niket", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 150, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -2, "gd15": -30, "xpd15": -10, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "EDG": {
    "teamName": "EDward Gaming",
    "financialTier": "A",
    "money": 40.0,
    "annualSupport": 40.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Zdz", "age": 23, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B", "dpm": 450, "dmg_pct": 23.0, "kda_per_min": 0.30, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Xiaohao", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 400, "dmg_pct": 18.5, "kda_per_min": 0.42, "solo_kill": 4, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 45, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Angel", "age": 24, "contract": 2026, "traits": ["PASSIVE"], "stats": { "ovr": "B+", "dpm": 520, "dmg_pct": 26.0, "kda_per_min": 0.38, "solo_kill": 3, "csd15": 2, "gd15": 10, "xpd15": 10, "fb_part": 20, "fb_victim": 5 } },
      { "div": "1군", "role": "ADC", "name": "Ahn", "age": 23, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B", "dpm": 550, "dmg_pct": 28.0, "kda_per_min": 0.40, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Parukia", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 130, "dmg_pct": 6.5, "kda_per_min": 0.35, "solo_kill": 0, "csd15": -3, "gd15": -20, "xpd15": -10, "fb_part": 30, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "WE": {
    "teamName": "Team WE",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Cube", "age": 22, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B", "dpm": 420, "dmg_pct": 22.5, "kda_per_min": 0.30, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Monki", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "C+", "dpm": 320, "dmg_pct": 16.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Karis", "age": 22, "contract": 2026, "traits": ["PASSIVE"], "stats": { "ovr": "C+", "dpm": 480, "dmg_pct": 25.0, "kda_per_min": 0.32, "solo_kill": 3, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "SPT", "name": "Vampire", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 140, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -3, "gd15": -30, "xpd15": -15, "fb_part": 35, "fb_victim": 25 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "LGD": {
    "teamName": "LGD Gaming",
    "financialTier": "C",
    "money": 15.0,
    "annualSupport": 15.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "sasi", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 380, "dmg_pct": 22.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -5, "gd15": -40, "xpd15": -30, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Meteor", "age": 24, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "B", "dpm": 400, "dmg_pct": 18.0, "kda_per_min": 0.40, "solo_kill": 3, "csd15": 0, "gd15": 10, "xpd15": 0, "fb_part": 45, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "xqw", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 420, "dmg_pct": 24.5, "kda_per_min": 0.30, "solo_kill": 3, "csd15": -4, "gd15": -30, "xpd15": -20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Sav1or", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 450, "dmg_pct": 27.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -5, "gd15": -40, "xpd15": -25, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "SPT", "name": "Ycx", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 130, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -5, "gd15": -50, "xpd15": -30, "fb_part": 35, "fb_victim": 25 } },
      { "div": "1군", "role": "SUB", "name": "climber", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "D+", "dpm": 320, "dmg_pct": 20.0, "kda_per_min": 0.20, "solo_kill": 1, "csd15": -8, "gd15": -60, "xpd15": -40, "fb_part": 10, "fb_victim": 30 } }
    ]
  },
  "UP": {
    "teamName": "Ultra Prime",
    "financialTier": "C",
    "money": 15.0,
    "annualSupport": 15.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "1Jiang", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "C+", "dpm": 400, "dmg_pct": 23.0, "kda_per_min": 0.28, "solo_kill": 4, "csd15": -3, "gd15": -20, "xpd15": -10, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Junhao", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 320, "dmg_pct": 16.5, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -5, "gd15": -40, "xpd15": -20, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Saber", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 430, "dmg_pct": 25.0, "kda_per_min": 0.32, "solo_kill": 3, "csd15": -4, "gd15": -30, "xpd15": -20, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Baiye", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 460, "dmg_pct": 27.5, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -5, "gd15": -40, "xpd15": -30, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "SPT", "name": "Xiaoxia", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 160, "dmg_pct": 7.5, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 35, "fb_victim": 25 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "TT": {
    "teamName": "ThunderTalk Gaming",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "HOYA", "age": 24, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B", "dpm": 450, "dmg_pct": 23.0, "kda_per_min": 0.30, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Aki", "age": 23, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B", "dpm": 400, "dmg_pct": 18.0, "kda_per_min": 0.42, "solo_kill": 5, "csd15": 2, "gd15": 10, "xpd15": 5, "fb_part": 45, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "SeTab", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 480, "dmg_pct": 25.5, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "1xn", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B-", "dpm": 540, "dmg_pct": 28.0, "kda_per_min": 0.40, "solo_kill": 5, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Feather", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 170, "dmg_pct": 8.0, "kda_per_min": 0.50, "solo_kill": 0, "csd15": -1, "gd15": -20, "xpd15": -10, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "xiaohuangren", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "C+", "dpm": 360, "dmg_pct": 17.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 35, "fb_victim": 20 } }
    ]
  },
  "LNG": {
    "teamName": "LNG Esports",
    "financialTier": "A",
    "money": 40.0,
    "annualSupport": 40.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Zika", "age": 21, "contract": 2027, "traits": ["SPLIT_PUSHER", "GROWTH_POTENTIAL"], "stats": { "ovr": "A", "dpm": 580, "dmg_pct": 24.5, "kda_per_min": 0.40, "solo_kill": 12, "csd15": 5, "gd15": 50, "xpd15": 40, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "xiaofang", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "B", "dpm": 380, "dmg_pct": 17.0, "kda_per_min": 0.38, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "haichao", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B+", "dpm": 540, "dmg_pct": 25.5, "kda_per_min": 0.42, "solo_kill": 6, "csd15": 2, "gd15": 20, "xpd15": 15, "fb_part": 30, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "LP", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 620, "dmg_pct": 29.0, "kda_per_min": 0.50, "solo_kill": 8, "csd15": 3, "gd15": 30, "xpd15": 20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "SPT", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "SUB", "name": "Alley", "age": 20, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 130, "dmg_pct": 6.0, "kda_per_min": 0.30, "solo_kill": 0, "csd15": -5, "gd15": -40, "xpd15": -30, "fb_part": 30, "fb_victim": 25 } }
    ]
  },
  "OMG": {
    "teamName": "Oh My God",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "lamb", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 400, "dmg_pct": 22.0, "kda_per_min": 0.28, "solo_kill": 3, "csd15": -3, "gd15": -20, "xpd15": -10, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Tianzhen", "age": 21, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "C+", "dpm": 360, "dmg_pct": 17.5, "kda_per_min": 0.35, "solo_kill": 4, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 45, "fb_victim": 25 } },
      { "div": "1군", "role": "MID", "name": "Charlotte", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C", "dpm": 440, "dmg_pct": 25.0, "kda_per_min": 0.32, "solo_kill": 2, "csd15": -4, "gd15": -30, "xpd15": -20, "fb_part": 25, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Starry", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 480, "dmg_pct": 27.0, "kda_per_min": 0.38, "solo_kill": 4, "csd15": -1, "gd15": -10, "xpd15": 0, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "Moham", "age": 24, "contract": 2026, "traits": ["ROAMING_GOD"], "stats": { "ovr": "B", "dpm": 200, "dmg_pct": 8.5, "kda_per_min": 0.50, "solo_kill": 1, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 50, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },

 // ==========================================
  // [LCS - North America] (총 8개 팀)
  // ==========================================
  "FLY": {
    "teamName": "FlyQuest",
    "financialTier": "A",
    "money": 40.0,
    "annualSupport": 40.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Gakgos", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "B", "dpm": 400, "dmg_pct": 22.0, "kda_per_min": 0.30, "solo_kill": 3, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Gryffinn", "age": 19, "contract": 2027, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B+", "dpm": 380, "dmg_pct": 17.5, "kda_per_min": 0.45, "solo_kill": 4, "csd15": 2, "gd15": 20, "xpd15": 15, "fb_part": 45, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Quad", "age": 22, "contract": 2026, "traits": ["SOLO_KILL"], "stats": { "ovr": "A-", "dpm": 550, "dmg_pct": 27.0, "kda_per_min": 0.50, "solo_kill": 10, "csd15": 5, "gd15": 50, "xpd15": 40, "fb_part": 25, "fb_victim": 10 } },
      { "div": "1군", "role": "ADC", "name": "Massu", "age": 20, "contract": 2027, "traits": ["SPONGE"], "stats": { "ovr": "A-", "dpm": 580, "dmg_pct": 28.0, "kda_per_min": 0.48, "solo_kill": 5, "csd15": 4, "gd15": 40, "xpd15": 20, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Cryogen", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 150, "dmg_pct": 5.5, "kda_per_min": 0.35, "solo_kill": 0, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 30, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "TL": {
    "teamName": "Team Liquid",
    "financialTier": "A",
    "money": 45.0,
    "annualSupport": 45.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "JGL", "name": "Josedeodo", "age": 24, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "B+", "dpm": 380, "dmg_pct": 18.0, "kda_per_min": 0.40, "solo_kill": 3, "csd15": 0, "gd15": 10, "xpd15": 5, "fb_part": 40, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Quid", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "A", "dpm": 580, "dmg_pct": 28.0, "kda_per_min": 0.55, "solo_kill": 8, "csd15": 5, "gd15": 50, "xpd15": 40, "fb_part": 30, "fb_victim": 10 } },
      { "div": "1군", "role": "ADC", "name": "Yeon", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "A", "dpm": 600, "dmg_pct": 29.0, "kda_per_min": 0.52, "solo_kill": 6, "csd15": 4, "gd15": 60, "xpd15": 30, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "CoreJJ", "age": 30, "contract": 2026, "traits": ["COMMANDER", "VETERAN"], "stats": { "ovr": "A+", "dpm": 200, "dmg_pct": 7.0, "kda_per_min": 0.65, "solo_kill": 0, "csd15": 2, "gd15": 30, "xpd15": 20, "fb_part": 50, "fb_victim": 10 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "SR": {
    "teamName": "Shopify Rebellion",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Fudge", "age": 22, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "B", "dpm": 420, "dmg_pct": 23.0, "kda_per_min": 0.30, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Contractz", "age": 25, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B", "dpm": 380, "dmg_pct": 17.0, "kda_per_min": 0.40, "solo_kill": 3, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 45, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Zinie", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 450, "dmg_pct": 25.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Bvoy", "age": 26, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B+", "dpm": 550, "dmg_pct": 28.0, "kda_per_min": 0.45, "solo_kill": 5, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Ceos", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "B", "dpm": 150, "dmg_pct": 7.0, "kda_per_min": 0.50, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "LYON": {
    "teamName": "Lyon Gaming",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Zamudo", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 380, "dmg_pct": 21.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -3, "gd15": -30, "xpd15": -15, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Inspired", "age": 22, "contract": 2026, "traits": ["SMART_JUNGLE", "CONTROL"], "stats": { "ovr": "A", "dpm": 400, "dmg_pct": 18.5, "kda_per_min": 0.55, "solo_kill": 5, "csd15": 5, "gd15": 50, "xpd15": 40, "fb_part": 50, "fb_victim": 10 } },
      { "div": "1군", "role": "MID", "name": "Saint", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "B-", "dpm": 450, "dmg_pct": 24.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Berserker", "age": 21, "contract": 2026, "traits": ["HYPER_CARRY", "MECHANIC_GOD"], "stats": { "ovr": "A+", "dpm": 650, "dmg_pct": 30.0, "kda_per_min": 0.60, "solo_kill": 8, "csd15": 8, "gd15": 100, "xpd15": 60, "fb_part": 20, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Isles", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "B", "dpm": 160, "dmg_pct": 6.5, "kda_per_min": 0.50, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "C9": {
    "teamName": "Cloud9",
    "financialTier": "A",
    "money": 42.0,
    "annualSupport": 42.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Thanatos", "age": 20, "contract": 2027, "traits": ["TOP_CARRY"], "stats": { "ovr": "A", "dpm": 550, "dmg_pct": 25.0, "kda_per_min": 0.45, "solo_kill": 10, "csd15": 6, "gd15": 60, "xpd15": 40, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Blaber", "age": 24, "contract": 2026, "traits": ["AGGRESSIVE", "COIN_FLIP"], "stats": { "ovr": "A+", "dpm": 450, "dmg_pct": 20.0, "kda_per_min": 0.55, "solo_kill": 8, "csd15": 3, "gd15": 50, "xpd15": 30, "fb_part": 55, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "APA", "age": 22, "contract": 2026, "traits": ["EMOTIONAL"], "stats": { "ovr": "A-", "dpm": 520, "dmg_pct": 26.0, "kda_per_min": 0.40, "solo_kill": 5, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 30, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Zven", "age": 27, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "A-", "dpm": 550, "dmg_pct": 27.0, "kda_per_min": 0.45, "solo_kill": 4, "csd15": 2, "gd15": 30, "xpd15": 20, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Vulcan", "age": 25, "contract": 2026, "traits": ["ENGAGE_SUPPORT"], "stats": { "ovr": "A", "dpm": 200, "dmg_pct": 8.0, "kda_per_min": 0.60, "solo_kill": 1, "csd15": 0, "gd15": 40, "xpd15": 20, "fb_part": 50, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "SEN": {
    "teamName": "Sentinels",
    "financialTier": "C",
    "money": 15.0,
    "annualSupport": 15.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "JGL", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "MID", "name": "DARKWINGS", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 400, "dmg_pct": 24.0, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -3, "gd15": -30, "xpd15": -20, "fb_part": 25, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Rahel", "age": 22, "contract": 2026, "traits": ["SPONGE"], "stats": { "ovr": "B-", "dpm": 450, "dmg_pct": 26.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "huhi", "age": 29, "contract": 2026, "traits": ["VETERAN"], "stats": { "ovr": "B", "dpm": 180, "dmg_pct": 7.0, "kda_per_min": 0.50, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "DIG": {
    "teamName": "Dignitas",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Photon", "age": 23, "contract": 2026, "traits": ["SOLO_KILL"], "stats": { "ovr": "B+", "dpm": 480, "dmg_pct": 23.0, "kda_per_min": 0.35, "solo_kill": 8, "csd15": 3, "gd15": 30, "xpd15": 20, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "MID", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "ADC", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "SPT", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "DSG": {
    "teamName": "Disguised",
    "financialTier": "C",
    "money": 15.0,
    "annualSupport": 15.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Castle", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 380, "dmg_pct": 22.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Kryra", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 350, "dmg_pct": 16.0, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -2, "gd15": -20, "xpd15": -10, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Callme", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 420, "dmg_pct": 24.5, "kda_per_min": 0.30, "solo_kill": 3, "csd15": -1, "gd15": -10, "xpd15": -5, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "SPT", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },

  // ==========================================
  // [LEC - Europe] (총 10개 팀)
  // ==========================================
  "G2": {
    "teamName": "G2 Esports",
    "financialTier": "S",
    "money": 50.0,
    "annualSupport": 50.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "BrokenBlade", "age": 24, "contract": 2026, "traits": ["TOP_CARRY", "AGGRESSIVE"], "stats": { "ovr": "S", "dpm": 600, "dmg_pct": 24.5, "kda_per_min": 0.40, "solo_kill": 10, "csd15": 5, "gd15": 100, "xpd15": 80, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Skewmond", "age": 20, "contract": 2027, "traits": ["NEWBIE_SENSATION"], "stats": { "ovr": "A+", "dpm": 450, "dmg_pct": 18.5, "kda_per_min": 0.50, "solo_kill": 5, "csd15": 3, "gd15": 80, "xpd15": 60, "fb_part": 50, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Caps", "age": 25, "contract": 2027, "traits": ["ROMANTIC", "VARIABLE_MAKER"], "stats": { "ovr": "S+", "dpm": 650, "dmg_pct": 27.5, "kda_per_min": 0.55, "solo_kill": 15, "csd15": 8, "gd15": 150, "xpd15": 120, "fb_part": 35, "fb_victim": 10 } },
      { "div": "1군", "role": "ADC", "name": "Hans Sama", "age": 25, "contract": 2026, "traits": ["LANE_KINGDOM", "AGGRESSIVE"], "stats": { "ovr": "A+", "dpm": 620, "dmg_pct": 29.0, "kda_per_min": 0.52, "solo_kill": 8, "csd15": 10, "gd15": 100, "xpd15": 80, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "Labrov", "age": 23, "contract": 2026, "traits": [], "stats": { "ovr": "A", "dpm": 200, "dmg_pct": 8.0, "kda_per_min": 0.60, "solo_kill": 1, "csd15": 0, "gd15": 50, "xpd15": 30, "fb_part": 50, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "KC": {
    "teamName": "Karmine Corp",
    "financialTier": "A",
    "money": 35.0,
    "annualSupport": 35.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Canna", "age": 24, "contract": 2026, "traits": ["SOLO_KILL"], "stats": { "ovr": "A", "dpm": 500, "dmg_pct": 23.0, "kda_per_min": 0.35, "solo_kill": 8, "csd15": 2, "gd15": 50, "xpd15": 40, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Yike", "age": 24, "contract": 2026, "traits": ["CARRY_JUNGLE"], "stats": { "ovr": "A+", "dpm": 480, "dmg_pct": 19.0, "kda_per_min": 0.48, "solo_kill": 6, "csd15": 4, "gd15": 80, "xpd15": 60, "fb_part": 45, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Kyeahoo", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B+", "dpm": 500, "dmg_pct": 25.0, "kda_per_min": 0.38, "solo_kill": 4, "csd15": 0, "gd15": 20, "xpd15": 10, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Caliste", "age": 19, "contract": 2027, "traits": ["NEWBIE_SENSATION", "HYPER_CARRY"], "stats": { "ovr": "A", "dpm": 600, "dmg_pct": 29.0, "kda_per_min": 0.55, "solo_kill": 8, "csd15": 5, "gd15": 100, "xpd15": 80, "fb_part": 20, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Busio", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "B+", "dpm": 180, "dmg_pct": 7.5, "kda_per_min": 0.50, "solo_kill": 0, "csd15": 0, "gd15": 20, "xpd15": 10, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "FNC": {
    "teamName": "Fnatic",
    "financialTier": "A",
    "money": 35.0,
    "annualSupport": 35.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Empyros", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "B+", "dpm": 450, "dmg_pct": 22.0, "kda_per_min": 0.30, "solo_kill": 3, "csd15": 0, "gd15": 10, "xpd15": 5, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Razork", "age": 24, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "A", "dpm": 420, "dmg_pct": 18.0, "kda_per_min": 0.45, "solo_kill": 5, "csd15": 2, "gd15": 50, "xpd15": 40, "fb_part": 50, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Vladi", "age": 19, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "B", "dpm": 480, "dmg_pct": 24.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -2, "gd15": 0, "xpd15": 0, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Upset", "age": 25, "contract": 2026, "traits": ["HYPER_CARRY", "RESOURCE_HEAVY"], "stats": { "ovr": "A+", "dpm": 650, "dmg_pct": 30.0, "kda_per_min": 0.52, "solo_kill": 8, "csd15": 8, "gd15": 100, "xpd15": 80, "fb_part": 15, "fb_victim": 10 } },
      { "div": "1군", "role": "SPT", "name": "Lospa", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "B", "dpm": 160, "dmg_pct": 7.0, "kda_per_min": 0.40, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "MKOI": {
    "teamName": "Movistar KOI",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Mrywn", "age": 21, "contract": 2026, "traits": ["JOKER_PICK"], "stats": { "ovr": "B", "dpm": 420, "dmg_pct": 21.5, "kda_per_min": 0.28, "solo_kill": 4, "csd15": 0, "gd15": 10, "xpd15": 5, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Elyoya", "age": 24, "contract": 2026, "traits": ["COMMANDER"], "stats": { "ovr": "A", "dpm": 400, "dmg_pct": 17.5, "kda_per_min": 0.45, "solo_kill": 3, "csd15": 3, "gd15": 50, "xpd15": 40, "fb_part": 50, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Jojopyun", "age": 21, "contract": 2026, "traits": ["AGGRESSIVE", "TRASH_TALKER"], "stats": { "ovr": "A-", "dpm": 550, "dmg_pct": 26.5, "kda_per_min": 0.48, "solo_kill": 8, "csd15": 2, "gd15": 40, "xpd15": 30, "fb_part": 30, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Supa", "age": 23, "contract": 2026, "traits": ["CONFIDENT"], "stats": { "ovr": "B+", "dpm": 580, "dmg_pct": 28.0, "kda_per_min": 0.50, "solo_kill": 5, "csd15": 2, "gd15": 20, "xpd15": 15, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "Alvaro", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "B", "dpm": 180, "dmg_pct": 7.5, "kda_per_min": 0.55, "solo_kill": 0, "csd15": 0, "gd15": 10, "xpd15": 5, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "GX": {
    "teamName": "GIANTX",
    "financialTier": "C",
    "money": 20.0,
    "annualSupport": 20.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Lot", "age": 21, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 380, "dmg_pct": 20.5, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -5, "gd15": -20, "xpd15": -15, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Isma", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "B-", "dpm": 350, "dmg_pct": 16.5, "kda_per_min": 0.35, "solo_kill": 2, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Jackies", "age": 20, "contract": 2026, "traits": ["MELEE_MID"], "stats": { "ovr": "B", "dpm": 450, "dmg_pct": 24.5, "kda_per_min": 0.40, "solo_kill": 4, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Noah", "age": 23, "contract": 2026, "traits": ["GLASS_MENTAL"], "stats": { "ovr": "B", "dpm": 520, "dmg_pct": 27.0, "kda_per_min": 0.42, "solo_kill": 3, "csd15": 2, "gd15": 10, "xpd15": 5, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "Jun", "age": 24, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B", "dpm": 180, "dmg_pct": 7.5, "kda_per_min": 0.50, "solo_kill": 0, "csd15": 0, "gd15": 10, "xpd15": 5, "fb_part": 40, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "VIT": {
    "teamName": "Team Vitality",
    "financialTier": "B",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Naak Nako", "age": 20, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 400, "dmg_pct": 21.5, "kda_per_min": 0.28, "solo_kill": 2, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Lyncas", "age": 21, "contract": 2026, "traits": ["GROWTH_POTENTIAL"], "stats": { "ovr": "B", "dpm": 380, "dmg_pct": 17.0, "kda_per_min": 0.38, "solo_kill": 3, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Humanoid", "age": 24, "contract": 2026, "traits": ["LANE_KINGDOM", "THROWING"], "stats": { "ovr": "A", "dpm": 600, "dmg_pct": 27.5, "kda_per_min": 0.50, "solo_kill": 8, "csd15": 5, "gd15": 80, "xpd15": 60, "fb_part": 25, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Carzzy", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 580, "dmg_pct": 28.5, "kda_per_min": 0.52, "solo_kill": 6, "csd15": 3, "gd15": 30, "xpd15": 20, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "SPT", "name": "Fleshy", "age": 22, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 150, "dmg_pct": 6.5, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -3, "gd15": -20, "xpd15": -10, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "BDS": {
    "teamName": "Team BDS",
    "financialTier": "B",
    "money": 30.0,
    "annualSupport": 30.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Rooster", "age": 22, "contract": 2026, "traits": ["LANE_KINGDOM"], "stats": { "ovr": "B", "dpm": 450, "dmg_pct": 23.0, "kda_per_min": 0.32, "solo_kill": 5, "csd15": 2, "gd15": 10, "xpd15": 5, "fb_part": 20, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Boukada", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 350, "dmg_pct": 16.5, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Nuc", "age": 22, "contract": 2026, "traits": ["STEADY"], "stats": { "ovr": "B+", "dpm": 500, "dmg_pct": 26.0, "kda_per_min": 0.42, "solo_kill": 4, "csd15": 3, "gd15": 20, "xpd15": 15, "fb_part": 25, "fb_victim": 15 } },
      { "div": "1군", "role": "ADC", "name": "Paduck", "age": 22, "contract": 2026, "traits": ["TEAMFIGHT_GLADIATOR"], "stats": { "ovr": "B", "dpm": 550, "dmg_pct": 27.5, "kda_per_min": 0.45, "solo_kill": 4, "csd15": 2, "gd15": 10, "xpd15": 5, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "Trymbi", "age": 24, "contract": 2026, "traits": ["COMMANDER"], "stats": { "ovr": "A-", "dpm": 200, "dmg_pct": 8.0, "kda_per_min": 0.60, "solo_kill": 1, "csd15": 2, "gd15": 40, "xpd15": 20, "fb_part": 45, "fb_victim": 15 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "TH": {
    "teamName": "Team Heretics",
    "financialTier": "C",
    "money": 25.0,
    "annualSupport": 25.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Tracyn", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 380, "dmg_pct": 21.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -4, "gd15": -20, "xpd15": -10, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "JGL", "name": "Sheo", "age": 23, "contract": 2026, "traits": ["SMART_JUNGLE"], "stats": { "ovr": "B", "dpm": 360, "dmg_pct": 16.0, "kda_per_min": 0.35, "solo_kill": 2, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 40, "fb_victim": 15 } },
      { "div": "1군", "role": "MID", "name": "Sarin", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 420, "dmg_pct": 24.0, "kda_per_min": 0.30, "solo_kill": 3, "csd15": -3, "gd15": -30, "xpd15": -15, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Ice", "age": 22, "contract": 2026, "traits": ["AGGRESSIVE"], "stats": { "ovr": "B+", "dpm": 580, "dmg_pct": 28.0, "kda_per_min": 0.48, "solo_kill": 6, "csd15": 2, "gd15": 20, "xpd15": 10, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "SPT", "name": "Stend", "age": 23, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 150, "dmg_pct": 6.5, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "SK": {
    "teamName": "SK Gaming",
    "financialTier": "C",
    "money": 20.0,
    "annualSupport": 20.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Wunder", "age": 26, "contract": 2026, "traits": ["VETERAN", "TRASH_TALKER"], "stats": { "ovr": "B", "dpm": 420, "dmg_pct": 22.5, "kda_per_min": 0.32, "solo_kill": 4, "csd15": -2, "gd15": -10, "xpd15": -5, "fb_part": 15, "fb_victim": 15 } },
      { "div": "1군", "role": "JGL", "name": "Skeanz", "age": 24, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 350, "dmg_pct": 16.5, "kda_per_min": 0.30, "solo_kill": 2, "csd15": -4, "gd15": -20, "xpd15": -15, "fb_part": 35, "fb_victim": 20 } },
      { "div": "1군", "role": "MID", "name": "Lider", "age": 25, "contract": 2026, "traits": ["MELEE_MID", "COIN_FLIP"], "stats": { "ovr": "B-", "dpm": 500, "dmg_pct": 26.0, "kda_per_min": 0.40, "solo_kill": 6, "csd15": -2, "gd15": 0, "xpd15": 0, "fb_part": 25, "fb_victim": 25 } },
      { "div": "1군", "role": "ADC", "name": "Jopa", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C+", "dpm": 450, "dmg_pct": 25.0, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -3, "gd15": -10, "xpd15": -5, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "SPT", "name": "Mikyx", "age": 26, "contract": 2026, "traits": ["ROAMING_GOD", "ENGAGE_GOD"], "stats": { "ovr": "A", "dpm": 200, "dmg_pct": 8.0, "kda_per_min": 0.60, "solo_kill": 1, "csd15": 2, "gd15": 50, "xpd15": 30, "fb_part": 55, "fb_victim": 15 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  },
  "NAVI": {
    "teamName": "Natus Vincere",
    "financialTier": "C",
    "money": 20.0,
    "annualSupport": 20.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Maynter", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 380, "dmg_pct": 21.0, "kda_per_min": 0.25, "solo_kill": 2, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 15, "fb_victim": 25 } },
      { "div": "1군", "role": "JGL", "name": "Rhilech", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 330, "dmg_pct": 16.0, "kda_per_min": 0.30, "solo_kill": 1, "csd15": -6, "gd15": -40, "xpd15": -25, "fb_part": 30, "fb_victim": 25 } },
      { "div": "1군", "role": "MID", "name": "Poby", "age": 20, "contract": 2026, "traits": ["STEEL_STAMINA"], "stats": { "ovr": "C+", "dpm": 420, "dmg_pct": 24.5, "kda_per_min": 0.35, "solo_kill": 3, "csd15": -3, "gd15": -20, "xpd15": -15, "fb_part": 20, "fb_victim": 20 } },
      { "div": "1군", "role": "ADC", "name": "Hans SamD", "age": 23, "contract": 2026, "traits": [], "stats": { "ovr": "C+", "dpm": 480, "dmg_pct": 26.0, "kda_per_min": 0.38, "solo_kill": 4, "csd15": -2, "gd15": -10, "xpd15": -10, "fb_part": 15, "fb_victim": 20 } },
      { "div": "1군", "role": "SPT", "name": "Parus", "age": 21, "contract": 2026, "traits": ["NEWBIE"], "stats": { "ovr": "C", "dpm": 140, "dmg_pct": 6.5, "kda_per_min": 0.40, "solo_kill": 0, "csd15": -5, "gd15": -30, "xpd15": -20, "fb_part": 35, "fb_victim": 25 } },
      { "div": "1군", "role": "SUB", "name": "VACANT", "age": 0, "contract": 0, "traits": [], "stats": { "ovr": "-", "dpm": 0, "dmg_pct": 0, "kda_per_min": 0, "solo_kill": 0, "csd15": 0, "gd15": 0, "xpd15": 0, "fb_part": 0, "fb_victim": 0 } }
    ]
  }
};