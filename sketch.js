let grasses = [];
let bubbles = []; // 新增：水泡陣列
let fishes = []; // 新增：小魚陣列
let particles = []; // 新增：爆破粒子陣列
let popSound;
const plantColors = ["#006030", "#01814A", "#019858", "#01B468", "#02C874", "#02DF82", "#009100", "#00A600"];

function preload() {
  popSound = loadSound("pop.mp3");
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.style('position', 'fixed'); // 固定 Canvas 位置
  cnv.style('z-index', '1'); // 設定 Canvas 為上層
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透 Canvas

  let iframe = createElement('iframe'); // 建立 iframe
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'fixed'); // 固定 iframe 位置
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.size(windowWidth, windowHeight);
  iframe.style('border', 'none');
  iframe.style('z-index', '0'); // 將 iframe 設為底層 (0)，確保可見且位於 Canvas 後方

  // 產生 80 條水草，由左至右分佈
  for (let i = 0; i < 60; i++) {
    // 將 i 對應到視窗寬度，並加入一點隨機位置偏移
    let x = map(i, 0, 60, 0, width);
    grasses.push(new Grass(x));
  }
  // 產生 10 條小魚
  for (let i = 0; i < 10; i++) {
    fishes.push(new Fish());
  }
}

function draw() {
  clear(); // 清除畫布背景設為全透明，以顯示後方的 iframe 網頁
  blendMode(BLEND); // 設定混合模式讓透明度產生疊加效果
  // 繪製每一條水草
  for (let g of grasses) {
    g.display();
  }

  // 更新並繪製小魚
  for (let f of fishes) {
    f.update();
    f.display();
  }

  // 隨機產生水泡
  if (random() < 0.25) {
    bubbles.push(new Bubble());
  }

  // 更新並繪製水泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.update();
    b.display();
    if (b.checkPop()) {
      // 當水泡破裂時，產生爆破粒子效果
      popSound.play();
      for (let j = 0; j < 6; j++) {
        particles.push(new Particle(b.x, b.y));
      }
      bubbles.splice(i, 1);
    }
  }

  // 更新並繪製爆破粒子
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.display();
    if (p.isDead()) {
      particles.splice(i, 1);
    }
  }
}

class Grass {
  constructor(x) {
    this.x = x + random(-10, 10); // 基礎 X 位置
    this.color = random(plantColors); // 隨機顏色
    this.heightLen = random(height * 0.2, height * 0.4); // 高度為視窗 20%~40%
    this.thickness = random(30, 50); // 粗細 30~50
    this.swaySpeed = random(0.005, 0.02); // 搖晃速度不均
    this.noiseOffset = random(1000); // 隨機噪聲起始點，讓每條擺動狀態不同
  }

  display() {
    let c = color(this.color); // 將 HEX 字串轉為顏色物件
    c.setAlpha(200); // 設定透明度 (範圍 0-255)，150 約為 60% 不透明
    stroke(c);
    strokeWeight(this.thickness);
    noFill();

    let topY = height - this.heightLen;

    beginShape();
    curveVertex(this.x, height); // 底部控制點
    for (let y = height; y >= topY; y -= 10) {
      // 計算擺動：使用各自的 swaySpeed 與 noiseOffset
      let noiseVal = noise(y * 0.01, frameCount * this.swaySpeed + this.noiseOffset);
      let xOffset = map(noiseVal, 0, 1, -50, 50);
      
      // 計算擺動係數：底部固定，越往上擺動越大
      let factor = (height - y) / this.heightLen;
      let x = this.x + xOffset * factor;
      curveVertex(x, y);
    }
    // 結束控制點，確保線條畫到頂端
    curveVertex(this.x, topY);
    endShape();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + 10;
    this.size = random(10, 20);
    this.speed = random(1, 3);
    this.popY = random(height * 0.1, height * 0.7); // 設定隨機破裂高度
  }

  update() {
    this.y -= this.speed;
    this.x += sin(frameCount * 0.05 + this.y) * 0.5; // 模擬氣泡上升時的左右輕微搖晃
  }

  display() {
    noStroke();
    fill(255, 127); // 白色，透明度 0.5 (127/255)
    circle(this.x, this.y, this.size);
    
    // 左上角反光效果
    fill(255, 200);
    circle(this.x - this.size * 0.25, this.y - this.size * 0.25, this.size * 0.3);
  }

  checkPop() {
    // 檢查是否到達破裂高度
    return this.y < this.popY;
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-2, 2); // 向四面八方擴散
    this.vy = random(-2, 2);
    this.alpha = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 10; // 逐漸消失
  }

  display() {
    noStroke();
    fill(255, this.alpha);
    circle(this.x, this.y, 3);
  }

  isDead() {
    return this.alpha <= 0;
  }
}

class Fish {
  constructor() {
    this.x = random(width);
    this.y = random(height * 0.2, height * 0.8); // 避免太靠近頂部或底部
    this.size = random(20, 40); // 魚的大小
    this.speed = random(1, 3) * (random() > 0.5 ? 1 : -1); // 隨機左右游動
    this.color = color(random(200, 255), random(100, 200), random(50, 150)); // 暖色系顏色
  }

  update() {
    this.x += this.speed;
    
    // 邊界檢查：超出畫面時從另一側出現
    if (this.speed > 0 && this.x > width + 50) {
      this.x = -50;
      this.y = random(height * 0.2, height * 0.8);
    } else if (this.speed < 0 && this.x < -50) {
      this.x = width + 50;
      this.y = random(height * 0.2, height * 0.8);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    // 根據移動方向翻轉魚身 (假設預設畫法是頭朝右)
    if (this.speed < 0) {
      scale(-1, 1);
    }
    noStroke();
    fill(this.color);
    ellipse(0, 0, this.size, this.size * 0.6); // 身體
    triangle(-this.size * 0.4, 0, -this.size * 0.8, -this.size * 0.3, -this.size * 0.8, this.size * 0.3); // 尾巴
    fill(255); circle(this.size * 0.2, -this.size * 0.1, this.size * 0.15); // 眼白
    fill(0); circle(this.size * 0.25, -this.size * 0.1, this.size * 0.05); // 眼珠
    pop();
  }
}
