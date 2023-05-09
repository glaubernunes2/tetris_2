"use strict";
const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(20, 20);

const controles = document.querySelectorAll(".controles i");
const controlesLaterais = document.querySelectorAll(".controles-laterais i");

let score = 0;
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");

// Obtenha pontuação alta do armazenamento local
scoreElement.ininnerText = `Score: ${score}`;
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;


function limparArena(){
    //Essa função vai limpar a arena
    let contadorLinha = 1;
    outer: for(let y = arena.length - 1; y > 0; --y){
        for(let x = 0; x < arena[y].length; ++x){
            if(arena[y][x] === 0){
                continue outer;
            }
        }

        const linha = arena.splice(y, 1)[0].fill(0);
        arena.unshift(linha);
        ++y;
        score += contadorLinha * 10;
        contadorLinha *= 2;
        scoreElement.innerText = `Score: ${score}`;

    }
}

function colidir(arena, player){

    const m = player.matrix;
    const o = player.pos;
    for(let y = 0; y < m.length; ++y){
        for(let x = 0; x < m[y].length; ++x){
            if(m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0){
                return true;
            }
        }
    }

    return false;

}

function criarMatrix(w, h){

    const matrix = [];
    while(h--){
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function criarPecas(type){

    if(type === "I"){
        return[
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    }else if(type === "L"){
        return[
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    }else if(type === "J"){
        return[
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    }else if(type === "O"){
        return[
            [4, 4],
            [4, 4],
        ];
    }else if(type === "Z"){
        return[
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    }else if(type === "S"){
        return[
            [0 , 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    }else if(type === "T"){
        return[
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }

}

function desenharMatrix(matrix, offset){

    matrix.forEach((linha, y) => {
        linha.forEach((value, x) =>{
            if(value !== 0){
                context.fillStyle = cores[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function desenhar(){

    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    desenharMatrix(arena, {x: 0, y: 0});
    desenharMatrix(player.matrix, player.pos);
}

function fundir(arena, player){
    player.matrix.forEach((linha, y) =>{
        linha.forEach((value, x) =>{
            if(value !== 0){
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function girar(matrix, dir){
    for(let y = 0; y < matrix.length; ++y){
        for(let x = 0; x < y; ++x){
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if(dir > 0){
        matrix.forEach((row) => row.reverse());
    }else{
        matrix.reverse();
    }
}

function gameover(){

    player.pos.y++;
    if(colidir(arena, player)){
        player.pos.y--;
        fundir(arena, player);
        playerReset();
        limparArena();
        updateScore();
    }
    dropCounter = 0;
}

function movimentoLateral(offset){
    player.pos.x += offset;
    if(colidir(arena, player)){
        player.pos.x -= offset;
    }
}

function playerReset(){
    
    score++;

    scoreElement.innerText = `Score: ${score}`;
    const pieces = "TJLOSZI";
    player.matrix = criarPecas(pieces[(pieces.length * Math.random()) | 0]);
    player.pos.y = 0;
    player.pos.x = ((arena[0].length / 2) | 0) - ((player.matrix[0].length  / 2) | 0);
    if(colidir(arena, player)){
        arena.forEach((row) => row.fill(0));
        updateScore();
        score = 0
        scoreElement.innerText = `Score: ${score}`;
        
    }
}

function rotação(dir){

    const pos = player.pos.x;
    let offset = 1;
    girar(player.matrix, dir);
    while(colidir(arena, player)){
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if(offset > player.matrix[0].length){
            girar(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0){
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    if(dropCounter > dropInterval){
        gameover();
    }
    lastTime = time;
    desenhar();
    requestAnimationFrame(update);
}

function updateScore(){
    
    highScore = score >= highScore ? score : highScore; // se score > high score => high score = score

    localStorage.setItem("high-score", highScore);
    highScoreElement.innerText = `High Score: ${highScore}`;
     
    //document.querySelector(".score").innerText = "Score : " + player.score;
}

document.addEventListener("keydown", (event) =>{

    if(event.keyCode === 37){
        movimentoLateral(-1);
    }else if(event.keyCode === 39){
        movimentoLateral(1);
    }else if(event.keyCode === 40){
        gameover();
    }else if(event.keyCode === 81){
        rotação(-1);
    }else if(event.keyCode === 87){
        rotação(1);
    }
});

const mudacaDirecao = e => {
    if (e.key === "rotateL") {
        rotação(-1);
    } else if (e.key === "ArrowDown") {
        gameover();
    } else if (e.key === "ArrowLeft") {
        movimentoLateral(-1);
    } else if (e.key === "ArrowRight" ) {
        movimentoLateral(1);
    } else if (e.key === "rotateR" ) {
        rotação(1);
    }
}

// Alterar direção em cada clique de tecla

controles.forEach(button => button.addEventListener("click", () => mudacaDirecao({ key: button.dataset.key })));
controlesLaterais.forEach(button => button.addEventListener("click", () => mudacaDirecao({ key: button.dataset.key })));

const cores = [
    null,
    "#ff0d72",
    "#0dc2ff",
    "#0dff72",
    "#f538ff",
    "#ff8e0d",
    "#ffe138",
    "#3877ff",
];

const arena = criarMatrix(12, 20);
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    
};
playerReset();
updateScore();
update();