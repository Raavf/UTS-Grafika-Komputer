// ==============================
// ====  BAGIAN GRAFIKA  ========
// ==============================

let image_data;
let canvas_handler;
let context;

// inisialisasi canvas
function init_graphics(nama_canvas) {
  canvas_handler = document.querySelector("#" + nama_canvas);
  context = canvas_handler.getContext("2d");

  // buat background putih
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas_handler.width, canvas_handler.height);

  image_data = context.getImageData(0, 0, canvas_handler.width, canvas_handler.height);
}

// menampilkan buffer ke layar
function finish_drawing() {
  context.putImageData(image_data, 0, 0);
}

// menggambar 1 titik
function drawDot(x, y, color) {
  let index = 4 * (Math.floor(x) + (Math.floor(y) * canvas_handler.width));
  image_data.data[index] = color.r;
  image_data.data[index+1] = color.g;
  image_data.data[index+2] = color.b;
  image_data.data[index+3] = 255;
}

function dda_line(x1,y1,x2,y2, r,g,b){
    var dx = x2 - x1;
    var dy = y2 - y1;

    if ( Math.abs(dx) > Math.abs(dy) ) {
        //jalan di x
        var x = x1;
        var y = y1;
        if(x2 > x1){
            var y = y1
            //kanan
            for(var x = x1; x<x2; x++){
                y = y + dy/Math.abs(dx);
                drawDot(x,y, r,g,b)
            }
        }
        else { //x2 < x1
            //kiri
            var y = y1
            for(var x = x1; x>x2; x--){
                y = y + dy/Math.abs(dx);
                drawDot(x,y, r,g,b)
            }
        }
    }
    else{
        //jalan di y
        if(y2 > y1){
            var x = x1
            //kanan
            for(var y = y1; y<y2; y++){
                x = x + dx/Math.abs(dy);
                drawDot(x,y, r,g,b)
            }
        }
        else { //x2 < x1
            //kiri 
            var x = x1
            for(var y = y1; y>y2; y--){
                x = x + dx/Math.abs(dy);
                drawDot(x,y, r,g,b)
            }
        }
    }
}

function drawLine(x1, y1, x2, y2, color) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let steps = Math.max(Math.abs(dx), Math.abs(dy));
  let x_inc = dx / steps;
  let y_inc = dy / steps;
  let x = x1;
  let y = y1;
  for (let i = 0; i <= steps; i++) {
    drawDot(x, y, color);
    x += x_inc;
    y += y_inc;
  }
}

function polyline(points, color) {
  for (let i = 0; i < points.length - 1; i++) {
    let p1 = points[i];
    let p2 = points[i + 1];
    drawLine(p1.x, p1.y, p2.x, p2.y, color);
  }
}

function polygon(points, color) {
  polyline(points, color);
  let p1 = points[points.length - 1];
  let p2 = points[0];
  drawLine(p1.x, p1.y, p2.x, p2.y, color);
}

// menggambar persegi panjang (bar)
function drawBar(x, yBottom, width, height, color) {
  const yTop = yBottom - height;
  const points = [
    { x: x, y: yBottom },
    { x: x + width, y: yBottom },
    { x: x + width, y: yTop },
    { x: x, y: yTop }
  ];
  polygon(points, color);
}

// membersihkan layar
function clear_screen() {
  context.clearRect(0, 0, canvas_handler.width, canvas_handler.height);
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas_handler.width, canvas_handler.height);
  image_data = context.getImageData(0, 0, canvas_handler.width, canvas_handler.height);
}

// ==============================
// ====  BAGIAN SORTING  ========
// ==============================

const canvasName = "canvas";
init_graphics(canvasName);

const input = document.getElementById("fname");
const tombolMasukkan = document.getElementById("Masukkan");
const tombolUrutkan = document.getElementById("Urutkan");
const form = document.querySelector("form");

let angka = [];
const MAX_ANGKA = 10;
const BAR_WIDTH = 50;
const BASE_Y = 250;
const GAP = 60;

// cegah reload saat tekan Enter
form.addEventListener("submit", e => e.preventDefault());
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    tombolMasukkan.click();
  }
});

// menggambar semua bar
function gambarAngka(highlightIndex = -1) {
  clear_screen();

  for (let i = 0; i < angka.length; i++) {
    const color = (i === highlightIndex)
      ? { r: 255, g: 0, b: 0 }  // merah
      : { r: 0, g: 0, b: 255 }; // biru

    const x = 50 + i * GAP;
    const tinggi = angka[i] * 4;

    drawBar(x, BASE_Y, BAR_WIDTH, tinggi, color);
  }

  finish_drawing();

  // tulis angka di bawah bar
  context.fillStyle = "black";
  context.font = "18px Arial";
  for (let i = 0; i < angka.length; i++) {
    const x = 50 + i * GAP + 15;
    context.fillText(angka[i], x, BASE_Y + 20);
  }
}

// tombol masukkan angka
tombolMasukkan.addEventListener("click", function () {
  const nilai = parseInt(input.value);
  if (isNaN(nilai) || nilai < 0 || nilai > 50) {
    alert("Masukkan angka antara 0 dan 50!");
    return;
  }

  if (angka.length >= MAX_ANGKA) {
    alert("Maksimal 10 angka saja!");
    return;
  }

  angka.push(nilai);
  input.value = "";
  gambarAngka();
});

// helper delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// insertion sort animasi
tombolUrutkan.addEventListener("click", async function () {
  for (let i = 1; i < angka.length; i++) {
    let key = angka[i];
    let j = i - 1;

    gambarAngka(i);
    await delay(400);

    while (j >= 0 && angka[j] > key) {
      angka[j + 1] = angka[j];
      j--;
      gambarAngka(j + 1);
      await delay(300);
    }

    angka[j + 1] = key;
    gambarAngka(j + 1);
    await delay(400);
  }

  gambarAngka();
});
