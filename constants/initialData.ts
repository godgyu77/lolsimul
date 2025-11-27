import { Player, Team, Tier } from "@/types";

// 결정론적인 랜덤 함수 (시드 기반)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 문자열을 숫자로 변환하는 간단한 해시 함수
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  return Math.abs(hash);
}

// 등급을 능력치로 변환하는 함수 (결정론적)
function tierToOverall(tier: Tier, seed: number): number {
  const ranges: Record<Tier, [number, number]> = {
    "S+": [96, 100],
    "S": [90, 95],
    "S-": [85, 89],
    "A+": [80, 84],
    "A": [75, 79],
    "A-": [70, 74],
    "B+": [65, 69],
    "B": [60, 64],
    "B-": [55, 59],
    "C+": [50, 54],
    "C": [45, 49],
    "C-": [40, 44],
    "D": [35, 39],
  };

  const [min, max] = ranges[tier];
  const random = seededRandom(seed);
  return Math.floor(random * (max - min + 1)) + min;
}

// 등급과 포지션에 맞춰 스탯 생성 (결정론적)
function generateStats(tier: Tier, position: string, overall: number, seed: number): {
  라인전: number;
  한타: number;
  운영: number;
  피지컬: number;
  챔프폭: number;
  멘탈: number;
} {
  const base = overall;
  const variation = 5; // ±5 변동

  // 포지션별 강점 조정
  const positionBonus: Record<string, Partial<Record<keyof ReturnType<typeof generateStats>, number>>> = {
    TOP: { 라인전: 3, 피지컬: 3 },
    JGL: { 운영: 3, 한타: 3 },
    MID: { 라인전: 3, 피지컬: 3 },
    ADC: { 한타: 3, 피지컬: 2 },
    SPT: { 운영: 3, 멘탈: 3 },
  };

  const bonus = positionBonus[position] || {};

  const statKeys = ["라인전", "한타", "운영", "피지컬", "챔프폭", "멘탈"];
  
  const randomize = (base: number, key: string, index: number) => {
    const bonusValue = bonus[key as keyof typeof bonus] || 0;
    // 각 스탯마다 다른 시드 사용
    const statSeed = seed + index * 1000;
    const random = seededRandom(statSeed);
    const value = base + bonusValue + (random * variation * 2 - variation);
    return Math.max(1, Math.min(100, Math.round(value)));
  };

  return {
    라인전: randomize(base, "라인전", 0),
    한타: randomize(base, "한타", 1),
    운영: randomize(base, "운영", 2),
    피지컬: randomize(base, "피지컬", 3),
    챔프폭: randomize(base, "챔프폭", 4),
    멘탈: randomize(base, "멘탈", 5),
  };
}

// 등급에 따른 연봉 추정 (억원 단위, 결정론적)
function tierToSalary(tier: Tier, seed: number): number {
  const salaryRanges: Record<Tier, [number, number]> = {
    "S+": [8, 12],
    "S": [5, 8],
    "S-": [3, 5],
    "A+": [2, 3.5],
    "A": [1.5, 2.5],
    "A-": [1, 2],
    "B+": [0.8, 1.5],
    "B": [0.5, 1],
    "B-": [0.3, 0.8],
    "C+": [0.2, 0.5],
    "C": [0.1, 0.3],
    "C-": [0.05, 0.2],
    "D": [0.03, 0.1],
  };

  const [min, max] = salaryRanges[tier];
  const random = seededRandom(seed);
  return Number((random * (max - min) + min).toFixed(1));
}

// 선수 생성 헬퍼 함수
function createPlayer(
  name: string,
  nickname: string,
  position: "TOP" | "JGL" | "MID" | "ADC" | "SPT",
  tier: Tier,
  contractEndsAt: number,
  teamId: string,
  division: "1군" | "2군" = "1군",
  age?: number
): Player {
  // 선수 ID를 기반으로 결정론적인 시드 생성
  const playerId = `${teamId}-${nickname.toLowerCase()}`;
  const seed = hashString(playerId);
  
  const overall = tierToOverall(tier, seed);
  const stats = generateStats(tier, position, overall, seed);
  const salary = tierToSalary(tier, seed);
  
  // 나이도 결정론적으로 생성 (20~24세)
  const ageSeed = hashString(playerId + "-age");
  const playerAge = age || Math.floor(seededRandom(ageSeed) * 5) + 20;

  return {
    id: playerId,
    name,
    nickname,
    position,
    age: playerAge,
    tier,
    stats,
    salary,
    contractEndsAt,
    teamId,
    division,
  };
}

