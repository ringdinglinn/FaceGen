var objects;
var points;

var sortedPoints;

function setup() {
    createCanvas(windowWidth, windowHeight);
    objects = new Array();
    points = new Array();
    grid1d = new Array();
    grid2d = new Array();
    targetNodes = new Array();

    initializeObjects();
    initializePoints();
    

    displayObjects();
    displayPoints();
    displayEyeObjects();

    sortPoints();
    displaySortedPoints();

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
        var n = int(random(1,20));
       
        for (let j = 0; j < n; j++ ){
            var rand = random();
            var p = objs[i].samplePoint(rand);
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
    for (let i = 1; i < sortedPoints.length; i++){
        noFill();
        stroke(0);
        line(sortedPoints[i-1].x, sortedPoints[i-1].y, sortedPoints[i].x, sortedPoints[i].y);
    }
}

function sortPoints(){
    sortedPoints = new Array();
    var startPoint = points[random(0, points.length)];
    getClosestPoint(startPoint);
}

function getClosestPoint(point){
    var closestPoint;
    var d = 100000000000000;

    console.log(points.length);
    for (let i = 0; i < points.length; i++){
        var v = createVector(point.x, point.y);
        var dist = v.sub(points[i]).mag;
        console.log(dist < d);
        console.log(point != points[i]);
        console.log(!sortedPoints.includes(point[i]));
        if (dist < d && point != points[i] && !sortedPoints.includes(point[i])){
            console.log("dist smaller");
            d = dist;
            closestPoint = point[i];
        }
    }

    if (closestPoint != null){
        sortedPoints.push(closestPoint);
        getClosestPoint(closestPoint);
    } else {
        return;
    }
}