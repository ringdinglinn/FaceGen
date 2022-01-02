var objects;
var points;

var sortedPoints;
var bezierPoints;

var settings;
var data;

var canvas;
var widthOffset = 300;

function setup() {
    init();
}

function init(){

    createCanvas( (window.innerWidth - widthOffset), window.innerHeight);

    settings = new Settings();

    calculate();

    // displayObjects();
    // displayVertices();
    // displayEyeObjects();

    // sortPoints();
    // displaySortedVertices();
}

function calculate(){
    initializeObjects();
    initializeVertices();
    update();
}

function update(){
    background(255);
    createBezier();
    displayBezier();
}

function windowResized() {
    resizeCanvas( (window.innerWidth - widthOffset), window.innerHeight);
    update();
}

function savePNG(){
    saveCanvas('face', 'png');
}

function saveConfig(){
    download(JSON.stringify(settings), "config.json", "text/plain");
}

function uploadFile(file){
    var fr = new FileReader();
    fr.onload = onReaderLoad;
    fr.readAsText(file);
}

function onReaderLoad(event){
    data = event.target.result;
}

function loadConfig(){
    settings = JSON.parse(data);
    console.log(settings);
}

function download(content, fileName, contentType) {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function updateSettings(index, elem){
    var value = parseFloat(elem.value);
    if (index == 0){
        settings.objOffset = value;
    }
    if (index == 1){
        settings.objSpawnProbability = value;
    }
    if (index == 2){
        settings.minVerticesPerObj = value;
    }
    if (index == 3){
        settings.maxVerticesPerObj = value;
    }
}

class Settings{
    constructor(){
        this.objOffset = 20;
        this.objSpawnProbability = 1;
        this.maxVerticesPerObj = 4;
        this.minVerticesPerObj = 1;
    }
}

class Obj {
    constructor(points, radius, isEye, isNose) {
        if (random() > settings.objSpawnProbability)
            return;

        this.relPoints = points;
        this.radius = radius;
        this.relVertices = new Array();
        this.isEye = isEye;
        this.isNose = isNose;

        this.randomize();

        this.relCenter = createVector(0, 0);
        for (let i = 0; i < this.relPoints.length; i++) {
            this.relCenter.add(this.relPoints[i]);
        }
        if (this.relPoints.length != 0) this.relCenter = this.relCenter.div(this.relPoints.length);

        this.getMeasures();
        objects.push(this);
    }

    get points(){
        var p = new Array();
        var cw =  (window.innerWidth - widthOffset)/2;
        var ch = window.innerHeight/2;
        for (let i = 0; i < this.relPoints.length; i++){
            p.push(createVector(cw - this.relPoints[i].x, ch - this.relPoints[i].y));
        }
        return p;
    }

    get center(){
        var c = createVector( (window.innerWidth - widthOffset)/2 + this.relCenter.x, window.innerHeight/2 + this.relCenter.y);
        return c;
    }

    get vertices(){
        var v = new Array();
        var cw =  (window.innerWidth - widthOffset)/2;
        var ch = window.innerHeight/2;
        for (let i = 0; i < this.relVertices.length; i++){
            v.push(createVector(cw + this.relVertices[i].x, ch + this.relVertices[i].y));
        }
        return v;
    }

    randomize(){
        for (let i = 0; i < this.relPoints.length; i++){
            this.relPoints[i].x += random(-settings.objOffset,settings.objOffset);
            this.relPoints[i].y += random(-settings.objOffset,settings.objOffset);
        }
        this.radius += random(max(-settings.objOffset,0),settings.objOffset);
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

    sampleVertex(rand){
        var theta = rand * Math.PI * 2;
        var y = (this.radius/2 + this.dy) * sin(theta);
        var x = (this.radius/2 + this.dx) * cos(theta);
        var vert = createVector(this.relCenter.x + x, this.relCenter.y + y);
        stroke(0);
        noFill();
        this.relVertices.push(vert);
        return vert;
    }

    displayVertices(){
        for (let i = 0; i < this.vertices.length; i++ ){
            var p = this.vertices[i];
            fill(255,0,0);
            noStroke();
            circle(p.x, p.y, 10);
        }
    }
}

function initializeObjects() {
    objects = new Array();
    var p0 = [ createVector(-100, -50) ];
    var o0 = new Obj(p0, 100, true);
    var p1 = [ createVector(100, -50) ];
    var o1 = new Obj(p1, 100, true);
    var p2 = [ createVector(0, -50), createVector(0, 5) ];
    var o2 = new Obj(p2, 50, false, true);
    var p3 = [ createVector(-30, 100), createVector(30, 100) ];
    var o3 = new Obj(p3, 50, false);
    var p4 = [ createVector(0, 200)];
    var o4 = new Obj(p4, 200, false);
    var p5 = [ createVector(0, -100)];
    var o5 = new Obj(p5, 300, false);
}

function displayObjects(){
    for (let i = 0; i < objects.length; i++){
        objects[i].display();
    }
}

function displayEyeObjects(){
    for (let i = 0; i < objects.length; i++){
        objects[i].displayEyes();
    }
}

function initializeVertices(){
    var objs = shuffleArray(objects);
    for (let i = 0; i < objs.length; i++){
        var n = int(random(settings.minVerticesPerObj,settings.maxVerticesPerObj));
        var b = 0;
        if (objs[i].isNose || objs[i].isEye) {
            n += 2;
            b = 0.8;
        }
        var rand = random();
        for (let j = 0; j < n; j++ ){
            var p = objs[i].sampleVertex(rand + (j+b)/n);
        }
    }
}

function displayVertices(){
    for (let i = 0; i < objects.length; i++ ){
        objects[i].displayVertices();
    }
}

function displaySortedVertices(){
    noFill();
    stroke(0);

    for (let i = 0; i < sortedPoints.length; i++){
        noFill();
        stroke(0);
        line(sortedPoints[i].x, sortedPoints[i].y, sortedPoints[(i+1)%sortedPoints.length].x, sortedPoints[(i+1)%sortedPoints.length].y);
    }
}

function sortPoints(){
    sortedPoints = new Array();
    var startPoint = points[int(random(0, points.length))];
    getClosestPoint(startPoint);
}

function getClosestPoint(point){
    var closestPoint = null;
    var d = 100000000000000;
    var index;

    for (let i = 0; i < points.length; i++){
        var v = createVector(point.x, point.y);
        var dist = v.sub(points[i]).mag();
        if (dist < d && !sortedPoints.includes(point[i])){
            d = dist;
            closestPoint = points[i];
            index = i;
        }
    }
    if (closestPoint != null){
        points.splice(index, 1);
        sortedPoints.push(closestPoint);
        getClosestPoint(closestPoint);
    } else {
        return;
    }
}

function createBezier(){
    bezierPoints = new Array();
    var verts = getCurrentVerts();

    for (let i = 0; i < verts.length; i++){
        var prevPoint = verts[(verts.length + (i-1)) % verts.length];
        var startPoint = verts[i];
        var endPoint = verts[(verts.length + (i+1)) % verts.length];
        var dir1 = createVector(prevPoint.x, prevPoint.y).sub(startPoint);
        var dir2 = createVector(endPoint.x, endPoint.y).sub(startPoint);
        var d1 = dir1.mag()/2;
        var d2 = dir2.mag()/2;
        dir1.normalize();
        dir2.normalize();
        var cp1 = createVector(dir1.x, dir1.y).sub(dir2).normalize().mult(d1).add(startPoint);
        var cp2 = createVector(dir2.x, dir2.y).sub(dir1).normalize().mult(d2).add(startPoint);
        
        bezierPoints.push(cp1);
        bezierPoints.push(startPoint);
        bezierPoints.push(cp2);
    }
}

function getCurrentVerts(){
    var verts = new Array();
    for (var i = 0; i < objects.length; i++){
        for (var j = 0; j < objects[i].vertices.length; j++){
            verts.push(objects[i].vertices[j]);
        }
    }
    return verts;
}

function displayBezier(){
    for (let i = 1; i <= bezierPoints.length; i++ ){
        var size = 10;

        noStroke();
        if (i % 3 == 0 || (i-2)%3 == 0) {
            noStroke();
            noFill();   
            size = 5;
        } else {
            fill(255,0,0);
            size = 10;

            stroke(0);
            noFill();
            strokeWeight(2);

            var anchor1 = bezierPoints[cycle(i)];
            var ctrl1 = bezierPoints[cycle(i+1)];
            var ctrl2 = bezierPoints[cycle(i+2)];
            var anchor2 = bezierPoints[cycle(i+3)];

            bezier(anchor1.x, anchor1.y, ctrl1.x, ctrl1.y, ctrl2.x, ctrl2.y, anchor2.x, anchor2.y);
        }

        // circle(bezierPoints[cycle(i)].x, bezierPoints[cycle(i)].y, size);
    }

    function cycle(i){
        var index = i;
        index += bezierPoints.length;
        index %= bezierPoints.length;
        return index;
    }
}



function shuffleArray(array) {
    let currentIndex = array.length,  randomIndex;
  
    while (currentIndex != 0) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}