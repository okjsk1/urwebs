import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  Timestamp,
  QueryConstraint,
  QueryDocumentSnapshot,
  CollectionReference,
  FieldValue,
} from 'firebase/firestore';
import {
  Search,
  Plus,
  Calendar,
  User,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Heart,
  ChevronLeft,
  ChevronRight,
  Filter,
  Send,
  Lock,
  Loader2,
  Check,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { auth, db } from '../firebase/config';

type Category = '자유' | '질문' | '정보' | '후기' | '건의';
type DocId = string;

interface PostDoc {
  title?: string;
  content?: string;
  category?: Category;
  authorName?: string;
  authorEmail?: string;
  authorId?: string;
  views?: number;
  likes?: number;
  dislikes?: number;
  commentsCount?: number;
  createdAt?: Timestamp | FieldValue | null;
}

interface CommentDoc {
  authorName?: string;
  authorId?: string;
  content?: string;
  likes?: number;
  createdAt?: Timestamp | FieldValue | null;
}

interface VoteDoc {
  type: 'like' | 'dislike';
  userId: string;
  createdAt: Timestamp | FieldValue;
}

interface PostVM {
  id: DocId;
  title: string;
  content: string;
  authorName: string;
  authorId: string | null;
  createdAt: Date | null;
  createdAtLabel: string;
  views: number;
  likes: number;
  dislikes: number;
  commentsCount: number;
  category: Category;
}

interface CommentVM {
  id: DocId;
  authorName: string;
  authorId: string | null;
  content: string;
  createdAt: Date | null;
  createdAtLabel: string;
  likes: number;
}

const CATEGORY_OPTIONS: Array<'전체' | Category> = ['전체', '자유', '질문', '정보', '후기', '건의'];
const ITEMS_PER_PAGE = 10;
const COMMENTS_PAGE_SIZE = 10;
const COMMENT_MAX_LEN = 2000;
const POST_CONTENT_MAX_LEN = 8000;

const stripTags = (value: string) => value.replace(/<[^>]*>/g, '');
const sanitizeInput = (value: string, maxLength: number) =>
  stripTags(value).trim().slice(0, maxLength);

const formatDate = (date: Date | null) => {
  if (!date) return '작성일 정보 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const mapPostSnapshot = (snap: QueryDocumentSnapshot<PostDoc>): PostVM => {
  const data = snap.data();
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
  return {
    id: snap.id,
    title: data.title ?? '',
    content: data.content ?? '',
    authorName: data.authorName ?? '익명',
    authorId: data.authorId ?? null,
    createdAt,
    createdAtLabel: formatDate(createdAt),
    views: data.views ?? 0,
    likes: data.likes ?? 0,
    dislikes: data.dislikes ?? 0,
    commentsCount: data.commentsCount ?? 0,
    category: (data.category ?? '자유') as Category,
  };
};

const mapCommentSnapshot = (snap: QueryDocumentSnapshot<CommentDoc>): CommentVM => {
  const data = snap.data();
  const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null;
  return {
    id: snap.id,
    authorName: data.authorName ?? '익명',
    authorId: data.authorId ?? null,
    content: data.content ?? '',
    createdAt,
    createdAtLabel: formatDate(createdAt),
    likes: data.likes ?? 0,
  };
};

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
    </td>
    <td className="px-6 py-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
    </td>
    <td className="px-6 py-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
    </td>
    <td className="px-6 py-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
    </td>
  </tr>
);

function getCategoryBadgeClass(category: Category) {
  switch (category) {
    case '자유':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
    case '질문':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700';
    case '정보':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700';
    case '후기':
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700';
    case '건의':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600';
  }
}

const buildErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: string }).code;
    if (code === 'permission-denied') {
      return '권한이 없습니다. 로그인 상태를 확인해주세요.';
    }
    if (code === 'unavailable') {
      return '서비스를 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
    }
  }
  if (error instanceof Error && error.message) {
    return `${fallback}: ${error.message}`;
  }
  return fallback;
};

