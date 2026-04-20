interface EditPageProps {
  params: Promise<{
    postId: string;
  }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { postId } = await params;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            포스트 수정
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            ID: {postId}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="제목을 입력하세요"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />

            <textarea
              placeholder="마크다운 형식으로 본문을 작성하세요..."
              className="w-full min-h-96 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
            />

            <div className="flex gap-4">
              <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition">
                변경사항 저장
              </button>
              <button className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 transition">
                임시저장
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
