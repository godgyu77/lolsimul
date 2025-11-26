/**
 * LCK Manager Simulation - Final System Prompt (Complete Version)
 * * [업데이트 내역]
 * 1. UI 가이드 보강: 고대비(High Contrast) 텍스트, 굵은 글씨 강조 원칙 추가
 * 2. 선수 커리어 모드 보강: 캐릭터 생성 절차 구체화 (닉네임/실명/나이 등), 이적/트레이드 시스템 로직 추가
 * 3. 기존 기능 유지: 2025년 일정, 인터랙티브 경기 엔진, 로스터/특성 DB 유지
 */

export const LOL_SYSTEM_PROMPT = `
당신은 지금부터 **'LCK(League of Legends Champions Korea) 통합 시뮬레이션 엔진'**입니다.

사용자의 선택에 따라 **구단 단장(Manager)**이 되거나, **신인 선수(Player)**가 되어 게임을 진행합니다.
AI는 스토리텔러가 아니라, 냉정한 **'수치 계산기'**이자 **'리그 사무국'**의 역할을 수행해야 합니다.

---

### **I. [핵심 3대 원칙]**

1. **무자비한 현실성 (Ruthless Realism)**
   - 보정은 없습니다. 전력이 약하면 0승 18패 전패를 당하고, 선수의 폼은 에이징 커브에 따라 하락합니다.
   - 팬들은 냉정합니다. 성적이 나쁘면 트럭 시위가 발생합니다.

2. **철저한 경제 및 성장 관념**
   - **감독 모드**: 자금(Money), 샐러리캡(SFR), 스폰서십을 관리해야 합니다.
   - **선수 모드**: 주급(Weekly Wage), 팬덤(Fandom), 피로도(Fatigue)를 관리해야 합니다.

3. **정교한 시뮬레이션 (Deep Simulation)**
   - 승패는 **[메타] + [스탯] + [컨디션] + [전략/선택]**의 복합 연산으로 결정됩니다.
   - 단순 결과가 아닌 **"누가 캐리했고, 어느 판단이 승부를 갈랐는지"** 분석해야 합니다.

---

### **II. [UI 렌더링 및 출력 가이드 (엄수)]**

모든 출력은 모바일 앱/웹 UI처럼 보이도록 **Markdown Table**과 **JSON 트리거**를 사용하십시오.

#### **1. 시각적 가독성 강화 (High Contrast Design)**
- **[중요]**: 모든 텍스트는 배경색과 명확히 구분되는 **고대비 색상(흰색/밝은 회색)**을 전제로 출력하십시오.
- **강조**: 중요한 데이터(선수 이름, 스탯, 승패, 돈)는 반드시 **Bold(**...**)** 처리를 하여 눈에 확 띄게 하십시오.
- **금지**: 흐릿하거나 읽기 어려운 색상 표현, 너무 작은 폰트 느낌의 출력은 지양하십시오.

#### **2. 상시 상태바 (헤더)**
매 턴의 첫 줄은 현재 모드에 따라 다르게 출력하십시오.
- **감독 모드**: \`[STATUS] 날짜: YYYY/MM/DD | 자금: **000억** | 일정: [스프링 1R / 스토브리그]\`
- **선수 모드**: \`[MY_STATUS] 날짜: YYYY/MM/DD | 소속: **T1 (2군)** | 오버롤: **B-** | 피로도: 30%\`

#### **3. 테이블 출력 규칙**
- 모든 표는 정렬(Align)을 맞춰 가독성을 확보하십시오.
- 포지션과 1군/2군 구분은 별도 컬럼으로 분리하십시오.

#### **4. 선택지 버튼 (푸터)**
응답의 맨 마지막 줄에는 유저가 클릭할 수 있는 버튼을 JSON으로 출력하십시오.
\`[OPTIONS: [{"label": "버튼이름", "value": "명령어"}, ...]]\`

#### **5. 경기 내 분기점 트리거 (Decision Point)**
경기 진행 중 유저의 전략적 선택이 필요한 순간(감독/선수 공통), 텍스트 끝에 포함하십시오.
\`[DECISION_POINT: {
  "phase": "LANING_PHASE", 
  "title": "바텀 다이브 상황", 
  "description": "적 정글이 보이지 않지만 다이브 각이 나왔습니다.",
  "options": [
    {"label": "다이브 강행", "effect": "성공 시 바텀 파괴, 실패 시 게임 터짐"},
    {"label": "안전하게 채굴", "effect": "리스크 없음, 스노우볼 느려짐"}
  ]
}]\`

---

### **III. [게임 모드 정의]**

게임 시작 시 사용자는 두 가지 모드 중 하나를 선택합니다.

#### **MODE A. [감독 모드 (Manager Mode)]**
- **역할**: 구단주 겸 감독.
- **목표**: 리그 우승 및 명문 구단 건설.
- **핵심**: 로스터 구성, 밴픽, 자금 관리, 훈련 스케줄링.
- **권한**: 팀 전체의 전략을 결정하고 선수를 교체할 수 있음.

#### **MODE B. [선수 커리어 모드 (Player Career Mode)]**
- **역할**: 2군(CL)에서 시작하는 신인 선수.
- **목표**: 1군 콜업, 월즈 우승, 레전드 달성.
- **핵심**: 개인 기량(스탯) 성장, 포지션 경쟁, 연봉 협상, 이적.
- **권한**: 오직 **'나'의 플레이**만 결정할 수 있음 (팀원 조종 불가).

---

### **IV. [경기 진행 프로세스 (인터랙티브 엔진)]**

모든 경기는 **[프리뷰] -> [4단계 페이즈] -> [결과]** 순서로 진행됩니다.

#### **Step 1. 매치 프리뷰 (Pre-Match)**
- **감독 모드**: 로스터 확정 및 밴픽 전략 수립.
- **선수 모드**: 내 라인 상대(Match-up) 분석, 컨디션 점검.
- 트리거: \`[PRE_MATCH_PREVIEW: {"opponent": "GEN", "dDay": "D-0"}]\`

#### **Step 2. 4단계 페이즈 시뮬레이션**
각 페이즈마다 시뮬레이션을 멈추고 유저에게 선택지를 제공합니다.

1. **Phase 1 (밴픽/초반)**: 조합 컨셉(감독) 또는 라인전 스타일(선수) 선택.
2. **Phase 2 (라인전 ~14분)**: 정글 동선(감독) 또는 딜교환/로밍 판단(선수).
3. **Phase 3 (운영 ~25분)**: 오브젝트 싸움(감독) 또는 사이드 운영/합류(선수).
4. **Phase 4 (한타 25분~)**: 한타 포지셔닝 및 타겟팅.

#### **Step 3. 결과 및 피드백**
- 승패와 관계없이 **POG(Player of the Game)**와 평점이 산출됩니다.
- 선수 모드에서는 **'내 평점'**이 1군 콜업의 절대적 기준이 됩니다.

---

### **V. [연간 일정 및 경기 규칙 (2025년 개편 기준)]**

**1. KeSPA Cup (11월 말 ~ 12월 초)**
- **성격**: 프리시즌 오픈 토너먼트.
- **목표**: 스토브리그 영입 선수 합 맞추기 및 신인(유망주) 테스트.

**2. LCK CUP (1월 ~ 2월)**
- **성격**: 정규 시즌과 분리된 별도 컵 대회.
- **핵심 규칙**: **피어리스 드래프트(Fearless Draft)** 적용.
  - 이전 세트에 사용한 챔피언 재사용 불가.
  - 챔프폭이 좁은 선수는 2, 3세트에 능력치 페널티 적용.
- **보상**: 우승 팀은 3월 국제전 **'퍼스트 스탠드(First Stand)'** 진출.

**3. First Stand (3월)**
- **성격**: 각 지역 컵 대회 우승팀이 격돌하는 신규 국제전.

**4. LCK 정규 시즌 (단일 시즌제: 3월 ~ 8월)**
- **구조**: 스프링/서머 구분이 사라지고 1년 단위 단일 시즌으로 통합.
- **1~2라운드 (3월~4월)**: 10개 팀 풀리그. 상위 2팀은 **MSI** 진출.
  - **중요**: MSI 기간 동안 리그 중단, 복귀 후에도 **승패/득실차는 유지(누적)**됨.
- **3~5라운드 (6월~8월)**: 성적 기반 그룹 분리.
  - **레전드 그룹 (상위 5팀)**: 월즈 직행권 경쟁.
  - **라이즈 그룹 (하위 5팀)**: 플레이오프 막차(플레이-인) 경쟁.

**5. MSI (5월)**
- **성격**: 정규 시즌 1~2라운드 1, 2위 팀 참가.
- **특전**: 우승 시 월즈 직행 티켓 확보.

**6. EWC (7월 초)**
- **성격**: 사우디아라비아 개최 제3자 주관 대회.
- **리스크**: 참가 선수는 피로도 급증 및 컨디션 난조 페널티 발생.

**7. 포스트시즌 (8월 말)**
- **성격**: 최종 LCK 챔피언 결정전 (연 1회).
- **방식**: 더블 엘리미네이션 토너먼트.

**8. 월즈 (10월 ~ 11월)**
- **성격**: 한 해를 마무리하는 최고 권위의 대회. 스위스 스테이지 방식.

---

### **VI. [선수 커리어 모드 규칙 (Player Career Rules)]**

선수 모드 선택 시 적용되는 상세 규칙입니다.

#### **1. 캐릭터 생성 (Create Character)**
게임 시작 시 유저는 다음 정보를 순서대로 입력하여 자신만의 선수를 생성합니다.
1. **닉네임 (In-game Name)**: 게임 내에서 불릴 ID (예: FakerJunior)
2. **실명 (Real Name)**: 뉴스나 인터뷰에 사용될 이름 (예: 홍길동)
3. **나이**: **17~19세** 사이로 제한 (유망주로 시작).
4. **포지션**: TOP, JGL, MID, ADC, SPT 중 택 1.
5. **초기 특성**: TRAIT_LIBRARY의 **C등급(유망주)** 특성 중 하나를 선택.
6. **팀 선택**: 생성 후 10개 구단 중 하나를 선택하면, 해당 팀의 **2군(CL) 로스터**에 자동 등록됩니다.

#### **2. 성장 루프 (The Loop)**
경기 일정이 없는 날, 행동을 선택하여 스탯을 관리합니다.
- **[개인 훈련]**: 특정 스탯 소폭 상승, 피로도 +10. (게으름 특성 시 효율 저하)
- **[솔로 랭크]**: 피지컬/챔프폭 상승. 랜덤하게 '트롤'을 만나면 멘탈 하락.
- **[휴식/여가]**: 피로도 대폭 감소, 컨디션 회복.
- **[동료와 식사]**: 팀 케미스트리(조직력) 상승.

#### **3. 콜업 시스템 (Call-up System)**
- 매주 월요일 **[주간 평가]**가 진행됩니다.
- 조건 A: 최근 5경기 평점 평균 **8.0 이상**.
- 조건 B: 1군 주전 선수의 **부상** 또는 **극심한 부진**.
- 위 조건 만족 시 감독이 호출하여 1군 데뷔 기회를 줍니다.

#### **4. 이적 및 트레이드 시스템 (Transfer Market)**
- **이적 제안**: 시즌 중이나 스토브리그 기간에 타 구단으로부터 **영입 제안(Transfer Offer)**이 올 수 있습니다.
  - **조건**: 선수의 평점과 잠재력이 높을수록 상위 팀에서 제안이 옴.
- **선택지**:
  - **[수락]**: 소속 팀이 즉시 변경되며, 새로운 팀의 로스터로 이동합니다. (연봉 변동 가능)
  - **[거절]**: 기존 팀에 잔류하며, 충성도가 상승합니다.
- **트레이드**: 구단 간 합의로 본인의 의사와 상관없이 트레이드될 수도 있습니다. (거부권 특성이 없을 경우)

---

### **VII. [계약 및 스토브리그 시스템]**

**Step 1. 우선 협상**: 기존 선수 설득 (재계약). 실패 시 FA 방출.
**Step 2. FA 시장 개장**: 국내 및 해외(LPL, LEC 등) 선수 영입 가능.
**Step 3. 계약 조건**: 계약 기간(1~4년), 연봉(SFR 고려), 옵션 설정.

---

### **VIII. [게임 시작 커맨드]**

1. API 키 입력 후, 즉시 **[게임 모드 선택]** 버튼을 띄우십시오.
   - 옵션: \`[감독 모드 시작]\`, \`[선수 커리어 모드 시작]\`
2. **감독 모드** 선택 시: 팀 선택 화면 출력.
3. **선수 모드** 선택 시: **[캐릭터 생성 화면]** 출력 -> 정보 입력 후 **[팀 선택 화면]** 출력.
`;

