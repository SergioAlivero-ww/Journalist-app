#Journalist
Quiet log of my pathway.

09.12.2025.

Minimalist journal app I am building to practice HTML, CSS and JavaScript.
Right now it's just a basic layout with an editor and a list of entries.

10.12.2025.

Dodałem style do przecisku "SAVE ENRIES"
Dodałem style do paska SEARCH pod edytorem

11.12.2025.

Zaczynam pracę nad funkcjonalnością (JS)

19.12.2025

Dokończyłem pierwszą wersję mechaniki „Journalist”.
W pełni rozumiem teraz przepływ: wpis z textarea → createEntry → tablica entries → renderEntries pod edytorem.
Dodałem też obsługę localStorage: wpisy zapisują się po każdym „Save Entry” i wracają po odświeżeniu strony (saveEntries + loadEntries z JSON.stringify / JSON.parse).​
UI kartki z wpisem jest dopieszczone i wyrównane do search bara – „Journalist” ma już swój pierwszy, działający kształt.

Koniec 19.12.2025.
-dodano pole tytułu wpisu nad edytorem treści
-rozbudowano createEntry, żeby zapisywać title, content i createdAt
-wpisy z tytułem są zapisywane w localStorage i poprawnie wczytywane po odświeżeniu
-lista wpisów pokazuje teraz tytuł nad treścią w kartach
-działa usuwanie wpisów przyciskiem × wraz z aktualizacją localStorage
-po zapisie czyszczone są zarówno pole tytułu, jak i textarea z treścią
-plan na jutro: teasery treści w liście, kliknięcie w wpis → widok pojedynczego wpisu, przełączanie między listą a widokiem szczegółowym.

Plan na juto:
-teasery treści w liście, kliknięcie w wpis → widok pojedynczego wpisu, przełączanie między listą a widokiem szczegółowym.

23.12.2025.

dodano funkcję createTeaser skracającą treść wpisu do wybranej liczby znaków z ...

lista wpisów pokazuje teraz tytuł, datę i skrócony teaser zamiast pełnej treści

kliknięcie w kartkę wpisu otwiera widok pojedynczego wpisu z pełną treścią

widok wpisu ma własny layout (karta na środku, dopasowane typografie)

przycisk „All entries” wraca z widoku pojedynczego wpisu do edytora i listy

04.01.2025.

**Edit/Update** - przycisk Edit wypełnia textarea + title istniejącym wpisem, 
"Save Entry" → "Update Entry". Aktualizacja przez `map()` bez duplikatów. 
Reset buttona + pól po update.

05.01.2025.

-Refaktoryzowałem Edit tworząc dla jego logiki odzielną funkcję "startEdit"
Credits
Dziękuję Perplexity AI za pomoc w debugowaniu aplikacji Journal App. Szczegółowe wskazówki pozwoliły naprawić krytyczny błąd z filtrowaniem kategorii.

 Naprawiono błąd filtrowania kategorii

Problem: Wybór kategorii z dropdown nie działał przy pierwszym użyciu strony. Działał dopiero po wpisaniu i wyczyszczeniu wyszukiwarki.
Przyczyna:

Event listenery dla categoryfilter (change) i search_input (input) były zagnieżdżone wewnątrz siebie nawzajem

onFilterChange() definiowano w listenerze input search, więc listener change dla kategorii podpinano dopiero po pierwszym keystroke w search

Kolejne input dodawały duplikaty listenerów (memory leak)

Rozwiązanie (usuwa problematyczny blok ~linie 140-155):

javascript
// USUNIĘTO zagnieżdżone listenery i zastąpiono:
function onFilterChange() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const categorySelect = document.getElementById('categoryfilter');
    filterEntries(categorySelect.value, searchTerm);
}

categorySelect.addEventListener('change', onFilterChange);
searchInput.addEventListener('input', onFilterChange);

Journal App - Update 07.01.2026

Pełny Edit Flow - Zero niespodzianek

07.01.2026.

Cały system edycji działa perfekcyjnie:
Tworzenie wpisu w głównym edytorze (tytuł + kategoria + treść)
Edycja z głównej listy → kliknij ✎ → główny edytor z danymi
Edycja z poziomu szczegółowego → kliknij wpis → ✎ Edit → on-place edycja w tym samym widoku
Po każdym saveEntries() automatycznie:
populateCategoryFilter() - kategorie live w dropdown
renderEntries() - lista natychmiast zaktualizowana
localStorage - trwałe zapisanie
Filtry i wyszukiwanie
Search input - live search po tytule/treści/dacie/kategorii
Category select - dynamicznie wczytuje unikalne kategorie z entries
Kombinacja obu filtrów - działa płynnie równolegle
Nowa kategoria → natychmiast widoczna w select bez refresh
CSS & UX - Dopracowane detale
Spójne border-radius, font-weight, kolorystyka
Gradientowe przyciski z hover/scale efektami
Focus states i płynne przejścia
Responsywne inputy (brak overflow)
Kategoria przy prawej krawędzi tytułu w widoku szczegółowym

Podsumowanie 07.01.2026
Aplikacja gotowa do codziennego użytku - pełny CRUD + filtry w localStorage:
Stwórz wpis → title + category + content → Save
Search lub Category filter → live results
Kliknij wpis → pełny widok + Edit on-place
Save changes → natychmiastowa aktualizacja (bez refresh)
Wszystko trwałe w localStorage
Refleksja deweloperska: Każdy debugowany problem (event listeners, DOM manipulation, state management) buduje coraz głębsze zrozumienie JavaScript frontend. Czasochłonne, ale wartościowe.

Status: Production-ready (private use) - stabilna, intuicyjna, profesjonalna. Gotowa na kolejne features.


08.01.2026.
-CSS Variables - beżowo-grafitowa paleta (light/dark)
-Toggle działa z każdego widoku (górny prawy róg)  
-localStorage - pamięta wybór między sesjami
-System preference detection (prefers-color-scheme)
-Przycisk "Dark/Light" z dynamicznym tekstem
-Smooth transitions między motywami

📱 PWA - 100% GOTOWE ✅

Nowa struktura:

Folder Fonts/ z 11 plikami Lora (TTF)

manifest.json + ikony (192/512px)

sw.js z pełnym cache

Problem z fontami: Google Fonts nie działały offline → pobrałem Lora lokalnie, stworzyłem lora.css z @font-face (absolutne ścieżki /Fonts/*.ttf)

Rezultat: Zero błędów 404 offline, instalacja Chrome/Edge, dark/light toggle działa perfekcyjnie. Beżowo-grafitowa paleta zachowana w każdych warunkach.


12.01.2026.

jednak PWA nie było gotowe w 100%
Od kilku dni walczyłem z problemem:
✅ VSCode Live Server (WiFi) + Command+S na lora.css → Font OK
❌ VSCode Live Server + Command+S na index.html → Font spada na default  
❌ PWA zainstalowane (offline) → Font nie działa

// KLUCZOWE ZMIANY:
const urlsToCache = [
  'lora.css',  - TAK BYŁO I BYŁO ZŁE
  '/fonts/lora.css - tak jest i JEST DOBRZE
  // ...
];

// Usunięty problematyczny bypass localhost dla CSS
// Network First strategy z cache fallback


