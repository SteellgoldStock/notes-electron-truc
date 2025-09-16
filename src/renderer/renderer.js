class NotesApp {
  constructor() {
    this.notes = [];
    this.currentNoteId = null;
    this.searchTerm = '';

    this.loadNotes();
    this.bindEvents();
    this.renderNotesList();
    this.showEmptyState();
  }

  loadNotes() {
    const savedNotes = localStorage.getItem('notes-app-data');
    if (savedNotes) {
      try {
        this.notes = JSON.parse(savedNotes);
      } catch (e) {
        console.error('Error loading notes:', e);
        this.notes = [];
      }
    }
  }

  saveNotes() {
    try {
      localStorage.setItem('notes-app-data', JSON.stringify(this.notes));
    } catch (e) {
      console.error('Error saving notes:', e);
    }
  }

  bindEvents() {
    const newNoteBtn = document.getElementById('newNoteBtn');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const searchInput = document.getElementById('searchInput');
    const noteTitle = document.getElementById('noteTitle');
    const noteEditor = document.getElementById('noteEditor');

    newNoteBtn.addEventListener('click', () => this.createNewNote());
    deleteNoteBtn.addEventListener('click', () => this.deleteNote(this.currentNoteId));

    searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    noteTitle.addEventListener('input', (e) => this.handleTitleChange(e.target.value));
    noteEditor.addEventListener('input', (e) => this.handleContentChange(e.target.value));
  }

  createNewNote() {
    console.log('Creating new note');
    const newNote = {
      id: this.generateId(),
      title: 'Nouvelle note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notes.unshift(newNote);
    this.saveNotes();
    this.renderNotesList();
    this.selectNote(newNote.id);
  }

  deleteNote(noteId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      this.notes = this.notes.filter(n => n.id !== noteId);
      this.saveNotes();
      this.renderNotesList();

      if (this.currentNoteId === noteId) {
        this.currentNoteId = null;
        this.showEmptyState();
        this.hideNoteEditor();
      }
    }
  }

  selectNote(noteId) {
    const note = this.notes.find(n => n.id === noteId);
    if (!note) return;

    this.currentNoteId = noteId;
    this.hideEmptyState();
    this.showNoteEditor();
    this.populateNoteEditor(note);
    this.updateActiveNoteInList(noteId);
  }

  handleTitleChange(title) {
    if (!this.currentNoteId) return;

    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (note) {
      note.title = title || 'Sans titre';
      note.updatedAt = new Date().toISOString();
      this.saveNotes();
      this.renderNotesList();
      this.updateActiveNoteInList(this.currentNoteId);
    }
  }

  handleContentChange(content) {
    if (!this.currentNoteId) return;

    const note = this.notes.find(n => n.id === this.currentNoteId);
    if (note) {
      note.content = content;
      note.updatedAt = new Date().toISOString();
      this.saveNotes();
      this.updatePreview(content);
      this.updateLastModified(note.updatedAt);
    }
  }

  handleSearch(searchTerm) {
    this.searchTerm = searchTerm.toLowerCase();
    this.renderNotesList();
  }

  deleteNote(noteId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      this.notes = this.notes.filter(n => n.id !== noteId);
      this.saveNotes();
      this.renderNotesList();

      if (this.currentNoteId === noteId) {
        this.currentNoteId = null;
        this.showEmptyState();
        this.hideNoteEditor();
      }
    }
  }

  renderNotesList() {
    const notesList = document.getElementById('notesList');
    const filteredNotes = this.notes.filter(note =>
      note.title.toLowerCase().includes(this.searchTerm) ||
      note.content.toLowerCase().includes(this.searchTerm)
    );

    if (filteredNotes.length === 0) {
      notesList.innerHTML = `
        <div class="p-4 text-center text-gray-500">
          <p class="text-sm">Aucune note trouvée</p>
        </div>
      `;
      return;
    }

    notesList.innerHTML = filteredNotes.map(note => `
      <div
        class="note-item group p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${note.id === this.currentNoteId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}"
        data-note-id="${note.id}"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0 pr-2">
            <h3 class="font-medium text-gray-900 truncate">${this.escapeHtml(note.title)}</h3>
            <p class="text-sm text-gray-600 mt-1 line-clamp-2">${this.getPreviewText(note.content)}</p>
            <p class="text-xs text-gray-400 mt-2">${this.formatDate(note.updatedAt)}</p>
          </div>

          <button
            class="delete-note text-red-500 hover:text-white p-1 hover:bg-red-500 group-hover:bg-red-500 group-hover:text-white rounded transition-all duration-200"
            data-note-id="${note.id}"
            title="Supprimer"
          >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shredder-icon lucide-shredder"><path d="M10 22v-5"/><path d="M14 19v-2"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M18 20v-3"/><path d="M2 13h20"/><path d="M20 13V7l-5-5H6a2 2 0 0 0-2 2v9"/><path d="M6 20v-3"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    notesList.querySelectorAll('.note-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('.delete-note')) {
          this.selectNote(item.dataset.noteId);
        }
      });
    });

    notesList.querySelectorAll('.delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteNote(btn.dataset.noteId);
      });
    });
  }

  showNoteEditor() {
    document.getElementById('noteHeader').classList.remove('hidden');
    document.getElementById('noteHeader').nextElementSibling.classList.remove('hidden');
  }

  hideNoteEditor() {
    document.getElementById('noteHeader').classList.add('hidden');
    document.getElementById('noteHeader').nextElementSibling.classList.add('hidden');
  }

  showEmptyState() {
    document.getElementById('emptyState').classList.remove('hidden');
  }

  hideEmptyState() {
    document.getElementById('emptyState').classList.add('hidden');
  }

  populateNoteEditor(note) {
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteEditor').value = note.content;
    this.updatePreview(note.content);
    this.updateLastModified(note.updatedAt);
  }

  updatePreview(content) {
    const preview = document.getElementById('notePreview');
    if (content.trim()) {
      try {
        // preview.innerHTML = marked.parse(content);
      } catch (e) {
        preview.innerHTML = '<p class="text-red-500">Erreur de rendu markdown</p>';
      }
    } else {
      preview.innerHTML = '<p class="text-gray-500 italic">L\'aperçu apparaîtra ici...</p>';
    }
  }

  updateLastModified(timestamp) {
    document.getElementById('lastModified').textContent = this.formatDate(timestamp);
  }

  updateActiveNoteInList(noteId) {
    document.querySelectorAll('.note-item').forEach(item => {
      if (item.dataset.noteId === noteId) {
        item.classList.add('bg-blue-50', 'border-l-4', 'border-l-blue-500');
      } else {
        item.classList.remove('bg-blue-50', 'border-l-4', 'border-l-blue-500');
      }
    });
  }

  // Utility functions
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getPreviewText(content) {
    return content.replace(/[#*`_]/g, '').substring(0, 100) + (content.length > 100 ? '...' : '');
  }

  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure${Math.floor(diffInHours) > 1 ? 's' : ''}`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new NotesApp();
});
