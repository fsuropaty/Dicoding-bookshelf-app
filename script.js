"use strict";

let shelf = [];
const RENDER_EVENT = "render-app";
const SAVE_KEY = "BOOKSHELF-APP";
const incompleteList = document.getElementById("incompleteList");
const completedList = document.getElementById("completedList");

// Load
document.addEventListener("DOMContentLoaded", () => {
	loadFromStorage();
	document.dispatchEvent(new Event(RENDER_EVENT));
});

// Render
document.addEventListener(RENDER_EVENT, function () {
	const incompleteList = document.getElementById("incompleteList");
	const completedList = document.getElementById("completedList");

	incompleteList.innerHTML = "";
	completedList.innerHTML = "";

	for (const book of shelf) {
		const bookEL = generateBook(book);
		if (book.isCompleted) {
			completedList.append(bookEL);
		} else {
			incompleteList.append(bookEL);
		}
	}
});

// Form
const form = document.getElementById("form");
form.addEventListener("submit", (e) => {
	e.preventDefault();
	const inputJudul = document.getElementById("inputJudul").value;
	const inputPenulis = document.getElementById("inputPenulis").value;
	const inputTahun = document.getElementById("inputTahun").value;
	const isCompleted = document.getElementById("isCompleted").checked;

	const generateID = generateId();
	addBook(generateID, inputJudul, inputPenulis, inputTahun, isCompleted);

	document.dispatchEvent(new Event(RENDER_EVENT));
});

function addBook(id, judul, penulis, tahunStr, isCompleted) {
	const tahun = parseInt(tahunStr);
	const newBook = {
		id,
		judul,
		penulis,
		tahun,
		isCompleted,
	};

	shelf.push(newBook);
	saveToStorage();
}

// Book Action
function toggleCompleted(bookId) {
	const bookTarget = findBookId(bookId);

	if (bookTarget.isCompleted && bookTarget !== null) {
		bookTarget.isCompleted = false;
	} else {
		bookTarget.isCompleted = true;
	}
	saveToStorage();

	document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteBook(bookId) {
	const bookTarget = getBookIndex(bookId);
	const dialogPrompt = document.getElementById("prompt");
	const yesBtn = document.getElementById("prompt-yes");
	const noBtn = document.getElementById("prompt-no");

	if (bookTarget === null) return;

	dialogPrompt.open = true;

	yesBtn.addEventListener("click", () => {
		shelf.splice(bookTarget, 1);
		dialogPrompt.open = false;
		saveToStorage();

		document.dispatchEvent(new Event(RENDER_EVENT));
	});

	noBtn.addEventListener("click", () => {
		dialogPrompt.open = false;
	});
}

// Utils

function generateId() {
	return +new Date();
}

function findBookId(bookId) {
	for (const book of shelf) {
		if (book.id === bookId) {
			return book;
		}
	}
	return null;
}

function getBookIndex(bookId) {
	for (const index in shelf) {
		if (shelf[index].id === bookId) {
			return index;
		}
	}
	return -1;
}

function generateBook(book) {
	const { id, judul, penulis, tahun, isCompleted } = book;
	const card = document.createElement("div");
	const judulEl = document.createElement("h2");
	const penulisEL = document.createElement("p");
	const tahunEL = document.createElement("p");
	const btnContainer = document.createElement("div");
	const addToListBtn = document.createElement("button");
	const deleteBookBtn = document.createElement("button");

	judulEl.innerText = judul;
	penulisEL.innerText = `Penulis : ${penulis}`;
	tahunEL.innerText = `Tahun : ${tahun}`;

	if (isCompleted) {
		addToListBtn.innerText = "Belum Selesai Dibaca";
		addToListBtn.addEventListener("click", () => toggleCompleted(id));
	} else {
		addToListBtn.innerText = "Sudah Selesai Dibaca";
		addToListBtn.addEventListener("click", () => toggleCompleted(id));
	}

	deleteBookBtn.innerText = "Hapus Buku";
	deleteBookBtn.classList.add("secondary");
	deleteBookBtn.addEventListener("click", () => deleteBook(id));

	btnContainer.classList.add("grid");
	btnContainer.append(addToListBtn, deleteBookBtn);

	card.append(judulEl, penulisEL, tahunEL, btnContainer);
	card.setAttribute("id", `book-${id}`);

	return card;
}

// Storage
function checkStorage() {
	if (typeof Storage === undefined) {
		console.log("browser kamu tidak mendukung local storage");
		return false;
	}
	return true;
}

function saveToStorage() {
	if (checkStorage) {
		const parsed = JSON.stringify(shelf);
		localStorage.setItem(SAVE_KEY, parsed);
	}
}

function loadFromStorage() {
	const existData = localStorage.getItem(SAVE_KEY);
	let shelfData = JSON.parse(existData);
	if (shelfData !== null) {
		for (const book of shelfData) {
			shelf.push(book);
		}
	}
}

// Search Book
const searchEl = document.getElementById("searchInput");
const cariBtn = document.getElementById("cariBtn");
const resetBtn = document.getElementById("resetBtn");

cariBtn.addEventListener("click", searchBook);
resetBtn.addEventListener("click", () => {
	searchEl.value = "";
	document.dispatchEvent(new Event(RENDER_EVENT));
});

function searchBook() {
	const judulCari = searchEl.value;

	const result = shelf.filter((str) =>
		str.judul.toLowerCase().includes(judulCari)
	);

	incompleteList.innerHTML = "";
	completedList.innerHTML = "";

	for (const book of result) {
		const bookEL = generateBook(book);
		if (book.isCompleted) {
			completedList.append(bookEL);
		} else {
			incompleteList.append(bookEL);
		}
	}
}
