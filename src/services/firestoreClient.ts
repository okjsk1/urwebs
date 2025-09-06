import { collection, doc } from "firebase/firestore";
import { db } from "../firebase";

export const getUserDocRef = (uid: string) => doc(db, "users", uid);
export const getBookmarksColRef = (uid: string) => collection(db, "users", uid, "bookmarks");
export const getFoldersColRef = (uid: string) => collection(db, "users", uid, "folders");
export const getWidgetsColRef = (uid: string) => collection(db, "users", uid, "widgets");
export const getSettingsColRef = (uid: string) => collection(db, "users", uid, "settings");
