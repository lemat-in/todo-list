let frame = 1;
let position = 0;
let direction = 1;
const dogImg = document.getElementById("dog");
const todoSection = document.querySelector(".todo-section");
const todoHeader = document.querySelector(".todo-header");
let state = "walking";
let walkCount = 0;

const restImage = [
  "./image/dog_sit/dog_sit_1.png",
  "./image/dog_sit/dog_sit_2.png",
  "./image/dog_stretch/dog_stretch_1.png",
  "./image/dog_stretch/dog_stretch_2.png",
];

setInterval(() => {
  if (state !== "walking") return;

  frame = (frame % 8) + 1;
  dogImg.src = `./image/dog_walk/dog_walk_${frame}.png`;

  position += 5 * direction;
  dogImg.style.right = `${position}px`;

  const maxPosition = todoSection.offsetWidth - todoHeader.offsetWidth - dogImg.offsetWidth;

  if (position >= maxPosition) {
    direction = -1;
    dogImg.style.transform = "scaleX(-1)";
  } else if (position <= 0) {
    direction = 1;
    dogImg.style.transform = "scaleX(1)";
  }

  walkCount++;
  if (walkCount > 100) {
    walkCount = 0;
    startResting();
  }
}, 140);

function startResting() {
  state = "resting";
  const randomImg = restImage[Math.floor(Math.random() * restImage.length)];
  dogImg.src = randomImg;

  setTimeout(() => {
    state = "walking";
  }, 3000);
}

const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");

function createTaskItem(text = "", checked = false) {
  const li = document.createElement("li");
  li.className = "task-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checked;

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "タスクを入力する";
  textInput.style.color = "#999";
  textInput.value = text;

  if (checked) {
    textInput.style.textDecoration = "line-through";
    textInput.style.color = "#999";
  }

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      textInput.style.textDecoration = "line-through";
      textInput.style.color = "#999";
    } else {
      textInput.style.textDecoration = "none";
      textInput.style.color = "";
    }
    saveTasks();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "-";
  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks();
  });
  deleteBtn.style.color = "#a5c8e1";

  textInput.addEventListener("input", saveTasks);

  li.appendChild(checkbox);
  li.appendChild(textInput);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

addBtn.addEventListener("click", () => {
  createTaskItem();
  saveTasks();
});

function loadTasks() {
  const savedData = localStorage.getItem("todoTasks");
  if (!savedData) return;

  const tasks = JSON.parse(savedData);
  tasks.forEach((task) => {
    createTaskItem(task.text, task.checked);
  });
}

function saveTasks() {
  const tasks = [];
  const allItems = document.querySelectorAll(".task-item");

  allItems.forEach((item) => {
    const text = item.querySelector("input[type='text']").value;
    const checked = item.querySelector("input[type='checkbox']").checked;
    tasks.push({ text: text, checked: checked });
  });

  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

loadTasks();
