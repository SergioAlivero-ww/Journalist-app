# Journalist

Minimalist journaling app with Firebase backend, authentication and real-time data sync.
Focused on clean UX, writing flow and mobile experience.

Built as a portfolio project to practice real-world frontend architecture with Firebase backend, authentication and state management.

## 🔗 Links

- Live demo: https://journalist-e3348.web.app
- GitHub repository: https://github.com/SergioAlivero-ww/Journalist-app



## ✨ Features

- Google Authentication (Firebase Auth)
- Full CRUD for journal entries
- Real-time data sync with Firestore
- Public shareable entries (read-only view)
- URL-based navigation (SPA behavior with pushState)
- Category filtering + live search
- Autosave draft (localStorage)
- Custom category dropdown (dynamic)
- Toast notifications (no native alerts)
- Delete confirmation modal
- Light / Dark mode (persistent)
- Fully responsive (mobile-first UX)
- PWA support (installable app)

---

## 🧠 Tech Stack

- HTML5
- CSS3 (custom properties, responsive design)
- Vanilla JavaScript (no frameworks)
- Firebase:
  - Authentication (Google login)
  - Firestore (database)
  - Hosting
- PWA (manifest + service worker)

---

## 📱 UX & Mobile Focus

- Optimized layout for small screens (tested on iPhone Mini & Android)
- Touch-friendly UI (buttons, spacing, interactions)
- Dynamic textarea (auto-resize with max height + scroll)
- Fixed mobile issues:
  - scroll jumping during typing
  - tap highlight / active states
  - layout overflow bugs

---

## 🔗 Public Sharing System

Each entry can be shared via a public link:

`?share=ENTRY_ID`

- No login required
- Read-only mode
- UI adapts automatically (no edit / no navigation)
- Safe separation between private and public views

---

## ⚙️ Architecture

Simple state-driven structure:

Firestore → entries (state) → UI

Flow:

boot()
↓
initAuth()
↓
loadEntriesFromFirestore()
↓
entries (state)
↓
renderEntries()

Code organized into logical sections:
- state
- data layer
- UI rendering
- events
- helpers

---

## 🧩 Challenges & What I Learned

### Mobile Authentication (Firebase)
- signInWithPopup does not work on mobile
- implemented signInWithRedirect + getRedirectResult

### URL as App State
- handled navigation using history.pushState
- synchronized UI with URL (?entry=, ?share=)

### Clipboard API
- modern API + fallback for Safari (execCommand)
- ensured execution inside user interaction (browser restrictions)

### Long Text Handling
- fixed overflow issues with:
  - overflow-wrap
  - word-break
- ensured content stays inside card layout

### Mobile UX Bugs
- scroll jumping while typing (textarea auto-resize)
- tap highlight / stuck active states
- inconsistent spacing on small screens

### State Consistency
- ensured UI always reflects latest data after:
  - edit
  - delete
  - save
- separated state from DOM logic

---

## 🧪 Testing

Tested on:
- Desktop (Chrome, Safari)
- Mobile:
  - iPhone Mini
  - Android (Chrome)

---

## 🚀 Future Improvements

- User profiles
- Rich text editor
- Tags system
- Offline-first sync
- Better animations

---

## 📁 Additional Notes

Full development journey available in:

DEVLOG.md

---

## 👤 Author

Serhii Likhachov