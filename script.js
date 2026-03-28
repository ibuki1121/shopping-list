// --- 既存の変数取得はそのまま ---
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const deleteBtn = document.getElementById('delete-btn');
const listContainer = document.getElementById('shopping-list');
const statusText = document.getElementById('status');

// 1. ページ読み込み時に保存されたデータを表示
window.addEventListener('load', () => {
    const savedData = JSON.parse(localStorage.getItem('myShoppingList')) || [];
    savedData.forEach(itemText => addItem(itemText, false)); // 保存時は音を出さない
});

// 2. データを保存する関数
function saveToLocal() {
    const items = [];
    document.querySelectorAll('.item-text').forEach(span => {
        items.push(span.innerText);
    });
    localStorage.setItem('myShoppingList', JSON.stringify(items));
}

// --- 音声認識の設定はそのまま ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'ja-JP';
recognition.continuous = true;

recognition.onresult = (event) => {
    const text = event.results[event.results.length - 1][0].transcript.trim();
    if (text) {
        addItem(text, true); // 新しく追加
    }
};

// 3. addItem関数を修正（保存処理を呼ぶようにする）
function addItem(text, shouldSave = true) {
    const div = document.createElement('div');
    div.className = 'shopping-item';
    div.innerHTML = `
        <label style="display: flex; align-items: center; width: 100%;">
            <input type="checkbox" class="item-check">
            <span class="item-text" style="margin-left: 10px;">${text}</span>
        </label>
    `;
    
    const checkbox = div.querySelector('.item-check');
    const span = div.querySelector('.item-text');
    checkbox.onchange = () => {
        span.classList.toggle('completed', checkbox.checked);
    };

    listContainer.appendChild(div);
    if (shouldSave) saveToLocal(); // 保存を実行
}

// 4. 削除ボタンの修正
deleteBtn.onclick = () => {
    document.querySelectorAll('.item-check:checked').forEach(cb => {
        cb.closest('.shopping-item').remove();
    });
    saveToLocal(); // 削除後も保存状態を更新
    statusText.innerText = "リストを更新しました";
};

// --- startBtn / stopBtn の処理はそのまま ---
startBtn.onclick = () => { recognition.start(); startBtn.disabled = true; stopBtn.disabled = false; statusText.innerText = "録音中..."; };
stopBtn.onclick = () => { recognition.stop(); startBtn.disabled = false; stopBtn.disabled = true; statusText.innerText = "終了"; };