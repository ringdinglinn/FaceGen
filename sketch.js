var objects;
var points;

var sortedPoints;
var bezierPoints;

function setup() {
    createCanvas(windowWidth, windowHeight);
    objects = new Array();
    points = new Array();
    grid1d = new Array();
    grid2d = new Array();
    targetNodes = new Array();

    initializeObjects();
    initializePoints();

    // displayObjects();
    // displayPoints();
    displayEyeObjects();

    // sortPoints();
    // displaySortedPoints();

    createBezier();
    displayBezier();

}

function draw(){
}

class obj {
    constructor(points, radius, isEye, isNose) {
        this.points = points;
        this.radius = radius;

        this.randomize();

        this.center = createVector(0, 0);
        for (let i = 0; i < points.length; i++) {
            this.center.add(points[i]);
        }
        if (points.length != 0) this.center = this.center.div(points.length);
        objects.push(this);
        this.getMeasures();

        this.isEye = isEye;
        this.isNose = isNose;
    }

    randomize(){
        for (let i = 0; i < this.points.length; i++){
            this.points[i].x += random(-20,20);
            this.points[i].y += random(-20,20);
        }
        this.radius += random(-20, 20);
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
    var o0 = new obj(p0, 100, true);
    var p1 = [ createVector(cw + 100, ch - 50) ];
    var o1 = new obj(p1, 100, true);
    var p2 = [ createVector(cw, ch - 50), createVector(cw, ch + 5) ];
    var o2 = new obj(p2, 50, false, true);
    var p3 = [ createVector(cw - 30, ch + 100), createVector(cw + 30, ch + 100) ];
    var o3 = new obj(p3, 50, false);
    var p4 = [ createVector(cw, ch + 200)];
    var o4 = new obj(p4, 200, false);
    var p5 = [ createVector(cw, ch - 100)];
    var o5 = new obj(p5, 300, false);
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

function initializePoints(){
    var objs = shuffleArray(objects);
    for (let i = 0; i < objs.length; i++){
        var n = int(random(2,4));
        var b = 0;
        if (objs[i].isNose || objs[i].isEye) {
            n += 2;
            b = 0.8;
        }
        var rand = random();
        for (let j = 0; j < n; j++ ){
            var p = objs[i].samplePoint(rand + (j+b)/n);
            points.push(p);
        }
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

function displaySortedPoints(){
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

    for (let i = 0; i < points.length; i++){
        var prevPoint = points[(points.length + (i-1)) % points.length];
        var startPoint = points[i];
        var endPoint = points[(points.length + (i+1)) % points.length];
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

function displayBezier(){
    for (let i = 1; i <= bezierPoints.length; i++ ){
        var size = 10;

        noStroke();
        if (i % 3 == 0 || (i-2)%3 == 0) {
            console.log("ctrl point");
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