// 초기 선수 데이터 생성
export const initialPlayers: Player[] = [];

// 1. Gen.G (GEN)
const genPlayers: Player[] = [
  createPlayer("기인", "Kiin", "TOP", "S", 2026, "GEN", "1군", 27),
  createPlayer("김건부", "Canyon", "JGL", "S+", 2026, "GEN", "1군", 25),
  createPlayer("정지훈", "Chovy", "MID", "S+", 2028, "GEN", "1군", 25),
  createPlayer("박재혁", "Ruler", "ADC", "S", 2028, "GEN", "1군", 28),
  createPlayer("두로", "Duro", "SPT", "B+", 2027, "GEN", "1군", 24),
  // 2군
  createPlayer("호랑이", "HorangE", "TOP", "C+", 2027, "GEN", "2군", 22),
  createPlayer("토시", "Tossi", "JGL", "B-", 2026, "GEN", "2군", 23),
  createPlayer("제스트", "Zest", "MID", "C+", 2027, "GEN", "2군", 21),
  createPlayer("슬레이어", "Slayer", "ADC", "C", 2027, "GEN", "2군", 20),
  createPlayer("달리아", "Dahlia", "SPT", "C", 2027, "GEN", "2군", 19),
];
initialPlayers.push(...genPlayers);

// 2. HLE (한화생명e스포츠)
const hlePlayers: Player[] = [
  createPlayer("최우제", "Zeus", "TOP", "S+", 2026, "HLE", "1군", 22),
  createPlayer("서진혁", "Kanavi", "JGL", "S", 2026, "HLE", "1군", 26),
  createPlayer("김건우", "Zeka", "MID", "S", 2027, "HLE", "1군", 24),
  createPlayer("이민형", "Gumayusi", "ADC", "S", 2027, "HLE", "1군", 24),
  createPlayer("유환중", "Delight", "SPT", "A+", 2027, "HLE", "1군", 24),
  // 2군
  createPlayer("루스터", "Rooster", "TOP", "B+", 2026, "HLE", "2군", 22),
  createPlayer("그리즐리", "Grizzly", "JGL", "A-", 2026, "HLE", "2군", 21),
  createPlayer("로키", "Loki", "MID", "B", 2027, "HLE", "2군", 20),
  createPlayer("루어", "Lure", "ADC", "B", 2026, "HLE", "2군", 23),
  createPlayer("바우트", "Baut", "SPT", "C+", 2026, "HLE", "2군", 22),
];
initialPlayers.push(...hlePlayers);

// 3. T1
const t1Players: Player[] = [
  createPlayer("최현준", "Doran", "TOP", "A+", 2026, "T1", "1군", 26),
  createPlayer("문현준", "Oner", "JGL", "S", 2026, "T1", "1군", 24),
  createPlayer("이상혁", "Faker", "MID", "S", 2029, "T1", "1군", 30), // 운영 S+ 특별 처리
  createPlayer("김수환", "Peyz", "ADC", "S", 2028, "T1", "1군", 21),
  createPlayer("류민석", "Keria", "SPT", "S+", 2026, "T1", "1군", 24),
  // 2군
  createPlayer("달", "Dal", "TOP", "B", 2026, "T1", "2군", 20),
  createPlayer("구원", "Guwon", "JGL", "B+", 2026, "T1", "2군", 22),
  createPlayer("포비", "Poby", "MID", "B", 2026, "T1", "2군", 20),
  createPlayer("원석", "Wonsok", "ADC", "C", 2027, "T1", "2군", 19),
  createPlayer("클라우드", "Cloud", "SPT", "C+", 2026, "T1", "2군", 21),
];
// Faker의 운영 스탯을 S+ 수준으로 조정
const fakerIndex = t1Players.findIndex((p) => p.nickname === "Faker");
if (fakerIndex !== -1) {
  t1Players[fakerIndex].stats.운영 = Math.min(100, t1Players[fakerIndex].stats.운영 + 5);
}
initialPlayers.push(...t1Players);

