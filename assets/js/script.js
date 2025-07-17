let currentPlayerName = "";

// Constantes para representar as classes CSS dos elementos do jogo
const FRONT = "card_front"; // Classe CSS para a face frontal da carta
const BACK = "card_back";   // Classe CSS para a face traseira da carta
const CARD = "card";        // Classe CSS para o elemento carta
const ICON = "icon";        // Classe CSS para o ícone da carta

// Selecionando os elementos relevantes do HTML
const cardClick = document.getElementById("card-click"); // Som ao clicar em uma carta
const cardCheck = document.getElementById("card-check"); // Som de verificação de par
const cardWin = document.getElementById("card-win");     // Som de vitória
const cardStart = document.getElementById("card-start"); // Som de início do jogo

// Função para iniciar o jogo
function startGame() {
  document.getElementById("time").parentElement.classList.remove("oculto");
  document.getElementById("ranking").classList.add("oculto");

  const nameInput = document.getElementById("playerName");
  if (!nameInput.value.trim()) {
    alert("Por favor, insira seu nome.");
    return;
  }
  currentPlayerName = nameInput.value.trim();

  // Esconde a tela de início do jogo
  let gameStartLayer = document.getElementById("gameStart");
  gameStartLayer.style.display = "none";

  // ✅ Limpa o tabuleiro antes de criar novas cartas
  document.getElementById("gameBoard").innerHTML = "";

  // Inicia a trilha sonora do jogo
  cardStart.play();

  // Funções relacionadas ao tempo do jogo
  stopTime();         // Para o tempo
  verificarLocalStorage(); // Verifica se há registros no armazenamento local
  startTime();        // Inicia o tempo

  // Inicializa as cartas do jogo
  initializeCards(game.createCardsFromTechs()); // Cria e exibe as cartas
}

// Função para inicializar as cartas do jogo
function initializeCards(cards) {
  let gameBoard = document.getElementById("gameBoard"); // Elemento contendo as cartas
  gameBoard.innerHTML = ""; // Limpa o conteúdo existente

  // Para cada carta, cria um elemento HTML correspondente
  game.cards.forEach((card) => {
    let cardElement = document.createElement("div"); // Cria um elemento de carta
    cardElement.id = card.id;                        // Define um ID único para a carta
    cardElement.classList.add(CARD);                 // Adiciona a classe CSS "card"
    cardElement.dataset.icon = card.icon;            // Define o ícone da carta

    // Adiciona uma classe "flip" às cartas, para animação
    setTimeout(() => {
      cardElement.classList.add("flip"); // Adiciona a classe de virada para animação
    }, 300);
    setTimeout(() => {
      cardElement.classList.remove("flip"); // Remove a classe de virada após um tempo
    }, 2000);

    // Cria o conteúdo da carta (frente e verso)
    createCardContent(card, cardElement); // Cria o conteúdo da carta
    cardElement.addEventListener("click", flipCard); // Adiciona evento de clique
    gameBoard.appendChild(cardElement); // Adiciona a carta ao tabuleiro
  });
}

// Função para criar o conteúdo de uma carta
function createCardContent(card, cardElement) {
  createCardFace(FRONT, card, cardElement); // Cria a face frontal da carta
  createCardFace(BACK, card, cardElement);  // Cria a face traseira da carta
}

// Função para criar a face de uma carta (frente ou verso)
function createCardFace(face, card, element) {
  let cardElementFace = document.createElement("div"); // Cria um elemento para a face da carta
  cardElementFace.classList.add(face);                // Adiciona a classe correspondente (frente ou verso)
  if (face === FRONT) {
    // Se a face for a frente da carta, cria e adiciona a imagem do ícone
    let iconElement = document.createElement("img"); // Cria um elemento de imagem
    iconElement.classList.add(ICON);                 // Adiciona a classe de ícone
    iconElement.src = "./assets/img/" + card.icon + ".png"; // Define a fonte da imagem do ícone
    cardElementFace.appendChild(iconElement); // Adiciona o ícone à face da carta
  } else {
    // Se a face for o verso da carta, cria e adiciona a imagem padrão do verso
    let iconElement = document.createElement("img"); // Cria um elemento de imagem
    iconElement.classList.add(ICON);                 // Adiciona a classe de ícone
    iconElement.src = "./assets/img/card.png";       // Define a fonte da imagem do verso
    cardElementFace.appendChild(iconElement); // Adiciona o verso à face da carta
  }
  element.appendChild(cardElementFace); // Adiciona a face criada ao elemento da carta
}

