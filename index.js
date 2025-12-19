const journal = document.getElementById("journal_editor");
const saveButton = document.getElementById("save_journal_button");
const showEntries = document.getElementById("entries_container");

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

function createEntry(content){
    return {
    id: Date.now().toString(),
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
    <small class="journal_entry_date">${date}</small>
    <p class="journal_entry_content">${entry.content}</p>
    `;

    showEntries.appendChild(wrapper);
});
};




saveButton.addEventListener('click', () => {
    const text = journal.value.trim();
    if (!text) return;

    const entry = createEntry(text);

    entries.unshift(entry);

    saveEntries();

    renderEntries();

    console.log(entries);

    journal.value = "";

    autoResize();

});

renderEntries();