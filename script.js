// ==========================================
// 1. ロード画面の解除
// ==========================================
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => { if (loader) loader.classList.add('loaded'); }, 500);
});

// ==========================================
// 2. スタート画面の選択処理
// ==========================================
const modeScreen = document.getElementById('mode-selection-screen');
const appContainer = document.getElementById('app-container');
const templateBtn = document.getElementById('template-btn');
const blankBtn = document.getElementById('blank-btn');

if (templateBtn) {
    templateBtn.addEventListener('click', () => {
        modeScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        initProject(true);
    });
}
if (blankBtn) {
    blankBtn.addEventListener('click', () => {
        modeScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        initProject(false);
    });
}

function initProject(isTemplate) {
    if (isTemplate) {
        console.log("テンプレートで開始");
        player.jumpPower = -7;
    } else {
        console.log("白紙で開始");
        player.jumpPower = -4;
    }
    gameLoop();
}

// ==========================================
// 3. ゲームの常時ジャンプアニメーション
// ==========================================
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 400; canvas.height = 200;
document.querySelector('.game-screen').appendChild(canvas);

const player = { x: 60, y: 100, size: 25, vy: 0, jumpPower: -6, gravity: 0.35 };
const groundY = canvas.height - 15;

function gameLoop() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    player.vy += player.gravity;
    player.y += player.vy;

    if (player.y + player.size >= groundY) {
        player.y = groundY - player.size;
        player.vy = player.jumpPower; 
    }

    ctx.fillStyle = '#72b63a';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    ctx.fillStyle = '#4ca7ff';
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.fillStyle = '#fff'; ctx.fillRect(player.x + 15, player.y + 5, 5, 5);
    ctx.fillStyle = '#000'; ctx.fillRect(player.x + 17, player.y + 7, 3, 3);

    requestAnimationFrame(gameLoop);
}

// ==========================================
// 4. ブロック選択 ＆ 組み立てエリアへの配置機能
// ==========================================
const blockModal = document.getElementById('block-modal');
const openBtn = document.getElementById('open-btn');
const closeBtn = document.getElementById('close-btn');
const dropZone = document.querySelector('.drop-zone');

if (openBtn) openBtn.addEventListener('click', () => blockModal.classList.remove('hide'));
if (closeBtn) closeBtn.addEventListener('click', () => blockModal.classList.add('hide'));

let selectedBlockData = null;

const allBlocks = document.querySelectorAll('.block');
allBlocks.forEach(block => {
    block.addEventListener('click', function(e) {
        allBlocks.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        
        selectedBlockData = {
            text: this.textContent,
            className: this.className.replace('selected', '').trim(),
            type: this.getAttribute('data-type'),
            value: this.getAttribute('data-value')
        };
        console.log("ブロックを選択:", selectedBlockData.text);
    });
});

if (dropZone) {
    dropZone.addEventListener('click', function(e) {
        if (!selectedBlockData) return;
        
        const placeholder = dropZone.querySelector('.placeholder-text');
        if (placeholder) placeholder.remove();

        const newBlock = document.createElement('div');
        newBlock.className = selectedBlockData.className;
        newBlock.style.margin = "5px";
        newBlock.style.display = "flex";
        newBlock.style.justifyContent = "space-between";
        newBlock.style.alignItems = "center";
        newBlock.style.width = "90%";
        newBlock.style.cursor = "default";
        
        newBlock.setAttribute('data-type', selectedBlockData.type);
        newBlock.setAttribute('data-value', selectedBlockData.value);

        const textSpan = document.createElement('span');
        textSpan.textContent = selectedBlockData.text;
        newBlock.appendChild(textSpan);

        const deleteX = document.createElement('span');
        deleteX.textContent = "✖";
        deleteX.style.cursor = "pointer";
        deleteX.style.marginLeft = "10px";
        deleteX.style.color = "rgba(255,255,255,0.7)";
        
        deleteX.addEventListener('click', function(event) {
            event.stopPropagation();
            newBlock.remove();
            if (dropZone.children.length === 0) {
                dropZone.innerHTML = '<p class="placeholder-text">（ここに組み立てたブロックが表示されます）</p>';
            }
        });
        
        newBlock.appendChild(deleteX);
        dropZone.appendChild(newBlock);
        
        // テスト用：組み立て欄に入った緑ブロックの能力をゲームに即時反映
        if (selectedBlockData.type === 'jump') {
            player.jumpPower = -6 * parseFloat(selectedBlockData.value);
        }

        allBlocks.forEach(b => b.classList.remove('selected'));
        selectedBlockData = null;
    });
}

// ==========================================
// 5. ファイル保存と「読み込めません」安全チェック
// ==========================================
const saveBtn = document.getElementById('save-btn');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        const saveData = { fileType: "streech", version: "1.0", currentJump: player.jumpPower };
        const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "my_project.streech";
        a.click();
        URL.revokeObjectURL(url);
    });
}

const fileInput = document.getElementById('file-input');
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(evt) {
            try {
                const data = JSON.parse(evt.target.result);
                if (data.fileType !== "streech") {
                    throw new Error("別システムです");
                }
                player.jumpPower = data.currentJump || -6;
                alert("プロジェクトを正常に読み込みました！");
            } catch (err) {
                alert("選択されたファイルを読み込めません。");
                fileInput.value = "";
            }
        };
        reader.readAsText(file);
    });
}
