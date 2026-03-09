# JOURNALIST – TECHNICAL AUDIT

## 1. Architektura
- [ ] Czy plik index.js ma logiczne sekcje?
- [ ] Czy stan aplikacji jest kontrolowany?
- [ ] Czy routing URL jest spójny?

Uwagi:
-

---

## 2. State Management
Globalne zmienne:
- entries
- currentUser
- currentlyEditingId
- currentOpenEntryId

Problemy:
-

---

## 3. Routing (URL)
- ?entry=
- ?share=

Problemy:
-

---

## 4. Renderowanie
- renderEntries()
- openEntry()

Problemy:
-

---

## 5. Firestore
- loadEntriesFromFirestore
- saveEntry
- deleteEntry
- publishEntryPublic

Problemy:
-

---

## 6. UX
- Czy UI się resetuje poprawnie?
- Czy mobile działa?
- Czy focus jest logiczny?

Problemy:
-

---

## 7. Refactor Plan
1.
2.
3.


## 0. App Flow (jak to działa teraz)

### Boot
- boot():
  - jeśli URL ma ?share= -> loadSharedEntry() -> entries=[shared] -> openEntry(shared.id) -> STOP
  - jeśli nie ma ?share= -> showAuthView()

### Auth
- initAuth(callback):
  - jeśli ?share= -> return (nic nie dotyka)
  - jeśli user:
    - hide auth
    - showListView()
    - loadEntriesFromFirestore()
    - renderEntries()
    - populateCategoryFilter()
  - jeśli brak user:
    - showAuthView()
    - entries=[]
    - renderEntries([])

### Widoki
- showAuthView(): pokazuje auth, chowa resztę
- showListView(): pokazuje listę, chowa detail, renderEntries(), populateCategoryFilter()
- openEntry(id): ustawia currentOpenEntryId, ustawia URL (?entry=), renderuje detail, podpina listenery, chowa listę

### State (global)
- currentUser
- entries
- currentlyEditingId
- currentOpenEntryId


## 0.1 Krytyczne punkty ryzyka (podejrzenia)
- openEntry() zawsze ustawia ?entry= (konflikt z public view ?share=)
- openEntry() podpina listenery za każdym otwarciem -> ryzyko duplikacji
- showListView() woła renderEntries() i populateCategoryFilter() (powtarzane też po loadzie)
- zapis w detail edytuje entries lokalnie, ale nie zapisuje do Firestore (podejrzenie niespójności)

## AUDIT LOG

### [A-001] Routing: konflikt entry/share
- Co jest: openEntry() zawsze ustawia ?entry=, nawet w public view (?share=).
- Dlaczego problem: może mieszać URL i logikę trybów; utrudnia debug.
- Co robimy: w openEntry() nie ustawiamy ?entry= gdy isPublicView() === true.
- Status: DONE

### [A-002] openEntry(): listenery w środku renderu
- Co jest: openEntry() generuje HTML przez innerHTML i potem podpina listenery.
- Dlaczego problem: trudne do testowania, łatwo o duplikacje i chaos (już są stare/nowe wersje share).
- Co robimy: przenosimy listenery do jednej funkcji bindDetailEvents() i wołamy ją raz po renderze.
- Status: DONE

### [A-003] Console noise: Firestore WebChannel (CORS)
- Co jest: w normalnym oknie przeglądarki pojawiają się błędy XMLHttpRequest ... due to access control checks.
- Przyczyna: rozszerzenie przeglądarki blokujące googleapis.com (adblock / privacy).
- Dowód: w incognito (bez extension) problem nie występuje.
- Wpływ: brak wpływu na działanie aplikacji.
- Status: DONE (dev environment only)

### [A-004] Render: jedno źródło prawdy (usunąć nadmiarowe renderEntries)
- Co jest: renderEntries() było wywoływane w wielu miejscach, w tym globalnie przy starcie pliku.
- Dlaczego problem: mogło powodować render pustej listy przed auth i trudniejszy debugging.
- Co zrobiliśmy: usunięto globalne renderEntries(); oraz uporządkowano render listy w initAuth i showListView.
- Status: DONE

### [A-005] showListView: tylko widok, bez logiki danych
- Co jest: showListView() przełącza sekcje i dodatkowo woła renderEntries() + populateCategoryFilter().
- Dlaczego problem: miesza routing widoków z renderowaniem danych; może resetować UI (filtr) przy nawigacji.
- Co robimy: showListView() zostaje tylko do display. Render listy i filtr odpalamy tylko przy zmianie entries (refresh/load/save/delete).
- Status: DONE
- Fix: po login load → showListView() + refreshListUI()

### [A-006] Ujednolicenie zapisu do Firestore (persistEntry)
- Co jest: formularz główny i detail view miały osobne flow zapisu.
- Dlaczego problem: łatwo o rozjazdy logiki i bugi przy dalszych zmianach.
- Co zrobiliśmy: dodano persistEntry(entry) i użyto go w saveButton oraz saveEditDetail.
- Status: DONE