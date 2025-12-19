const journal = document.getElementById("journal_editor");
const saveButton = document.getElementById("save_journal_button");
const showEntries = document.getElementById("entries_container");
const journalTitle = document.getElementById("entry_title");

function autoResize() {
    journal.style.height = "auto";
    journal.style.height = journal.scrollHeight + "px";
}
journal.addEventListener('input', autoResize);
autoResize();


let entries = [];

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

function renderEntries(){
    showEntries.innerHTML = "";

    if (entries.length === 0) {
        showEntries.innerHTML = '<p style="color: #4a4a4a; font-style: italic;">No entries yet...</p>';
        return;
    }
    entries.forEach(entry => {
    const wrapper = document.createElement('article');
    wrapper.classList.add('journal_entry');

    const date = new Date(entry.createdAt).toLocaleString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    wrapper.innerHTML = `
    <h2 class="journal_entry_title">${entry.title}</h2>
    <small class="journal_entry_date">${date}</small>
    <p class="journal_entry_content">${entry.content}</p>
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

    showEntries.appendChild(wrapper);
});
};




saveButton.addEventListener('click', () => {
    const text = journal.value.trim();
    if (!text) return;

    const title = journalTitle.value.trim();
    if (!title) return;

    const entry = createEntry(text, title);

    entries.unshift(entry);

    saveEntries();

    renderEntries();

    console.log(entries);

    journal.value = "";
    journalTitle.value = "";

    autoResize();

});

renderEntries();

