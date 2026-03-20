import { initializeApp } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";

import {
  initializeFirestore,
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection,
  query,
  orderBy,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX7kie8WqPzfh2IYbfnb34_9fxTmjIXbw",
  authDomain: "journalist-e3348.web.app",
  projectId: "journalist-e3348",
  storageBucket: "journalist-e3348.firebasestorage.app",
  messagingSenderId: "485272578962",
  appId: "1:485272578962:web:8aff4b33fc004cb1456f4b"
};

const app = initializeApp(firebaseConfig);

// AUTH
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function initAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

function isMobileDevice() {
  return window.matchMedia("(max-width: 768px)").matches;
}

export async function loginWithGoogle() {
  if (isMobileDevice()) {
    return signInWithRedirect(auth, provider);
  }

  return signInWithPopup(auth, provider);
}

export async function handleRedirectLoginResult() {
  return getRedirectResult(auth);
}

export async function logout() {
  return signOut(auth);
}

// FIRESTORE
/* const db = getFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
}); */

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

function userEntriesCol(uid) {
  return collection(db, `users/${uid}/entries`);
}

export async function saveEntry(uid, entry) {
  // entry.id jako ID dokumentu => stabilne linki
  const ref = doc(db, `users/${uid}/entries/${entry.id}`);
  await setDoc(ref, entry, { merge: true });
}

export async function loadEntriesFromFirestore(uid) {
  const q = query(userEntriesCol(uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
}

export async function deleteEntry(uid, entryId) {
  const ref = doc(db, `users/${uid}/entries/${entryId}`);
  await deleteDoc(ref);
}

export async function updateEntry(uid, entryId, partialData) {
  const ref = doc(db, `users/${uid}/entries/${entryId}`);
  await updateDoc(ref, partialData);
}

export async function loadSharedEntry(entryId) {
  // publiczny dokument np. /publicEntries/{entryId}
  const ref = doc(db, `publicEntries/${entryId}`);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function publishEntryPublic(entry) {
  const ref = doc(db, `publicEntries/${entry.id}`);
  await setDoc(ref, {
    id: entry.id,
    title: entry.title,
    content: entry.content,
    category: entry.category,
    createdAt: entry.createdAt
  }, { merge: true });
}

