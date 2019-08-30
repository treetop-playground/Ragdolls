/*
  Warren Galyen
  Verlet Integration
  from Coding Math by Keith Peters.

  My Github repositories:
  https://www.github.com/wgalyen
  https://www.github.com/warrengalyen
*/

function distance(p0, p1) {
    var x = p1.x - p0.x;
    var y = p1.y - p0.y;
    return Math.sqrt(x * x + y * y);
}

class Point {
    constructor(x, y, extremity, gravity, radius) {
        this.x = x;
        this.y = y;
        this.oldx = x;
        this.oldy = y;
        this.extremity = extremity;
        if (extremity) {
            this.r = 5;
        } else {
            this.r = radius || 1;
        }
        this.g = gravity || 0.1;
    }   
}

class Stick {
    constructor(p0, p1, invisible) {
        this.p0 = p0;
        this.p1 = p1;
        this.length = distance(p0, p1);
        this.invisible = invisible;
    }
}

class World {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.ctx = canvas.getContext("2d");
        this.h = this.canvas.height = window.innerHeight;
        this.w = this.canvas.width = window.innerWidth;
        this.ctx.lineWidth = 2;

        this.bounce = 0.65;
        this.friction = 0.994;

        this.points = [];
        this.sticks = [];
        this.createRagdoll(100, 0);
        this.createRagdoll(300, 0);
        
        this.isDragging = false;
        this.dragPoint = undefined;

