var player = null;
var playerMoves = 0;
var goals = [];
var goalsCompleted = 0;

function reset() {
    document.getElementById("container").innerHTML = '';
    document.getElementById("status").textContent = "Let's go!";
    document.getElementById("reset").style.visibility = "hidden";
    player= null;
    playerMoves = 0;
    goals = [];
    goalsCompleted = 0;    
    createTiles();
}

function createTiles() {
    var container = document.getElementById("container");
    container.style.gridTemplateColumns = `repeat(${tileMap01.width}, 1fr)`;    
    for (let y = 0; y < tileMap01.height; y++) {
        for (let x = 0; x < tileMap01.width; x++) {   
            var element = document.createElement("div");
            element.setAttribute("id", createID(x, y));
            switch (tileMap01.mapGrid[y][x].toString()) {
                case 'W':
                    element.classList.add(Tiles.Wall);
                    break;
                case "B":
                    element.classList.add(Entities.Block);
                    break;
                case "P":
                    element.classList.add(Entities.Character);          
                    player = element;
                    break;
                  case "G":
                    element.classList.add(Tiles.Goal);
                    goals.push(element);
                    break;
                case " ":
                    element.classList.add(Tiles.Space);
                default:
                    break;
            }
            container.appendChild(element);
        }
    }
}

function createID(x, y) {
    return `${x},${y}`;
}

function getCoordsByID(str) {
    return Array.from(str.split(',')).map(Number);
}

function getElementByCoord(x, y) {
    return document.getElementById(createID(x, y));
}

function isTypeOf(element, ...args) {
    for (let i = 0; i < args.length; i++) {
        if (element.classList.contains(args[i]))
            return true;
    }
    return false;
}

function checkCollision(entity, target) {
    return isTypeOf(target, Tiles.Wall)
       || (isTypeOf(entity, Entities.Block, Entities.BlockDone) 
        && isTypeOf(target, Entities.Block, Entities.BlockDone));
}

function moveEntity(entity, x, y) { 
    var coords = getCoordsByID(entity.id);  
    var target = getElementByCoord(coords[0] + x, coords[1] + y);

    if (checkCollision(entity, target)) {
        showInpact(target);
        return false;
    }    
    if (isTypeOf(entity, Entities.Character)) {      
        if (isTypeOf(target, Entities.Block, Entities.BlockDone)) {
            /*recursive call on element in front of player*/              
            if (!moveEntity(target, x, y)) 
                return false;            
        }        
        target.classList.remove(...target.classList);
        target.classList.toggle(Entities.Character);
        onPlayerMoved(target, coords[0], coords[1]);        
    }
    else /*entity == Block || BlockDone*/ {
        target.classList.remove(...target.classList);
        target.classList.toggle(goals.includes(target) ? Entities.BlockDone : Entities.Block);        
    }
    entity.classList.remove(...entity.classList);
    entity.classList.toggle(goals.includes(entity) ? Tiles.Goal : Tiles.Space, true);
    return true;
}

function onPlayerMoved(playerElement, x, y) {
    player = playerElement;
    playerMoves++;
    goalsCompleted = goals.filter(item => item.classList.contains(Entities.BlockDone)).length;    

    document.getElementById("status").textContent = (goalsCompleted == goals.length) 
        ? "Level completed!"
        : `Moves: ${playerMoves}. Goals: ${goalsCompleted} / ${goals.length}.`;

    if (playerMoves == 1) 
        document.getElementById("reset").style.visibility = "visible";
}

function handleInputEvent(e) {
    e.preventDefault();  // Chrome/Edge
    e.stopPropagation(); // Opera
    return false; // IE
}

document.addEventListener('keydown', function(e) {
    if (goalsCompleted == goals.length) {
        return handleInputEvent(e);
    }
    switch (e.key) {
        case "ArrowLeft":
            moveEntity(player, -1, 0);
            return handleInputEvent(e);
        case "ArrowUp": 
            moveEntity(player, 0, -1);
            return handleInputEvent(e);
        case "ArrowRight": 
            moveEntity(player, 1, 0);
            return handleInputEvent(e);
        case "ArrowDown": 
            moveEntity(player, 0, 1);
            return handleInputEvent(e);
        default:
            break;
    }
});

function showInpact(element) {
    var overlay = document.getElementById("overlay");
    var vp = element.getBoundingClientRect();
    overlay.style.top = `${vp.top}px`;
    overlay.style.left = `${vp.left}px`;    
    overlay.style.width = `${vp.width}px`;
    overlay.style.height = `${vp.height}px`;
    fadeElement(overlay);
}

function fadeElement(element) {
    var increment = 0.2;
    var opacity = 0.8;
    var instance = window.setInterval(function() {
        element.style.opacity = opacity
        opacity = opacity - increment;
        if(opacity < 0){
            window.clearInterval(instance);
        }
    },100)
}

reset();
