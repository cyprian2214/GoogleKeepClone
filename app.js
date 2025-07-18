// Full updated app.js
class Note {
  constructor(id, title, text, isArchived = false) {
    this.id = id;
    this.title = title;
    this.text = text;
    this.isArchived = isArchived;
  }
}

class App {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.selectedNoteId = "";
    this.miniSidebar = true;
    this.sidebarPinned = false;
    this.selectedSection = "notes";

    this.$activeForm = document.querySelector(".active-form");
    this.$inactiveForm = document.querySelector(".inactive-form");
    this.$noteTitle = document.querySelector("#note-title");
    this.$noteText = document.querySelector("#note-text");
    this.$notes = document.querySelector(".notes");
    this.$form = document.querySelector("#form");
    this.$modal = document.querySelector(".modal");
    this.$modalForm = document.querySelector("#modal-form");
    this.$modalTitle = document.querySelector("#modal-title");
    this.$modalText = document.querySelector("#modal-text");
    this.$closeModalForm = document.querySelector("#modal-btn");
    this.$sidebar = document.querySelector(".sidebar");
    this.$sidebarActiveItem = document.querySelector(".active-item");

    this.addEventListeners();
    this.displayNotes();
  }

  addEventListeners() {
    document.body.addEventListener("click", (event) => {
      this.handleFormClick(event);
      this.closeModal(event);
      this.openModal(event);
      this.handleArchiving(event);
    });

    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;
      this.addNote({ title, text });
      this.closeActiveForm();
    });

    this.$modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    document.querySelector("#menu-toggle").addEventListener("click", () => {
      this.toggleSidebar();
    });

    this.$sidebar.addEventListener("mouseover", () => {
      if (!this.sidebarPinned) this.expandSidebarTemporarily();
    });

    this.$sidebar.addEventListener("mouseout", () => {
      if (!this.sidebarPinned) this.collapseSidebarTemporarily();
    });

    document.querySelector(".search-area input").addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = this.notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.text.toLowerCase().includes(query)
      );
      this.displayNotes(filtered);
    });

    document.querySelectorAll(".sidebar-item").forEach(item => {
      item.addEventListener("click", () => {
        const text = item.querySelector(".sidebar-text").textContent.trim();
        this.handleSidebarSelection(text);
      });
    });

    document.body.addEventListener("click", (e) => {
      const icon = e.target.closest(".material-symbols-outlined");
      if (!icon) return;

      const action = icon.innerText.trim();
      switch (action) {
        case "add_alert": alert("Reminder feature not ready."); break;
        case "person_add": alert("Collaborator coming soon."); break;
        case "palette": alert("Color change not implemented."); break;
        case "image": alert("Image upload coming soon."); break;
        case "more_vert": alert("More options coming."); break;
        case "undo": alert("Undo not ready."); break;
        case "redo": alert("Redo not ready."); break;
      }
    });

    const settingsIcon = document.getElementById("settings-icon");
    const settingsMenu = document.getElementById("settings-menu");
    const darkSwitch = document.getElementById("darkmode-switch");

    settingsIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsMenu.style.display =
        settingsMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!settingsMenu.contains(e.target) && e.target !== settingsIcon) {
        settingsMenu.style.display = "none";
      }
    });

    darkSwitch.addEventListener("change", () => {
      if (darkSwitch.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });

    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark-mode");
      darkSwitch.checked = true;
    }
  }

  toggleSidebar() {
    const main = document.querySelector("main");
    this.sidebarPinned = !this.sidebarPinned;

    if (this.sidebarPinned) {
      this.$sidebar.style.width = "250px";
      this.$sidebar.classList.add("sidebar-hover");
      this.$sidebarActiveItem.classList.add("sidebar-active-item");
      main.classList.add("sidebar-expanded");
    } else {
      this.$sidebar.style.width = "80px";
      this.$sidebar.classList.remove("sidebar-hover");
      this.$sidebarActiveItem.classList.remove("sidebar-active-item");
      main.classList.remove("sidebar-expanded");
    }
  }

  expandSidebarTemporarily() {
    const main = document.querySelector("main");
    this.$sidebar.style.width = "250px";
    this.$sidebar.classList.add("sidebar-hover");
    main.classList.add("sidebar-expanded");
  }

  collapseSidebarTemporarily() {
    const main = document.querySelector("main");
    this.$sidebar.style.width = "80px";
    this.$sidebar.classList.remove("sidebar-hover");
    main.classList.remove("sidebar-expanded");
  }

  handleSidebarSelection(section) {
    this.selectedSection = section.toLowerCase();
    this.render();
  }

  handleFormClick(event) {
    const isActiveFormClickedOn = this.$activeForm.contains(event.target);
    const isInactiveFormClickedOn = this.$inactiveForm.contains(event.target);
    const title = this.$noteTitle.value;
    const text = this.$noteText.value;

    if (isInactiveFormClickedOn) {
      this.openActiveForm();
    } else if (!isInactiveFormClickedOn && !isActiveFormClickedOn) {
      this.addNote({ title, text });
      this.closeActiveForm();
    }
  }

  openActiveForm() {
    this.$inactiveForm.style.display = "none";
    this.$activeForm.style.display = "block";
    this.$noteText.focus();
  }

  closeActiveForm() {
    this.$inactiveForm.style.display = "block";
    this.$activeForm.style.display = "none";
    this.$noteText.value = "";
    this.$noteTitle.value = "";
  }

  openModal(event) {
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && !event.target.closest(".archive")) {
      this.selectedNoteId = $selectedNote.id;
      this.$modalTitle.value = $selectedNote.children[1].innerHTML;
      this.$modalText.value = $selectedNote.children[2].innerHTML;
      this.$modal.classList.add("open-modal");
    }
  }

  closeModal(event) {
    const isModalFormClickedOn = this.$modalForm.contains(event.target);
    const isCloseModalBtnClickedOn = this.$closeModalForm.contains(event.target);
    if ((!isModalFormClickedOn || isCloseModalBtnClickedOn) && this.$modal.classList.contains("open-modal")) {
      this.editNote(this.selectedNoteId, {
        title: this.$modalTitle.value,
        text: this.$modalText.value,
      });
      this.$modal.classList.remove("open-modal");
    }
  }

  handleArchiving(event) {
    const $selectedNote = event.target.closest(".note");
    if ($selectedNote && event.target.closest(".archive")) {
      const id = $selectedNote.id;
      this.notes = this.notes.map(note => {
        if (note.id === id) note.isArchived = !note.isArchived;
        return note;
      });
      this.render();
    }
  }

  addNote({ title, text }) {
    if (text.trim() !== "") {
      const newNote = new Note(cuid(), title, text);
      this.notes = [...this.notes, newNote];
      this.render();
    }
  }

  editNote(id, { title, text }) {
    this.notes = this.notes.map((note) => {
      if (note.id == id) {
        note.title = title;
        note.text = text;
      }
      return note;
    });
    this.render();
  }

  render() {
    this.saveNotes();
    this.displayNotes();
  }

  saveNotes() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }

  displayNotes(filteredNotes = null) {
    let notesToRender = filteredNotes || this.notes;
    if (this.selectedSection === "notes") {
      notesToRender = notesToRender.filter((n) => !n.isArchived);
    } else if (this.selectedSection === "archive") {
      notesToRender = notesToRender.filter((n) => n.isArchived);
    }

    this.$notes.innerHTML = notesToRender
      .map(
        (note) => `
        <div class="note" id="${note.id}">
          <span class="material-symbols-outlined check-circle">check_circle</span>
          <div class="title">${note.title}</div>
          <div class="text">${note.text}</div>
          <div class="note-footer">
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">add_alert</span><span class="tooltip-text">Remind me</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">person_add</span><span class="tooltip-text">Collaborator</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">palette</span><span class="tooltip-text">Change Color</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">image</span><span class="tooltip-text">Add Image</span></div>
            <div class="tooltip archive"><span class="material-symbols-outlined hover small-icon">archive</span><span class="tooltip-text">Archive</span></div>
            <div class="tooltip"><span class="material-symbols-outlined hover small-icon">more_vert</span><span class="tooltip-text">More</span></div>
          </div>
        </div>`
      )
      .join("");
  }
}

const app = new App();
