var player = null;
var playerMoves = 0;
var goals = [];
var goalsCompleted = 0;

function reset() {
    document.getElementById("container").innerHTML = '';
    document.getElementById("status").textContent = "Let's go!";
    document.getElementById("reset").style.opacity = 0;
    player= null;
    playerMoves = 0;
    goals = [];
    goalsCompleted = 0;    
    addTiles();
}

function addTiles() {
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
            document.getElementById("container").appendChild(element);
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

function isColiding(entity, target) {
    /*wall is always a collision*/
    if (target.classList.contains(Tiles.Wall))
        return true;
    /*entity is Block or BlockDone and so is target -> collision*/    
    return ((entity.classList.contains(Entities.Block) || entity.classList.contains(Entities.BlockDone))
         && (target.classList.contains(Entities.Block) || target.classList.contains(Entities.BlockDone)));
}

function moveEntity(entity, x, y) {
 
    var coords = getCoordsByID(entity.id);  
    var target = getElementByCoord(coords[0] += x, coords[1] += y);

    if (isColiding(entity, target)) {
        showInpact(target);
        return false;
    }
    
    if (entity.classList.contains(Entities.Character)) {
        
        if (target.classList.contains(Entities.Block)
         || target.classList.contains(Entities.BlockDone)) {
            /*recursive call for target that's blocking the character path*/              
            if (!moveEntity(target, x, y)) {
                return false;
            }
        }        
        target.classList.remove(...target.classList);
        target.classList.toggle(Entities.Character);
        onPlayerMoved(coords[0], coords[1]);        
    }
    else /*entity == Block || BlockDone*/ {
        target.classList.remove(...target.classList);
        target.classList.toggle(goals.includes(target) ? Entities.BlockDone : Entities.Block);        
    }

    /*entity reached target -> clear & reset*/
    entity.classList.remove(...entity.classList);
    entity.classList.toggle(goals.includes(entity) ? Tiles.Goal : Tiles.Space, true);
    return true;
}

function onPlayerMoved(x, y) {
    player = getElementByCoord(x, y);
    playerMoves++;
    goalsCompleted = goals.filter(item => item.classList.contains(Entities.BlockDone)).length;    

    var status = document.getElementById("status");

    if (playerMoves == 1)
        status.style.opacity = 1;

    status.textContent = (goalsCompleted == goals.length) 
        ? "Level completed!"
        : `Moves: ${playerMoves}. Goals: ${goalsCompleted} / ${goals.length}.`;
}

function handleInputEvent(e) {
    e.preventDefault();  
    e.stopPropagation(); 
    return false;
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
            moveEntity(player, +1, 0);
            return handleInputEvent(e);
        case "ArrowDown": 
            moveEntity(player, 0, +1);
            return handleInputEvent(e);
        case "Space":
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
