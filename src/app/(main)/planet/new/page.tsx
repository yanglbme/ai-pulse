import { PostEditor } from '@/components/planet/post-editor';

export const metadata = {
  title: '发布内容',
};

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        发布内容
      </h1>
      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
        <PostEditor />
      </div>
    </div>
  );
}
