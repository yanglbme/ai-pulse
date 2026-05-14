'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { X, Loader2 } from 'lucide-react';

const TOPICS = [
  { id: 'ai', name: 'AI' },
  { id: 'llm', name: 'LLM' },
  { id: 'agent', name: 'Agent' },
  { id: 'rag', name: 'RAG' },
  { id: 'machine-learning', name: '机器学习' },
  { id: 'mlops', name: 'MLOps' },
  { id: 'deep-learning', name: '深度学习' },
  { id: 'computer-vision', name: '计算机视觉' },
  { id: 'nlp', name: '自然语言处理' },
  { id: 'open-source', name: '开源' },
];

export function PostEditor() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleTopic = (slug: string) => {
    setSelectedTopics(prev =>
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    );
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('标题和正文不能为空');
      return;
    }

    setSubmitting(true);
    try {
      const supa = createClient() as any;
      const { data: { user } } = await supa.auth.getUser();
      if (!user) {
        setError('请先登录');
        return;
      }

      const { data: post, error: postError } = await supa
        .from('posts')
        .insert({
          author_id: user.id,
          title: title.trim(),
          summary: summary.trim() || title.trim().slice(0, 100),
          content,
          source: 'user',
        })
        .select()
        .single();

      if (postError) throw postError;

      // Link topics
      if (selectedTopics.length > 0) {
        const topicRecords = selectedTopics.map((slug: string) => ({
          post_id: post.id,
          topic_id: slug,
        }));
        await supa.from('post_topics').insert(topicRecords);
      }

      // Create or link tags
      for (const tagName of tags) {
        const slug = tagName.toLowerCase().replace(/\s+/g, '-');
        await supa.from('tags').upsert({ name: tagName, slug }, { onConflict: 'slug' });

        const { data: tagData } = await supa
          .from('tags')
          .select('id')
          .eq('slug', slug)
          .single();

        if (tagData) {
          await supa.from('post_tags').insert({
            post_id: post.id,
            tag_id: tagData.id,
          });
        }
      }

      router.push(`/planet/${post.id}`);
    } catch (err: any) {
      setError(err.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 sm:p-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <Input
        label="标题"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="给内容起个标题..."
        required
        maxLength={200}
      />

      <Textarea
        label="摘要（可选）"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="简要描述内容..."
        maxLength={500}
        rows={2}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          正文 <span className="text-gray-400 font-normal">(支持 Markdown)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的想法..."
          className="flex min-h-[200px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          required
        />
      </div>

      {/* Topics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          话题
        </label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              type="button"
              onClick={() => toggleTopic(topic.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors min-h-[44px] ${
                selectedTopics.includes(topic.id)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          标签
        </label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="输入标签后回车"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="secondary" onClick={addTag}>
            添加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <Badge key={tag} variant="default" className="gap-1">
              #{tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={submitting}>
          发布
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          取消
        </Button>
      </div>
    </form>
  );
}
