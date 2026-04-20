import Link from 'next/link';

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            설정
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            계정과 개인 정보를 관리하세요.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/settings/profile"
            className="block rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-500 dark:hover:bg-blue-950 transition"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              프로필 편집
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              이름, 자기소개, 프로필 사진을 편집합니다.
            </p>
          </Link>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 opacity-50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              비밀번호 변경
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              계정 보안을 위해 비밀번호를 변경합니다. (OAuth 계정은 지원하지 않음)
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700 opacity-50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              알림 설정
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              댓글, 좋아요 등의 알림을 관리합니다.
            </p>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950 opacity-50">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
              계정 삭제
            </h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              모든 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
