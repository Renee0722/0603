// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];

let dino, dinoY, dinoVY, isJumping;
let groundY;
let obstacleX, obstacleY, obstacleW, obstacleH;
let gameOver = false;
let gameStarted = false;

let obstacleType; // 0: 黑色可穿越, 1: 紅色需跳躍

// 紅色與黑色障礙物的題目選項
const redOptions = ["化學", "物理", "微積分", "計算機概論"];
const blackOptions = ["教育科技概論", "平面設計", "程式設計", "音訊編輯"];
let obstacleLabel = "";

let score = 0; // 新增得分變數
let highScore = 0; // 最高得分

// 新增背景元素
let clouds = [];
let trees = [];
let bgScroll = 0;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  createCanvas(windowWidth, windowHeight); // 改為全螢幕
  video = createCapture(VIDEO, { flipped: true });
  video.size(200, 150);
  video.hide();

  // 初始化雲朵
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: random(width),
      y: random(60, 180),
      size: random(80, 160),
      speed: random(0.2, 0.5)
    });
  }
  // 初始化樹
  for (let i = 0; i < 8; i++) {
    trees.push({
      x: random(width),
      y: groundY,
      h: random(80, 160),
      w: random(30, 50),
      speed: 3
    });
  }

  resetGame();
  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // 視窗大小改變時自動調整
  resetGame();
}

function resetGame() {
  // 地面置中
  groundY = height / 2 + 100;
  // 放大恐龍
  dino = { x: width / 2 - 180, y: groundY, w: 90, h: 90 };
  dinoY = groundY;
  dinoVY = 0;
  isJumping = false;

  // 放大障礙物，置中
  obstacleW = 50;
  obstacleH = 120;
  obstacleX = width / 2 + 250;
  obstacleY = groundY;
  obstacleType = random([0, 1]); // 隨機產生障礙物型態

  // 根據障礙物型態隨機選擇標籤
  if (obstacleType === 0) {
    obstacleLabel = random(blackOptions);
  } else {
    obstacleLabel = random(redOptions);
  }

  gameOver = false;
  score = 0; // 重設得分
}

function gotHands(results) {
  hands = results;
}

