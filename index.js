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
function copyCurrentURLToClipboard() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
}


function saveEntries(){
    localStorage.setItem('journalEntries', JSON.stringify(entries));
};

function loadEntries(){
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

loadEntries();
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
    deleteButton.addEventListener('click', () => {
    entries = entries.filter(e => e.id !== entry.id);
    saveEntries();
    renderEntries(entries);
    populateCategoryFilter();
    });

    wrapper.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.textContent = '✎';
    editButton.classList.add('journal_entry_edit');
    editButton.addEventListener('click', () => {
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

    mainSec.style.display = 'none';
    entriesSec.style.display = 'none';
    entryDetail.style.display = 'block';

        document.getElementById('BackAllEntries')
  .addEventListener('click', () => {
    clearEntryIdFromURL();
    showListView();
  });

  document.getElementById('shareEntry').addEventListener('click', () => {
  copyCurrentURLToClipboard();
  alert('Link skopiowany do schowka');
});

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
        saveEntries();
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




saveButton.addEventListener('click', () => {
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

const entryIdFromURL = getEntryIdFromURL();
if (entryIdFromURL) {
  openEntry(entryIdFromURL);
}


/* if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered!', reg))
    .catch(err => console.log('SW error', err));
} */

