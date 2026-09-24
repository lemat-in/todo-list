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
