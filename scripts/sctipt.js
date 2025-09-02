
const LS_KEY = "eisenhower_simple_tasks_v1";
const state = load();

const boardLists = document.querySelectorAll(".list");
const plusButtons = document.querySelectorAll(".plus");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const cancelBtn = document.getElementById("cancelBtn");

let activeQuadrant = null; 

renderAll();

plusButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    activeQuadrant = btn.dataset.q;
    modalTitle.textContent = `Add Task — ${titleFor(activeQuadrant)}`;
    taskInput.value = "";
    openModal();
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text || !activeQuadrant) return;

  const t = { id: uid(), text };
  state[activeQuadrant].push(t);
  save();
  renderQuadrant(activeQuadrant);
  closeModal();
});

cancelBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal(); 
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

boardLists.forEach(list => {
  list.addEventListener("click", (e) => {
    if (e.target.matches(".del")) {
      const q = list.dataset.list;
      const id = e.target.closest("li").dataset.id;
      const arr = state[q];
      const idx = arr.findIndex(t => t.id === id);
      if (idx !== -1) {
        arr.splice(idx, 1);
        save();
        renderQuadrant(q);
      }
    }
  });
});

function openModal(){
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden","false");
  setTimeout(() => taskInput.focus(), 0);
}
function closeModal(){
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden","true");
  activeQuadrant = null;
}
function uid(){ return Math.random().toString(36).slice(2,10); }
function titleFor(q){
  return ({ q1:"Do First", q2:"Delegate", q3:"Schedule", q4:"Eliminate" })[q] || "Task";
}

function renderAll(){
  ["q1","q2","q3","q4"].forEach(renderQuadrant);
}

function renderQuadrant(q){
  const ul = document.querySelector(`.list[data-list="${q}"]`);
  if (!ul) return;
  ul.innerHTML = "";

  
  state[q].forEach(t => { if (typeof t.done !== "boolean") t.done = false; });

  state[q].forEach(item => {
    const li = document.createElement("li");
    li.className = "task";
    if (item.done) li.classList.add("done");
    li.dataset.id = item.id;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = item.done;
    cb.id = `cb-${q}-${item.id}`;

    

    const label = document.createElement("label");
    label.setAttribute("for", cb.id);
    label.textContent = item.text;


    cb.addEventListener("change", () => {
    item.done = cb.checked;            
    li.classList.toggle("done", cb.checked); 
    save();                           
    });

    li.append(cb, label);
    ul.appendChild(li);
  });
}

function load(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { q1:[], q2:[], q3:[], q4:[] };
  }catch{
    return { q1:[], q2:[], q3:[], q4:[] };
  }
}
function save(){
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}
