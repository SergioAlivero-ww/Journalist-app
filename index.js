
document.getElementById("pheader").textContent = "BUILD TEST 12:55";


const journal = document.getElementById("journal_editor");
const saveButton = document.getElementById("save_journal_button");
const showEntries = document.getElementById("entries_container");
const journalTitle = document.getElementById("entry_title");
const entryDetail = document.getElementById("entry_detail");
const entriesSec = document.getElementById("entries_sec");
const mainSec = document.getElementById('main_sec');
const searchInput = document.getElementById('search_input');
const categorySelect = document.getElementById('categoryfilter');
const categoryInput = document.getElementById('entry_category');
const themeToggle = document.getElementById('themeToggle');
const authSec = document.getElementById('authSec');
const googleLoginBtn = document.getElementById("googleLoginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authError = document.getElementById("authError");

let currentUser = null;

googleLoginBtn.addEventListener("click", async () => {
  try {
    authError.style.display = "none";
    await loginWithGoogle();
  } catch (err) {
    console.error(err);
    authError.textContent = "Nie udało się zalogować.";
    authError.style.display = "block";
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await logout();
  } catch (err) {
    console.error(err);
  }
});


import 
{ 
    initAuth, 
    loginWithGoogle, 
    logout, 
    saveEntry, 
    loadEntriesFromFirestore, 
    deleteEntry, 
    updateEntry,
    publishEntryPublic,      // +
    loadSharedEntry  
} 
    from "./firebase.js";

const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);


function autoResize() {
    journal.style.height = "auto";
    journal.style.height = journal.scrollHeight + "px";
}
journal.addEventListener('input', autoResize);
autoResize();




let entries = [];
let currentlyEditingId = null;
let currentOpenEntryId = null;

async function refreshEntries() {
  if (!currentUser) return;

  entries = await loadEntriesFromFirestore(currentUser.uid);
  renderEntries(entries);
  populateCategoryFilter();
}

/* AUTH */

function showAuthView() {
    authSec.style.display = 'block';
    mainSec.style.display = 'none';
    entriesSec.style.display = 'none';
    entryDetail.style.display = 'none';
}



function showAppView() {
    authSec.style.display = 'none';
    showListView();
}


/* tworzymy link wpisu który wybieramy */
function setEntryIdToURL(id) {
  const url = new URL(window.location.href);
  url.searchParams.set("entry", id);
  window.history.pushState({}, "", url);
}

/* czyścimy pole od linku wpisu */
function clearEntryIdFromURL(){
    const url = new URL(window.location.href);
    url.searchParams.delete("entry");
    window.history.pushState({}, "", url);
}

/* Funkcja która pozwoli aplikacji otwierać sie z linku, otwierać ten wpis do którego prowadzi link */
function getEntryIdFromURL () {
    const url = new URL(window.location.href);
    return url.searchParams.get("entry");
}


/* Funkcja kopiowania */
/* function copyCurrentURLToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
} */
async function copyText(text) {
  // 1) Clipboard API (czasem działa)
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (_) {}

  // 2) Fallback: textarea + execCommand('copy') (często działa w Safari)
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);

    const ok = document.execCommand("copy");
    document.body.removeChild(ta);

    if (ok) return true;
  } catch (_) {}

  // 3) Ostatecznie prompt (zawsze działa)
  window.prompt("Skopiuj link:", text);
  return false;
}

/* Wykrywamu czy jesteśmy w public view */
function getShareIdFromURL() {
  return new URL(window.location.href).searchParams.get("share");
}

function isPublicView() {
  return !!getShareIdFromURL();
}

function saveEntries(){
    localStorage.setItem('journalEntries', JSON.stringify(entries));
};

function loadEntriesLocal(){
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
        entries = JSON.parse(storedEntries);
    }
};