// 4. KT Rolster (KT)
const ktPlayers: Player[] = [
  createPlayer("퍼펙트", "PerfecT", "TOP", "B+", 2026, "KT", "1군", 22),
  createPlayer("문우찬", "Cuzz", "JGL", "A", 2027, "KT", "1군", 27),
  createPlayer("곽보성", "Bdd", "MID", "S-", 2026, "KT", "1군", 27),
  createPlayer("하성민", "Aiming", "ADC", "A+", 2026, "KT", "1군", 26),
  createPlayer("폴루", "Pollu", "SPT", "C+", 2026, "KT", "1군", 20),
  createPlayer("장용준", "Ghost", "SPT", "B-", 2026, "KT", "1군", 27),
  // 2군
  createPlayer("함박", "HamBak", "TOP", "B-", 2026, "KT", "2군", 21),
  createPlayer("영재", "YoungJae", "JGL", "B", 2026, "KT", "2군", 24),
  createPlayer("파우트", "Pout", "MID", "B-", 2026, "KT", "2군", 21),
  createPlayer("하이프", "Hype", "ADC", "B", 2026, "KT", "2군", 21),
  createPlayer("웨이", "Way", "SPT", "B", 2026, "KT", "2군", 21),
];
initialPlayers.push(...ktPlayers);

// 5. Dplus KIA (DK)
const dkPlayers: Player[] = [
  createPlayer("시우", "Siwoo", "TOP", "B+", 2027, "DK", "1군", 21),
  createPlayer("이용우", "Lucid", "JGL", "A-", 2026, "DK", "1군", 21),
  createPlayer("허수", "ShowMaker", "MID", "S-", 2026, "DK", "1군", 26),
  createPlayer("스매시", "Smash", "ADC", "B", 2027, "DK", "1군", 20),
  createPlayer("커리어", "Career", "SPT", "C+", 2026, "DK", "1군", 21),
  // 2군
  createPlayer("체이시", "Chasy", "TOP", "B", 2026, "DK", "2군", 25),
  createPlayer("샤벨", "Sharvel", "JGL", "C+", 2027, "DK", "2군", 21),
  createPlayer("세인트", "Saint", "MID", "B-", 2026, "DK", "2군", 22),
  createPlayer("라헬", "Rahel", "ADC", "B+", 2026, "DK", "2군", 22),
  createPlayer("루피", "Loopy", "SPT", "B-", 2026, "DK", "2군", 24),
];
initialPlayers.push(...dkPlayers);

// 6. 농심 레드포스 (NS)
const nsPlayers: Player[] = [
  createPlayer("황성훈", "Kingen", "TOP", "A", 2026, "NS", "1군", 26),
  createPlayer("스폰지", "Sponge", "JGL", "B-", 2026, "NS", "1군", 22),
  createPlayer("이예찬", "Scout", "MID", "S-", 2026, "NS", "1군", 28),
  createPlayer("칼릭스", "Calix", "MID", "C+", 2027, "NS", "2군", 19),
  createPlayer("태윤", "Taeyoon", "ADC", "B-", 2026, "NS", "1군", 24),
  createPlayer("손시우", "Lehends", "SPT", "A", 2026, "NS", "1군", 28),
  // 2군 추가
  createPlayer("미힐", "Mihile", "TOP", "B-", 2026, "NS", "2군", 21),
  createPlayer("에이치에이치", "HH", "JGL", "C+", 2026, "NS", "2군", 21),
  createPlayer("콜미", "Callme", "MID", "B", 2026, "NS", "2군", 22),
  createPlayer("비탈", "Vital", "ADC", "C+", 2027, "NS", "2군", 21),
  createPlayer("오딘", "Odin", "SPT", "C", 2027, "NS", "2군", 20),
];
initialPlayers.push(...nsPlayers);

