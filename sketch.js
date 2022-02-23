var People = [];
var days = [];
var numInfections = [];
var numRemoved = [];

var numPeople = 1000;
var size = 3.0;
var maxAccel = 3.0;

var infectionRate = 0.3;
var infectionRadius = 3 * size;
var recoveryMin = 1 * 60;
var recoveryMax = 2 * 60;

var simX = 30;
var simY = 30;
var simWidth = 600;
var simHeight = 500;

var running = false;

function myFunction() {
    running = false;
}

function setup() {
    frameRate(240);
    createCanvas(windowWidth, windowHeight);
    background(51);
}


function draw() {

    if (!running) {

        infectionRate = document.getElementById("infectionSlider").value / 100;

        simWidth = windowWidth * 5/12;

        People = [];
        for (var i = 0; i < numPeople; i++) {
            append(People, new Person());
        }
        People[0].isInfected = 1;
        People[0].dayInfected = frameCount;

        days = [];
        numInfections = [];
        numRemoved = [];

        currentNumInfections = 1;
        currentNumRemoved = 0;

        running = true;
    }

    background(30);
    fill(0);
    stroke(200);
    strokeWeight(10);
    fill(255);
    rect(simX - size - 5, simY - size - 5, simWidth + 2 * size + 10, simHeight + 2 * size + 10);

    for (var i = 0; i < numPeople; i++) {
        People[i].render();
        People[i].move();
        if (People[i].catchInfection(People, numPeople, frameCount) == 1) {
            currentNumInfections += 1;
        }
        if (People[i].checkRemoved(frameCount)) {
            currentNumRemoved += 1;
            currentNumInfections -= 1;
        }
    }

    append(days, frameCount);
    append(numInfections, currentNumInfections);
    append(numRemoved, currentNumRemoved);

    var newInfections = numInfections[frameCount - 1] - numInfections[frameCount - 61];
    var newRemoved = numRemoved[frameCount - 1] - numRemoved[frameCount - 61];

    graph(days, numInfections, numRemoved, numPeople, frameCount, simX + simWidth + 50, displayWidth - 50, simY + simHeight, simY);
    fill(255);
    textSize(25);
    text("New Daily Cases: " + (newInfections + newRemoved), simX + simWidth + 75, simY + 50);
    text("New Removed Cases: " + newRemoved, simX + simWidth + 75, simY + 85);
    text("Susceptible: " + (numPeople - currentNumInfections - currentNumRemoved), simX + simWidth + 500, simY + 50);
    text("Infected: " + currentNumInfections, simX + simWidth + 500, simY + 85);
    text("Removed: " + currentNumRemoved, simX + simWidth + 500, simY + 120);
}


function Person() {
    this.size = size;
    this.position = createVector(random(simX, simX + simWidth), random(simY, simY + simHeight), 0);
    this.velocity = createVector(0, 0, 0);
    this.maxAccel = maxAccel;
    this.isInfected = 0;
    this.dayInfected = -1;

    this.move = function () {
        this.position = p5.Vector.add(this.position, this.velocity);
        this.position.x = constrain(this.position.x, simX, simX + simWidth);
        this.position.y = constrain(this.position.y, simY, simY + simHeight);

        if (this.position.x == simX || this.position.x == simX + simWidth) {
            this.velocity.x = -this.velocity.x;
        }
        if (this.position.y == simY || this.position.y == simY + simHeight) {
            this.velocity.y = -this.velocity.y;
        }

        this.velocity = this.velocity.add(random(-1, 1), random(-1, 1), 0).normalize().mult(random(0, this.maxAccel));
    };

    this.render = function () {
        if (this.isInfected == 1) {
            fill(255, 0, 0);
        } else if (this.isInfected == 0) {
            fill(0, 255, 0);
        } else {
            fill(0, 0, 255);
        }

        strokeWeight(1);
        stroke(10);
        ellipse(this.position.x, this.position.y, this.size * 2, this.size * 2);
    };

    this.catchInfection = function (peopleList, lenPeopleList, day) {
        if (this.isInfected == 0) {
            for (var i = 0; i < lenPeopleList; i++) {
                if (peopleList[i].isInfected == 1 && infectionRadius > (p5.Vector.sub(this.position, peopleList[i].position)).mag()) {
                    if (random(0, 1) < infectionRate) {
                        this.isInfected = 1;
                        this.dayInfected = day;
                        return 1;
                    }
                }
            }
        }
        return 0;
    }

    this.checkRemoved = function (day) {
        if (this.isInfected == 1 && day - this.dayInfected > random(recoveryMin, recoveryMax)) {
            console.log(day);
            this.isInfected = 2;
            return 1;
        } else {
            return 0;
        }
    }

}

function graph(xList, yList1, yList2, maxYVal, dataLength, xLeft, xRight, yBottom, yTop) {

    fill(0);
    rect(xLeft, yTop, (xRight - xLeft), (yBottom - yTop));

    strokeWeight(2);

    line(xLeft, yBottom, xLeft, yTop);
    line(xLeft, yBottom, xRight, yBottom);

    var xScale = max(xList) / (xRight - xLeft);
    var yScale = 1.5 * maxYVal / (yTop - yBottom);

    fill(0, 255, 0);
    rect(xLeft, yTop + (yBottom - yTop) * (1 - 1 / 1.5), xRight - xLeft, (yBottom - yTop) / 1.5);

    fill(0, 0, 255);
    beginShape();
    vertex(xLeft, yBottom);
    for (var i = 0; i < dataLength; i++) {
        vertex(xLeft + xList[i] / xScale, yBottom + (yList2[i] + yList1[i]) / yScale);
    }
    vertex(xRight, yBottom);
    vertex(xLeft, yBottom);
    endShape(CLOSE);

    fill(255, 0, 0);
    beginShape();
    vertex(xLeft, yBottom);
    for (var i = 0; i < dataLength; i++) {
        vertex(xLeft + xList[i] / xScale, yBottom + yList1[i] / yScale);
    }
    vertex(xRight, yBottom);
    vertex(xLeft, yBottom);
    endShape(CLOSE);
}
