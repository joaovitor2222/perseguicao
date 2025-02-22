const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

let playerSpeed = 2;
let euaSpeed = 1;
let obstaculos = [];
let euaBalls = [];
let player = null;
let selectedObject = null;  // Objeto que está sendo arrastado
let offsetX, offsetY;
let euaBallImg = new Image();
euaBallImg.src = "https://static.wikia.nocookie.net/villains/images/f/ff/Estados_Unidos_Countryball.png/revision/latest/thumbnail/width/360/height/360?cb=20230320154917&path-prefix=pt-br";

// Carrega um mapa salvo, se existir
if (localStorage.getItem("mapaCustomizado")) {
    const mapaSalvo = JSON.parse(localStorage.getItem("mapaCustomizado"));
    playerSpeed = mapaSalvo.playerSpeed;
    euaSpeed = mapaSalvo.euaSpeed;
    obstaculos = mapaSalvo.obstaculos || [];
    euaBalls = mapaSalvo.euaBalls || [];
    player = mapaSalvo.player || null;
    desenhar();
}

// Clicar na tela define a posição do player
canvas.addEventListener("click", (e) => {
    if (!player) {
        const rect = canvas.getBoundingClientRect();
        player = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            radius: 10
        };
        desenhar();
    }
});

// Adicionar obstáculo
function adicionarObstaculo() {
    let x = Math.random() * (canvas.width - 40);
    let y = Math.random() * (canvas.height - 40);
    obstaculos.push({ x, y, width: 40, height: 40 });
    desenhar();
}

// Adicionar EUA Ball
function adicionarEuaBall() {
    let x = Math.random() * (canvas.width - 30);
    let y = Math.random() * (canvas.height - 30);
    euaBalls.push({ x, y, radius: 15 });
    desenhar();
}

// Remover últimos itens
function removerUltimoObstaculo() {
    if (obstaculos.length > 0) {
        obstaculos.pop();
        desenhar();
    }
}

function removerUltimoEuaBall() {
    if (euaBalls.length > 0) {
        euaBalls.pop();
        desenhar();
    }
}

// Permitir arrastar objetos
canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    selectedObject = null;

    // Verifica se clicou no jogador
    if (player && Math.hypot(mouseX - player.x, mouseY - player.y) < player.radius) {
        selectedObject = player;
        offsetX = mouseX - player.x;
        offsetY = mouseY - player.y;
        return;
    }

    // Verifica se clicou em um obstáculo
    for (let obs of obstaculos) {
        if (mouseX >= obs.x && mouseX <= obs.x + obs.width &&
            mouseY >= obs.y && mouseY <= obs.y + obs.height) {
            selectedObject = obs;
            offsetX = mouseX - obs.x;
            offsetY = mouseY - obs.y;
            return;
        }
    }

    // Verifica se clicou em um EUA Ball
    for (let ball of euaBalls) {
        if (Math.hypot(mouseX - ball.x, mouseY - ball.y) < ball.radius) {
            selectedObject = ball;
            offsetX = mouseX - ball.x;
            offsetY = mouseY - ball.y;
            return;
        }
    }
});

function verificarColisaoComObstaculo(x, y, radius) {
    for (let obs of obstaculos) {
        if (x + radius > obs.x && x - radius < obs.x + obs.width &&
            y + radius > obs.y && y - radius < obs.y + obs.height) {
            return true;  // Colidiu com um obstáculo
        }
    }
    return false;  // Não colidiu
}


// Mover objeto arrastado
canvas.addEventListener("mousemove", (e) => {
    if (selectedObject) {
        const rect = canvas.getBoundingClientRect();
        selectedObject.x = e.clientX - rect.left - offsetX;
        selectedObject.y = e.clientY - rect.top - offsetY;
        desenhar();
    }
});

// Soltar objeto
canvas.addEventListener("mouseup", () => {
    selectedObject = null;
});

let euaBallImgSrc = "https://static.wikia.nocookie.net/villains/images/f/ff/Estados_Unidos_Countryball.png/revision/latest/thumbnail/width/360/height/360?cb=20230320154917&path-prefix=pt-br";

// Verifica se o jogador já salvou uma imagem antes
if (localStorage.getItem("euaBallImg")) {
    euaBallImgSrc = localStorage.getItem("euaBallImg");
    document.getElementById("previewImagem").src = euaBallImgSrc;
}

// Desenhar todos os elementos na tela
function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Obstáculos
    ctx.fillStyle = "black";
    obstaculos.forEach(obs => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // EUA Balls
    euaBalls.forEach(ball => {
        ctx.drawImage(euaBallImg, ball.x - ball.radius, ball.y - ball.radius, 30, 30);
    });

    // Player
    if (player) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function alterarImagem() {
    const input = document.getElementById("inputImagem");
    const file = input.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            euaBallImgSrc = e.target.result;
            document.getElementById("previewImagem").src = euaBallImgSrc;
            localStorage.setItem("euaBallImg", euaBallImgSrc);
            alert("Imagem alterada com sucesso!");
        };
        reader.readAsDataURL(file);
    } else {
        alert("Nenhuma imagem selecionada!");
    }
}

// Salvar o mapa
function salvarMapa() {
    if (!player) {
        alert("Por favor, clique para definir a posição inicial do jogador antes de salvar!");
        return;
    }

    const dadosMapa = {
        player: { x: player.x, y: player.y },
        playerSpeed: document.getElementById("playerSpeed").value,
        euaSpeed: document.getElementById("euaSpeed").value,
        obstaculos: obstaculos.map(obs => ({ x: obs.x, y: obs.y, width: obs.width, height: obs.height })),
        euaBalls: euaBalls.map(ball => ({ x: ball.x, y: ball.y, radius: ball.radius })),
        euaBallImg: euaBallImgSrc // Salva a imagem escolhida
    };

    localStorage.setItem("mapaCustomizado", JSON.stringify(dadosMapa));
    alert("Mapa salvo com sucesso!");
}


// Testar o mapa antes de salvar
function testarMapa() {
    if (!player) {
        alert("Defina a posição do jogador antes de testar!");
        return;
    }
    salvarMapa();
    window.location.href = "testar.html";
}

// Função para remover o player manualmente (caso bugue)
function removerPlayer() {
    player = null;
    desenhar();
}



function voltarAoJogo() {
    window.location.href = "index.html";
}
