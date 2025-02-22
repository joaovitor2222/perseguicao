const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const luzStatus = document.getElementById("status-luz");
const btnDireita = document.getElementById("btnDireita");

canvas.width = 800;
canvas.height = 400;

let player = { x: 50, y: 350, radius: 10, speed: 2 };
let euaBalls = [];
let obstaculos = [];
let luzVerde = true;
let movendo = false;
let venceu = false;
let gameOver = false;

// Alterna a luz a cada 10 segundos
setInterval(() => {
    luzVerde = !luzVerde;
    luzStatus.style.backgroundColor = luzVerde ? "green" : "red";
}, 10000);

function update() {
    if (gameOver || venceu) return;

    // Verifica se o jogador está colidindo com um obstáculo
    let playerSpeed = player.speed;
    if (verificarColisaoComObstaculo(player.x, player.y, player.radius)) {
        playerSpeed *= 0.6;  // Lentidão de 40% no jogador
    }

    // Movimentação do jogador
    if (movendo) {
        player.x += playerSpeed;  // Usando playerSpeed que pode ter sido reduzido
    }

    // Movimento do EUA Ball
    euaBalls.forEach(eua => {
        let euaSpeed = eua.speed;
        if (verificarColisaoComObstaculo(eua.x, eua.y, eua.radius)) {
            euaSpeed *= 0.6;  // Lentidão de 40% nas bolas dos EUA
        }

        // Movimento do EUA Ball
        if (luzVerde) {
            eua.x += euaSpeed / 2;
        } else {
            eua.x += euaSpeed * 1.5;
        }

        // Verifica colisão com o player
        if (Math.hypot(player.x - eua.x, player.y - eua.y) < 20) {
            alert("Game Over! O EUA Ball te pegou!");
            resetGame();
        }
    });

    // Verifica se o player atingiu a linha de chegada
    if (player.x >= canvas.width - 30) {
        alert("Você venceu!");
        venceu = true;
    }

    draw();
}

// Função para verificar a colisão do jogador ou bolas dos EUA com obstáculos
function verificarColisaoComObstaculo(x, y, radius) {
    for (let obs of obstaculos) {
        if (x + radius > obs.x && x - radius < obs.x + obs.width &&
            y + radius > obs.y && y - radius < obs.y + obs.height) {
            return true;  // Colidiu com um obstáculo
        }
    }
    return false;  // Não colidiu
}


// Criamos um objeto de imagem global para evitar recriação constante
let euaBallImg = new Image();

// Carregar a imagem salva no localStorage
let euaBallImgSrc = localStorage.getItem("euaBallImg") || 
    "https://static.wikia.nocookie.net/villains/images/f/ff/Estados_Unidos_Countryball.png/revision/latest/thumbnail/width/360/height/360?cb=20230320154917&path-prefix=pt-br";


    // Verifica se há um mapa salvo e carrega a imagem escolhida
    if (localStorage.getItem("mapaCustomizado")) {
        const mapa = JSON.parse(localStorage.getItem("mapaCustomizado"));
        
        // Carregar o player com a velocidade configurada
        player = { x: mapa.player.x, y: mapa.player.y, radius: 10, speed: parseInt(mapa.playerSpeed) };
        
        // Aplicar a velocidade configurada nas EUA Balls
        const euaSpeedModifier = parseFloat(mapa.euaSpeed); // Pega o valor de euaSpeed do mapa
        
        euaBalls = mapa.euaBalls.map(ball => ({
            x: ball.x,
            y: ball.y,
            radius: 15,
            speed: 1 * euaSpeedModifier // Aplica a multiplicação pela velocidade configurada
        }));
    
        obstaculos = mapa.obstaculos.map(obs => ({ x: obs.x, y: obs.y, width: obs.width, height: obs.height }));
        euaBallImgSrc = mapa.euaBallImg || "https://static.wikia.nocookie.net/villains/images/f/ff/Estados_Unidos_Countryball.png/revision/latest/thumbnail/width/360/height/360?cb=20230320154917&path-prefix=pt-br";
    }

// Definimos a imagem
euaBallImg.src = euaBallImgSrc;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Linha de chegada
    ctx.fillStyle = "yellow";
    ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);

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
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
}

function voltarAoEditor() {
    window.location.href = "editor.html";
}



function resetGame() {
    player.x = 50;
    euaBalls.forEach(ball => ball.x = 10);
}

// Controles do jogador
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
        movendo = true;
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight") {
        movendo = false;
    }
});

// Controles para celulares
btnDireita.addEventListener("touchstart", () => { movendo = true; });
btnDireita.addEventListener("touchend", () => { movendo = false; });

setInterval(update, 50);