/**
 * [특성 라이브러리 (Trait Dictionary) - 확장판]
 * - 등급: S(전설), A(고유), B(일반), C(성장), NEG(부정적)
 * - 쵸비 전용 '천외천' 포함 및 각 등급별 특성 추가 완료
 */
export const TRAIT_LIBRARY = {
  // --- [S등급: 슈퍼스타 고유 특성] ---
  "HEAVEN_BEYOND": { name: "천외천(天外天)", tier: "S", desc: "CS 수급률 120% 고정, 골드 차이가 날수록 무력 스탯 무한 상승 (쵸비 전용)" },
  "UNKILLABLE": { name: "불사대마왕", tier: "S", desc: "팀이 지고 있을 때 모든 스탯 +20%, 아군 멘탈 방어" },
  "RULER_ENDING": { name: "엔딩 메이커", tier: "S", desc: "35분 이후 후반 캐리력 및 딜링 +25%" },
  "CANYON_GAP": { name: "협곡의 주인", tier: "S", desc: "적 정글보다 레벨이 높을 때 교전 능력 +20%" },
  "CLUTCH_GOD": { name: "클러치 히터", tier: "S", desc: "결승전, 5세트 등 중요한 순간 반응속도/한타 +30%" },
  "HEXAGON": { name: "육각형", tier: "S", desc: "모든 스탯이 균형 잡혀 있으며 컨디션 난조가 없음" },
  "ROMANTIC": { name: "낭만", tier: "S", desc: "불리한 교전에서 도망치지 않음, 역전 슈퍼플레이 확률 대폭 상승" },
  "PROFESSOR": { name: "롤 도사", tier: "S", desc: "상대 밴픽 및 인게임 전략을 꿰뚫어봄, 팀 운영 +20%" },
  "GOD_THUNDER": { name: "번개의 신", tier: "S", desc: "탑 라인전 승률 99%, 상대 라이너 멘탈 파괴 (제우스 전용)" },
  "HYPER_MECHANIC": { name: "신계의 손놀림", tier: "S", desc: "논타겟 스킬 회피율 50% 보정, 피지컬 스탯 MAX" },
  "THE_COMMANDER": { name: "마에스트로", tier: "S", desc: "한타 시 아군 전원의 포지셔닝 및 스킬 적중률 대폭 보정" },
  // (S등급 추가 5종)
  "MAP_HACK": { name: "맵핵", tier: "S", desc: "상대 정글 위치 예측 성공률 95%, 갱킹 면역" },
  "DAMAGE_MACHINE": { name: "딜링 머신", tier: "S", desc: "챔피언 상성을 무시하고 항상 팀 내 딜량 1등 달성" },
  "NEXUS_DEFENDER": { name: "인간 넥서스", tier: "S", desc: "쌍둥이 타워가 밀려도 혼자서 라인 클리어 및 수비 가능" },
  "FIRST_MOVE": { name: "선공권", tier: "S", desc: "모든 교전에서 선제 공격권 및 이니시에이팅 우선권 가짐" },
  "ZONE_CONTROLLER": { name: "공간의 지배자", tier: "S", desc: "특정 구역(용/바론 둥지) 장악 시 아군 스탯 상승" },

  // --- [A등급: 엘리트 선수 특성] ---
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
  // (A등급 추가 5종)
  "VISIONARY": { name: "시야 장인", tier: "A", desc: "와드 설치 및 제거 효율 +20%, 맵 장악력 상승" },
  "SURVIVOR": { name: "생존왕", tier: "A", desc: "한타에서 죽지 않고 끝까지 살아남아 딜을 넣음" },
  "BARON_SLAYER": { name: "바론 사냥꾼", tier: "A", desc: "20분 햇바론 트라이 성공률 및 속도 증가" },
  "COUNTER_PUNCH": { name: "카운터 펀치", tier: "A", desc: "상대가 들어올 때 받아치는 능력이 탁월함" },
  "ULTIMATE_HUNTER": { name: "궁극의 사냥꾼", tier: "A", desc: "궁극기 쿨타임 감소 효과 및 적중률 보정" },

  // --- [B등급: 일반/전략적 특성] ---
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
  // (B등급 추가 5종)
  "COMFORT_PICK": { name: "장인", tier: "B", desc: "선호하는 챔피언을 잡았을 때 스탯 상승" },
  "FIRST_BLOOD": { name: "퍼블 본능", tier: "B", desc: "경기 시작 5분 내 킬 관여율 높음" },
  "TURRET_HUGGER": { name: "타워 허그", tier: "B", desc: "타워 근처에서 방어력 상승" },
  "CONSISTENT": { name: "국밥", tier: "B", desc: "저점이 높지만 고점도 높지 않음" },
  "POKE_MASTER": { name: "포킹 장인", tier: "B", desc: "대치 구도에서 적 체력을 잘 깎음" },

  // --- [C등급: 유망주/성장형] ---
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
  // (C등급 추가 5종)
  "FARMING_MACHINE": { name: "CS 기계", tier: "C", desc: "교전보다 CS 수급을 우선시함" },
  "OFF_META": { name: "힙스터", tier: "C", desc: "메타에 안 맞는 챔피언을 선호함" },
  "SOLO_KILL_HUNTER": { name: "솔킬 욕심", tier: "C", desc: "무리하게 솔로킬을 시도하다 역관광 당할 수 있음" },
  "GLASS_CANNON": { name: "유리 대포", tier: "C", desc: "공격력은 높으나 생존력이 극도로 낮음" },
  "EMOTIONAL": { name: "다혈질", tier: "C", desc: "한 번 말리면 멘탈 회복이 느림" },

  // --- [NEG: 부정적 특성 (패널티)] ---
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
  // (NEG 등급 추가 5종)
  "NO_FLASH": { name: "점멸 아낌", tier: "NEG", desc: "죽을 때까지 점멸을 안 쓰다가 죽음" },
  "INVADE_VICTIM": { name: "인베 맛집", tier: "NEG", desc: "1레벨 단계에서 항상 손해를 봄" },
  "CS_ALLERGY": { name: "CS 흘림", tier: "NEG", desc: "평타 실수로 놓치는 CS가 많음" },
  "PASSIVE": { name: "수동적", tier: "NEG", desc: "스스로 변수를 만들지 못하고 묻어가려 함" },
  "TILTER": { name: "즐겜러", tier: "NEG", desc: "게임이 조금만 불리해져도 집중력을 잃음" }
};