// 7. BNK 피어엑스 (BFX)
const bfxPlayers: Player[] = [
  createPlayer("클리어", "Clear", "TOP", "B", 2026, "BFX", "1군", 23),
  createPlayer("랩터", "Raptor", "JGL", "B-", 2026, "BFX", "1군", 22),
  createPlayer("빅라", "VicLa", "MID", "B", 2026, "BFX", "1군", 23),
  createPlayer("데이스타", "Daystar", "MID", "C+", 2026, "BFX", "2군", 22),
  createPlayer("디아블", "Diable", "ADC", "B-", 2026, "BFX", "1군", 21),
  createPlayer("켈린", "Kellin", "SPT", "A-", 2026, "BFX", "1군", 25),
  // 2군 추가
  createPlayer("소보로", "Soboro", "TOP", "B", 2026, "BFX", "2군", 23),
  createPlayer("아르겐", "Argen", "JGL", "C+", 2026, "BFX", "2군", 21),
  createPlayer("파이스티", "Feisty", "MID", "C+", 2027, "BFX", "2군", 21),
  createPlayer("파덕", "Paduck", "ADC", "B-", 2026, "BFX", "2군", 22),
  createPlayer("익스큐트", "Execute", "SPT", "B", 2026, "BFX", "2군", 23),
];
initialPlayers.push(...bfxPlayers);

// 8. OK저축은행 브리온 (BRO)
const broPlayers: Player[] = [
  createPlayer("캐스팅", "Casting", "TOP", "C", 2027, "BRO", "1군", 22),
  createPlayer("기디언", "GIDEON", "JGL", "B", 2026, "BRO", "1군", 23),
  createPlayer("피셔", "Fisher", "MID", "B-", 2026, "BRO", "1군", 22),
  createPlayer("성승헌", "Teddy", "ADC", "A-", 2026, "BRO", "1군", 28),
  createPlayer("남궁", "Namgung", "SPT", "C", 2027, "BRO", "1군", 21),
  // 2군
  createPlayer("강인", "Kangin", "TOP", "C+", 2026, "BRO", "2군", 21),
  createPlayer("도이브", "DdoiV", "JGL", "C", 2027, "BRO", "2군", 20),
  createPlayer("풀배", "Pullbae", "MID", "B", 2026, "BRO", "2군", 23),
  createPlayer("에노쉬", "Enosh", "ADC", "B-", 2026, "BRO", "2군", 22),
  createPlayer("코크", "Kork", "SPT", "C", 2027, "BRO", "2군", 20),
];
initialPlayers.push(...broPlayers);

// 9. DRX
const drxPlayers: Player[] = [
  createPlayer("리치", "Rich", "TOP", "B-", 2026, "DRX", "1군", 28),
  createPlayer("윌러", "Willer", "JGL", "B+", 2026, "DRX", "1군", 23),
  createPlayer("빈첸조", "Vincenzo", "JGL", "C", 2026, "DRX", "2군", 21),
  createPlayer("우칼", "Ucal", "MID", "B+", 2026, "DRX", "1군", 25),
  createPlayer("지우", "Jiwoo", "ADC", "A-", 2027, "DRX", "1군", 22),
  createPlayer("안딜", "Andil", "SPT", "B-", 2026, "DRX", "1군", 24),
  // 2군 추가
  createPlayer("프로그", "Frog", "TOP", "B-", 2026, "DRX", "2군", 23),
  createPlayer("제퍼", "Zephyr", "JGL", "C", 2027, "DRX", "2군", 19),
  createPlayer("계아후", "kyeahoo", "MID", "B", 2026, "DRX", "2군", 22),
  createPlayer("플레아타", "Pleata", "ADC", "B", 2026, "DRX", "2군", 23),
  createPlayer("피에로", "Piero", "SPT", "B-", 2026, "DRX", "2군", 22),
];
initialPlayers.push(...drxPlayers);

