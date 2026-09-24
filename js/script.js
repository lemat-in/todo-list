//  ---------- ここから犬のアニメーション ---------- //
let frame = 1;
let position = 0; // 犬の現在位置
let direction = 1; // 1なら右→左に進んでる、-1なら逆
const dogImg = document.getElementById("dog");
const todoSection = document.querySelector(".todo-section");
const todoHeader = document.querySelector(".todo-header");
let state = "walking";
let walkCount = 0; // 歩いた回数を数える

const restImage = [
  "./image/dog_sit/dog_sit_1.png",
  "./image/dog_sit/dog_sit_2.png",
  "./image/dog_stretch/dog_stretch_1.png",
  "./image/dog_stretch/dog_stretch_2.png",
];

setInterval(() => {
  if (state === "walking") {
    frame = (frame % 8) + 1; // 1~8を繰り返す
    dogImg.src = `./image/dog_walk/dog_walk_${frame}.png`;

    position += 5 * direction; // 1回ごとに5pxずつ移動する direction進む向きが変わる
    dogImg.style.right = `${position}px`;

    // 端についたかチェック
    // 折り返し位置を箱の幅 - タブの幅 - 犬の幅で計算
    const maxPosition = todoSection.offsetWidth - todoHeader.offsetWidth - dogImg.offsetWidth;

    if (position >= maxPosition) {
      direction = -1; // 左に戻る
      dogImg.style.transform = "scaleX(-1)"; // 画像を反転(右向きになる)
    } else if (position <= 0) {
      direction = 1; // 右に戻る
      dogImg.style.transform = "scaleX(1)"; // 反転を解除(元の左向きに戻る)
    }

    walkCount++;
    if (walkCount > 100) {
      // 一定歩数ごとに休憩
      walkCount = 0;
      startResting();
    }
  }
  // stateが"resting"の間は何もしない(startRestingが画像管理をしてるから)
}, 140); // 140msごとにコマ送り(調整必須)

function startResting() {
  state = "resting";
  const randomImg = restImage[Math.floor(Math.random() * restImage.length)];
  dogImg.src = randomImg;

  setTimeout(() => {
    state = "walking";
  }, 3000); //3秒休憩したら歩行開始
}

//  ---------- ここまで犬のアニメーション ---------- //

const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");

// 1つのタスク行(チェックボックス+入力欄+削除ボタン)をまとめて作る関数
// text/checkedを渡さなければ「新規追加」、渡せば「保存データからの復元」として使える
function createTaskItem(text = "", checked = false) {
  const li = document.createElement("li");
  li.className = "task-item";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checked; // 保存されてたチェック状態を反映

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "タスクを入力する";
  textInput.value = text; // 保存されてたテキストを反映

  // 復元時にすでにチェック済みだった場合、見た目も最初から取り消し線にしておく
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

  textInput.addEventListener("input", () => {
    saveTasks();
  });

  li.appendChild(checkbox);
  li.appendChild(textInput);
  li.appendChild(deleteBtn);

  taskList.appendChild(li);
}

// +ボタンは、空の状態でcreateTaskItemを呼ぶだけになる
addBtn.addEventListener("click", () => {
  createTaskItem();
  saveTasks();
});

// 読み込み時は、保存されてたtext/checkedを渡して呼ぶ
function loadTasks() {
  const savedData = localStorage.getItem("todoTasks");
  if (!savedData) return;

  const tasks = JSON.parse(savedData);
  tasks.forEach((task) => {
    createTaskItem(task.text, task.checked);
  });
}

// 今画面にある全タスクの状態(text/checked)を配列にまとめてローカルストレージに保存する
// 追加・削除・チェック変更・文字入力、それぞれのタイミングで呼び出される
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

/* --------------------
以下、共通化する前の状態(記録として保存)

■ このバージョンの問題点:
1. addBtnのクリック処理の中に、行を作る処理がすべて直書きされていた
  → 「+ボタンで新規追加する場合」の処理しか存在せず、
    「保存データから復元する場合」に同じ処理を使い回せなかった

2. saveTasksの中で .value が誤って .Value(大文字)になっていた
  → JSは大文字小文字を区別するため、これだと値が取得できずエラーの原因になる

3. チェックボックスのchangeイベント内、saveTasks()がif/elseの
  elseブロックの中にしか書かれていなかった
  → チェックを"入れた"時にはsaveTasksが呼ばれず、保存漏れが起きる状態だった

■ 改善後(createTaskItem関数)でどう直ったか:
- 行を作る処理を関数として切り出し、text/checkedを引数で受け取れるようにした
  → +ボタンからも読み込み時(loadTasks)からも、同じ関数を呼ぶだけで済むようになった
- .value に修正
- saveTasks()をif/elseの外(両方のケースで共通)に移動し、
  チェックを入れても外しても必ず保存されるようにした


addBtn.addEventListener("click", () => {
  // 1.liタグを作る
  const li = document.createElement("li");
  li.className = "task-item";

  // 2.チェックボックスを作る
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";

  // 3.テキスト入力欄を作る
  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "タスクを入力する";

  // 追加2:チェックボックスの状態が変わったら
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      textInput.style.textDecoration = "line-through"; //取り消し線をつける
      textInput.style.color = "#999"; // 文字色も薄くする
    } else {
      textInput.style.textDecoration = "none"; // チェックを外したら元に戻す
      textInput.style.color = ""; // 色も元に戻すから""指定
      saveTasks(); // 追加2:チェック状態が変わったら保存 ← elseの中にしかなかった(バグ)
    }
  });

  // 追加1:削除ボタンを作成
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "-";

  // 追加1:削除ボタンが押されたらこの行(li)を消す
  deleteBtn.addEventListener("click", () => {
    li.remove();
    saveTasks(); // 追加2:削除したら保存
  });

  // 追加2:
  textInput.addEventListener("input", () => {
    saveTasks(); // 追加2:文字を入力するたびに保存
  });

  // 4.liの中にチェックボックスとテキスト欄を入れる
  li.appendChild(checkbox);
  li.appendChild(textInput);
  li.appendChild(deleteBtn); // 追加1:liの中に削除ボタンも入れる

  // 5.liをリスト全体に追加する
  taskList.appendChild(li);
  saveTasks(); // 追加2:新しい行を追加した直後にも保存
});

// ローカルストレージ保存
function saveTasks() {
  const tasks = [];
  const allItems = document.querySelectorAll(".task-item");

  allItems.forEach((item) => {
    const text = item.querySelector("input[type='text']").Value; // ← .Value(バグ)
    const checked = item.querySelector("input[type='checkbox']").checked;
    tasks.push({ text: text, checked: checked });
  });

  localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const savedData = localStorage.getItem("todoTasks");
  if (!savedData) return; // 保存されたデータがなければ何もしない

  const tasks = JSON.parse(savedData); // 文字列を配列に戻す

  tasks.forEach((task) => {
    // ここで、保存されてたtaskの情報を元に行(li)を作って画面に追加する
    // 中身は addBtn のクリック処理とほぼ同じ！
    // → 結局この中身が空のままだったので、復元処理が未完成だった
  });
}
loadTasks(); // ページが読み込まれた時に実行

-------------------- */
