SZKILET APLIKACJI:

START
|
boot ()
|
|- sprawdza czy jest ?share = 
|
|- TAK - loadSharedEntry()
|        |
|        openEntry()
|        |
|        PUBLIC VIEW
|
|- NIE -> initAuth()
          |
          |- user zalogowany
          |  |
          |  LoadEntriesFromFirestore()
          |  |
          | entries(state)
          |  |
          |  refreshListUI()
          |  |
          |  renderEntries()
          |
          |- user niezalogowany
             |
             showAuthView()
    


GŁÓWNA ARCHITEKTURA DANYCH

Firestor 
|
loadEntriesFromFirestore()
|
Entries (state aplikacji)
|
refreshListUI()
|
renderEntries()
|
UI

Czyli: DATABASE -> STATE -> UI



FLOW ZAPISU WPISU

click SAVE 
|
saveButton event
|
createEntry() (jeśli nowy)
|
persistEntry()
|
saveEntry() -> Firestore
|
refreshEntries()
|
loadEntriesFromFirestore()
|
entries
|
refreshListUI()
|
renderEntries()

Czyli: UI -> DATABASE -> STATE -> UI



FLOW OTWIERANIA WPISU:

click entry
|
openEntry(id)
|
entries.find()
|
rendeer entry detail
|
show detail view


FLOW UDOSTEPNIANIA WPISU:

click SHARE
|
publichEntryPublick()
|
Firestore -> publickEntries
|
generate link
?share=entry_id
|
copyText()


FLOW OTWIERANIA PUBLICZNEGO LINKU

user opens link
?share=ID
|
boot()
|
getShareIDFromURL()
|
loadSharedEntry()
|
entries = [sharedEntry]
|
openEntry()
|
PUBLICK VIEW



PRAWDZIWA ARCHITEKTURA APLIKACJI "JOURNALIST"

                 ┌───────────────┐
                 │   Firestore   │
                 └───────┬───────┘
                         │
                loadEntriesFromFirestore
                         │
                         ▼
                 ┌───────────────┐
                 │    entries    │
                 │ (app state)   │
                 └───────┬───────┘
                         │
                 refreshListUI
                         │
                         ▼
                 ┌───────────────┐
                 │   render UI   │
                 └───────┬───────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
     saveEntry       openEntry        filterEntries
        │                │                │
        ▼                ▼                ▼
     Firestore        Detail UI        Filtered UI