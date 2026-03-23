



/* ================================
   IMPORTS
================================ */
import 
{ 
    initAuth, 
    loginWithGoogle, 
    handleRedirectLoginResult,
    logout, 
    saveEntry, 
    loadEntriesFromFirestore, 
    deleteEntry, 
    publishEntryPublic,      
    loadSharedEntry  
} 
    from "./firebase.js";


/* ================================
   DOM REFERENCES
================================ */


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
const deleteModal = document.getElementById("deleteModal");
const deleteConfirmBtn = document.getElementById("deleteConfirm");
const deleteCancelBtn = document.getElementById("deleteCancel");
const categoryDropdown = document.getElementById("category_dropdown");
const select = document.getElementById("categoryfilter");
const categoryFilter = document.getElementById("categoryfilter");

/* ================================
   STATE
================================ */

let currentUser = null;
let entries = [];
let currentlyEditingId = null;
let currentOpenEntryId = null;  /* ?? */
let entryToDelete = null;

/* ================================
   THEME
================================ */


const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);

function updateThemeToggleLabel(theme) {
  // prosty tekst: pokazujemy co się stanie po kliknięciu
  themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
};

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
};

/* ========================
     TEXTAREA AUTO RESIZE
========================= */

function autoResize() {
    journal.style.height = "auto";
    journal.style.height = journal.scrollHeight + "px";
}
journal.addEventListener('input', autoResize);
autoResize();


/* ========================
      URL HELPERS
========================= */

function setEntryIdToURL(id) {
  const url = new URL(window.location.href);
  url.searchParams.set("entry", id);
  window.history.pushState({}, "", url);
};

function clearEntryIdFromURL(){
    const url = new URL(window.location.href);
    url.searchParams.delete("entry");
    window.history.pushState({}, "", url);
};

function getEntryIdFromURL () {
    const url = new URL(window.location.href);
    return url.searchParams.get("entry");
};

function getShareIdFromURL() {
  return new URL(window.location.href).searchParams.get("share");
};

function isPublicView() {
  return !!getShareIdFromURL();
};


/* ================================
   CLIPBOARD
================================ */

async function copyText(text) {
  // 1) nowoczesne kopiowanie
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn("Clipboard API failed, trying fallback...", err);
  }

  // 2) fallback dla Safari / starszych środowisk
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // ważne: musi być w DOM
    document.body.appendChild(textArea);

    // styl ukrywający, ale nadal kopiowalny
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.setAttribute("readonly", "");

    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    const successful = document.execCommand("copy");

    document.body.removeChild(textArea);

    return successful;
  } catch (err) {
    console.error("Fallback copy failed:", err);
    return false;
  }
}


/* ================================
   FEEDBACK / TOAST
================================ */


function showToast(message) {
  console.log("SHOW TOAST DZIAŁA:", message);

  const toast = document.getElementById("toast");
  if (!toast) {
    console.log("BRAK #toast w HTML");
    return;
  }

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}


/* ================================
   ENTRY HELPERS
================================ */

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

function getUniqueCategories() {
  return [...new Set(
    entries
      .map(entry => entry.category?.trim())
      .filter(Boolean)
  )];
}

function closeCategoryDropdown() {
  categoryDropdown.classList.add("hidden");
  categoryDropdown.innerHTML = "";
}

function renderCategoryDropdown(filterText = "") {
  if (!categoryDropdown) return;

  const normalized = filterText.trim().toLowerCase();

  const categories = getUniqueCategories().filter(category =>
    category.toLowerCase().includes(normalized)
  );

  categoryDropdown.innerHTML = "";

  if (categories.length === 0) {
    closeCategoryDropdown();
    return;
  }

  categories.forEach(category => {
    const option = document.createElement("div");
    option.classList.add("category_option");
    option.textContent = category;

    option.addEventListener("click", () => {
      categoryInput.value = category;
      closeCategoryDropdown();
      categoryInput.focus();
    });

    categoryDropdown.appendChild(option);
  });

  categoryDropdown.classList.remove("hidden");
}


/* ================================
   DRAFT
================================ */

/* ================================
   DRAFT
================================ */

const DRAFT_KEY = "journalist_draft";

