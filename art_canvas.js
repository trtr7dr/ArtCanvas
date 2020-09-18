class ArtCanvas {

    rInt(min, max) {
        let rand = min + Math.random() * (max + 1 - min);
        return Math.floor(rand);
    }

    constructor(element_id) {
        this.id = element_id;
    }

    ready() {
        let canv = document.createElement('canvas');
        canv.id = 'artcanvas' + this.id;
        canv.style.width = "100vw";
        canv.style.height = "100vh";
        document.body.appendChild(canv);
        document.getElementById(this.id).appendChild(canv);
    }

    setup(mix = 'source-out', alpha = 1, color = 'black') {
        this.ctx.globalCompositeOperation = mix;
        this.ctx.globalAlpha = alpha;
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
    }

    init() {

        this.canvas = document.getElementById("artcanvas" + this.id);
        if (this.canvas === null) {
            this.ready();
            this.canvas = document.getElementById("artcanvas" + this.id);
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        }

        this.ctx = this.canvas.getContext("2d");
        this.w = this.canvas.width;
        this.h = this.canvas.height;
        if (this.rInt(1, 3) === 1) {
            this.ctx.beginPath();
            this.setup();
        }
    }

    plotCBez(ptCount, pxTolerance, Ax, Ay, Bx, By, Cx, Cy, Dx, Dy) {
        let deltaBAx = Bx - Ax;
        let deltaCBx = Cx - Bx;
        let deltaDCx = Dx - Cx;
        let deltaBAy = By - Ay;
        let deltaCBy = Cy - By;
        let deltaDCy = Dy - Cy;
        let ax, ay, bx, by;
        let lastX = -10000;
        let lastY = -10000;
        let pts = [{x: Ax, y: Ay}];
        for (let i = 1; i < ptCount; i++) {
            let t = i / ptCount;
            ax = Ax + deltaBAx * t;
            bx = Bx + deltaCBx * t;
            let cx = Cx + deltaDCx * t;
            ax += (bx - ax) * t;
            bx += (cx - bx) * t;
            //
            ay = Ay + deltaBAy * t;
            by = By + deltaCBy * t;
            let cy = Cy + deltaDCy * t;
            ay += (by - ay) * t;
            by += (cy - by) * t;
            let x = ax + (bx - ax) * t;
            let y = ay + (by - ay) * t;
            let dx = x - lastX;
            let dy = y - lastY;
            if (dx * dx + dy * dy > pxTolerance) {
                x += this.rInt(1, 15) - this.rInt(1, 15);
                y += this.rInt(1, 15) - this.rInt(1, 15);
                this.ctx.rect(x, y, 1, 1);
                lastX = x;
                lastY = y;
            }
        }
        return 0;
    }

    bcurve(pnts, close = false) {
        let p0, p1, p2, p3, cp1x, cp1y, cp2x, cp2y;
        for (let i = 0; i < Object.keys(pnts).length - 2; i += 1) {
            this.ctx.moveTo(pnts[i].x, pnts[i].y);
            p0 = (i > 0) ? pnts[i - 1] : pnts[0];
            p1 = pnts[i];
            p2 = pnts[i + 1];
            p3 = (i !== Object.keys(pnts).length - 2) ? pnts[i + 2] : p1;
            cp1x = p1.x + (p2.x - p0.x) / 6;
            cp1y = p1.y + (p2.y - p0.y) / 6;
            cp2x = p2.x - (p3.x - p1.x) / 6;
            cp2y = p2.y - (p3.y - p1.y) / 6;
            this.ctx.moveTo(pnts[i].x, pnts[i].y);
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);

        }

        if (close) {
            p1 = pnts[Object.keys(pnts).length - 1];
            p2 = pnts[0];
            p3 = pnts[Object.keys(pnts).length - 1];
            cp1x = p1.x + (p2.x - p0.x) / 16;
            cp1y = p1.y + (p2.y - p0.y) / 6;
            cp2x = p2.x - (p3.x - p1.x) / 6;
            cp2y = p2.y - (p3.y - p1.y) / 6;
            this.ctx.moveTo(pnts[Object.keys(pnts).length - 1].x, pnts[Object.keys(pnts).length - 1].y);
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, pnts[0].x, pnts[0].y);
    }
    }

    random_blend_mode() {
        let m = ['source-out', 'source-out', 'color'];
        return m[this.rInt(0, m.length - 1)];
    }

}

class CircArt extends ArtCanvas {

    constructor(id) {
        super(id);
        this.init();
    }

    sin_trans(i, self) {
        return Math.sin(1 / i) * self.h + (self.h / i);
    }

