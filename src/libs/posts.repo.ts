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
} from "firebase/firestore";
import { db } from "../firebase";

export interface Post {
  id: string;
  board: "notice" | "free";
  title: string;
  content: string;
  authorUid: string;
  authorName: string;
  pinned: boolean;
  createdAt: any;
  updatedAt: any;
}

export async function listPosts(board: "notice" | "free", last?: any) {
  const col = collection(db, "posts");
  const base = query(
    col,
    where("board", "==", board),
    orderBy("createdAt", "desc"),
    limit(10),
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

export async function createPost(data: Omit<Post, "id" | "createdAt" | "updatedAt">) {
  const docRef = await addDoc(collection(db, "posts"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePost(
  id: string,
  data: Partial<Omit<Post, "id" | "authorUid" | "authorName" | "createdAt">>
) {
  await updateDoc(doc(db, "posts", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, "posts", id));
}