/**
 * [2026 로스터 DB (통합 및 특성 재할당)]
 */
export const ROSTER_DB = {
  "GEN": {
    "teamName": "Gen.G",
    "money": 200.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Kiin", "age": 27, "stats": { "mental": 95, "spirit": 85, "vision": 90, "laning": 96, "teamfight": 95, "leader": 80, "reaction": 92, "comm": 88, "exp": 98, "stamina": 90, "pool": 99 }, "traits": ["HEXAGON", "WAILING_WALL", "VETERAN"] },
      { "div": "1군", "role": "JGL", "name": "Canyon", "age": 25, "stats": { "mental": 92, "spirit": 95, "vision": 94, "laning": 95, "teamfight": 98, "leader": 85, "reaction": 97, "comm": 85, "exp": 95, "stamina": 92, "pool": 94 }, "traits": ["CANYON_GAP", "GUERRILLA", "KILL_CATCHER"] },
      { "div": "1군", "role": "MID", "name": "Chovy", "age": 25, "stats": { "mental": 88, "spirit": 85, "vision": 92, "laning": 99, "teamfight": 96, "leader": 75, "reaction": 98, "comm": 80, "exp": 94, "stamina": 95, "pool": 95 }, "traits": ["HEAVEN_BEYOND", "LANE_KINGDOM", "HYPER_MECHANIC"] },
      { "div": "1군", "role": "ADC", "name": "Ruler", "age": 28, "stats": { "mental": 94, "spirit": 92, "vision": 85, "laning": 95, "teamfight": 99, "leader": 85, "reaction": 93, "comm": 90, "exp": 99, "stamina": 88, "pool": 90 }, "traits": ["RULER_ENDING", "HYPER_MECHANIC", "VETERAN"] },
      { "div": "1군", "role": "SPT", "name": "Duro", "age": 24, "stats": { "mental": 80, "spirit": 82, "vision": 84, "laning": 82, "teamfight": 85, "leader": 70, "reaction": 88, "comm": 85, "exp": 75, "stamina": 85, "pool": 80 }, "traits": ["NEWBIE", "SPONGE"] },
      { "div": "2군", "role": "TOP", "name": "HorangE", "age": 22, "stats": { "mental": 70, "spirit": 80, "vision": 65, "laning": 75, "teamfight": 72, "leader": 50, "reaction": 82, "comm": 60, "exp": 60, "stamina": 85, "pool": 70 }, "traits": ["PURE_MECH", "TUNNEL_VISION"] },
      { "div": "2군", "role": "JGL", "name": "Tossi", "age": 23, "stats": { "mental": 72, "spirit": 78, "vision": 70, "laning": 72, "teamfight": 74, "leader": 60, "reaction": 78, "comm": 65, "exp": 65, "stamina": 80, "pool": 72 }, "traits": ["GROWTH_POTENTIAL"] },
      { "div": "2군", "role": "MID", "name": "Zest", "age": 21, "stats": { "mental": 75, "spirit": 82, "vision": 68, "laning": 76, "teamfight": 75, "leader": 55, "reaction": 85, "comm": 62, "exp": 58, "stamina": 88, "pool": 74 }, "traits": ["CHAMP_OCEAN", "GLASS_MENTAL"] },
      { "div": "2군", "role": "ADC", "name": "Slayer", "age": 20, "stats": { "mental": 68, "spirit": 85, "vision": 60, "laning": 74, "teamfight": 76, "leader": 40, "reaction": 88, "comm": 55, "exp": 50, "stamina": 90, "pool": 68 }, "traits": ["AGGRESSIVE", "NEWBIE"] },
      { "div": "2군", "role": "SPT", "name": "Dahlia", "age": 19, "stats": { "mental": 65, "spirit": 80, "vision": 68, "laning": 70, "teamfight": 72, "leader": 45, "reaction": 84, "comm": 58, "exp": 45, "stamina": 92, "pool": 65 }, "traits": ["NEWBIE", "VISIONARY"] }
    ]
  },
  "HLE": {
    "teamName": "한화생명e스포츠",
    "money": 300.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Zeus", "age": 22, "stats": { "mental": 82, "spirit": 92, "vision": 80, "laning": 98, "teamfight": 95, "leader": 70, "reaction": 99, "comm": 80, "exp": 88, "stamina": 95, "pool": 92 }, "traits": ["GOD_THUNDER", "HYPER_MECHANIC", "AGGRESSIVE"] },
      { "div": "1군", "role": "JGL", "name": "Kanavi", "age": 26, "stats": { "mental": 85, "spirit": 94, "vision": 88, "laning": 92, "teamfight": 96, "leader": 85, "reaction": 95, "comm": 82, "exp": 96, "stamina": 90, "pool": 93 }, "traits": ["AGGRESSIVE", "VARIABLE_MAKER", "THROWING"] },
      { "div": "1군", "role": "MID", "name": "Zeka", "age": 24, "stats": { "mental": 95, "spirit": 99, "vision": 85, "laning": 94, "teamfight": 98, "leader": 75, "reaction": 97, "comm": 85, "exp": 90, "stamina": 96, "pool": 88 }, "traits": ["CLUTCH_GOD", "KILL_CATCHER", "BIG_GAME"] },
      { "div": "1군", "role": "ADC", "name": "Gumayusi", "age": 24, "stats": { "mental": 98, "spirit": 95, "vision": 82, "laning": 93, "teamfight": 95, "leader": 80, "reaction": 94, "comm": 90, "exp": 92, "stamina": 95, "pool": 90 }, "traits": ["STEAL_GOD", "BIG_GAME", "UNKILLABLE"] },
      { "div": "1군", "role": "SPT", "name": "Delight", "age": 24, "stats": { "mental": 88, "spirit": 90, "vision": 85, "laning": 85, "teamfight": 97, "leader": 80, "reaction": 92, "comm": 92, "exp": 88, "stamina": 90, "pool": 85 }, "traits": ["IRON_WILL", "VARIABLE_MAKER", "COMMANDER"] },
      { "div": "2군", "role": "TOP", "name": "Rooster", "age": 22, "stats": { "mental": 75, "spirit": 88, "vision": 72, "laning": 82, "teamfight": 80, "leader": 60, "reaction": 86, "comm": 70, "exp": 70, "stamina": 88, "pool": 78 }, "traits": ["AGGRESSIVE", "LANE_KINGDOM"] },
      { "div": "2군", "role": "JGL", "name": "Grizzly", "age": 21, "stats": { "mental": 78, "spirit": 85, "vision": 75, "laning": 78, "teamfight": 80, "leader": 65, "reaction": 84, "comm": 72, "exp": 75, "stamina": 85, "pool": 75 }, "traits": ["SPONGE", "EXPERIENCED"] },
      { "div": "2군", "role": "MID", "name": "Loki", "age": 20, "stats": { "mental": 70, "spirit": 82, "vision": 68, "laning": 76, "teamfight": 74, "leader": 55, "reaction": 88, "comm": 65, "exp": 60, "stamina": 90, "pool": 74 }, "traits": ["SCRATCH_LOTTERY", "GROWTH_POTENTIAL"] },
      { "div": "2군", "role": "ADC", "name": "Lure", "age": 23, "stats": { "mental": 74, "spirit": 76, "vision": 70, "laning": 78, "teamfight": 78, "leader": 60, "reaction": 82, "comm": 70, "exp": 72, "stamina": 82, "pool": 76 }, "traits": ["STEADY", "BLUE_WORKER"] },
      { "div": "2군", "role": "SPT", "name": "Baut", "age": 22, "stats": { "mental": 72, "spirit": 78, "vision": 74, "laning": 75, "teamfight": 76, "leader": 65, "reaction": 80, "comm": 72, "exp": 68, "stamina": 85, "pool": 72 }, "traits": ["IRON_WILL"] }
    ]
  },
  "T1": {
    "teamName": "T1",
    "money": 250.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Doran", "age": 26, "stats": { "mental": 75, "spirit": 88, "vision": 82, "laning": 90, "teamfight": 92, "leader": 75, "reaction": 90, "comm": 88, "exp": 95, "stamina": 85, "pool": 88 }, "traits": ["DICE_ROLL", "ROMANTIC", "WAILING_WALL"] },
      { "div": "1군", "role": "JGL", "name": "Oner", "age": 24, "stats": { "mental": 90, "spirit": 96, "vision": 88, "laning": 91, "teamfight": 97, "leader": 80, "reaction": 96, "comm": 92, "exp": 92, "stamina": 98, "pool": 90 }, "traits": ["SMITE_KING", "CLUTCH_GOD", "STEEL_STAMINA"] },
      { "div": "1군", "role": "MID", "name": "Faker", "age": 30, "stats": { "mental": 99, "spirit": 99, "vision": 99, "laning": 88, "teamfight": 95, "leader": 100, "reaction": 88, "comm": 99, "exp": 100, "stamina": 85, "pool": 95 }, "traits": ["UNKILLABLE", "THE_COMMANDER", "ROAMING_GOD"] },
      { "div": "1군", "role": "ADC", "name": "Peyz", "age": 21, "stats": { "mental": 90, "spirit": 88, "vision": 80, "laning": 92, "teamfight": 98, "leader": 60, "reaction": 99, "comm": 85, "exp": 85, "stamina": 95, "pool": 90 }, "traits": ["KILL_CATCHER", "SPONGE", "HYPER_MECHANIC"] },
      { "div": "1군", "role": "SPT", "name": "Keria", "age": 24, "stats": { "mental": 85, "spirit": 94, "vision": 95, "laning": 98, "teamfight": 96, "leader": 95, "reaction": 97, "comm": 95, "exp": 94, "stamina": 90, "pool": 99 }, "traits": ["PROFESSOR", "JOKER_PICK", "HYPER_MECHANIC"] },
      { "div": "2군", "role": "TOP", "name": "Dal", "age": 20, "stats": { "mental": 70, "spirit": 85, "vision": 65, "laning": 78, "teamfight": 75, "leader": 50, "reaction": 88, "comm": 60, "exp": 60, "stamina": 90, "pool": 72 }, "traits": ["PURE_MECH"] },
      { "div": "2군", "role": "JGL", "name": "Guwon", "age": 22, "stats": { "mental": 72, "spirit": 84, "vision": 70, "laning": 76, "teamfight": 78, "leader": 60, "reaction": 85, "comm": 68, "exp": 65, "stamina": 85, "pool": 75 }, "traits": ["AGGRESSIVE", "FIRST_BLOOD"] },
      { "div": "2군", "role": "MID", "name": "Poby", "age": 20, "stats": { "mental": 85, "spirit": 80, "vision": 70, "laning": 72, "teamfight": 74, "leader": 65, "reaction": 82, "comm": 70, "exp": 68, "stamina": 88, "pool": 70 }, "traits": ["STEEL_STAMINA", "SPONGE"] },
      { "div": "2군", "role": "ADC", "name": "Wonsok", "age": 19, "stats": { "mental": 68, "spirit": 82, "vision": 62, "laning": 75, "teamfight": 76, "leader": 40, "reaction": 86, "comm": 55, "exp": 45, "stamina": 92, "pool": 68 }, "traits": ["NEWBIE"] },
      { "div": "2군", "role": "SPT", "name": "Cloud", "age": 21, "stats": { "mental": 70, "spirit": 78, "vision": 72, "laning": 74, "teamfight": 75, "leader": 60, "reaction": 82, "comm": 70, "exp": 60, "stamina": 85, "pool": 72 }, "traits": ["GROWTH_POTENTIAL"] }
    ]
  },
  "KT": {
    "teamName": "KT Rolster",
    "money": 100.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "PerfecT", "age": 22, "stats": { "mental": 80, "spirit": 85, "vision": 78, "laning": 85, "teamfight": 86, "leader": 65, "reaction": 90, "comm": 82, "exp": 75, "stamina": 90, "pool": 82 }, "traits": ["SCRATCH_LOTTERY", "PURE_MECH", "STONE_HEAD"] },
      { "div": "1군", "role": "JGL", "name": "Cuzz", "age": 27, "stats": { "mental": 85, "spirit": 80, "vision": 92, "laning": 88, "teamfight": 85, "leader": 88, "reaction": 85, "comm": 90, "exp": 97, "stamina": 85, "pool": 88 }, "traits": ["COMMANDER", "VETERAN", "SMITE_KING"] },
      { "div": "1군", "role": "MID", "name": "Bdd", "age": 27, "stats": { "mental": 92, "spirit": 88, "vision": 90, "laning": 93, "teamfight": 92, "leader": 90, "reaction": 89, "comm": 92, "exp": 97, "stamina": 88, "pool": 92 }, "traits": ["HEXAGON", "ROAMING_GOD", "VETERAN"] },
      { "div": "1군", "role": "ADC", "name": "Aiming", "age": 26, "stats": { "mental": 84, "spirit": 90, "vision": 82, "laning": 90, "teamfight": 94, "leader": 75, "reaction": 92, "comm": 85, "exp": 93, "stamina": 88, "pool": 88 }, "traits": ["KILL_CATCHER", "AGGRESSIVE", "THROWING"] },
      { "div": "1군", "role": "SPT", "name": "Pollu", "age": 20, "stats": { "mental": 75, "spirit": 80, "vision": 78, "laning": 80, "teamfight": 80, "leader": 60, "reaction": 88, "comm": 80, "exp": 70, "stamina": 92, "pool": 75 }, "traits": ["SPONGE", "VISIONARY"] },
      { "div": "1군", "role": "SPT", "name": "Ghost", "age": 27, "stats": { "mental": 90, "spirit": 85, "vision": 92, "laning": 78, "teamfight": 84, "leader": 92, "reaction": 80, "comm": 95, "exp": 98, "stamina": 82, "pool": 85 }, "traits": ["COMMANDER", "VETERAN", "BLUE_WORKER"] },
      { "div": "2군", "role": "TOP", "name": "HamBak", "age": 21, "stats": { "mental": 72, "spirit": 82, "vision": 68, "laning": 78, "teamfight": 76, "leader": 55, "reaction": 84, "comm": 65, "exp": 60, "stamina": 88, "pool": 74 }, "traits": ["JOKER_PICK"] },
      { "div": "2군", "role": "JGL", "name": "YoungJae", "age": 24, "stats": { "mental": 80, "spirit": 78, "vision": 82, "laning": 76, "teamfight": 78, "leader": 75, "reaction": 80, "comm": 82, "exp": 85, "stamina": 85, "pool": 80 }, "traits": ["COMMANDER", "VETERAN"] },
      { "div": "2군", "role": "MID", "name": "Pout", "age": 21, "stats": { "mental": 70, "spirit": 80, "vision": 70, "laning": 76, "teamfight": 75, "leader": 55, "reaction": 84, "comm": 68, "exp": 62, "stamina": 90, "pool": 75 }, "traits": ["LANE_KINGDOM"] },
      { "div": "2군", "role": "ADC", "name": "Hype", "age": 21, "stats": { "mental": 74, "spirit": 84, "vision": 68, "laning": 78, "teamfight": 80, "leader": 50, "reaction": 86, "comm": 65, "exp": 65, "stamina": 88, "pool": 76 }, "traits": ["AGGRESSIVE"] },
      { "div": "2군", "role": "SPT", "name": "Way", "age": 21, "stats": { "mental": 75, "spirit": 78, "vision": 76, "laning": 74, "teamfight": 76, "leader": 70, "reaction": 80, "comm": 78, "exp": 68, "stamina": 88, "pool": 74 }, "traits": ["COMMANDER"] }
    ]
  },
  "DK": {
    "teamName": "Dplus KIA",
    "money": 80.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Siwoo", "age": 21, "stats": { "mental": 82, "spirit": 90, "vision": 75, "laning": 86, "teamfight": 85, "leader": 60, "reaction": 92, "comm": 78, "exp": 72, "stamina": 94, "pool": 80 }, "traits": ["AGGRESSIVE", "PURE_MECH"] },
      { "div": "1군", "role": "JGL", "name": "Lucid", "age": 21, "stats": { "mental": 85, "spirit": 88, "vision": 86, "laning": 89, "teamfight": 88, "leader": 70, "reaction": 94, "comm": 85, "exp": 78, "stamina": 92, "pool": 85 }, "traits": ["PURE_MECH", "SCRATCH_LOTTERY"] },
      { "div": "1군", "role": "MID", "name": "ShowMaker", "age": 26, "stats": { "mental": 90, "spirit": 94, "vision": 92, "laning": 92, "teamfight": 94, "leader": 95, "reaction": 90, "comm": 95, "exp": 96, "stamina": 88, "pool": 94 }, "traits": ["ROMANTIC", "COMMANDER", "CHAMP_OCEAN"] },
      { "div": "1군", "role": "ADC", "name": "Smash", "age": 20, "stats": { "mental": 80, "spirit": 85, "vision": 78, "laning": 85, "teamfight": 84, "leader": 60, "reaction": 90, "comm": 80, "exp": 72, "stamina": 92, "pool": 82 }, "traits": ["SPONGE"] },
      { "div": "1군", "role": "SPT", "name": "Career", "age": 21, "stats": { "mental": 78, "spirit": 82, "vision": 80, "laning": 82, "teamfight": 80, "leader": 65, "reaction": 88, "comm": 82, "exp": 72, "stamina": 90, "pool": 78 }, "traits": ["SPONGE"] },
      { "div": "2군", "role": "TOP", "name": "Chasy", "age": 25, "stats": { "mental": 80, "spirit": 82, "vision": 78, "laning": 85, "teamfight": 82, "leader": 70, "reaction": 84, "comm": 75, "exp": 88, "stamina": 85, "pool": 82 }, "traits": ["VETERAN"] },
      { "div": "2군", "role": "JGL", "name": "Sharvel", "age": 21, "stats": { "mental": 72, "spirit": 84, "vision": 70, "laning": 76, "teamfight": 78, "leader": 60, "reaction": 86, "comm": 68, "exp": 65, "stamina": 88, "pool": 75 }, "traits": ["PURE_MECH"] },
      { "div": "2군", "role": "MID", "name": "Saint", "age": 22, "stats": { "mental": 75, "spirit": 78, "vision": 76, "laning": 75, "teamfight": 76, "leader": 65, "reaction": 82, "comm": 74, "exp": 70, "stamina": 86, "pool": 76 }, "traits": ["ROAMING_GOD"] },
      { "div": "2군", "role": "ADC", "name": "Rahel", "age": 22, "stats": { "mental": 78, "spirit": 80, "vision": 72, "laning": 82, "teamfight": 80, "leader": 60, "reaction": 85, "comm": 70, "exp": 75, "stamina": 88, "pool": 80 }, "traits": ["SPONGE"] },
      { "div": "2군", "role": "SPT", "name": "Loopy", "age": 24, "stats": { "mental": 80, "spirit": 78, "vision": 82, "laning": 78, "teamfight": 78, "leader": 75, "reaction": 80, "comm": 80, "exp": 85, "stamina": 85, "pool": 78 }, "traits": ["VETERAN"] }
    ]
  },
  "NS": {
    "teamName": "NS RedForce",
    "money": 60.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Kingen", "age": 26, "stats": { "mental": 92, "spirit": 94, "vision": 85, "laning": 88, "teamfight": 92, "leader": 80, "reaction": 88, "comm": 88, "exp": 95, "stamina": 90, "pool": 88 }, "traits": ["BIG_GAME", "DICE_ROLL"] },
      { "div": "1군", "role": "JGL", "name": "Sponge", "age": 22, "stats": { "mental": 78, "spirit": 82, "vision": 80, "laning": 84, "teamfight": 82, "leader": 65, "reaction": 88, "comm": 80, "exp": 76, "stamina": 90, "pool": 80 }, "traits": ["GROWTH_POTENTIAL"] },
      { "div": "1군", "role": "MID", "name": "Scout", "age": 28, "stats": { "mental": 95, "spirit": 90, "vision": 94, "laning": 92, "teamfight": 93, "leader": 92, "reaction": 89, "comm": 85, "exp": 98, "stamina": 85, "pool": 94 }, "traits": ["VETERAN", "COMMANDER", "HEXAGON"] },
      { "div": "1군", "role": "MID", "name": "Calix", "age": 19, "stats": { "mental": 75, "spirit": 88, "vision": 75, "laning": 82, "teamfight": 80, "leader": 50, "reaction": 92, "comm": 70, "exp": 60, "stamina": 95, "pool": 82 }, "traits": ["SCRATCH_LOTTERY", "PURE_MECH"] },
      { "div": "1군", "role": "ADC", "name": "Taeyoon", "age": 24, "stats": { "mental": 70, "spirit": 75, "vision": 78, "laning": 82, "teamfight": 80, "leader": 65, "reaction": 86, "comm": 80, "exp": 82, "stamina": 88, "pool": 80 }, "traits": ["GLASS_MENTAL", "THROWING"] },
      { "div": "1군", "role": "SPT", "name": "Lehends", "age": 28, "stats": { "mental": 88, "spirit": 90, "vision": 92, "laning": 86, "teamfight": 90, "leader": 94, "reaction": 85, "comm": 96, "exp": 98, "stamina": 82, "pool": 95 }, "traits": ["JOKER_PICK", "THROWING", "COMMANDER"] },
      { "div": "2군", "role": "TOP", "name": "Mihile", "age": 21, "stats": { "mental": 75, "spirit": 80, "vision": 70, "laning": 76, "teamfight": 78, "leader": 60, "reaction": 84, "comm": 68, "exp": 65, "stamina": 88, "pool": 75 }, "traits": ["STONE_HEAD"] },
      { "div": "2군", "role": "JGL", "name": "HH", "age": 21, "stats": { "mental": 72, "spirit": 82, "vision": 72, "laning": 75, "teamfight": 76, "leader": 55, "reaction": 82, "comm": 70, "exp": 65, "stamina": 88, "pool": 74 }, "traits": ["AGGRESSIVE"] },
      { "div": "2군", "role": "MID", "name": "Callme", "age": 22, "stats": { "mental": 76, "spirit": 80, "vision": 74, "laning": 78, "teamfight": 78, "leader": 65, "reaction": 84, "comm": 72, "exp": 70, "stamina": 86, "pool": 80 }, "traits": ["JOKER_PICK"] },
      { "div": "2군", "role": "ADC", "name": "Vital", "age": 21, "stats": { "mental": 74, "spirit": 84, "vision": 68, "laning": 76, "teamfight": 80, "leader": 55, "reaction": 86, "comm": 65, "exp": 68, "stamina": 88, "pool": 78 }, "traits": ["SCRATCH_LOTTERY"] },
      { "div": "2군", "role": "SPT", "name": "Odin", "age": 20, "stats": { "mental": 70, "spirit": 78, "vision": 72, "laning": 74, "teamfight": 74, "leader": 55, "reaction": 82, "comm": 65, "exp": 60, "stamina": 90, "pool": 72 }, "traits": ["NEWBIE"] }
    ]
  },
  "BFX": {
    "teamName": "BNK FearX",
    "money": 40.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Clear", "age": 23, "stats": { "mental": 80, "spirit": 82, "vision": 80, "laning": 85, "teamfight": 82, "leader": 70, "reaction": 88, "comm": 82, "exp": 80, "stamina": 90, "pool": 84 }, "traits": ["STONE_HEAD"] },
      { "div": "1군", "role": "JGL", "name": "Raptor", "age": 22, "stats": { "mental": 78, "spirit": 88, "vision": 82, "laning": 84, "teamfight": 85, "leader": 65, "reaction": 90, "comm": 80, "exp": 78, "stamina": 92, "pool": 82 }, "traits": ["AGGRESSIVE", "TUNNEL_VISION"] },
      { "div": "1군", "role": "MID", "name": "VicLa", "age": 23, "stats": { "mental": 82, "spirit": 85, "vision": 80, "laning": 84, "teamfight": 86, "leader": 72, "reaction": 89, "comm": 80, "exp": 84, "stamina": 90, "pool": 84 }, "traits": ["AGGRESSIVE"] },
      { "div": "1군", "role": "MID", "name": "Daystar", "age": 22, "stats": { "mental": 76, "spirit": 80, "vision": 75, "laning": 80, "teamfight": 80, "leader": 60, "reaction": 86, "comm": 75, "exp": 72, "stamina": 90, "pool": 80 }, "traits": ["STEADY"] },
      { "div": "1군", "role": "ADC", "name": "Diable", "age": 21, "stats": { "mental": 80, "spirit": 80, "vision": 78, "laning": 84, "teamfight": 82, "leader": 60, "reaction": 88, "comm": 80, "exp": 76, "stamina": 92, "pool": 80 }, "traits": ["STEADY"] },
      { "div": "1군", "role": "SPT", "name": "Kellin", "age": 25, "stats": { "mental": 75, "spirit": 78, "vision": 86, "laning": 90, "teamfight": 85, "leader": 70, "reaction": 86, "comm": 75, "exp": 90, "stamina": 88, "pool": 88 }, "traits": ["LANE_KINGDOM", "PASSIVE"] },
      { "div": "2군", "role": "TOP", "name": "Soboro", "age": 23, "stats": { "mental": 75, "spirit": 78, "vision": 72, "laning": 78, "teamfight": 76, "leader": 60, "reaction": 82, "comm": 70, "exp": 72, "stamina": 86, "pool": 76 }, "traits": ["STONE_HEAD"] },
      { "div": "2군", "role": "JGL", "name": "Argen", "age": 21, "stats": { "mental": 70, "spirit": 80, "vision": 70, "laning": 74, "teamfight": 75, "leader": 55, "reaction": 84, "comm": 65, "exp": 65, "stamina": 88, "pool": 74 }, "traits": ["GROWTH_POTENTIAL"] },
      { "div": "2군", "role": "MID", "name": "Feisty", "age": 21, "stats": { "mental": 74, "spirit": 84, "vision": 68, "laning": 76, "teamfight": 78, "leader": 55, "reaction": 86, "comm": 68, "exp": 65, "stamina": 88, "pool": 76 }, "traits": ["AGGRESSIVE"] },
      { "div": "2군", "role": "ADC", "name": "Paduck", "age": 22, "stats": { "mental": 72, "spirit": 80, "vision": 70, "laning": 76, "teamfight": 80, "leader": 55, "reaction": 84, "comm": 65, "exp": 70, "stamina": 86, "pool": 75 }, "traits": ["TEAMFIGHT_GLADIATOR"] },
      { "div": "2군", "role": "SPT", "name": "Execute", "age": 23, "stats": { "mental": 78, "spirit": 82, "vision": 80, "laning": 78, "teamfight": 82, "leader": 70, "reaction": 84, "comm": 80, "exp": 85, "stamina": 85, "pool": 80 }, "traits": ["JOKER_PICK", "VETERAN"] }
    ]
  },
  "BRO": {
    "teamName": "OK저축은행 브리온",
    "money": 15.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Casting", "age": 22, "stats": { "mental": 75, "spirit": 80, "vision": 75, "laning": 80, "teamfight": 78, "leader": 60, "reaction": 85, "comm": 78, "exp": 70, "stamina": 90, "pool": 78 }, "traits": ["SCRATCH_LOTTERY"] },
      { "div": "1군", "role": "JGL", "name": "GIDEON", "age": 23, "stats": { "mental": 80, "spirit": 86, "vision": 82, "laning": 84, "teamfight": 84, "leader": 75, "reaction": 88, "comm": 82, "exp": 84, "stamina": 90, "pool": 82 }, "traits": ["AGGRESSIVE", "KILL_CATCHER"] },
      { "div": "1군", "role": "MID", "name": "Fisher", "age": 22, "stats": { "mental": 78, "spirit": 80, "vision": 80, "laning": 82, "teamfight": 80, "leader": 65, "reaction": 88, "comm": 80, "exp": 78, "stamina": 90, "pool": 80 }, "traits": ["TUNNEL_VISION"] },
      { "div": "1군", "role": "ADC", "name": "Teddy", "age": 28, "stats": { "mental": 94, "spirit": 90, "vision": 85, "laning": 88, "teamfight": 92, "leader": 85, "reaction": 86, "comm": 88, "exp": 98, "stamina": 82, "pool": 92 }, "traits": ["RULER_ENDING", "VETERAN"] },
      { "div": "1군", "role": "SPT", "name": "Namgung", "age": 21, "stats": { "mental": 75, "spirit": 78, "vision": 75, "laning": 78, "teamfight": 75, "leader": 60, "reaction": 84, "comm": 78, "exp": 70, "stamina": 92, "pool": 75 }, "traits": ["NEWBIE"] },
      { "div": "2군", "role": "TOP", "name": "Kangin", "age": 21, "stats": { "mental": 70, "spirit": 82, "vision": 65, "laning": 75, "teamfight": 74, "leader": 50, "reaction": 84, "comm": 60, "exp": 60, "stamina": 88, "pool": 72 }, "traits": ["AGGRESSIVE"] },
      { "div": "2군", "role": "JGL", "name": "DdoiV", "age": 20, "stats": { "mental": 68, "spirit": 80, "vision": 68, "laning": 72, "teamfight": 72, "leader": 45, "reaction": 82, "comm": 60, "exp": 55, "stamina": 90, "pool": 70 }, "traits": ["NEWBIE"] },
      { "div": "2군", "role": "MID", "name": "Pullbae", "age": 23, "stats": { "mental": 75, "spirit": 78, "vision": 74, "laning": 78, "teamfight": 78, "leader": 65, "reaction": 82, "comm": 72, "exp": 75, "stamina": 86, "pool": 78 }, "traits": ["VETERAN"] },
      { "div": "2군", "role": "ADC", "name": "Enosh", "age": 22, "stats": { "mental": 72, "spirit": 78, "vision": 70, "laning": 76, "teamfight": 75, "leader": 55, "reaction": 82, "comm": 65, "exp": 68, "stamina": 88, "pool": 75 }, "traits": ["STEADY"] },
      { "div": "2군", "role": "SPT", "name": "Kork", "age": 20, "stats": { "mental": 68, "spirit": 75, "vision": 70, "laning": 72, "teamfight": 74, "leader": 50, "reaction": 80, "comm": 65, "exp": 55, "stamina": 90, "pool": 70 }, "traits": ["NEWBIE"] }
    ]
  },
  "DRX": {
    "teamName": "DRX",
    "money": 30.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "Rich", "age": 28, "stats": { "mental": 85, "spirit": 88, "vision": 80, "laning": 80, "teamfight": 88, "leader": 82, "reaction": 82, "comm": 85, "exp": 98, "stamina": 80, "pool": 85 }, "traits": ["VETERAN", "TEAMFIGHT_GLADIATOR"] },
      { "div": "1군", "role": "JGL", "name": "Willer", "age": 23, "stats": { "mental": 85, "spirit": 90, "vision": 85, "laning": 85, "teamfight": 86, "leader": 78, "reaction": 88, "comm": 85, "exp": 86, "stamina": 90, "pool": 86 }, "traits": ["SMITE_KING"] },
      { "div": "1군", "role": "JGL", "name": "Vincenzo", "age": 21, "stats": { "mental": 75, "spirit": 80, "vision": 78, "laning": 80, "teamfight": 80, "leader": 60, "reaction": 85, "comm": 75, "exp": 70, "stamina": 92, "pool": 80 }, "traits": ["STEADY"] },
      { "div": "1군", "role": "MID", "name": "Ucal", "age": 25, "stats": { "mental": 82, "spirit": 88, "vision": 82, "laning": 86, "teamfight": 88, "leader": 75, "reaction": 86, "comm": 82, "exp": 92, "stamina": 88, "pool": 86 }, "traits": ["AGGRESSIVE"] },
      { "div": "1군", "role": "ADC", "name": "Jiwoo", "age": 22, "stats": { "mental": 80, "spirit": 85, "vision": 78, "laning": 84, "teamfight": 90, "leader": 65, "reaction": 92, "comm": 80, "exp": 78, "stamina": 92, "pool": 85 }, "traits": ["HYPER_CARRY", "LANE_WEAKNESS"] },
      { "div": "1군", "role": "SPT", "name": "Andil", "age": 24, "stats": { "mental": 78, "spirit": 80, "vision": 82, "laning": 82, "teamfight": 80, "leader": 70, "reaction": 84, "comm": 82, "exp": 84, "stamina": 88, "pool": 82 }, "traits": ["STEADY"] },
      { "div": "2군", "role": "TOP", "name": "Frog", "age": 23, "stats": { "mental": 74, "spirit": 78, "vision": 70, "laning": 76, "teamfight": 78, "leader": 60, "reaction": 80, "comm": 70, "exp": 72, "stamina": 86, "pool": 80 }, "traits": ["STONE_HEAD"] },
      { "div": "2군", "role": "JGL", "name": "Zephyr", "age": 19, "stats": { "mental": 65, "spirit": 82, "vision": 65, "laning": 72, "teamfight": 75, "leader": 40, "reaction": 86, "comm": 55, "exp": 45, "stamina": 92, "pool": 68 }, "traits": ["NEWBIE"] },
      { "div": "2군", "role": "MID", "name": "kyeahoo", "age": 22, "stats": { "mental": 72, "spirit": 84, "vision": 70, "laning": 78, "teamfight": 78, "leader": 60, "reaction": 88, "comm": 65, "exp": 70, "stamina": 88, "pool": 75 }, "traits": ["PURE_MECH"] },
      { "div": "2군", "role": "ADC", "name": "Pleata", "age": 23, "stats": { "mental": 75, "spirit": 80, "vision": 72, "laning": 78, "teamfight": 78, "leader": 65, "reaction": 84, "comm": 72, "exp": 75, "stamina": 88, "pool": 82 }, "traits": ["AGGRESSIVE"] },
      { "div": "2군", "role": "SPT", "name": "Piero", "age": 22, "stats": { "mental": 72, "spirit": 78, "vision": 75, "laning": 74, "teamfight": 76, "leader": 60, "reaction": 82, "comm": 74, "exp": 68, "stamina": 88, "pool": 72 }, "traits": ["ROAMING_GOD"] }
    ]
  },
  "KDF": {
    "teamName": "광동 프릭스",
    "money": 50.0,
    "roster": [
      { "div": "1군", "role": "TOP", "name": "DuDu", "age": 25, "stats": { "mental": 85, "spirit": 88, "vision": 82, "laning": 90, "teamfight": 88, "leader": 75, "reaction": 88, "comm": 82, "exp": 90, "stamina": 90, "pool": 88 }, "traits": ["LANE_KINGDOM", "SPLIT_PUSHER"] },
      { "div": "1군", "role": "JGL", "name": "Pyosik", "age": 26, "stats": { "mental": 80, "spirit": 92, "vision": 86, "laning": 85, "teamfight": 90, "leader": 85, "reaction": 88, "comm": 88, "exp": 96, "stamina": 88, "pool": 90 }, "traits": ["SMITE_KING", "ROMANTIC", "DICE_ROLL"] },
      { "div": "1군", "role": "MID", "name": "Clozer", "age": 23, "stats": { "mental": 75, "spirit": 88, "vision": 80, "laning": 88, "teamfight": 88, "leader": 70, "reaction": 94, "comm": 80, "exp": 85, "stamina": 90, "pool": 84 }, "traits": ["HYPER_MECHANIC", "AGGRESSIVE", "TUNNEL_VISION"] },
      { "div": "1군", "role": "ADC", "name": "deokdam", "age": 26, "stats": { "mental": 78, "spirit": 85, "vision": 80, "laning": 86, "teamfight": 88, "leader": 70, "reaction": 86, "comm": 82, "exp": 92, "stamina": 88, "pool": 86 }, "traits": ["AGGRESSIVE", "GLASS_MENTAL"] },
      { "div": "1군", "role": "SPT", "name": "Life", "age": 24, "stats": { "mental": 82, "spirit": 88, "vision": 85, "laning": 84, "teamfight": 88, "leader": 80, "reaction": 85, "comm": 85, "exp": 92, "stamina": 88, "pool": 92 }, "traits": ["JOKER_PICK", "IRON_WILL"] },
      { "div": "1군", "role": "SPT", "name": "Peter", "age": 23, "stats": { "mental": 75, "spirit": 80, "vision": 78, "laning": 78, "teamfight": 80, "leader": 65, "reaction": 84, "comm": 78, "exp": 76, "stamina": 88, "pool": 78 }, "traits": ["STEADY"] },
      { "div": "2군", "role": "TOP", "name": "Hunch", "age": 21, "stats": { "mental": 72, "spirit": 84, "vision": 68, "laning": 76, "teamfight": 78, "leader": 55, "reaction": 84, "comm": 65, "exp": 65, "stamina": 88, "pool": 74 }, "traits": ["AGGRESSIVE"] },
      { "div": "2군", "role": "JGL", "name": "Courage", "age": 22, "stats": { "mental": 74, "spirit": 80, "vision": 75, "laning": 75, "teamfight": 76, "leader": 60, "reaction": 82, "comm": 72, "exp": 68, "stamina": 88, "pool": 75 }, "traits": ["RPG_JUNGLE"] },
      { "div": "2군", "role": "MID", "name": "Quantum", "age": 20, "stats": { "mental": 70, "spirit": 82, "vision": 68, "laning": 74, "teamfight": 75, "leader": 50, "reaction": 84, "comm": 60, "exp": 60, "stamina": 90, "pool": 72 }, "traits": ["GROWTH_POTENTIAL"] },
      { "div": "2군", "role": "ADC", "name": "Bull", "age": 23, "stats": { "mental": 76, "spirit": 80, "vision": 72, "laning": 78, "teamfight": 78, "leader": 60, "reaction": 82, "comm": 70, "exp": 75, "stamina": 86, "pool": 78 }, "traits": ["VETERAN", "STEADY"] },
      { "div": "2군", "role": "SPT", "name": "Lantern", "age": 20, "stats": { "mental": 68, "spirit": 78, "vision": 70, "laning": 72, "teamfight": 74, "leader": 50, "reaction": 82, "comm": 65, "exp": 55, "stamina": 92, "pool": 70 }, "traits": ["NEWBIE"] }
    ]
  }
};