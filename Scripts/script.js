
const LS_KEY = "eisenhowerTasks_v1";
const emptyState = { q1: [], q2: [], q3: [], q4: [] };

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || structuredClone(emptyState);
  } catch {
    return structuredClone(emptyState);
  }
}
function saveState() {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

let state = loadState();


const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const uid = () => Math.random().toString(36).slice(2, 10);


function render() {
  $$(".quad").forEach((q) => {
    const qid = q.dataset.q;
    const ul = q.querySelector(".list");
    ul.innerHTML = "";

    state[qid].forEach((item) => {
      const li = document.createElement("li");
      li.className = "task" + (item.done ? " done" : "");
      li.dataset.id = item.id;

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = item.done;
      cb.addEventListener("change", () => {
        item.done = cb.checked;
        li.classList.toggle("done", item.done);
        saveState();
      });

      const label = document.createElement("label");
      label.textContent = item.text;

      const del = document.createElement("button");
      del.className = "del";
      del.title = "Delete";
      del.innerHTML = "×";
      del.addEventListener("click", () => {
        state[qid] = state[qid].filter((t) => t.id !== item.id);
        saveState();
        render();
      });

      li.append(cb, label, del);
      ul.appendChild(li);
    });

    if (state[qid].length === 0) {
      const hint = document.createElement("div");
      hint.className = "hint";
      hint.textContent = "Click the + to add tasks";
      ul.appendChild(hint);
    }
  });
}


function openQuickAdd(qid) {
  const box = document.querySelector(`.quick-add[data-q="${qid}"]`);
  box.style.display = "flex";
  const input = box.querySelector("input");
  input.value = "";
  input.focus();
}

function closeQuickAdd(qid) {
  const box = document.querySelector(`.quick-add[data-q="${qid}"]`);
  box.style.display = "none";
}

function addTask(qid, text) {
  const trimmed = (text || "").trim();
  if (!trimmed) return;
  state[qid].push({ id: uid(), text: trimmed, done: false });
  saveState();
  render();
  closeQuickAdd(qid);
}


$$(".add-btn").forEach((btn) => {
  btn.addEventListener("click", () => openQuickAdd(btn.dataset.q));
});


$$(".quick-add").forEach((box) => {
  const qid = box.dataset.q;
  const input = box.querySelector("input");
  const btn = box.querySelector("button");

  btn.addEventListener("click", () => addTask(qid, input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask(qid, input.value);
    if (e.key === "Escape") closeQuickAdd(qid);
  });

 
  document.addEventListener("click", (e) => {
    const isInside = box.contains(e.target) || e.target.closest(`.add-btn[data-q="${qid}"]`);
    if (!isInside) closeQuickAdd(qid);
  });
});


render();

window.matrix = {
  clear() { state = structuredClone(emptyState); saveState(); render(); },
  export() { return JSON.parse(JSON.stringify(state)); },
  import(data) { state = data; saveState(); render(); }
};
