const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const luzStatus = document.getElementById("status-luz");
const btnDireita = document.getElementById("btnDireita");
const btnCongelar = document.getElementById("btnCongelar");
const moedaDisplay = document.getElementById("moedaDisplay");

canvas.width = 800;
canvas.height = 400;

const player = { x: 50, y: 350, radius: 10, speed: 2 };
const euaBall = { x: 10, y: 350, radius: 15, speed: 1 };

let luzVerde = true;
let gameOver = false;
let venceu = false;
let moveuNaLuzVermelha = false;
let euaBallParado = true;
let congelado = false;
let moedas = localStorage.getItem("moedas") ? parseInt(localStorage.getItem("moedas")) : 0;

// Upgrades
let upgradeLuz = 0;
let upgradeSpeed = 0;
let tempoLuzVermelha = 8000; // 8 segundos padrão

let tempoMovendo = 0; // Conta o tempo de movimento do jogador

let movendo = false; // Verifica se o jogador está se movendo

// Verifica se o jogador já comprou o botão congelar antes de recarregar a página
let temBotaoCongelar = localStorage.getItem("temBotaoCongelar") === "true";


// EUA Ball só começa a se mover depois de 5 segundos no início do jogo
setTimeout(() => {
    euaBallParado = false;
}, 5000);

function mudarLuz() {
    luzVerde = !luzVerde;
    luzStatus.style.backgroundColor = luzVerde ? "green" : "red";
    moveuNaLuzVermelha = false; // Reseta a penalização
}

// Alterna a luz a cada 10 segundos
setInterval(mudarLuz, 10000);

// Esta função será chamada quando o jogador for pego.
function jogadorFoiPegado() {
    if (!movendo && luzVerde === false) {
        // Se o jogador não se moveu na luz vermelha, ele recebe 5 moedas extras.
        moedas += 1;
        localStorage.setItem("moedas", moedas);
        moedaDisplay.innerText = `Moedas: ${moedas}`; // Exibe o valor atualizado de moedas
    }
    // Reinicia o jogo após ser pego
    resetGame();
}

function update() {
    if (gameOver || venceu) return;

    let velocidadeEua = 0;

    // Verifica se o EUA Ball está congelado, se sim, ele não se move
    if (!euaBallParado && !congelado) {
        if (luzVerde) {
            // Se a luz estiver verde, o EUA Ball se move com metade da velocidade do jogador
            velocidadeEua = player.speed / 2;
        } else {
            // Se o jogador está se movendo e a luz é vermelha
            if (movendo) {
                // Se o jogador se moveu na luz vermelha, o EUA Ball fica 4 vezes mais rápido
                velocidadeEua = player.speed * 4;
                moveuNaLuzVermelha = true;  // Marca que o jogador está se movendo na luz vermelha
            } else {
                // Se o jogador não se move, o EUA Ball se move 1.3x mais rápido
                velocidadeEua = player.speed * 1.3;
                moveuNaLuzVermelha = false;  // Marca que o jogador não está se movendo
            }
        }
    }

    if (efeitoCongelamentoDuracao > 0) {
        if (luzVerde) {
            velocidadeEua = player.speed * 0.5;  // EUA Ball fica 50% mais lento após congelamento na luz verde
        } else if (movendo) {
            velocidadeEua = player.speed * 2;  // EUA Ball fica 2x mais rápido que o jogador na luz vermelha se ele se mover
        } else {
            velocidadeEua = player.speed * 0.5;  // EUA Ball fica 50% mais lento na luz vermelha se jogador não se mover
        }

        efeitoCongelamentoDuracao -= 50;  // Reduz o tempo do efeito a cada 50ms
    }

    // Atualiza a posição do EUA Ball
    euaBall.x += velocidadeEua;

    // Verifica se o jogador colidiu com o EUA Ball
    if (Math.abs(player.x - euaBall.x) < 20) {
        alert("Game Over! O EUA Ball te pegou!");
        resetGame();  // Reinicia o jogo
    }

    // Verifica se o jogador atingiu a linha de vitória
    if (player.x >= canvas.width - 30) {
        alert("Você venceu!");
        venceu = true;
    }

    draw();  // Desenha a cena
    moverJogador();  // Atualiza o movimento do jogador
}

function moverEUA() {
    // Verifica se a luz vermelha está ativa e se o jogador está se movendo
    if (luzVermelhaAtiva && movendo) {
        euaBallSpeed = 4 * playerSpeed;  // EUA Ball fica 4 vezes mais rápido
    } else {
        euaBallSpeed = playerSpeed;  // EUA Ball se move na mesma velocidade do jogador
    }

    // Lógica normal de movimento do EUA Ball
    if (euaBall.x < player.x) {
        euaBall.x += euaBallSpeed;
    } else if (euaBall.x > player.x) {
        euaBall.x -= euaBallSpeed;
    }

    // Outras lógicas de movimentação do EUA Ball...
}

let tempoLuzRed = 8;  // Tempo da luz vermelha
let tempoLuzVerde = 10;  // Tempo da luz verde

