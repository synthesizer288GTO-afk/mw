const MAX_TRIES = 6;
const MIN_LEN = 2;
const BOARD_LEN = 11;
const BLANK = "□";

const defaultWords = `
カナメマドカ
ミキサヤカ
トモエマミ
サクラキョウコ
アケミホムラ
モモエナギサ
アキマバユ
ユゥ
シィ
クロエ
タマキイロハ
ナナミヤチヨ
ユイツルノ
トガメモモコ
ミナミレナ
アキノカエデ
ミナギササラ
ホズミシズク
カガミマサラ
ウツホナツキ
シノブアキラ
トキワナナカ
チュンメイユイ
ヤヨイカノコ
キサキエミリ
マリコアヤカ
クルミマナカ
アヤノリカ
ミヤコヒナノ
ナツメカコ
ハルナコノミ
ミツキフェリシア
イスズレン
シズミコノハ
ユサハヅキ
ミクリアヤメ
フタバサナ
エリアイミ
ミソノカリン
アワネココロ
アマネツクヨ
アマネツカサ
クロ
アリナグレイ
アイノミト
イブキレイラ
クミセイカ
ヤクモミタマ
ユキノカナエ
アンナメル
アズサミフユ
アミリア
コズエマユ
マオヒミカ
イズミカナギ
チアキリコ
マキノイクミ
ミドリリョウ
サトミトウカ
ヒイラギネム
タマキウイ
フミノサユキ
サラサハンナ
ナナセユキカ
ヒロエチハル
トキメシズカ
トキスナオ
ナツリョウコ
キラリヒカル
クレハユナ
カサネアオ
オオバジュリ
チズランカ
スズカサクヤ
ミヤビシグレ
アズミハグム
アイカヒメナ
カグラサン
ユカリミユリ
ヒムロラビ
クルスアレクサンドラ
ミウラアサヒ
ユメウララ
リヴィアメディロス
ササメヨヅル
サワスダチ
ヤクモミカゲ
コマチミクラ
キラテマリ
ミホノセイラ
メグミモカ
ヒビキメグル
ユキマリア
ミズキルイ
ワカナツムギ
コウハルユウナ
ユズキホトリ
ユズキリオン
カザリジュン
ミワミツネ
アシュリーテイラー
キリノサエ
サトミナユタ
イリナクシュ
マイアカリ
ユラホタル
サトリカゴメ
セナミコト
イナミミツル
チヅル
ミズナツユ
エボニー
オルガ
ガンヒルト
ヘルカ
トヨ
アマリュリス
ミクニオリコ
クレキリカ
チトセユマ
カズミ
マキカオル
ミサキウミカ
アマノスズネ
ナルミアリサ
カナデハルカ
シオンチサト
ヒナタマツリ
ミコトツバキ
タルト
リズヴィスコンティ
メリッサドヴィニョル
エリザツェリスカ
ペレネルフラメル
イザボードバヴィエール
ラピヌ
コルボー
ミヌゥ
`; // ←ここに全部貼る

function normalizeWords(text) {
  return [...new Set(
    text
      .split(/\n|,|\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= MIN_LEN && w.length <= BOARD_LEN)
  )];
}

const words = normalizeWords(defaultWords);

function randomAnswer() {
  return words[Math.floor(Math.random() * words.length)];
}

let answer = randomAnswer();
let history = [];

function padToBoard(word) {
  return (word + BLANK.repeat(BOARD_LEN)).slice(0, BOARD_LEN);
}

function scoreGuess(rawGuess, answer) {
  const guess = padToBoard(rawGuess);
  const ans = padToBoard(answer);

  const result = Array(BOARD_LEN).fill("absent");
  const used = Array(BOARD_LEN).fill(false);

  for (let i = 0; i < BOARD_LEN; i++) {
    if (guess[i] === ans[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < BOARD_LEN; i++) {
    if (result[i] === "correct") continue;

    for (let j = 0; j < BOARD_LEN; j++) {
      if (!used[j] && guess[i] === ans[j]) {
        result[i] = "present";
        used[j] = true;
        break;
      }
    }
  }

  return {
    padded: guess,
    result,
    solved: rawGuess === answer
  };
}

function drawBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  for (let r = 0; r < MAX_TRIES; r++) {
    const row = document.createElement("div");
    row.className = "row";

    const item = history[r];

    for (let i = 0; i < BOARD_LEN; i++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");

      if (item) {
        tile.classList.add(item.result[i]);
        tile.textContent =
          item.padded[i] === BLANK ? "" : item.padded[i];
      } else {
        tile.classList.add("empty");
        tile.textContent = "";   // ←重要
      }

      row.appendChild(tile);
    }

    board.appendChild(row);
  }
}

function setMessage(text) {
  document.getElementById("message").textContent = text;
}

function submitGuess() {
  const input = document.getElementById("guessInput");
  const guess = input.value.trim();

  if (guess.length < MIN_LEN || guess.length > BOARD_LEN) {
    setMessage(`${MIN_LEN}〜${BOARD_LEN}文字で入力してください`);
    return;
  }

  if (!words.includes(guess)) {
    setMessage("キャラクター名を入れてください");
    return;
  }

  const scored = scoreGuess(guess, answer);
  history.push(scored);

  drawBoard();
  input.value = "";

  if (scored.solved) {
    setMessage("正解！🎉");
  } else if (history.length >= MAX_TRIES) {
    setMessage(`ゲーム終了。答え: ${answer}`);
  } else {
    setMessage("");
  }
}

function resetGame() {
  answer = randomAnswer();
  history = [];
  drawBoard();
  setMessage("");
}

document.getElementById("submitBtn").onclick = submitGuess;
document.getElementById("resetBtn").onclick = resetGame;

document.getElementById("guessInput")
  .addEventListener("keypress", e => {
    if (e.key === "Enter") submitGuess();
  });

document.getElementById("wordCount").textContent =
  `登録単語数: ${words.length}`;

drawBoard();