    arc_point(x, y, r) {

        let res = [];
        for (let i = 0; i < 360; i++) {
            res[i] = {
                'x': x + r * Math.cos(i),
                'y': y + r * Math.sin(i)
            };
        }
        return res;
    }
    gen_point(f, n) {
        let res = [];
        for (let i = 0; i < n; i++) {
            res[i] = {
                'x': this.w / n * i,
                'y': f(i, n, this)
            };
        }
        res[0].x = 0;
        return res;
    }

    random_arc(x, y, r, p = 35) {
        let pnts = this.arc_point(x, y, r);
        for (let i = 0; i < Object.keys(pnts).length; i++) {
            pnts[i].x += this.rInt(1, p) - this.rInt(1, p);
            pnts[i].y += this.rInt(1, p) - this.rInt(1, p);
        }
        this.ctx.stroke();
        this.bcurve(pnts, true);

    }

    paint_arc() {

        this.ctx.moveTo(0, this.h / 2);
        let rnd = this.rInt(5, 70);
        for (let i = 0; i < this.rInt(40, 80); i++) {
            this.random_arc(this.rInt(0, this.w), this.rInt(0, this.h), i * this.rInt(1, 50), rnd);
        }

    }
}

class LineArt extends ArtCanvas {
    constructor(id) {
        super(id);
        this.init();
        this.setup('source-out', (1 - 10 / this.rInt(11, 100)));
    }

    drow_lines(v) {
        for (let i = 0; i < Object.keys(v).length; i++) {
            this.ctx.rect(v[i].x, v[i].y, 1, 1);
        }
        this.ctx.stroke();
    }

    y_rand(i, self) {
        return Math.cos(1 / i) * self.h + (self.h / i);
    }

    gen_point(n) {
        let res = [];
        for (let i = 1; i <= n; i++) {
            res[i] = {
                'x': this.w / n * (i + 1),
                'y': this.rInt(this.h / 10, this.h - this.h / 10)
            };
        }
        res[0] = {
            'x': 0,
            'y': this.rInt(0, this.h)
        };
        return res;
    }

    paint_line(type, f) {
        let def_rand = this.rInt(1, 15);
        let coutn_rnd = this.rInt(10, 100);
        let point = this.gen_point(20);
        for (let i = 0; i < this.rInt(coutn_rnd, 200); i++) {
            for (let s = 0; s < Object.keys(point).length - 1; s += 1) {
                switch (type) {
                    case 'rand':
                        point[s].x += this.rInt(1, 15) - this.rInt(1, 15);
                        point[s].y += this.rInt(1, 15) - this.rInt(1, 15);
                        break;
                    case 'wave':
                        point[s].y += def_rand;
                        break;
                    case 'drug':
                        point[s].y += this.h * Math.tan(s / 100);
                        break;
                    default:
                        point[s].y += this.rInt(1, 15) - this.rInt(1, 15);
                }

            }
            this.bcurve(point);
        }

        this.ctx.stroke();
    }

    paint_lines_texture() {
        for (let i = 0; i < this.rInt(1, 50); i++) {
            this.paint_line();
        }
    }
}

class FacArt extends ArtCanvas {

    constructor(id) {
        super(id);
        this.init();
    }

    str() {
        this.ctx.stroke();
    }

    dragon(x1, y1, x2, y2, k) {
        if (k > 0) {
            let xs = (x1 + x2) / 2 + (y2 - y1) / 2;
            let ys = (y1 + y2) / 2 - (x2 - x1) / 2;

            this.dragon(x2, y2, xs, ys, k - 1);
            this.dragon(x1, y1, xs, ys, k - 1);


        } else {
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
        }
    }

    drow_dragon(i = 15, n = 5) {
        let w = this.rInt(0, this.w * this.rInt(1, 3));
        let h = this.rInt(0, this.h);
        this.ctx.lineWidth = this.rInt(1, 100);

        for (let z = 0; z < n; z++) {
            this.dragon(w, h, this.rInt(0, this.w), this.rInt(0, this.h), i);
            this.ctx.stroke();
            if (this.rInt(1, 3) === 3) {
                this.ctx.beginPath();
            }

    }

    }
}

let id = 'test';
var circArt = new CircArt(id);
var lineArt = new LineArt(id);
var facArt = new FacArt(id);

facArt.drow_dragon(10);

class ArtPresets {
    line() {
        lineArt.paint_line();
    }
    many_line() {
        lineArt.paint_lines_texture();
    }
    circle() {
        circArt.paint_arc();
    }
    wave() {
        lineArt.paint_line('wave');
    }
    set_all_rand() {
        if (Math.random() > 0.5) {
            circArt.paint_arc();
        }
        if (Math.random() > 0.5) {
            lineArt.paint_line();
        }
        if (Math.random() > 0.5) {
            lineArt.paint_lines_texture();
        }
    }
}

var sets = new ArtPresets();
//sets.set_all_rand();

//lineArt.paint_line('drug', lineArt.sin_point);