function saveDraft() {
  const draft = {
    title: journalTitle.value.trim(),
    category: categoryInput.value.trim(),
    content: journal.value
  };

  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
  const rawDraft = localStorage.getItem(DRAFT_KEY);
  if (!rawDraft) return;

  try {
    const draft = JSON.parse(rawDraft);

    journalTitle.value = draft.title || "";
    categoryInput.value = draft.category || "";
    journal.value = draft.content || "";

    autoResize();
  } catch (error) {
    console.error("DRAFT LOAD ERROR:", error);
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/* ================================
   DATA LAYER
================================ */

async function refreshEntries() {
  if (!currentUser) return;

  entries = await loadEntriesFromFirestore(currentUser.uid);
  refreshListUI();
  
};

async function persistEntry(entry) {
  if (!currentUser) {
    alert("Zaloguj się, żeby zapisywać.");
    return false;
  }

  try {
    await saveEntry(currentUser.uid, entry); // działa jako create + update
    await refreshEntries();                  // pobiera świeże entries + odświeża listę
    return true;
  } catch (e) {
    console.error("PERSIST ERROR:", e);
    alert("Błąd zapisu do Firestore.");
    return false;
  }
};


/* ================================
   UI VIEWS
================================ */

function showAuthView() {
    authSec.style.display = 'block';
    mainSec.style.display = 'none';
    entriesSec.style.display = 'none';
    entryDetail.style.display = 'none';
};

function showAppView() {
    authSec.style.display = 'none';
    showListView();
};

function showListView() {
  mainSec.style.display = 'block';
  entriesSec.style.display = 'block';
  entryDetail.style.display = 'none';
};

function refreshListUI() {
  renderEntries(entries);
  populateCategoryFilter();
  onFilterChange(); // żeby utrzymać aktualny filtr/search jeśli były ustawione
};


/* ================================
    RENDERING
  ================================ */

function renderEntries(list = entries){
    showEntries.innerHTML = "";

    if (list.length === 0) {
  showEntries.innerHTML = `
    <div class="empty_state">
      <h3 class="empty_state_title">No entries yet</h3>
      <p class="empty_state_text">Your first journal entry will appear here.</p>
    </div>
  `;
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


    wrapper.innerHTML = `
    <div class="title_category"><h2 class="journal_entry_title">${entry.title}</h2>
    <span class="category-badge">${entry.category}</span></div>
    <small class="journal_entry_date">${date}</small>
    
    <p class="journal_entry_content">${teaser}</p>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.classList.add('journal_entry_delete');

    deleteButton.addEventListener('click', (event) => {
  event.stopPropagation();

  if (!currentUser) return alert("Zaloguj się.");

  entryToDelete = entry.id;
  deleteModal.classList.remove("hidden");
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


/* ================================
    FILTERS
================================ */ 

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
    
function onFilterChange() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const categorySelect = document.getElementById('categoryfilter');
    filterEntries(categorySelect.value, searchTerm);
};

function populateCategoryFilter() {
    const select = document.getElementById('categoryfilter');
    const categories = [...new Set(entries.map(entry => entry.category))];  // Unikalne kategorie
    
    select.innerHTML = '<option value="">Choose category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
};
populateCategoryFilter();   

function updateCategoryFilterState() {
  if (categoryFilter.value === "") {
    categoryFilter.classList.remove("has-value");
  } else {
    categoryFilter.classList.add("has-value");
  }
}

/* ================================
   ENTRY LOGIC
================================ */


function startEdit(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;

    currentlyEditingId = entryId;
    journalTitle.value = entry.title;
    journal.value = entry.content;
    categoryInput.value = entry.category;
    saveButton.textContent = 'Update Entry';
    journal.focus();
};

function openEntry(id) {
  currentOpenEntryId = id;

  const entry = entries.find(e => e.id === id);
  if (!entry) return;

  if (!isPublicView()) {
    setEntryIdToURL(id);
  }

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

    <div class="detail-header-right detail-actions-top">
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
      <textarea id="editContent">${entry.content}</textarea>

      <div class="edit_category_row">
        <input type="text" id="editCategory" value="${entry.category}">
        <div class="save_cancel_buttons">
          <button id="saveEditDetail" class="save-edit-button">Save</button>
          <button id="cancelEditDetail" class="cancel-edit-button">Cancel</button>
        </div>
      </div>
    </div>
  </article>

  <div class="detail-actions-bottom">
    <button id="editFromDetailMobile" class="detail-header-btn">✎ Edit</button>
    <button id="shareEntryMobile" class="detail-header-btn">⤴ Share</button>
  </div>
`;

  // BACK
  document.getElementById('BackAllEntries')?.addEventListener('click', () => {
    clearEntryIdFromURL();
    showListView();
  });

  // EDIT TOGGLE
  document.getElementById('editFromDetail')?.addEventListener('click', () => {
    document.getElementById('readMode').style.display = 'none';
    document.getElementById('editMode').style.display = 'block';
  });

  document.getElementById('editFromDetailMobile')?.addEventListener('click', () => {
  document.getElementById('readMode').style.display = 'none';
  document.getElementById('editMode').style.display = 'block';
});

  // CANCEL
  document.getElementById('cancelEditDetail')?.addEventListener('click', () => {
    showListView();
  });

  // SAVE
document.getElementById('saveEditDetail')?.addEventListener('click', async () => {
  const newTitle = document.getElementById('editTitle')?.value.trim();
  const newContent = document.getElementById('editContent')?.value.trim();
  const newCategory = document.getElementById('editCategory')?.value.trim() || 'Uncategorized';

  if (!newTitle || !newContent) {
    alert("Tytuł i treść nie mogą być puste!");
    return;
  }

  if (!currentUser) {
    alert("Zaloguj się.");
    return;
  }

  // bierzemy NAJŚWIEŻSZY wpis z entries, a nie stary obiekt z openEntry()
  const existing = entries.find(e => e.id === id);
  if (!existing) {
    alert("Nie znaleziono wpisu.");
    return;
  }

  const updatedEntry = {
  ...entry,
  title: newTitle,
  content: newContent,
  category: newCategory,
};

const ok = await persistEntry(updatedEntry);
if (!ok) return;

openEntry(id);
});
  // SHARE
document.getElementById('shareEntry')?.addEventListener('click', async () => {
  if (!currentUser) return alert("Zaloguj się.");

  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("share", id);

  const copied = await copyText(url.toString());

  if (copied) {
    showToast("Link copied");
  } else {
    showToast("Copy failed");
  }

  try {
    await publishEntryPublic(entry);
  } catch (e) {
    console.error("Publish error:", e);
    showToast("Sharing failed");
  }
});

document.getElementById('shareEntryMobile')?.addEventListener('click', async () => {
  if (!currentUser) return alert("Zaloguj się.");

  const url = new URL(window.location.origin + window.location.pathname);
  url.searchParams.set("share", id);

  const copied = await copyText(url.toString());

  if (copied) {
    showToast("Link copied");
  } else {
    showToast("Copy failed");
  }

  try {
    await publishEntryPublic(entry);
  } catch (e) {
    console.error("Publish error:", e);
    showToast("Sharing failed");
  }
});

  if (isPublicView()) {
    document.getElementById('BackAllEntries')?.remove();
    document.getElementById('editFromDetail')?.remove();
  }

  mainSec.style.display = 'none';
  entriesSec.style.display = 'none';
  entryDetail.style.display = 'block';
};

/* ================================
   EVENTS
================================ */

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
  const ok = await persistEntry(entryToPersist);
if (!ok) return;

  clearDraft();
  // czyścimy pola TYLKO po udanym zapisie
  categoryEl.value = '';
  journal.value = "";
  journalTitle.value = "";
  saveButton.textContent = 'Save Entry';
  autoResize();
});

categorySelect.addEventListener('change', onFilterChange);
searchInput.addEventListener('input', onFilterChange);

deleteCancelBtn?.addEventListener("click", () => {
  deleteModal.classList.add("hidden");
  entryToDelete = null;
});

deleteConfirmBtn?.addEventListener("click", async () => {
  if (!entryToDelete) return;

  if (!currentUser) {
    deleteModal.classList.add("hidden");
    entryToDelete = null;
    return alert("Zaloguj się.");
  }

  try {
    await deleteEntry(currentUser.uid, entryToDelete);
    await refreshEntries();
  } catch (e) {
    console.error("FIRESTORE DELETE ERROR:", e);
    alert("Błąd usuwania w Firestore.");
  }

  deleteModal.classList.add("hidden");
  entryToDelete = null;
});

deleteModal?.addEventListener("click", (event) => {
  if (event.target === deleteModal) {
    deleteModal.classList.add("hidden");
    entryToDelete = null;
  }
});

categoryInput.addEventListener("focus", () => {
  renderCategoryDropdown(categoryInput.value);
});

categoryInput.addEventListener("input", () => {
  renderCategoryDropdown(categoryInput.value);
});

document.addEventListener("click", (event) => {
  const clickedInside =
    event.target === categoryInput ||
    categoryDropdown.contains(event.target);

  if (!clickedInside) {
    closeCategoryDropdown();
  }
});


journalTitle.addEventListener("input", saveDraft);
categoryInput.addEventListener("input", saveDraft);
journal.addEventListener("input", saveDraft);

select.addEventListener("change", () => {
  if (select.value === "") {
    select.classList.remove("has-value");
  } else {
    select.classList.add("has-value");
  }
});

categoryFilter.addEventListener("change", updateCategoryFilterState);
updateCategoryFilterState();

/* ================================
   AUTH
================================ */


initAuth(async (user) => {
  currentUser = user || null;

  console.log("AUTH STATE:", currentUser?.email || "LOGGED OUT");

  if (getShareIdFromURL()) {
    return;
  }

  if (user) {
    googleLoginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    authError.style.display = "none";

    try {
      entries = await loadEntriesFromFirestore(user.uid);
    } catch (e) {
      console.error("LOAD ENTRIES ERROR:", e);
      entries = [];
    }

    showAppView();
    refreshListUI();
    return;
  }

  googleLoginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";

  showAuthView();
  entries = [];
  renderEntries(entries);
});
 



/* ================================
   BOOT
================================ */

async function boot() {
  try {
    await handleRedirectLoginResult();
  } catch (err) {
    console.error("REDIRECT LOGIN ERROR:", err);
    authError.textContent = "Nie udało się zalogować.";
    authError.style.display = "block";
  }

  console.log("BOOT shareId:", getShareIdFromURL(), "href:", window.location.href);
  const shareId = getShareIdFromURL();

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

  loadDraft();
}
boot();




/* if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered!', reg))
    .catch(err => console.log('SW error', err));
} */