function draw() {
  // === 根據分數切換背景與速度 ===
  let isNight = Math.floor(score / 10) % 2 === 1; // 每過10分切換一次夜晚/白天
  let speedUp = 10 + Math.floor(score / 5) * 2;  // 每5分加速2

  // 畫背景
  if (isNight) {
    background(20, 24, 60); // 深藍夜色
    // 畫月亮
    noStroke();
    fill(255, 255, 200, 230);
    ellipse(width - 120, 100, 90, 90);
    fill(20, 24, 60, 80); // 月亮陰影
    ellipse(width - 100, 110, 60, 60);
  } else {
    background(135, 206, 250); // 白天
  }

  // 畫雲朵（滾動）
  for (let cloud of clouds) {
    drawCloud(cloud.x - bgScroll * cloud.speed % (width + cloud.size), cloud.y, cloud.size);
    cloud.x += cloud.speed;
    if (cloud.x - bgScroll * cloud.speed % (width + cloud.size) > width + cloud.size) {
      cloud.x = -cloud.size;
    }
  }

  // ======= 刪除這段畫草地的綠色方塊 =======
  // fill(120, 200, 80);
  // noStroke();
  // rect(0, groundY + dino.h / 2, width, height - (groundY + dino.h / 2));
  // =========================================

  // 畫樹（滾動）
  for (let tree of trees) {
    let tx = (tree.x - bgScroll * tree.speed) % (width + 100);
    if (tx < -100) tx += width + 100;
    // 樹畫在地面線上方
    drawTree(tx, groundY - tree.h / 2, tree.w, tree.h);
  }

  // 更新背景滾動
  if (!gameOver && gameStarted) {
    bgScroll += speedUp / 4; // 速度隨分數提升
  }

  // 顯示題目
  fill(255, 255, 80); // 螢光黃
  textSize(50);
  textAlign(CENTER, TOP);
  text("{何者是教科系大一必修?}", width / 2, 30);

  // 顯示得分
  fill(50, 150, 200);
  textSize(32);
  textAlign(LEFT, TOP);
  text("得分：" + score, 30, 30);

  // 顯示最高得分
  fill(255, 120, 0);
  textSize(28);
  textAlign(LEFT, TOP);
  text("最高得分：" + highScore, 30, 70);

 // ...existing code...
  // 畫地面（加長）
  stroke(180);
  strokeWeight(4);
  line(0, groundY + dino.h / 2, width, groundY + dino.h / 2); // 地面線延長到整個畫面
  
// 左下角圓角方框說明
  let boxW = 370;   // 說明框寬度
  let boxH = 140;  // 說明框高度
  let boxX = 100;  // 說明框左上角 x 座標
  let boxY = height - boxH - 50;  // 說明框左上角 y 座標
  noStroke();
  fill(255, 255, 255, 220); // 半透明白底
  rect(boxX, boxY, boxW, boxH, 24); // 圓角方框
  fill(50, 150, 200);
  textSize(22);
  textAlign(LEFT, TOP);
  text("【玩法說明】\n" +
       "1. 手握拳頭，將手比出5即可讓恐龍跳躍。\n" +
       "2. 若內容為必修不要跳過，若不是必修請跳躍障礙物。\n" +
       "3. 每閃過一個障礙物得1分，分數越高速度越快。\n" +
       "4. 每5分加速，10分切換黑夜/白天。", boxX + 18, boxY + 16);

  // 顯示題目
  fill(255, 255, 80); // 螢光黃
  textSize(50);
  textAlign(CENTER, TOP);
  text("{何者是教科系大一必修?}", width / 2, 30);
// ...existing code...

  // 遊戲未開始
  if (!gameStarted) {
    fill(50, 150, 200);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("點擊螢幕開始遊戲", width / 2, height / 2 - 60);
    // 視訊畫面右下角
    image(video, width - video.width - 20, height - video.height - 20, video.width, video.height);
    return;
  }

  // 恐龍跳躍邏輯
  if (!gameOver) {
    if (hands.length > 0) {
      let hand = hands[0];
      let wrist = hand.keypoints[0];
      let indexTip = hand.keypoints[8];
      // 如果食指高於手腕（y 值較小），觸發跳躍
      if (indexTip && wrist && indexTip.y < wrist.y - 30 && !isJumping) {
        dinoVY = -20; // 跳躍初速度變大
        isJumping = true;
      }
    }

    dinoY += dinoVY;
    dinoVY += 0.8; // 重力變小，空中停留時間變長

    if (dinoY > groundY) {
      dinoY = groundY;
      dinoVY = 0;
      isJumping = false;
    }

    // 障礙物移動
    obstacleX -= speedUp; // 速度隨分數提升
    // 只有當障礙物完全離開畫面左側才重生
    if (obstacleX < -obstacleW / 2) {
      obstacleX = width + obstacleW / 2;
      obstacleType = random([0, 1]); // 每次重生隨機型態
      if (obstacleType === 0) {
        obstacleLabel = random(blackOptions);
      } else {
        obstacleLabel = random(redOptions);
      }
      score++; // 每成功閃過一個障礙物得1分
      if (score > highScore) {
        highScore = score; // 更新最高得分
      }
    }

    // 黑色障礙物：不能跳過，只能走過
    if (obstacleType === 0) {
      let dinoLeft   = dino.x - dino.w * 0.35;
      let dinoRight  = dino.x + dino.w * 0.35;
      let dinoBottom = dinoY + dino.h * 0.35;
      let obsRight   = obstacleX + obstacleW * 0.35;

      // 如果恐龍跳過黑色障礙物（在空中且右側超過障礙物右側），遊戲結束
      if (dinoLeft > obsRight && dinoY < groundY) {
        gameOver = true;
      }
    }

    // 紅色障礙物：只有碰撞才結束
    if (obstacleType === 1) {
      let dinoLeft   = dino.x - dino.w * 0.35;
      let dinoRight  = dino.x + dino.w * 0.35;
      let dinoBottom = dinoY + dino.h * 0.35;
      let obsLeft    = obstacleX - obstacleW * 0.35;
      let obsRight   = obstacleX + obstacleW * 0.35;

      // 只有碰撞才結束
      if (
        dinoRight > obsLeft &&
        dinoLeft < obsRight &&
        dinoBottom > obstacleY - obstacleH * 0.35
      ) {
        gameOver = true;
      }
    }
  }

  // 畫恐龍（精美版）
  push();
  rectMode(CENTER);
  ellipseMode(CENTER);
  noStroke();

  // 身體
  fill(100, 200, 100);
  ellipse(dino.x, dinoY + dino.h * 0.15, dino.w * 0.9, dino.h * 0.7);

  // 尾巴
  fill(80, 180, 80);
  triangle(
    dino.x - dino.w * 0.45, dinoY + dino.h * 0.18,
    dino.x - dino.w * 0.7, dinoY + dino.h * 0.28,
    dino.x - dino.w * 0.45, dinoY + dino.h * 0.38
  );

  // 腳
  fill(80, 180, 80);
  rect(dino.x - dino.w * 0.18, dinoY + dino.h * 0.45, dino.w * 0.18, dino.h * 0.18, 8);
  rect(dino.x + dino.w * 0.18, dinoY + dino.h * 0.45, dino.w * 0.18, dino.h * 0.18, 8);

  // 頭
  fill(100, 200, 100);
  ellipse(dino.x + dino.w * 0.32, dinoY - dino.h * 0.18, dino.w * 0.45, dino.h * 0.45);

  // 嘴巴
  fill(80, 150, 80);
  arc(dino.x + dino.w * 0.42, dinoY - dino.h * 0.08, dino.w * 0.18, dino.h * 0.12, 0, PI, CHORD);

  // 眼睛
  fill(0);
  ellipse(dino.x + dino.w * 0.38, dinoY - dino.h * 0.22, dino.w * 0.07, dino.h * 0.07);

  // 背部三角板
  fill(60, 160, 60);
  triangle(
    dino.x - dino.w * 0.18, dinoY - dino.h * 0.18,
    dino.x - dino.w * 0.08, dinoY - dino.h * 0.38,
    dino.x, dinoY - dino.h * 0.18
  );
  triangle(
    dino.x + dino.w * 0.05, dinoY - dino.h * 0.22,
    dino.x + dino.w * 0.15, dinoY - dino.h * 0.42,
    dino.x + dino.w * 0.22, dinoY - dino.h * 0.22
  );

  pop();

 // 畫障礙物
if (obstacleType === 0) {
  fill(128, 0, 255); // 紫色可穿越
} else {
  fill(255, 0, 0); // 紅色需跳躍
}
rect(obstacleX, obstacleY + obstacleH / 4, obstacleW, obstacleH, 10);

  // 顯示障礙物文字
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(obstacleLabel, obstacleX, obstacleY + obstacleH / 4);

  // 視訊畫面右下角
  image(video, width - video.width - 20, height - video.height - 20, video.width, video.height);

  // 遊戲結束提示
  if (gameOver) {
    fill(255, 0, 0);
    textSize(48);
    textAlign(CENTER, CENTER);
    text("Game Over", width / 2, height / 2 - 80);
    fill(50, 150, 200);
    textSize(32);
    text("點擊螢幕重新開始", width / 2, height / 2 - 30);
  }
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
  } else if (gameOver) {
    resetGame();
  }
}

// 畫雲朵
function drawCloud(x, y, size) {
  noStroke();
  fill(255, 255, 255, 220);
  ellipse(x, y, size, size * 0.6);
  ellipse(x + size * 0.4, y + size * 0.1, size * 0.7, size * 0.5);
  ellipse(x - size * 0.4, y + size * 0.15, size * 0.6, size * 0.4);
}

// 畫樹
function drawTree(x, y, w, h) {
  // 整棵樹往上移動一點（例如 -h*0.15）
  let offsetY = -h * 0.2;

  // 樹幹
  fill(120, 80, 40);
  rectMode(CENTER);
  rect(x, y + h * 0.35 + h * 0.35 + offsetY, w * 0.3, h * 0.7, 8);

  // 樹冠
  fill(34, 139, 34);
  ellipse(x + w * 0.15, y + h * 0.35 + offsetY, w * 1.2, h * 0.9);
  ellipse(x + w * 0.15, y + h * 0.15 + offsetY, w, h * 0.7);
}
