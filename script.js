// KaamSetu starter: bilingual UI and browser-local task list.
// Firebase Authentication and Firestore will be connected in a later step.
const $ = (selector) => document.querySelector(selector);
const taskInput = $('#taskInput');
const taskList = $('#taskList');
const emptyState = $('#emptyState');
const STORAGE_KEY = 'kaamsetu.tasks.v1';
let language = 'hi';
let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (Array.isArray(saved)) tasks = saved.filter(item => item && typeof item.text === 'string');
} catch (error) {
  console.warn('Could not load saved tasks.', error);
}

function setLanguage(nextLanguage) {
  language = nextLanguage;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-hi][data-en]').forEach(element => {
    element.innerHTML = element.dataset[language];
  });
  $('#langHi').classList.toggle('active', language === 'hi');
  $('#langEn').classList.toggle('active', language === 'en');
  taskInput.placeholder = language === 'hi' ? 'नया काम लिखें...' : 'Write a new task...';
  taskInput.setAttribute('aria-label', language === 'hi' ? 'नया काम' : 'New task');
  renderTasks();
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    alert(language === 'hi' ? 'काम सेव नहीं हो पाया। ब्राउज़र स्टोरेज चेक करें।' : 'Could not save tasks. Check browser storage.');
  }
}

function renderTasks() {
  taskList.replaceChildren();
  emptyState.hidden = tasks.length > 0;
  tasks.forEach(task => {
    const row = document.createElement('label');
    row.className = `task-item${task.done ? ' done' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(task.done);
    checkbox.setAttribute('aria-label', language === 'hi' ? 'काम पूरा हुआ' : 'Mark task complete');
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      saveTasks();
      renderTasks();
    });
    const text = document.createElement('span');
    text.textContent = task.text;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-task';
    remove.textContent = language === 'hi' ? 'हटाएँ' : 'Delete';
    remove.addEventListener('click', event => {
      event.preventDefault();
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });
    row.append(checkbox, text, remove);
    taskList.append(row);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }
  tasks.unshift({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text, done: false });
  saveTasks();
  taskInput.value = '';
  renderTasks();
  taskInput.focus();
}

$('#addTask').addEventListener('click', addTask);
taskInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') addTask();
});
$('#langHi').addEventListener('click', () => setLanguage('hi'));
$('#langEn').addEventListener('click', () => setLanguage('en'));
$('#year').textContent = new Date().getFullYear();
renderTasks();