const journal = document.getElementById("journal_editor");
const saveButton = document.getElementById("save_journal_button");
const showEntries = document.getElementById("entries_container");
const journalTitle = document.getElementById("entry_title");
const entryDetail = document.getElementById("entry_detail");
const entriesSec = document.getElementById("entries_sec");
const mainSec = document.getElementById('main_sec');
const searchInput = document.getElementById('search_input');

function autoResize() {
    journal.style.height = "auto";
    journal.style.height = journal.scrollHeight + "px";
}
journal.addEventListener('input', autoResize);
autoResize();


let entries = [];
let currentlyEditingId = null;

function saveEntries(){
    localStorage.setItem('journalEntries', JSON.stringify(entries));
};

function loadEntries(){
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
        entries = JSON.parse(storedEntries);
    }
};
loadEntries();

function createEntry(title, content){
    return {
    id: Date.now().toString(),
    title,
    content,
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

    wrapper.innerHTML = `
    <h2 class="journal_entry_title">${entry.title}</h2>
    <small class="journal_entry_date">${date}</small>
    <p class="journal_entry_content">${teaser}</p>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.classList.add('journal_entry_delete');
    deleteButton.addEventListener('click', () => {
    entries = entries.filter(e => e.id !== entry.id);
    saveEntries();
    renderEntries();
    });

    wrapper.appendChild(deleteButton);

    const editButton = document.createElement('button');
    editButton.textContent = '✎';
    editButton.classList.add('journal_entry_edit');
    editButton.addEventListener('click', () => {
        event.stopPropagation();
       const selectedEntry = entries.find(e => e.id === entry.id);
       currentlyEditingId = entry.id; 

       journalTitle.value = selectedEntry.title;
       journal.value = selectedEntry.content;
       saveButton.textContent = 'Update Entry';
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

    return titleText.includes(searchTerm) ||
    contentText.includes(searchTerm) || 
    dateText.includes(searchTerm);
};

function openEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;

      const date = new Date(entry.createdAt).toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    entryDetail.innerHTML = `
     <article class="entry_detail_card">
    <button id="BackAllEntries">All entries</button>
    <h2>${entry.title}</h2>
    <small>${date}</small>
    <p>${entry.content}</p>
    
    `;

    const backButton = document.getElementById('BackAllEntries');

    mainSec.style.display = 'none';
    entriesSec.style.display = 'none';
    entryDetail.style.display = 'block';

    
    backButton.addEventListener('click', showListView);


}



searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.trim().toLowerCase();

  if (!searchTerm) {
    // nic nie wpisane → pokazujemy wszystkie wpisy
    renderEntries(entries);
    return;
  }

  const filtered = entries.filter(entry => matchesSearch(entry, searchTerm));
  renderEntries(filtered);
});

saveButton.addEventListener('click', () => {

    const text = journal.value.trim();
    if (!text) return window.alert("Journal entry cannot be empty!");

    const title = journalTitle.value.trim();
    if (!title) return window.alert("Journal entry must have a title!");

    const entry = createEntry(title, text);

    if (saveButton.textContent === 'Update Entry') {
        entries = entries.map(existingEntry => 
    existingEntry.id === currentlyEditingId 
    ? { ...existingEntry, title: journalTitle.value, content: journal.value }
    : existingEntry 
    
);

} else {entries.unshift(entry);};
saveButton.textContent = 'Save Entry';


    

    saveEntries();

    renderEntries();


    console.log(entries);

    journal.value = "";
    journalTitle.value = "";

    autoResize();

});

renderEntries();

