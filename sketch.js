var objects;
var points;
var gridSize = 30;
var grid1d;
var grid2d;
var targetNodes;

var nx;
var ny;

var openNodes;
var closedNodes;
var startNode;
var endNode;
var path;
var paths;

function setup() {
    createCanvas(windowWidth, windowHeight);
    objects = new Array();
    points = new Array();
    grid1d = new Array();
    grid2d = new Array();
    targetNodes = new Array();

    initializeObjects();
    initializeGrid();
    initializePoints();

    evaluateTargetNodes();

    // displayGrid();
    // drawObjects();
    // displayPoints();

    findPath();
    drawPath();
    drawEyeObjects();
}

function draw(){
}

class obj {
    constructor(points, attraction, radius, isEye) {
        this.points = points;
        this.attraction = attraction;
        this.radius = radius;

        this.center = createVector(0, 0);
        for (let i = 0; i < points.length; i++) {
            this.center.add(points[i]);
        }
        if (points.length != 0) this.center = this.center.div(points.length);
        objects.push(this);
        this.getMeasures();
        this.isEye = isEye;
    }

    getMeasures(){
        this.dx = 0;
        this.dy = 0;
        if (this.points.length == 2){
            this.dx = abs(this.points[0].x - this.points[1].x);
            this.dy = abs(this.points[0].y - this.points[1].y);
        }
    }

    display() {
        noFill();
        stroke(0);
        ellipse(this.center.x, this.center.y, this.radius + this.dx*2, this.radius + this.dy*2);
    }

    displayEyes(){
        if (this.isEye){
            noStroke();
            fill(0);
            ellipse(this.center.x, this.center.y, 10);
        }
    }

    samplePoint(rand){
        var theta = rand * Math.PI * 2;
        var y = (this.radius/2 + this.dy) * sin(theta);
        var x = (this.radius/2 + this.dx) * cos(theta);
        var point = createVector(this.center.x + x, this.center.y + y);
        stroke(0);
        noFill();
        return point;
    }
}

function initializeObjects() {
    var cw = windowWidth/2;
    var ch = windowHeight/2 - 50;
    var p0 = [ createVector(cw - 100, ch - 50) ];
    var o0 = new obj(p0, 1, 100, true);
    var p1 = [ createVector(cw + 100, ch - 50) ];
    var o1 = new obj(p1, 1, 100, true);
    var p2 = [ createVector(cw, ch - 50), createVector(cw, ch + 5) ];
    var o2 = new obj(p2, 1, 50, false);
    var p3 = [ createVector(cw - 30, ch + 100), createVector(cw + 30, ch + 100) ];
    var o3 = new obj(p3, 1, 50, false);
}

function drawObjects(){
    for (let i = 0; i < objects.length; i++){
        objects[i].display();
    }
}

function drawEyeObjects(){
    for (let i = 0; i < objects.length; i++){
        objects[i].displayEyes();
    }
}

function initializePoints(){
    var objs = shuffleArray(objects);
    for (let i = 0; i < objs.length; i++){
        var n = int(random(1,20));
       
        for (let j = 0; j < n; j++ ){
            var rand = random();
            var p = objs[i].samplePoint(rand);
            points.push(p);
        }

        // var p = objs[i].samplePoint(rand + 0.25);
        // points.push(p);

        // var p = objs[i].samplePoint(rand + 0.5);
        // points.push(p);

        // var p = objs[i].samplePoint(rand + 0.75);
        // points.push(p);
    }
}

function displayPoints(){
    for (let i = 0; i < points.length; i++ ){
        var p = points[i];
        fill(255,0,0);
        noStroke();
        circle(p.x, p.y, 10);
    }
}

function initializeGrid(){
    nx = ceil(windowWidth / gridSize);
    ny = ceil(windowHeight / gridSize);

    for (let x = 0; x < nx; x++){
        var column = new Array();
        for (let y = 0; y < ny; y++){
            var tile = new Tile(x, y);
            column.push(tile);
        }
        grid2d.push(column);
    }
}

function displayGrid(){
    for (let i = 0; i < grid1d.length; i++){
        grid1d[i].display();
    }
}

class Tile {
    constructor(gridX, gridY){
        this.x = gridX * gridSize; 
        this.y = gridY * gridSize;
        this.gridX = gridX;
        this.gridY = gridY;
        grid1d.push(this);
        this.id = grid1d.length-1;
        this.special = false;
        this.walkable = this.checkWalkable();
        this.isOpen = false;
        this.isClosed = false;
        this.gCost = 0;
        this.parent = null;
    }

    checkWalkable(){
        var wa = true;
        var center = createVector( this.x + gridSize/2, this.y + gridSize/2 );
        var k = -1;
        var l = 1;
        for (let i = 0; i < objects.length; i++){
            var n = 0;
            for (let j = 0; j < 4; j++){
                var pp = createVector(center.x + k * gridSize/2, center.y + l * gridSize/2);
                noStroke();
                fill(0,255,0);
                pp.sub(objects[i].center);
                var a = objects[i].radius/2 + objects[i].dx;
                var b = objects[i].radius/2 + objects[i].dy;
                if (pow(pp.x, 2) / pow(a, 2) + pow(pp.y, 2) / pow(b, 2) < 1.0){
                    n++;
                    if (n >= 4){
                        wa = false;
                        break;
                    }
                }
                k *= -1;
                l *= -1;
            }
        }
        return wa;
    }

    display(){
        stroke(200);
        noFill();
        if (!this.walkable) fill(180);
        if (this.special) fill(0,0,255);
        rect(this.x, this.y, gridSize);
    }

