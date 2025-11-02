/**
 * 좋아요(즐겨찾기) 기능 훅
 * users/{uid}/favorites/{pageId} 컬렉션 관리
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export interface PageMeta {
  pageId: string;
  pageOwnerId: string;
  pageTitle: string;
  pageThumbnail?: string;
  pageUrl: string;
  authorName?: string; // 작성자 이름
  likedAt: Timestamp;
}

export function useFavorites(uid: string | null) {
  const [favorites, setFavorites] = useState<PageMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    const favoritesRef = collection(db, 'users', uid, 'favorites');
    const q = query(favoritesRef, orderBy('likedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const favoriteList = snapshot.docs.map((doc) => ({
          ...doc.data(),
          pageId: doc.id,
        })) as PageMeta[];
        setFavorites(favoriteList);
        setLoading(false);
      },
      (error) => {
        console.error('좋아요 목록 조회 실패:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const addFavorite = async (pageMeta: Omit<PageMeta, 'likedAt'>) => {
    if (!uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const favoritesRef = collection(db, 'users', uid, 'favorites');
      const favoriteDoc = doc(favoritesRef, pageMeta.pageId);
      
      // undefined 값을 가진 필드를 제거 (Firestore는 undefined를 허용하지 않음)
      const dataToSave: any = {
        pageId: pageMeta.pageId,
        pageOwnerId: pageMeta.pageOwnerId,
        pageTitle: pageMeta.pageTitle,
        pageUrl: pageMeta.pageUrl,
        likedAt: Timestamp.now(),
      };
      
      // pageThumbnail이 undefined가 아닌 경우에만 추가
      if (pageMeta.pageThumbnail !== undefined && pageMeta.pageThumbnail !== null) {
        dataToSave.pageThumbnail = pageMeta.pageThumbnail;
      }
      
      // authorName이 undefined가 아닌 경우에만 추가
      if (pageMeta.authorName !== undefined && pageMeta.authorName !== null) {
        dataToSave.authorName = pageMeta.authorName;
      }
      
      await setDoc(favoriteDoc, dataToSave);

      // 페이지의 좋아요 수도 증가
      const pageRef = doc(db, 'userPages', pageMeta.pageId);
      const pageSnap = await getDoc(pageRef);
      
      if (pageSnap.exists()) {
        const { increment, arrayUnion } = await import('firebase/firestore');
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(pageRef, {
          likesCount: increment(1),
          likedBy: arrayUnion(uid),
        });
      }
    } catch (error) {
      console.error('좋아요 추가 실패:', error);
      throw error;
    }
  };

  const removeFavorite = async (pageId: string) => {
    if (!uid) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const favoritesRef = collection(db, 'users', uid, 'favorites');
      const favoriteDoc = doc(favoritesRef, pageId);
      
      await deleteDoc(favoriteDoc);

      // 페이지의 좋아요 수도 감소
      const pageRef = doc(db, 'userPages', pageId);
      const pageSnap = await getDoc(pageRef);
      
      if (pageSnap.exists()) {
        const { increment, arrayRemove } = await import('firebase/firestore');
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(pageRef, {
          likesCount: increment(-1),
          likedBy: arrayRemove(uid),
        });
      }
    } catch (error) {
      console.error('좋아요 취소 실패:', error);
      throw error;
    }
  };

  const isFavorite = (pageId: string): boolean => {
    return favorites.some((fav) => fav.pageId === pageId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
}