// Função para virar uma carta ao clicar nela
function flipCard() {
  if (game.setCard(this.id)) {
    this.classList.add("flip");
    cardClick.play();

    if (game.secondCard) {
      if (game.checkMatch()) {
        game.clearCards();
        cardCheck.play();

        if (game.checkGameOver()) {
          console.log("🏁 Fim de jogo");
          const gameOverLayer = document.getElementById("gameOver");
          const resultadoP = document.getElementById("resultado");

          pauseTime();
          cardWin.play();

          resultadoP.innerHTML = `Parabéns! 🥳<br><br>Tempo de jogo ${calculateTime(time)} ⏱️`;
          gameOverLayer.style.display = "flex";

          compararTime(time);
          salvarNoRanking(currentPlayerName, time);
          exibirRanking();

          setTimeout(() => {
            restart(); // ← reinicia tudo corretamente
          }, 5000);
        }
      } else {
        // Se as cartas não forem iguais
        setTimeout(() => {
          let firstCardView = document.getElementById(game.firstCard.id);
          let secondCardView = document.getElementById(game.secondCard.id);

          firstCardView.classList.remove("flip");
          secondCardView.classList.remove("flip");
          game.unflipCards();
        }, 1000);
      }
    }
  }
}

// Função para reiniciar o jogo
function restart() {
  console.log("🔁 Reiniciando...");

  game.clearCards();
  game.cards = [];

  pauseTime();
  stopTime();
  time = 0;

  // Oculta a tela de Parabéns
  document.getElementById("gameOver").style.display = "none";

  // ✅ Exibe a tela inicial forçando a classe
  const startScreen = document.getElementById("gameStart");
  startScreen.style.display = "flex"; // segurança extra
  startScreen.classList.add("mostrar");

  document.getElementById("ranking").classList.add("oculto");
  document.getElementById("time").parentElement.classList.add("oculto");
  document.getElementById("top3Container").classList.remove("oculto");

  document.getElementById("gameBoard").innerHTML = "";
  document.getElementById("playerName").value = "";

  verificarLocalStorage();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Funções relacionadas ao tempo do jogo
let interval;             // Variável para o intervalo de tempo
let time = 0;             // Tempo inicial
let timeP = document.getElementById("time"); // Elemento para exibir o tempo

function startTime() {
  let startTime = Date.now() - time; // Inicia o tempo de contagem a partir do tempo anterior
  interval = setInterval(() => {
    time = Date.now() - startTime; // Calcula o tempo decorrido
    timeP.textContent = calculateTime(time); // Atualiza o tempo exibido na tela
  }, 1000); // Atualiza a cada segundo
}

function pauseTime() {
  clearInterval(interval); // Pausa o intervalo de tempo
  timeP.textContent = calculateTime(time); // Atualiza o tempo exibido na tela
}

function stopTime() {
  time = 0; // Reseta o tempo para zero
  clearInterval(interval); // Para o intervalo de tempo
  timeP.textContent = "00:00"; // Reinicia o texto exibido na tela para zero
}

function calculateTime(time) {
  let totalSeconds = Math.floor(time / 1000); // Calcula o total de segundos
  let totalMinutes = Math.floor(totalSeconds / 60); // Calcula o total de minutos

  let displaySeconds = (totalSeconds % 60).toString().padStart(2, "0"); // Formata os segundos
  let displayMinutes = totalMinutes.toString().padStart(2, "0"); // Formata os minutos

  return `${displayMinutes}:${displaySeconds}`; // Retorna o tempo formatado como string
}

// Funções para verificar e exibir o TOP dos menores tempos
function verificarLocalStorage() {
  const ul = document.getElementById("recordeLista");
  const top3Container = document.getElementById("top3Container");

  // Se o ranking estiver visível, oculta o TOP 3
  const rankingVisivel = !document.getElementById("ranking").classList.contains("oculto");

  if (rankingVisivel) {
    top3Container.classList.add("oculto");
    return; // Não continua preenchendo lista do TOP 3
  } else {
    top3Container.classList.remove("oculto");
  }

  ul.innerHTML = "";

  const ranking = JSON.parse(localStorage.getItem("ranking"));

  if (ranking && ranking.length > 0) {
    ranking.slice(0, 3).forEach((jogador, index) => {
      const li = document.createElement("li");
      li.textContent = `${index + 1}º ${jogador.nome} ${jogador.tempo}`;
      ul.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "Nenhum recorde registrado";
    ul.appendChild(li);
  }
}


function compararTime(time) {
  const tempoAtual = calculateTime(time);
  const tempoSalvo = localStorage.getItem("time");

  // Se não for exibir no HTML, só mantém no localStorage
  if (!tempoSalvo) {
    localStorage.setItem("time", tempoAtual);
    return;
  }

  const [minA, segA] = tempoAtual.split(":").map(Number);
  const [minB, segB] = tempoSalvo.split(":").map(Number);

  const segundosAtual = minA * 60 + segA;
  const segundosSalvo = minB * 60 + segB;

  if (segundosAtual < segundosSalvo) {
    localStorage.setItem("time", tempoAtual);
  }
}


// Função de inicialização quando a página é carregada
document.addEventListener("DOMContentLoaded", function () {
  const top3Container = document.getElementById("top3Container");
  const rankingSection = document.getElementById("ranking");

  // Oculta o TOP 3 se estiver visualizando o ranking
  if (!rankingSection.classList.contains("oculto")) {
    top3Container.classList.add("oculto");
  } else {
    top3Container.classList.remove("oculto");
    verificarLocalStorage();
  }

  exibirRanking();
  document.getElementById("playerName").value = "";
});


// Função para resetar o recorde
// document.getElementById("resetRecorde").addEventListener("click", function () {
//   localStorage.removeItem("time");
//   verificarLocalStorage(); // Atualiza a exibição do recorde
// });

function salvarNoRanking(nome, tempoMs) {
  const tempoFormatado = calculateTime(tempoMs);
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.push({ nome, tempo: tempoFormatado });

  // Ordena do menor para o maior tempo
  ranking.sort((a, b) => {
    const [minA, segA] = a.tempo.split(":").map(Number);
    const [minB, segB] = b.tempo.split(":").map(Number);
    return (minA * 60 + segA) - (minB * 60 + segB);
  });

  // Limita a 5 melhores posições
  const topRanking = ranking.slice(0, 5);

  localStorage.setItem("ranking", JSON.stringify(topRanking));
}

// Funação para exibir o Ranking
function exibirRanking() {
  const rankingList = document.getElementById("rankingList");
  rankingList.innerHTML = "";

  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  ranking.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span class="nome">${index + 1}º - ${item.nome}</span>
      <span class="tempo">${item.tempo}</span>
    `;

    rankingList.appendChild(li);
  });
}


// Função para redirecionar para tela de Ranking
function irParaRanking() {
  const gameStart = document.getElementById("gameStart");
  gameStart.style.display = "none";

  const rankingSection = document.getElementById("ranking");
  rankingSection.classList.remove("oculto");

  // Oculta o tempo
  document.getElementById("time").parentElement.classList.add("oculto");

  // ✅ Força ocultar o container completo do TOP 3 (inclui o texto e a lista)
  const top3Container = document.getElementById("top3Container");
  if (top3Container) {
    top3Container.classList.add("oculto"); // ← isso oculta o <p> e o <ul> juntos
  }

  rankingSection.scrollIntoView({ behavior: "smooth" });
}


// Função para retornar a tela inicial
function voltarTelaInicial() {
  const gameStart = document.getElementById("gameStart");
  gameStart.style.display = "flex";

  document.getElementById("ranking").classList.add("oculto");
  document.getElementById("time").parentElement.classList.add("oculto");
  document.getElementById("top3Container").classList.remove("oculto");

  document.getElementById("gameBoard").innerHTML = "";
  document.getElementById("playerName").value = "";

  // ⚠️ Importante: reseta o objeto game
  game.clearCards();
  game.cards = [];

  time = 0;
  pauseTime();
  stopTime();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Função para resetar o Ranking e o Tempo Recorde
function resetarRanking() {
  const confirmar = confirm("Tem certeza que deseja resetar o ranking e o recorde?");
  if (confirmar) {
    localStorage.removeItem("ranking");
    localStorage.removeItem("time");
    verificarLocalStorage();
    exibirRanking();
    alert("Ranking e recorde foram resetados!");
  }
}