function populateCategoryFilter() {
    const select = document.getElementById('categoryfilter');
    const categories = [...new Set(entries.map(entry => entry.category))];  // Unikalne kategorie
    
    select.innerHTML = '<option value="">Wszystkie kategorie</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

/* loadEntriesLocal(); */
populateCategoryFilter();



function createEntry(title, content, category = "Uncategorized"){
    return {
    id: Date.now().toString(),
    title,
    content,
    category,
    createdAt: new Date().toISOString(),
    };
    };

function createTeaser(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
};

function showListView() {
  mainSec.style.display = 'block';
  entriesSec.style.display = 'block';
  entryDetail.style.display = 'none';

  renderEntries();
  populateCategoryFilter();
}



function startEdit(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    currentlyEditingId = entryId;
    journalTitle.value = entry.title;
    journal.value = entry.content;
    categoryInput.value = entry.category;
    saveButton.textContent = 'Update Entry';
    journal.focus();
}

function renderEntries(list = entries){
    showEntries.innerHTML = "";

    if (list.length === 0) {
        showEntries.innerHTML = '<p style="color: #4a4a4a; font-style: italic;">No entries yet...</p>';
        return;
    }
    list.forEach(entry => {
    const wrapper = document.createElement('article');
    wrapper.classList.add('journal_entry');

    wrapper.addEventListener('click', () => {
        openEntry(entry.id);
    });

    const date = new Date(entry.createdAt).toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const teaser = createTeaser(entry.content, 30);
    const badgeHTML = `<span class="category-badge">${entry.category}</span>`;


    wrapper.innerHTML = `
    <div class="title_category"><h2 class="journal_entry_title">${entry.title}</h2>
    <span class="category-badge">${entry.category}</span></div>
    <small class="journal_entry_date">${date}</small>
    
    <p class="journal_entry_content">${teaser}</p>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.classList.add('journal_entry_delete');
    deleteButton.addEventListener('click', async (event) => {
  event.stopPropagation();
  if (!currentUser) return alert("Zaloguj się.");

  try {
    await deleteEntry(currentUser.uid, entry.id);
    await refreshEntries();
  } catch (e) {
    console.error("FIRESTORE DELETE ERROR:", e);
    alert("Błąd usuwania w Firestore.");
  }
});



    wrapper.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.textContent = '✎';
    editButton.classList.add('journal_entry_edit');
 editButton.addEventListener('click', (event) => {
  event.stopPropagation();
  startEdit(entry.id);
});
    wrapper.appendChild(editButton);

    showEntries.appendChild(wrapper);
    }); 
    };

function matchesSearch(entry, searchTerm) {
    const titleText = entry.title.toLowerCase();
    const contentText = entry.content.toLowerCase();
    const dateText = new Date(entry.createdAt).toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).toLowerCase();

    const categoryText = entry.category.toLowerCase();  


    return titleText.includes(searchTerm) ||
    contentText.includes(searchTerm) || 
    dateText.includes(searchTerm) ||
    categoryText.includes(searchTerm);
};

function filterEntries(categoryFilter, searchTerm) {
    let filtered = entries;
    
    // Filtr category (dokładne dopasowanie)
    if (categoryFilter) {
        filtered = filtered.filter(entry => entry.category === categoryFilter);
    }
    if (searchTerm) {
        filtered = filtered.filter(entry => matchesSearch(entry, searchTerm));
    }
     renderEntries(filtered);
};
    
   


function openEntry(id) {
  
currentOpenEntryId = id;
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

    
    setEntryIdToURL(id);

      const date = new Date(entry.createdAt).toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    entryDetail.innerHTML = `
    <div class="entry_detail_header">
        <button id="BackAllEntries" class="detail-header-btn">← All entries</button>
        <div class="detail-header-right">
        <button id="editFromDetail" class="detail-header-btn">✎ Edit</button>
        <button id="shareEntry" class="detail-header-btn">⤴ Share</button>
        </div>
    </div>
     <article class="entry_detail_card" id="detailCard">
        <div id="readMode">

                <div class="title_category_detail">
                <h2 class="title">${entry.title}</h2>
                <span class="category-badge">${entry.category}</span>
                </div>

                <div class="detail_meta">
                    <small>${date}</small>
                </div>
                <p class="full-entry-content">${entry.content}</p>
        </div>
        <div id="editMode" style="display: none;">
                <input type="text" id="editTitle" value="${entry.title}" placeholder="Tytuł...">
                <textarea id="editContent" placeholder="Treść...">${entry.content}</textarea>
                <div class="edit_category_row">
                    <input type="text" id="editCategory" value="${entry.category}" placeholder="Kategoria">
                    <div class="save_cansel_buttons">
                        <button id="saveEditDetail" class="save-edit-button"> Save Changes</button>
                        <button id="cancelEditDetail" class="cancel-edit-button"> Cancel</button>
                    </div>
                </div>
            </div>
        
    </article>
    `;

    const shareBtn = document.getElementById('shareEntry');

if (shareBtn) {
  shareBtn.addEventListener('click', async (event) => {
    event.stopPropagation();

    if (!currentUser) {
      alert("Zaloguj się, żeby udostępniać.");
      return;
    }

    const entry = entries.find(e => e.id === id);
    if (!entry) {
      alert("Nie znaleziono wpisu.");
      return;
    }

    try {
      await publishEntryPublic(entry);

      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set("share", id);

      const link = url.toString();
      await copyText(link);

      alert("Link gotowy");
    } catch (e) {
      console.error("PUBLISH ERROR:", e);
      alert("PUBLISH ERROR: " + (e?.message || e));
    }
  });
}

    console.log("URL", window.location.href);
    

    const publicMode = isPublicView();
        if (publicMode) {
        const backBtn = document.getElementById('BackAllEntries');
        const editBtn = document.getElementById('editFromDetail');
        if (backBtn) backBtn.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
    }


    mainSec.style.display = 'none';
    entriesSec.style.display = 'none';
    entryDetail.style.display = 'block';

        document.getElementById('BackAllEntries')
  .addEventListener('click', () => {
    clearEntryIdFromURL();
    showListView();
  });

/* const shareBtn = document.getElementById('shareEntry');
if (shareBtn) {
  shareBtn.onclick = async (event) => {
    event.stopPropagation();

    if (!currentUser) {
      alert("Zaloguj się, żeby udostępniać.");
      return;
    }

    const entry = entries.find(e => e.id === id);
    if (!entry) {
      alert("Nie znaleziono wpisu.");
      return;
    }

    try {
      await publishEntryPublic(entry);

      // ✅ budujemy czysty link tylko z ?share=...
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set("share", id);

      const link = url.toString();
      await copyText(link);

      alert("Link gotowy");
    } catch (e) {
      console.error("PUBLISH ERROR:", e);
      alert("PUBLISH ERROR: " + (e?.message || e));
    }
  };

}; */


        document.getElementById('editFromDetail').addEventListener('click', function() {
        document.getElementById('readMode').style.display = 'none';
        document.getElementById('editMode').style.display = 'block';
        document.getElementById('editContent').focus();
    });
    document.getElementById('saveEditDetail').addEventListener('click', function() {
        const newTitle = document.getElementById('editTitle').value.trim();
        const newContent = document.getElementById('editContent').value.trim();
        const newCategory = document.getElementById('editCategory').value.trim() || 'Uncategorized';
        if (!newTitle || !newContent) return alert('Tytuł i treść nie mogą być puste!');
        entries = entries.map(e => e.id === id ? { ...e, title: newTitle, content: newContent, category: newCategory } : e);
      /*  /*  saveEntries(); */
        populateCategoryFilter();

        const updatedEntry = entries.find(e => e.id === id);
        const date = new Date(updatedEntry.createdAt).toLocaleString('pl-PL', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    


      document.getElementById('readMode').innerHTML = `
        <div class="title_category_after_edit">
            <h2>${updatedEntry.title}</h2>
            <span class="category-badge">${updatedEntry.category}</span>
        </div>
        <div class="detail_meta">
            <small>${date}</small>
        </div>
        <p class="full-entry-content">${updatedEntry.content}</p>
    `;

     document.getElementById('editFromDetail').addEventListener('click', function() {
        document.getElementById('readMode').style.display = 'none';
        document.getElementById('editMode').style.display = 'block';
        document.getElementById('editContent').focus();
    });

        document.getElementById('readMode').style.display = 'block';
        document.getElementById('editMode').style.display = 'none';
    });
    document.getElementById('cancelEditDetail').addEventListener('click', showListView);
    
}

function onFilterChange() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const categorySelect = document.getElementById('categoryfilter');
    filterEntries(categorySelect.value, searchTerm);
}

categorySelect.addEventListener('change', onFilterChange);
searchInput.addEventListener('input', onFilterChange);



/* Old ZAPIS */


/* saveButton.addEventListener('click', () => {
    const text = journal.value.trim();
    if (!text) return window.alert("Journal entry cannot be empty!");
    const title = journalTitle.value.trim();
    if (!title) return window.alert("Journal entry must have a title!");
    
    const categoryInput = document.getElementById('entry_category');
    const category = categoryInput.value.trim() || 'Uncategorized';
    categoryInput.value = '';

    if (saveButton.textContent === 'Update Entry') {
        entries = entries.map(existingEntry => 
            existingEntry.id === currentlyEditingId 
                ? { ...existingEntry, title, content: text, category }
                : existingEntry 
        );
        currentlyEditingId = null;
    } else {
        const entry = createEntry(title, text, category);
        entries.unshift(entry);
    }
    
    saveButton.textContent = 'Save Entry';
    saveEntries(); 
    renderEntries();
    populateCategoryFilter();
    console.log(entries);
    journal.value = "";
    journalTitle.value = "";
    autoResize();

    
});
 */


/* TEŻ NIE DZIAŁA */

/* saveButton.addEventListener('click', async () => {
  const text = journal.value.trim();
  if (!text) return window.alert("Journal entry cannot be empty!");

  const title = journalTitle.value.trim();
  if (!title) return window.alert("Journal entry must have a title!");

  const categoryInputEl = document.getElementById('entry_category');
  const category = categoryInputEl.value.trim() || 'Uncategorized';
  categoryInputEl.value = '';

  if (!currentUser) return alert("Musisz się zalogować.");

  let entryToPersist;

  if (saveButton.textContent === 'Update Entry') {
    // aktualizacja istniejącego
    entries = entries.map(existingEntry =>
      existingEntry.id === currentlyEditingId
        ? { ...existingEntry, title, content: text, category }
        : existingEntry
    );

    entryToPersist = entries.find(e => e.id === currentlyEditingId);
    currentlyEditingId = null;
  } else {
    // nowy wpis
    entryToPersist = createEntry(title, text, category);
    entries.unshift(entryToPersist);
  }

  // zapis do Firestore (działa też jako update)
try {
  await saveEntry(currentUser.uid, entryToPersist);
  entries = await loadEntriesFromFirestore(currentUser.uid);
  renderEntries(entries);
  populateCategoryFilter();
} catch (e) {
  console.error("SAVE ERROR:", e);
  alert("Nie udało się zapisać do Firestore. Zobacz Console.");
  return;
}

  // reload z Firestore -> po refresh nie znika
  entries = await loadEntriesFromFirestore(currentUser.uid);
  renderEntries(entries);
  populateCategoryFilter();

  saveButton.textContent = 'Save Entry';
  journal.value = "";
  journalTitle.value = "";
  autoResize();
}); */
saveButton.addEventListener('click', async () => {

  const text = journal.value.trim();
  if (!text) {
    alert("Journal entry cannot be empty!");
    return;
  }

  const title = journalTitle.value.trim();
  if (!title) {
    alert("Journal entry must have a title!");
    return;
  }

  const categoryEl = document.getElementById('entry_category');
  const category = categoryEl.value.trim() || 'Uncategorized';

  if (!currentUser) {
    alert("Zaloguj się, żeby zapisywać.");
    return;
  }

  let entryToPersist;

  const isEditing = currentlyEditingId !== null;

  if (isEditing) {
    const existing = entries.find(e => e.id === currentlyEditingId);
    if (!existing) {
      alert("Nie znaleziono wpisu do edycji.");
      return;
    }

    entryToPersist = {
      ...existing,
      title,
      content: text,
      category
    };

    currentlyEditingId = null;
  } else {
    entryToPersist = createEntry(title, text, category);
  }

  try {
    await saveEntry(currentUser.uid, entryToPersist);
    await refreshEntries();   // 🔥 kluczowe
  } catch (e) {
    console.error("FIRESTORE SAVE ERROR:", e);
    alert("Błąd zapisu do Firestore. Sprawdź console.");
    return;
  }
  

  // czyścimy pola TYLKO po udanym zapisie
  categoryEl.value = '';
  journal.value = "";
  journalTitle.value = "";
  saveButton.textContent = 'Save Entry';
  autoResize();

  
});


function updateThemeToggleLabel(theme) {
  // prosty tekst: pokazujemy co się stanie po kliknięciu
  themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

if (themeToggle) {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeToggleLabel(currentTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeToggleLabel(next);
  });
}

renderEntries();

async function boot() {
    console.log("BOOT shareId:", getShareIdFromURL(), "href:", window.location.href);
  const shareId = getShareIdFromURL();

  // 1) PUBLIC VIEW: nie wymaga loginu
  if (shareId) {
    const shared = await loadSharedEntry(shareId);
    
    if (!shared) {
      authError.textContent = "Nie znaleziono wpisu lub link wygasł.";
      authError.style.display = "block";
      return;
    }

    entries = [shared];
    openEntry(shared.id);
    return;
  }

  // 2) NORMAL VIEW
  showAuthView();
}





initAuth(async (user) => {
  currentUser = user || null;

  console.log("AUTH STATE:", currentUser?.email || "LOGGED OUT");

  // 🔥 JEŚLI JEST SHARE LINK — NIC NIE DOTYKAJ
  if (getShareIdFromURL()) {
    return;
  }

  if (user) {
    authSec.style.display = "none";
    logoutBtn.style.display = "inline-block";
    showListView();

    try {
      entries = await loadEntriesFromFirestore(user.uid);
      renderEntries(entries);
      populateCategoryFilter();
    } catch (e) {
      console.error("LOAD ENTRIES ERROR:", e);
    }

  } else {
    authSec.style.display = "block";
    googleLoginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";

    showAuthView();
    entries = [];
    renderEntries(entries);
  }
});

boot();


/* if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered!', reg))
    .catch(err => console.log('SW error', err));
} */