// 10. DN Freecs (광동) - KDF
const kdfPlayers: Player[] = [
  createPlayer("두두", "DuDu", "TOP", "A-", 2026, "KDF", "1군", 25),
  createPlayer("홍창현", "Pyosik", "JGL", "A", 2026, "KDF", "1군", 26),
  createPlayer("이주현", "Clozer", "MID", "A-", 2026, "KDF", "1군", 23),
  createPlayer("서대길", "deokdam", "ADC", "B+", 2026, "KDF", "1군", 26),
  createPlayer("김시윤", "Life", "SPT", "B+", 2026, "KDF", "1군", 24),
  createPlayer("피터", "Peter", "SPT", "B-", 2026, "KDF", "1군", 23),
  // 2군 추가
  createPlayer("헌치", "Hunch", "TOP", "C+", 2027, "KDF", "2군", 21),
  createPlayer("커리지", "Courage", "JGL", "B-", 2026, "KDF", "2군", 22),
  createPlayer("퀀텀", "Quantum", "MID", "C+", 2026, "KDF", "2군", 20),
  createPlayer("불", "Bull", "ADC", "B", 2026, "KDF", "2군", 23),
  createPlayer("랜턴", "Lantern", "SPT", "C", 2027, "KDF", "2군", 20),
];
initialPlayers.push(...kdfPlayers);

// 초기 팀 데이터 생성
// ROSTER_DB의 money 값을 기준으로 설정 (단위: 억원 -> 원으로 변환)
import { ROSTER_DB } from "./systemPrompt";

export const initialTeams: Team[] = [
  {
    id: "HLE",
    name: "한화생명e스포츠",
    abbreviation: "HLE",
    money: (ROSTER_DB.HLE?.money || 80.0) * 100000000, // ROSTER_DB 기준: 80억
    fanbaseSize: 85,
    roster: hlePlayers,
  },
  {
    id: "T1",
    name: "T1",
    abbreviation: "T1",
    money: (ROSTER_DB.T1?.money || 70.0) * 100000000, // ROSTER_DB 기준: 70억
    fanbaseSize: 95,
    roster: t1Players,
  },
  {
    id: "GEN",
    name: "Gen.G",
    abbreviation: "GEN",
    money: (ROSTER_DB.GEN?.money || 65.0) * 100000000, // ROSTER_DB 기준: 65억
    fanbaseSize: 80,
    roster: genPlayers,
  },
  {
    id: "KT",
    name: "KT Rolster",
    abbreviation: "KT",
    money: (ROSTER_DB.KT?.money || 45.0) * 100000000, // ROSTER_DB 기준: 45억
    fanbaseSize: 75,
    roster: ktPlayers,
  },
  {
    id: "DK",
    name: "Dplus KIA",
    abbreviation: "DK",
    money: (ROSTER_DB.DK?.money || 40.0) * 100000000, // ROSTER_DB 기준: 40억
    fanbaseSize: 70,
    roster: dkPlayers,
  },
  {
    id: "NS",
    name: "농심 레드포스",
    abbreviation: "NS",
    money: (ROSTER_DB.NS?.money || 28.0) * 100000000, // ROSTER_DB 기준: 28억
    fanbaseSize: 40,
    roster: nsPlayers,
  },
  {
    id: "KDF",
    name: "DN Freecs",
    abbreviation: "KDF",
    money: (ROSTER_DB.DNF?.money || 30.0) * 100000000, // ROSTER_DB 기준: 30억 (DNF)
    fanbaseSize: 50,
    roster: kdfPlayers,
  },
  {
    id: "BFX",
    name: "BNK 피어엑스",
    abbreviation: "BFX",
    money: (ROSTER_DB.BFX?.money || 25.0) * 100000000, // ROSTER_DB 기준: 25억
    fanbaseSize: 45,
    roster: bfxPlayers,
  },
  {
    id: "DRX",
    name: "DRX",
    abbreviation: "DRX",
    money: (ROSTER_DB.DRX?.money || 20.0) * 100000000, // ROSTER_DB 기준: 20억
    fanbaseSize: 60,
    roster: drxPlayers,
  },
  {
    id: "BRO",
    name: "OK저축은행 브리온",
    abbreviation: "BRO",
    money: (ROSTER_DB.BRO?.money || 15.0) * 100000000, // ROSTER_DB 기준: 15억
    fanbaseSize: 35,
    roster: broPlayers,
  },
];

