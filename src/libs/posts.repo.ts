import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { stripUndefined } from "../utils/sanitize";

export interface Post {
  id: string;
  board: "notice" | "free";
  title: string;
  content: string;
  authorUid: string;
  authorName: string;
  pinned: boolean;
  tags?: string[];
  views: number;
  createdAt: any;
  updatedAt: any;
}

export async function listPosts(board: "notice" | "free", last?: any) {
  const col = collection(db, "posts");
  const base = query(
    col,
    where("board", "==", board),
    orderBy("createdAt", "desc"),
    limit(20),
    ...(last ? [startAfter(last)] : [])
  );
  const snap = await getDocs(base);
  let posts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[];
  const lastDoc = snap.docs[snap.docs.length - 1];

  if (!last) {
    const pinnedSnap = await getDocs(
      query(
        col,
        where("board", "==", board),
        where("pinned", "==", true),
        orderBy("createdAt", "desc")
      )
    );
    const pinnedPosts = pinnedSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    })) as Post[];
    posts = [...pinnedPosts, ...posts.filter((p) => !p.pinned)];
  }

  return { posts, lastDoc };
}

export async function getPost(id: string) {
  const snap = await getDoc(doc(db, "posts", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as Post) : null;
}

export async function createPost(
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "views">
) {
  const docRef = await addDoc(
    collection(db, "posts"),
    stripUndefined({
      ...data,
      views: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  return docRef.id;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<Post, "id" | "authorUid" | "authorName" | "createdAt">>
) {
  await updateDoc(
    doc(db, "posts", id),
    stripUndefined({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, "posts", id));
}

export async function increaseView(id: string) {
  await updateDoc(doc(db, "posts", id), { views: increment(1) });
}

export async function getAdjacentPosts(board: "notice" | "free", createdAt: any) {
  const col = collection(db, "posts");
  const base = query(col, where("board", "==", board), orderBy("createdAt", "desc"));
  const prevSnap = await getDocs(
    query(base, where("createdAt", "<", createdAt), limit(1))
  );
  const nextSnap = await getDocs(
    query(base, where("createdAt", ">", createdAt), limit(1))
  );
  const prev = prevSnap.docs[0]
    ? ({ id: prevSnap.docs[0].id, ...(prevSnap.docs[0].data() as any) } as Post)
    : null;
  const next = nextSnap.docs[0]
    ? ({ id: nextSnap.docs[0].id, ...(nextSnap.docs[0].data() as any) } as Post)
    : null;
  return { prev, next };
}
