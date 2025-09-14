import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import UserDashboardLayout from '@/layouts/user-dashboard-layout';
import type { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CornerDownRight, MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';

interface DiscussionProps extends PageProps {
    course: { id: number; title: string };
    threads: Array<{
        id: number;
        content: string;
        created_at: string;
        user: { id: number; name: string; profile_photo_url?: string };
        replies: Array<{
            id: number;
            content: string;
            created_at: string;
            user: { id: number; name: string; profile_photo_url?: string };
        }>;
    }>;
}

export default function CourseDiscussion({ course, threads }: DiscussionProps) {
    // New thread form
    const { data, setData, post, processing, reset } = useForm<{ content: string; parent_id?: number }>({ content: '' });

    // Per-thread reply state
    const [replyInputs, setReplyInputs] = useState<Record<number, string>>({});
    const [replyBoxOpen, setReplyBoxOpen] = useState<Record<number, boolean>>({});
    const [repliesOpen, setRepliesOpen] = useState<Record<number, boolean>>({});

    const submit = () => {
        const content = data.content.trim();
        if (!content) return;
        post(route('courses.discussion.store', { course: course.id }), {
            preserveScroll: true,
            onSuccess: () => reset('content'),
        });
    };

    const submitReply = (threadId: number) => {
        const content = (replyInputs[threadId] || '').trim();
        if (!content) return;
        router.post(
            route('courses.discussion.store', { course: course.id }),
            { content, parent_id: threadId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyInputs((s) => ({ ...s, [threadId]: '' }));
                    setReplyBoxOpen((s) => ({ ...s, [threadId]: false }));
                    setRepliesOpen((s) => ({ ...s, [threadId]: true }));
                },
            },
        );
    };

    const initials = (name?: string) =>
        name
            ? name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
            : 'U';

    return (
        <UserDashboardLayout>
            <Head title={`Diskusi - ${course.title}`} />
            <div className="container mx-auto max-w-4xl p-4">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        <h1 className="text-xl font-semibold">Diskusi: {course.title}</h1>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('courses.learn', { id: course.id })}>Kembali ke Belajar</Link>
                    </Button>
                </div>

                {/* New thread */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Tulis Komentar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Textarea
                                placeholder="Tulis pertanyaan atau diskusi..."
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button disabled={processing || !data.content.trim()} onClick={submit}>
                                    <Send className="mr-2 h-4 w-4" /> Kirim
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Threads */}
                <div className="space-y-4">
                    {threads.map((t) => (
                        <Card key={t.id} className="overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={t.user.profile_photo_url} />
                                        <AvatarFallback>{initials(t.user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="mb-1 text-sm font-medium">{t.user.name}</div>
                                        <div className="prose prose-sm dark:prose-invert max-w-none">{t.content}</div>
                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                            <span>{new Date(t.created_at).toLocaleString('id-ID')}</span>
                                            <Separator orientation="vertical" className="h-4" />
                                            <Button variant="ghost" size="xs" onClick={() => setReplyBoxOpen((s) => ({ ...s, [t.id]: !s[t.id] }))}>
                                                <CornerDownRight className="mr-1 h-3 w-3" /> {replyBoxOpen[t.id] ? 'Tutup' : 'Balas'}
                                            </Button>
                                            {t.replies?.length > 0 && (
                                                <>
                                                    <Separator orientation="vertical" className="h-4" />
                                                    <Button
                                                        variant="ghost"
                                                        size="xs"
                                                        onClick={() => setRepliesOpen((s) => ({ ...s, [t.id]: !s[t.id] }))}
                                                    >
                                                        {repliesOpen[t.id] ? 'Sembunyikan' : 'Tampilkan'} {t.replies.length} balasan
                                                    </Button>
                                                </>
                                            )}
                                        </div>

                                        {/* Reply box */}
                                        {replyBoxOpen[t.id] && (
                                            <div className="mt-3 space-y-2">
                                                <Textarea
                                                    placeholder={`Balas ${t.user.name}...`}
                                                    value={replyInputs[t.id] || ''}
                                                    onChange={(e) => setReplyInputs((s) => ({ ...s, [t.id]: e.target.value }))}
                                                    rows={3}
                                                />
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setReplyBoxOpen((s) => ({ ...s, [t.id]: false }))}
                                                    >
                                                        Batal
                                                    </Button>
                                                    <Button size="sm" disabled={!(replyInputs[t.id] || '').trim()} onClick={() => submitReply(t.id)}>
                                                        <Send className="mr-2 h-4 w-4" /> Kirim
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {t.replies?.length > 0 && repliesOpen[t.id] && (
                                            <div className="mt-4 space-y-3 border-l pl-4">
                                                {t.replies.map((r) => (
                                                    <div key={r.id} className="flex gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={r.user.profile_photo_url} />
                                                            <AvatarFallback>{initials(r.user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="mb-1 text-sm font-medium">{r.user.name}</div>
                                                            <div className="prose prose-sm dark:prose-invert max-w-none">{r.content}</div>
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                {new Date(r.created_at).toLocaleString('id-ID')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </UserDashboardLayout>
    );
}
