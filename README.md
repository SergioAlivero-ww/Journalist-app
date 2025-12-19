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