// Atualização do estado da luz
function atualizarLuz() {
    if (tempoLuzRed > 0) {
        luzVermelhaAtiva = true;  // Luz vermelha ativa
    } else {
        luzVermelhaAtiva = false;  // Luz verde ativa
    }
    
    // Atualiza os tempos
    tempoLuzRed--;
    tempoLuzVerde--;
    
    if (tempoLuzRed <= 0) {
        tempoLuzRed = 8;
        tempoLuzVerde = 10;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Linha de chegada
    ctx.fillStyle = "yellow";
    ctx.fillRect(canvas.width - 10, 0, 10, canvas.height);

    // EUA Ball
    const euaBallImg = new Image();
    euaBallImg.src = "https://static.wikia.nocookie.net/villains/images/f/ff/Estados_Unidos_Countryball.png/revision/latest/thumbnail/width/360/height/360?cb=20230320154917&path-prefix=pt-br";
    ctx.drawImage(euaBallImg, euaBall.x - 15, euaBall.y - 15, 30, 30);

    // Player
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
}

function moverJogador() {
    if (!gameOver && !venceu && movendo) {
        player.x += player.speed * (1 + upgradeSpeed);  // Move o jogador

        // A cada 50ms que o jogador se move, acumula o tempo
        tempoMovendo += 50; 

        // A cada 3 segundos (3000ms), dá uma moeda
        if (tempoMovendo >= 3000) {
            moedas++;
            tempoMovendo = 0; // Reseta o contador de tempo
            moedaDisplay.innerText = `Moedas: ${moedas}`;
            localStorage.setItem("moedas", moedas);
        }
    }
}

function iniciarMovimento() {
    movendo = true;
}

// Função para parar o movimento quando o botão for solto
function pararMovimento() {
    movendo = false;
}

// Função para resetar o jogo
function resetGame() {
    gameOver = false;
    venceu = false;
    player.x = 50;
    euaBall.x = 20;
    moveuNaLuzVermelha = false;

    // Concede 1 moedas extras toda vez que o jogo é resetado
    moedas += 1;
    localStorage.setItem("moedas", moedas);
    moedaDisplay.innerText = `Moedas: ${moedas}`; // Atualiza as moedas

    // Após 5 segundos, EUA Ball começa a se mover novamente
    setTimeout(() => {
        euaBallParado = false;
    }, 5000);
}

function comprarUpgrade(tipo) {
    if (tipo === "luz" && moedas >= 10 && upgradeLuz < 2500) {
        moedas -= 10;
        upgradeLuz += upgradeLuz === 0 ? 1000 : upgradeLuz === 1000 ? 1500 : 2500;
        tempoLuzVermelha -= upgradeLuz;
    }
    if (tipo === "speed" && moedas >= 15 && upgradeSpeed < 0.5) {
        moedas -= 15;
        upgradeSpeed += 0.1;
    }
    if (tipo === "congelar" && moedas >= 20 && !temBotaoCongelar) {
        moedas -= 20;
        temBotaoCongelar = true;
        localStorage.setItem("temBotaoCongelar", "true");
    }

    moedaDisplay.innerText = `Moedas: ${moedas}`;
    localStorage.setItem("moedas", moedas);
}

// Carrega mapa customizado, se existir
if (localStorage.getItem("mapaCustomizado")) {
    const mapa = JSON.parse(localStorage.getItem("mapaCustomizado"));
    player.speed = mapa.playerSpeed;
    euaBall.speed = mapa.euaSpeed;

    // Aplica obstáculos
    mapa.obstaculos.forEach(obs => {
        ctx.fillStyle = "black";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Adiciona EUA Balls adicionais
    mapa.euaBalls.forEach(ball => {
        ctx.drawImage(euaBallImg, ball.x, ball.y, 30, 30);
    });
}


btnDireita.addEventListener("touchstart", () => {
    movendo = true;  // Começa a mover o jogador
});

btnDireita.addEventListener("touchend", () => {
    movendo = false;  // Para de mover o jogador
});

let congelamentoDuracao = 0;  // Contador para o tempo do congelamento
let tempoCongelamentoEfeito = 0;  // Contador para o efeito de redução de velocidade (4 segundos)
let efeitoCongelamentoDuracao = 0;  // Contador para o efeito de redução de velocidade após congelamento (4 segundos)


btnCongelar.addEventListener("click", () => {
    if (temBotaoCongelar && !congelado) {
        // Verifica se o jogador tem moedas suficientes
        if (moedas >= 20) {
            moedas -= 20; // Desconta as 20 moedas
            localStorage.setItem("moedas", moedas); // Atualiza as moedas no localStorage
            moedaDisplay.innerText = `Moedas: ${moedas}`; // Exibe o valor atualizado de moedas

            congelado = true;  // Ativa o congelamento
            congelamentoDuracao = 3000;  // Congela o EUA Ball por 3 segundos

            setTimeout(() => {
                congelado = false;  // Descongela após 3 segundos
                aplicarLentidao();  // Aplica a lentidão após o congelamento
            }, congelamentoDuracao);
        } else {
            alert("Você não tem moedas suficientes para congelar!");
        }
    }
});

function aplicarLentidao() {
    efeitoCongelamentoDuracao = 4000;  // O efeito de lentidão dura 4 segundos

    // Aplica o efeito de lentidão
    setTimeout(() => {
        efeitoCongelamentoDuracao = 0;  // Reseta a duração após 4 segundos
    }, efeitoCongelamentoDuracao);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" && !movendo) {
        movendo = true;  // Começa a mover o jogador
    }
});

document.addEventListener("keyup", (event) => {
    if (event.key === "ArrowRight") {
        movendo = false; // Para de mover quando a tecla for solta
    }
});

setInterval(update, 50);