        this.canvas.addEventListener(
            "mousedown",
            event => this.onMouseDown(event)
        );
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        document.getElementById("jump").addEventListener(
            "click",
            () => this.onJumpClick()
        );
    }

    createRagdoll(x0, y0) {
        // Start index
        var i0 = this.points.length;

        // Head
        var h = new Point(x0, y0, false, 0.12, 15);
        h.head = true;
        h.oldx = x0 + (Math.random() - 0.5) * 25;
        this.points.push(h);

        // Groin
        this.points.push(new Point(x0, y0 + 80, false, 0.15));

        // Hips
        this.points.push(new Point(x0 + 15, y0 + 90, false, 0.12));
        this.points.push(new Point(x0 - 15, y0 + 90, false, 0.12));

        // Knees
        this.points.push(new Point(x0 + 20, y0 + 130));
        this.points.push(new Point(x0 - 20, y0 + 130));

        // Feet
        this.points.push(new Point(x0 + 20, y0 + 180, true));
        this.points.push(new Point(x0 - 20, y0 + 180, true));

        // Neck
        this.points.push(new Point(x0, y0 + 25));
        // Shoulders
        this.points.push(new Point(x0 + 15, y0 + 25));
        this.points.push(new Point(x0 - 15, y0 + 25));

        // Hands
        this.points.push(new Point(x0 + 15, y0 + 105, true));
        this.points.push(new Point(x0 - 15, y0 + 105, true));

        // "Muscles"
        // Head - shoulders
        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 9], true));
        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 10], true));
        // Shoulder - shoulder
        this.sticks.push(new Stick(this.points[i0 + 9], this.points[i0 + 10], true));

        // Shoulders - hips
        this.sticks.push(new Stick(this.points[i0 + 9], this.points[i0 + 2], true));
        this.sticks.push(new Stick(this.points[i0 + 10], this.points[i0 + 3], true));
        // Shoulders - hips opposite side
        this.sticks.push(new Stick(this.points[i0 + 9], this.points[i0 + 3], true));
        this.sticks.push(new Stick(this.points[i0 + 10], this.points[i0 + 2], true));

        // Hips - feet
        this.sticks.push(new Stick(this.points[i0 + 2], this.points[i0 + 6], true));
        this.sticks.push(new Stick(this.points[i0 + 3], this.points[i0 + 7], true));

        // Hips - feet, opposite
        this.sticks.push(new Stick(this.points[i0 + 2], this.points[i0 + 7], true));
        this.sticks.push(new Stick(this.points[i0 + 3], this.points[i0 + 6], true));

        // Head - groin
        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 1], true));

        // Hip - hip
        this.sticks.push(new Stick(this.points[i0 + 2], this.points[i0 + 3], true));
        // Shoulder - hip
        this.sticks.push(new Stick(this.points[i0 + 9], this.points[i0 + 2], true));
        this.sticks.push(new Stick(this.points[i0 + 10], this.points[i0 + 3], true));

        // Head - knee
        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 4], true));
        // Head - knee
        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 5], true));

        // Head feet
        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 6], true));
        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 7], true));

        // Body parts
        // Hips
        this.sticks.push(new Stick(this.points[i0 + 1], this.points[i0 + 2]));
        this.sticks.push(new Stick(this.points[i0 + 1], this.points[i0 + 3]));
        // Legs
        this.sticks.push(new Stick(this.points[i0 + 2], this.points[i0 + 4]));
        this.sticks.push(new Stick(this.points[i0 + 3], this.points[i0 + 5]));
        this.sticks.push(new Stick(this.points[i0 + 4], this.points[i0 + 6]));
        this.sticks.push(new Stick(this.points[i0 + 5], this.points[i0 + 7]));

        this.sticks.push(new Stick(this.points[i0], this.points[i0 + 8]));
        this.sticks.push(new Stick(this.points[i0 + 8], this.points[i0 + 1]));

        // Left arm
        this.sticks.push(new Stick(this.points[i0 + 8], this.points[i0 + 9]));
        this.sticks.push(new Stick(this.points[i0 + 9], this.points[i0 + 11]));

        // Right arm
        this.sticks.push(new Stick(this.points[i0 + 8], this.points[i0 + 10]));
        this.sticks.push(new Stick(this.points[i0 + 10], this.points[i0 + 12]));
    }

    onJumpClick() {
        var p = this.points[0];
        p.oldy = p.y + 50;
    }

    onMouseDown(event) {
        var x = event.clientX;
        var y = event.clientY;
        var p0 = { x: x, y: y };
        var p1 = this.getClosestPoint(p0);
        var dist = this.distance(p0, p1);
        if (dist < 30) {
            this.dragPoint = p1;
            this.dragPoint.x = x;
            this.dragPoint.y = y;
            this.dragPoint.oldx = x;
            this.dragPoint.oldy = y;
            this.dragPoint.pinned = true;
            this.isDragging = true;
            this.canvas.addEventListener("mousemove", this.onMouseMove);
            this.canvas.addEventListener("mouseup", this.onMouseUp);
        }
    }

    onMouseMove(event) {
        this.dragPoint.oldx = this.dragPoint.x;
        this.dragPoint.oldy = this.dragPoint.y;
        this.dragPoint.x = event.clientX;
        this.dragPoint.y = event.clientY;
    }

    onMouseUp(event) {
        this.dragPoint.pinned = false;
        this.isDragging = false;
        this.canvas.removeEventListener("mousemove", this.onMouseMove);
        this.canvas.removeEventListener("mouseup", this.onMouseUp);
    }

    getClosestPoint(p0) {
        var index = 0;
        this.points.map(p1 => this.distance(p0, p1)).reduce((prev, curr, i) => {
            if (curr < prev) {
                index = i;
            }
            return Math.min(curr, prev);
        });
        return this.points[index];
    }

    distance(p0, p1) {
        var x = p1.x - p0.x;
        var y = p1.y - p0.y;
        return Math.sqrt(x * x + y * y);
    }

    update() {
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(0, 0, this.w, this.h);
        this.updatePoints();
        this.updateSticks();
        this.drawSticks();
        this.drawHeads();
        this.drawExtremities();
    }

    drawHeads() {
        this.ctx.fillStyle = "black";
        this.points.filter(p => p.head).forEach(h => {
            this.ctx.beginPath();
            this.ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawExtremities() {
        this.ctx.fillStyle = "black";
        this.points.filter(p => p.extremity).forEach(e => {
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawSticks() {
        this.sticks.forEach(s => {
            this.ctx.beginPath();
            if (s.invisible) {
                this.ctx.strokeStyle = "rgba(255, 0, 0, 0.2)";
            } else {
                this.ctx.strokeStyle = "black";
            }
            this.ctx.moveTo(s.p0.x, s.p0.y);
            this.ctx.lineTo(s.p1.x, s.p1.y);
            this.ctx.stroke();
        });
    }

    updatePoints() {
        this.points.forEach(p => {
            if (!p.pinned) {
                var vx = (p.x - p.oldx) * this.friction;
                var vy = (p.y - p.oldy) * this.friction;
                p.oldx = p.x;
                p.oldy = p.y;
                // Ground friction
                if (p.y + p.r > this.h - 1) {
                    vx = 0;
                }
                p.x += vx;
                p.y += vy;
                p.y += p.g;

                if (p.x + p.r > this.w) {
                    p.x = this.w - p.r;
                    p.oldx = p.x + vx * this.bounce;
                }
                if (p.x - p.r < 0) {
                    p.x = p.r;
                    p.oldx = p.x + vx * this.bounce;
                }

                if (p.y + p.r > this.h) {
                    p.y = this.h - p.r;
                    p.oldy = p.y + vy * this.bounce;
                }
                if (p.y - p.r < 0) {
                    p.y = p.r;
                    p.oldy = p.y + vy * this.bounce;
                  }
            }
        });
    }

    updateSticks() {
        this.sticks.forEach(s => {
            var dx = s.p1.x - s.p0.x;
            var dy = s.p1.y - s.p0.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            var diff = s.length - dist;
            var percent = diff / dist / 2;
            if (s.invisible) {
                // This is a "muscle", it should be
                // more elastic than the bones.
                percent /= 3;
            }
            var offsetX = dx * percent;
            var offsetY = dy * percent;

            if (!s.p0.pinned) {
                s.p0.x -= offsetX;
                s.p0.y -= offsetY;
              }
              if (!s.p1.pinned) {
                s.p1.x += offsetX;
                s.p1.y += offsetY;
              }
        });
    }
}

var world = new World();

function animate() {
    world.update();
    requestAnimationFrame(animate);
}

animate();
