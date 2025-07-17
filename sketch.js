let time;
let frameCountBuffer = 0;
let fps = 0;

const CANVAS_W = 960;
const CANVAS_H = 1280;

const BUTTON_W = CANVAS_W/4;
const BUTTON_H = BUTTON_W/2;
const BUTTON_Y = CANVAS_H*3/5;
const BUTTON_M = 24;

const GRAVITY = 1.0;
const GRID_SIZE = 64;
const GRID_W = 64;
const GRID_BASE_X = GRID_SIZE*1;
const GRID_BASE_Y = GRID_SIZE*1;
const BALL_NUM = 2;
const BALL_START_X = GRID_SIZE*4;
const BALL_START_Y = GRID_SIZE*6;
const BALL_SIZE = GRID_SIZE;
const BALL_COLOR = 120;
const BALL_TOSS_SPEED = 32;
const HAND_COLOR = 255;
const HAND_CENTER_X = GRID_SIZE*8;
const HAND_CENTER_Y = GRID_SIZE*9;
const HAND_SIZE = GRID_SIZE*1.5;
const HAND_SPEED = 15;
const HAND_TOSS_ANGLE = 190;
const HAND_ENABLE_ANGLE = 270;
const HAND_MOVE_R = GRID_SIZE*3;
const CATCH_RANGE = 50;


let upButton, downButton, leftButton, rightButton;
let getButton;
let startButton;
let startFlag = false;
let startTime;
let endTime = 0;
let balls;
let hands;

let timeCount;
const TEXT_VIEW_SIZE = 32;

const DEBUG = true;
const DEBUG_VIEW_X = 40;
const DEBUG_VIEW_Y = 20;
const DEBUG_VIEW_H = 20;

function preload() {
}
function upFn() {
}
function downFn() {
}
function leftFn() {
}
function rightFn() {
}
function startFn() {
//	startFlag = true;
//	startTime = millis();
//	startButton.hide();
	hands.move = true;
}
function setup() {
	createCanvas(CANVAS_W, CANVAS_H);
	time = millis();
	rectMode(CENTER);

	upButton = buttonInit('↑', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, BUTTON_Y);
	downButton = buttonInit('↓', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, BUTTON_Y+(BUTTON_H+BUTTON_M)*2);
	leftButton = buttonInit('←', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W*3)/2-BUTTON_M, BUTTON_Y+BUTTON_H+BUTTON_M);
	rightButton = buttonInit('→', BUTTON_W, BUTTON_H, (CANVAS_W+BUTTON_W)/2+BUTTON_M, BUTTON_Y+BUTTON_H+BUTTON_M);
	startButton = buttonInit('START', BUTTON_W, BUTTON_H, (CANVAS_W-BUTTON_W)/2, BUTTON_Y-BUTTON_H*1.5);
	upButton.mousePressed(upFn);
	downButton.mousePressed(downFn);
	leftButton.mousePressed(leftFn);
	rightButton.mousePressed(rightFn);
	startButton.mousePressed(startFn);
	textAlign(CENTER,CENTER);

	balls = [];
	/*
	balls.pos = {};
	balls.pos.x = BALL_START_X;
	balls.pos.y = BALL_START_Y;
	balls.speed = {};
	balls.speed.x = 0;
	balls.speed.y = 0;
	balls.caught = 0;
	*/
	let ball = ballInit();
	balls.push(ball);
	hands = {};
	hands.angle = 0;
	hands.toss = false;
	hands.move = false;
	hands.enable = false;
	hands.ball = 0;
}
function ballInit() {
	let ball = {};
	ball.pos = {};
	ball.speed = {};
	ball.speed.x = 0;
	ball.speed.y = 0;
	ball.caught = true;
	return ball;
}
function buttonInit(text, w, h, x, y) {
	let button = createButton(text);
	button.size(w,h);
	button.position(x,y);
	button.style('font-size', '32px');
	return button;
}
function draw() {
	background(48);
	let current = millis();
	if ( (current-time)>=1000 ){
		time += 1000;
		fps = frameCount - frameCountBuffer;
		frameCountBuffer = frameCount;
	}
	if (DEBUG){
		stroke(128);
		strokeWeight(1);
		for (let i=0; i<CANVAS_H/GRID_SIZE; i++){
			line(0, i*GRID_SIZE, CANVAS_W, i*GRID_SIZE);
		}
		for (let i=0; i<CANVAS_W/GRID_SIZE; i++){
			line(i*GRID_SIZE, 0, i*GRID_SIZE, CANVAS_H);
		}
	}
	if (startFlag==false){
		fill(255);
		stroke(255);
		textSize(64);
		textAlign(CENTER);
		text(endTime.toFixed(1)+' sec', CANVAS_W/2, GRID_SIZE*3);
	}
	if (hands.move){
		if ((hands.angle<HAND_TOSS_ANGLE) && (hands.angle+HAND_SPEED >= HAND_TOSS_ANGLE)){
			if (hands.ball>=0){
				balls[hands.ball].caught = false;
				balls[hands.ball].speed.x = BALL_TOSS_SPEED*cos((HAND_TOSS_ANGLE+90)*PI/180);
				balls[hands.ball].speed.y = BALL_TOSS_SPEED*sin((HAND_TOSS_ANGLE+90)*PI/180);
				if (balls.length<BALL_NUM){
					let ball = ballInit();
					balls.push(ball);
					hands.ball = balls.length-1;
				}else{
					hands.ball = -1;
				}
			}
			hands.enable = false;
		}
		hands.angle += HAND_SPEED;
		if (hands.angle>=HAND_ENABLE_ANGLE){
			hands.enable = true;
		}
		if (hands.angle>=360){
			hands.angle = 0;
			hands.move = false;
		}
	}
	strokeWeight(0);
	fill(HAND_COLOR);
	const hx = HAND_CENTER_X+HAND_MOVE_R*cos(hands.angle*PI/180);
	const hy = HAND_CENTER_Y+HAND_MOVE_R*sin(hands.angle*PI/180);
	circle(hx, hy, HAND_SIZE);
	for (let i=0; i<balls.length; i++){
		if (!balls[i].caught){
			balls[i].pos.x += balls[i].speed.x;
			balls[i].pos.y += balls[i].speed.y;
			balls[i].speed.y += GRAVITY;
			if (balls[i].pos.y>=CANVAS_H){
				balls.splice(i+i,1);
			}
			if (sqrt((balls[i].pos.x-hx)*(balls[i].pos.x-hx)+(balls[i].pos.y-hy)*(balls[i].pos.y-hy)) <= CATCH_RANGE){
				if (hands.enable && (hands.ball<0)){
					balls[i].caught = true;
					hands.ball = i;
				}
			}
		}else{
			balls[i].pos.x = hx;
			balls[i].pos.y = hy;
		}
		fill(BALL_COLOR);
		circle(balls[i].pos.x, balls[i].pos.y, BALL_SIZE);
	}
	fill(255);
	stroke(255);
	textSize(16);
	strokeWeight(1);
	let debugY = DEBUG_VIEW_Y;
	text('fps:'+fps, DEBUG_VIEW_X, debugY);
	debugY += DEBUG_VIEW_H;
	text('ball:'+balls.length, DEBUG_VIEW_X,debugY);
	debugY += DEBUG_VIEW_H;
	text('hand:'+hands.enable, DEBUG_VIEW_X,debugY);
}
function touchMoved() {
	return false;
}