export function CommunityPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [posts, setPosts] = useState<PostVM[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostVM | null>(null);
  const [selectedPostVote, setSelectedPostVote] = useState<'like' | 'dislike' | null>(null);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'전체' | Category>('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  const [loadingPosts, setLoadingPosts] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const postsCursorRef = useRef<QueryDocumentSnapshot<PostDoc> | null>(null);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '자유' as Category,
  });

  const [comments, setComments] = useState<CommentVM[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
  const commentCursorRef = useRef<QueryDocumentSnapshot<CommentDoc> | null>(null);

  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  const lastFocusedPostIdRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  const resetPagination = useCallback(() => {
    postsCursorRef.current = null;
    setHasMorePosts(true);
  }, []);

  const loadPosts = useCallback(
    async (reset = false) => {
      if (loadingPosts) return;
      setPostsError(null);

      if (reset) {
        resetPagination();
        setInitialLoading(true);
        setPosts([]);
      }

      setLoadingPosts(true);
      try {
        const baseRef = collection(db, 'communityPosts') as CollectionReference<PostDoc>;
        const constraints: QueryConstraint[] = [];

        if (selectedCategory !== '전체') {
          constraints.push(where('category', '==', selectedCategory));
        }

        constraints.push(orderBy('createdAt', 'desc'));
        if (!reset && postsCursorRef.current) {
          constraints.push(startAfter(postsCursorRef.current));
        }
        constraints.push(limit(ITEMS_PER_PAGE));

        const snapshot = await getDocs(query(baseRef, ...constraints));
        const newPosts = snapshot.docs.map(mapPostSnapshot);

        setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
        postsCursorRef.current = snapshot.docs[snapshot.docs.length - 1] ?? null;
        setHasMorePosts(snapshot.size === ITEMS_PER_PAGE);
      } catch (error) {
        console.error('게시글 로드 실패:', error);
        setPostsError(buildErrorMessage(error, '게시글을 불러오지 못했습니다'));
      } finally {
        setLoadingPosts(false);
        setInitialLoading(false);
      }
    },
    [loadingPosts, resetPagination, selectedCategory]
  );

  useEffect(() => {
    loadPosts(true).catch(() => {});
  }, [selectedCategory, loadPosts]);

  const filteredPosts = useMemo(() => {
    if (!debouncedSearch.trim()) return posts;
    const lower = debouncedSearch.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lower) ||
        post.content.toLowerCase().includes(lower) ||
        post.authorName.toLowerCase().includes(lower)
    );
  }, [posts, debouncedSearch]);

  const handleWriteClick = useCallback(() => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다. 상단의 로그인 버튼을 이용해주세요.');
      return;
    }
    setShowWriteForm(true);
  }, [currentUser]);

  const handlePostSubmit = useCallback(async () => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }
    const safeTitle = sanitizeInput(newPost.title, 200);
    const safeContent = sanitizeInput(newPost.content, POST_CONTENT_MAX_LEN);

    if (!safeTitle || !safeContent) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    try {
      const postsRef = collection(db, 'communityPosts');
      await addDoc(postsRef, {
        title: safeTitle,
        content: safeContent,
        category: newPost.category,
        authorName: currentUser.displayName || currentUser.email || '익명',
        authorEmail: currentUser.email,
        authorId: currentUser.uid,
        views: 0,
        likes: 0,
        dislikes: 0,
        commentsCount: 0,
        createdAt: serverTimestamp(),
      } satisfies PostDoc);

      alert('게시글이 등록되었습니다.');
      setShowWriteForm(false);
      setNewPost({ title: '', content: '', category: '자유' });
      await loadPosts(true);
    } catch (error) {
      console.error('게시글 등록 실패:', error);
      alert(buildErrorMessage(error, '게시글 등록에 실패했습니다'));
    }
  }, [currentUser, newPost, loadPosts]);

  const restoreFocusToList = useCallback(() => {
    const targetId = lastFocusedPostIdRef.current;
    if (!targetId) return;
    const element = document.getElementById(`post-row-${targetId}`);
    element?.focus();
    lastFocusedPostIdRef.current = null;
  }, []);

  const fetchUserVote = useCallback(
    async (postId: string) => {
      if (!currentUser) {
        setSelectedPostVote(null);
        return;
      }
      try {
        const voteRef = doc(db, 'communityPosts', postId, 'votes', currentUser.uid);
        const snap = await getDoc(voteRef);
        if (snap.exists()) {
          const data = snap.data() as VoteDoc;
          setSelectedPostVote(data.type);
        } else {
          setSelectedPostVote(null);
        }
      } catch (error) {
        console.error('투표 정보 로드 실패:', error);
        setSelectedPostVote(null);
      }
    },
    [currentUser]
  );

  const loadComments = useCallback(
    async (postId: string, reset = false) => {
      if (commentsLoading) return;
      if (reset) {
        commentCursorRef.current = null;
        setCommentsHasMore(true);
        setComments([]);
      }
      setCommentsLoading(true);
      setCommentError(null);
      try {
        const commentsRef = collection(
          db,
          'communityPosts',
          postId,
          'comments'
        ) as CollectionReference<CommentDoc>;

        const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
        if (!reset && commentCursorRef.current) {
          constraints.push(startAfter(commentCursorRef.current));
        }
        constraints.push(limit(COMMENTS_PAGE_SIZE));

        const snapshot = await getDocs(query(commentsRef, ...constraints));
        const docs = snapshot.docs.map(mapCommentSnapshot);
        setComments((prev) => (reset ? docs : [...prev, ...docs]));
        commentCursorRef.current = snapshot.docs[snapshot.docs.length - 1] ?? null;
        setCommentsHasMore(snapshot.size === COMMENTS_PAGE_SIZE);
      } catch (error) {
        console.error('댓글 로드 실패:', error);
        setCommentError(buildErrorMessage(error, '댓글을 불러오지 못했습니다'));
      } finally {
        setCommentsLoading(false);
      }
    },
    [commentsLoading]
  );

  const incrementViewOnce = useCallback(async (postId: string) => {
    if (typeof window === 'undefined') return;
    const key = `community:viewed:${postId}`;
    if (window.sessionStorage.getItem(key)) return;

    try {
      await runTransaction(db, async (tx) => {
        const postRef = doc(db, 'communityPosts', postId);
        const snap = await tx.get(postRef);
        if (!snap.exists()) return;
        tx.update(postRef, {
          views: increment(1),
        });
      });
      window.sessionStorage.setItem(key, '1');
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, views: post.views + 1 } : post))
      );
      setSelectedPost((prev) =>
        prev && prev.id === postId ? { ...prev, views: prev.views + 1 } : prev
      );
    } catch (error) {
      console.warn('조회수 증가 실패:', error);
    }
  }, []);

  const handlePostSelect = useCallback(
    async (post: PostVM) => {
      lastFocusedPostIdRef.current = post.id;
      setSelectedPost(post);
      await Promise.all([
        loadComments(post.id, true),
        incrementViewOnce(post.id),
        fetchUserVote(post.id),
      ]);
    },
    [fetchUserVote, incrementViewOnce, loadComments]
  );

  const handleBackToList = useCallback(() => {
    setSelectedPost(null);
    restoreFocusToList();
  }, [restoreFocusToList]);

  const handleCommentSubmit = useCallback(async () => {
    if (!currentUser || !selectedPost) {
      alert('로그인이 필요합니다.');
      return;
    }
    const sanitized = sanitizeInput(newComment, COMMENT_MAX_LEN);
    if (!sanitized) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setCommentError(null);
    try {
      await runTransaction(db, async (tx) => {
        const postRef = doc(db, 'communityPosts', selectedPost.id);
        const postSnap = await tx.get(postRef);
        if (!postSnap.exists()) {
          throw new Error('게시글이 존재하지 않습니다.');
        }

        const commentsRef = collection(
          db,
          'communityPosts',
          selectedPost.id,
          'comments'
        ) as CollectionReference<CommentDoc>;
        const newCommentRef = doc(commentsRef);

        tx.set(newCommentRef, {
          authorName: currentUser.displayName || currentUser.email || '익명',
          authorId: currentUser.uid,
          content: sanitized,
          likes: 0,
          createdAt: serverTimestamp(),
        } satisfies CommentDoc);

        tx.update(postRef, {
          commentsCount: increment(1),
        });
      });

      setNewComment('');
      await loadComments(selectedPost.id, true);
      setSelectedPost((prev) =>
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev
      );
      setPosts((prev) =>
        prev.map((post) =>
          post.id === selectedPost.id
            ? { ...post, commentsCount: post.commentsCount + 1 }
            : post
        )
      );
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      setCommentError(buildErrorMessage(error, '댓글을 등록하지 못했습니다'));
    }
  }, [currentUser, selectedPost, newComment, loadComments]);

  const handleVote = useCallback(
    async (postId: string, type: 'like' | 'dislike') => {
      if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
      }

      try {
        const postRef = doc(db, 'communityPosts', postId);
        const voteRef = doc(db, 'communityPosts', postId, 'votes', currentUser.uid);

        let newVoteValue: 'like' | 'dislike' | null = type;

        await runTransaction(db, async (tx) => {
          const [postSnap, voteSnap] = await Promise.all([tx.get(postRef), tx.get(voteRef)]);
          if (!postSnap.exists()) {
            throw new Error('게시글이 존재하지 않습니다.');
          }

          const prev = voteSnap.exists() ? (voteSnap.data() as VoteDoc).type : null;
          let likeDelta = 0;
          let dislikeDelta = 0;

          if (prev === type) {
            tx.delete(voteRef);
            newVoteValue = null;
            if (type === 'like') likeDelta = -1;
            else dislikeDelta = -1;
          } else {
            tx.set(voteRef, {
              type,
              userId: currentUser.uid,
              createdAt: serverTimestamp(),
            } satisfies VoteDoc);

            if (prev === 'like') likeDelta -= 1;
            if (prev === 'dislike') dislikeDelta -= 1;

            if (type === 'like') likeDelta += 1;
            else dislikeDelta += 1;
          }

          tx.update(postRef, {
            likes: increment(likeDelta),
            dislikes: increment(dislikeDelta),
          });
        });

        setSelectedPostVote(newVoteValue);

        setSelectedPost((prev) => {
          if (!prev || prev.id !== postId) return prev;
          const likes =
            prev.likes +
            (newVoteValue === 'like' ? 1 : 0) -
            (selectedPostVote === 'like' && newVoteValue !== 'like' ? 1 : 0);
          const dislikes =
            prev.dislikes +
            (newVoteValue === 'dislike' ? 1 : 0) -
            (selectedPostVote === 'dislike' && newVoteValue !== 'dislike' ? 1 : 0);
          return { ...prev, likes, dislikes };
        });

        setPosts((prev) =>
          prev.map((post) => {
            if (post.id !== postId) return post;
            const nextLikes =
              post.likes +
              (newVoteValue === 'like' ? 1 : 0) -
              (selectedPostVote === 'like' && newVoteValue !== 'like' ? 1 : 0);
            const nextDislikes =
              post.dislikes +
              (newVoteValue === 'dislike' ? 1 : 0) -
              (selectedPostVote === 'dislike' && newVoteValue !== 'dislike' ? 1 : 0);
            return { ...post, likes: nextLikes, dislikes: nextDislikes };
          })
        );
      } catch (error) {
        console.error('투표 실패:', error);
        alert(buildErrorMessage(error, '투표를 처리하지 못했습니다'));
      }
    },
    [currentUser, selectedPostVote]
  );

  const handleLoadMorePosts = useCallback(() => {
    if (!hasMorePosts || loadingPosts) return;
    loadPosts(false).catch(() => {});
  }, [hasMorePosts, loadingPosts, loadPosts]);

  const handleLoadMoreComments = useCallback(() => {
    if (!selectedPost || !commentsHasMore || commentsLoading) return;
    loadComments(selectedPost.id, false).catch(() => {});
  }, [selectedPost, commentsHasMore, commentsLoading, loadComments]);

  if (showWriteForm) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => setShowWriteForm(false)}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          목록으로 돌아가기
        </Button>

        <Card className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">게시글 작성</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                카테고리
              </label>
              <select
                value={newPost.category}
                onChange={(event) =>
                  setNewPost((prev) => ({ ...prev, category: event.target.value as Category }))
                }
                className="w-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
              >
                {CATEGORY_OPTIONS.filter((value) => value !== '전체').map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목
              </label>
              <Input
                value={newPost.title}
                onChange={(event) => setNewPost((prev) => ({ ...prev, title: event.target.value }))}
                maxLength={200}
                placeholder="게시글 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                내용
              </label>
              <Textarea
                value={newPost.content}
                onChange={(event) =>
                  setNewPost((prev) => ({ ...prev, content: event.target.value }))
                }
                maxLength={POST_CONTENT_MAX_LEN}
                placeholder="게시글 내용을 입력하세요"
                className="h-72 resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                {newPost.content.length}/{POST_CONTENT_MAX_LEN}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={handlePostSubmit} className="bg-blue-600 hover:bg-blue-700">
                게시글 등록
              </Button>
              <Button variant="outline" onClick={() => setShowWriteForm(false)}>
                취소
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedPost) {
    const userCanVote = Boolean(currentUser);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Button variant="outline" onClick={handleBackToList}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          목록으로 돌아가기
        </Button>

        <Card className="p-8 space-y-6" role="article" aria-live="polite">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            <Badge className={getCategoryBadgeClass(selectedPost.category)}>{selectedPost.category}</Badge>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" aria-hidden="true" />
              <span>{selectedPost.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span>{selectedPost.createdAtLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span>조회 {selectedPost.views}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              <span>댓글 {selectedPost.commentsCount}</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {selectedPost.title}
          </h1>

          <div className="text-gray-800 dark:text-gray-100 whitespace-pre-line leading-relaxed">
            {selectedPost.content}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant={selectedPostVote === 'like' ? 'default' : 'outline'}
              className="flex items-center gap-2"
              aria-pressed={selectedPostVote === 'like'}
              aria-label="이 게시글 좋아요"
              onClick={() => handleVote(selectedPost.id, 'like')}
              disabled={!userCanVote}
            >
              <Heart className="w-4 h-4" aria-hidden="true" />
              <span>좋아요 {selectedPost.likes}</span>
            </Button>
            <Button
              type="button"
              variant={selectedPostVote === 'dislike' ? 'default' : 'outline'}
              className="flex items-center gap-2"
              aria-pressed={selectedPostVote === 'dislike'}
              aria-label="이 게시글 싫어요"
              onClick={() => handleVote(selectedPost.id, 'dislike')}
              disabled={!userCanVote}
            >
              <ThumbsDown className="w-4 h-4" aria-hidden="true" />
              <span>싫어요 {selectedPost.dislikes}</span>
            </Button>
          </div>
        </Card>

        <Card className="p-6 space-y-4" aria-live="polite">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              댓글
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              총 {selectedPost.commentsCount}개
            </span>
          </div>

          <div className="space-y-3">
            <Textarea
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder={
                currentUser ? '댓글을 입력하세요...' : '로그인 후 댓글을 작성할 수 있습니다.'
              }
              disabled={!currentUser}
              aria-label="댓글 입력"
              maxLength={COMMENT_MAX_LEN}
            />
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {newComment.length}/{COMMENT_MAX_LEN}
              </span>
              <div className="flex items-center gap-2">
                {!currentUser && (
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" aria-hidden="true" />
                    로그인 필요
                  </span>
                )}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCommentSubmit}
                  disabled={!currentUser || !sanitizeInput(newComment, COMMENT_MAX_LEN)}
                >
                  <Send className="w-4 h-4 mr-1" aria-hidden="true" />
                  등록
                </Button>
              </div>
            </div>
            {commentError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {commentError}
              </p>
            )}
          </div>

          <div className="space-y-4" role="list">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                role="listitem"
              >
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                  <User className="w-3 h-3" aria-hidden="true" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {comment.authorName}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{comment.createdAtLabel}</span>
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            ))}

            {commentsLoading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" aria-hidden="true" />
              </div>
            )}

            {!commentsLoading && commentsHasMore && (
              <Button variant="outline" onClick={handleLoadMoreComments}>
                더 보기
              </Button>
            )}

            {!commentsLoading && !commentsHasMore && comments.length > 0 && (
              <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                모든 댓글을 불러왔습니다.
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">자유게시판</h1>
        <p className="text-gray-600 dark:text-gray-400">사용자들과 정보를 나누고 대화를 이어가세요.</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="relative block">
            <span className="sr-only">게시글 검색</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="게시글을 검색하세요..."
              className="pl-10"
              aria-label="게시글 검색"
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
          <label className="sr-only" htmlFor="category-select">
            카테고리 필터
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value as '전체' | Category)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <Button
            onClick={handleWriteClick}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            aria-label="새 게시글 작성"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            글쓰기
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden" role="region" aria-live="polite">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회/추천
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {initialLoading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}
              {!initialLoading && filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    조건에 맞는 게시글이 없습니다.
                  </td>
                </tr>
              )}
              {!initialLoading &&
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    id={`post-row-${post.id}`}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer outline-none"
                    tabIndex={0}
                    onClick={() => handlePostSelect(post)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handlePostSelect(post);
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getCategoryBadgeClass(post.category)} flex-shrink-0`}>
                          {post.category}
                        </Badge>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-50 hover:text-blue-600">
                            {post.title}
                          </div>
                          {post.commentsCount > 0 && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-500">
                              <MessageSquare className="w-3 h-3" aria-hidden="true" />
                              <span>{post.commentsCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {post.authorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {post.createdAtLabel}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" aria-hidden="true" />
                          {post.views}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1 text-rose-500 dark:text-rose-300">
                          <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                          {post.dislikes}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {postsError && (
          <div className="px-4 py-3 text-sm text-red-600 dark:text-red-400 border-t border-red-200 dark:border-red-800 flex items-center justify-between">
            <span>{postsError}</span>
            <Button size="sm" variant="outline" onClick={() => loadPosts(true)}>
              다시 시도
            </Button>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadPosts(true)}
          disabled={loadingPosts}
          aria-label="게시글 새로 고침"
        >
          {loadingPosts ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
              새로 고침 중...
            </>
          ) : (
            '새로 고침'
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLoadMorePosts}
          disabled={!hasMorePosts || loadingPosts}
        >
          {loadingPosts ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
              불러오는 중...
            </>
          ) : hasMorePosts ? (
            '더 보기'
          ) : (
            '마지막 페이지'
          )}
        </Button>
      </div>
    </div>
  );
}