    f_cost = {
        get cost(){
            return this.h_cost + this.g_cost;
        }
    };

    h_cost = {
        get cost(){
            var h = this.getDistance(endNode);
            return h
        }
    }

    getDistance(node){
        return abs(node.gridX - this.gridX) + abs(node.gridY - this.gridY);
    }

    displayClosed(){
        stroke(0);
        fill(255,0,0);
        rect(this.x, this.y, gridSize);
    }

    displayOpen(){
        stroke(0);
        fill(0,255,0);
        rect(this.x, this.y, gridSize);
    }

    displayClear(){
        stroke(0);
        fill(255);
        rect(this.x, this.y, gridSize);
    }
}

function evaluateTargetNodes(){
    for (let x = 0; x < nx; x++){
        for (let y = 0; y < ny; y++){

            var tile = grid2d[x][y];
            var tileCenter = createVector(tile.x + gridSize/2, tile.y + gridSize/2);
            
            for (let i = 0; i < points.length; i++){
                var p = points[i];
                if (p.x < tileCenter.x + gridSize/2 && 
                    p.x > tileCenter.x - gridSize/2 && 
                    p.y < tileCenter.y + gridSize/2 && 
                    p.y > tileCenter.y - gridSize/2){
                        if (!targetNodes.includes(tile)){
                            targetNodes.push(tile);
                            tile.special = true;
                            tile.walkable = true;
                        }
                }
            }
        }
    }
}


function shuffleArray(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

function drawPath(){
    for (let i = 1; i < path.length; i++){
        noFill();
        stroke(0);
        strokeWeight(4);
        line(path[i-1].x + gridSize/2, path[i-1].y + gridSize/2, path[i].x + gridSize/2, path[i].y + gridSize/2);
    }
}

function findPath(){
    path = new Array();
    paths = new Array();
    var n = int(random(0, targetNodes.length));
    startNode = targetNodes[n];
    var l = targetNodes.length;
    nodes = removeFromArray(targetNodes, startNode);
    for (let i = 0; i < l; i++){
        // endNode = getClosestPoint(startNode);

        var newPath = new Array();
        var pathLength = 1000000000000000;
        var newStartNode;
        for (let j = 0; j < nodes.length; j++){
            endNode = nodes[j];
            var p = AStar();
            if (p.length < pathLength){
                pathLength = p.length;
                newPath = p;
                newStartNode = endNode;
            }
        }

        for (let j = newPath.length-1; j >= 0 ; j--){
            path.push(newPath[j]);
        }
        startNode = newStartNode;
        nodes = removeFromArray(nodes, startNode);
        console.log(nodes);
    }
}

function removeFromArray(array, node){
    var newArray = new Array();
    var index = -1;
    for (let i = 0; i < array.length; i++){
        if (array[i] == node){
            index = i;
            break;
        }
    }

    console.log(index);
    for (let i = 0; i < array.length; i++){
        if (i != index || i == -1)
            newArray.push(array[i]);
    }
    return newArray;
}

function AStar(){
    resetTiles();

    openNodes = new Array();
    openNodes = [];
    closedNodes = new Array();
    closedNodes = [];

    openNodes.push(startNode);

    while(openNodes.length > 0){
        var current = openNodes[0];
        var index = 0;
        for (let i = 0; i < openNodes.length; i++){
            if (openNodes[0].f_cost < current.f_cost){
                current = openNodes[i];
                index = i;
            }
        }
        closedNodes.push(current);
        current.isClosed = true;
        // current.displayClosed();
    
        if (current == endNode){
            break;
        }
    
        var neighbors = getNodeNeighbors(current);
        for (let i = 0; i < neighbors.length; i++){
            if (neighbors[i].walkable && !neighbors[i].isClosed) {
                if (current.g_cost + 1 < neighbors[i].g_cost || !neighbors[i].isOpen){
                    neighbors[i].g_cost = current.g_cost + 1;
                    neighbors[i].parent = current;
                    if (!neighbors[i].isOpen){
                        neighbors[i].isOpen = true;
                        openNodes.push(neighbors[i]);
                        // neighbors[i].displayOpen();
                    }
                }
            }
        }

        openNodes.splice(index, 1);
    }

    var newPath = new Array();
    addToPath(endNode);


    function addToPath(node){
        newPath.push(node);
        if (node == startNode) return;
        // node.walkable = false;
        addToPath(node.parent);
    }

    return newPath;
}

function resetTiles(){
    for (let i = 0; i < grid1d.length; i++){
        grid1d[i].isClosed = false;
        grid1d[i].isOpen = false;
        grid1d[i].g_cost = 0;
    }
}

function getNodeNeighbors(node){
    var neighbors = new Array();
    if (node.gridX - 1 >= 0) neighbors.push(grid2d[node.gridX - 1][node.gridY]);
    if (node.gridX + 1 < nx) neighbors.push(grid2d[node.gridX + 1][node.gridY]);
    if (node.gridY - 1 >= 0) neighbors.push(grid2d[node.gridX][node.gridY - 1]);
    if (node.gridY + 1 < ny) neighbors.push(grid2d[node.gridX][node.gridY + 1]);
    return neighbors;
}

function getClosestPoint(node){
    let index = 0;
    let distance = 1000000000000000;
    var closestNode;
    for (let i = 0; i < targetNodes.length; i++){
        if (node.getDistance(targetNodes[i]) < distance && node != targetNodes[i]){
            distance = node.getDistance(targetNodes[i]);
            index = i;
            closestNode = targetNodes[i];
        }
    }
    targetNodes.splice(index, 1);
    return closestNode;
}