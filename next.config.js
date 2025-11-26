/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// 프로덕션 빌드 시에는 TLS 설정을 하지 않음
// 개발 환경에서만 필요한 경우 .env.local 파일에 NODE_TLS_REJECT_UNAUTHORIZED=0 설정
// 배포 시에는 이 환경 변수가 설정되지 않으므로 경고가 발생하지 않음

module.exports = nextConfig;

