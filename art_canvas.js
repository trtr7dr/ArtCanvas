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
        this.ctx.globalAlpha = 1;
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
        this.flag = true;
        this.global_rand = Math.random();
    }
    
    rand_color(){
        if(this.global_rand > 0.5){
            this.ctx.strokeStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
            this.ctx.fillStyle = '#' + Math.floor(Math.random()*16777215).toString(16);
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

    set_smooth() {
        this.ctx.mozImageSmoothingEnabled = true;
        this.ctx.webkitImageSmoothingEnabled = true;
        this.ctx.msImageSmoothingEnabled = true;
        this.ctx.imageSmoothingEnabled = true;
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
        this.rand_color();
        let pnts = this.arc_point(x, y, r);
        for (let i = 0; i < Object.keys(pnts).length; i++) {
            pnts[i].x += this.rInt(1, p) - this.rInt(1, p);
            pnts[i].y += this.rInt(1, p) - this.rInt(1, p);
        }
        this.bcurve(pnts, true);
        this.ctx.stroke();
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
            this.ctx.fillRect(v[i].x, v[i].y, 1, 1);
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
    regen_point(n){
        let res = [];
        for (let i = 0; i <= n; i++) {
            res[i] = {
                'x': this.rInt(0, this.w),
                'y': Math.cos(this.rInt(0, this.h))
            };
        }
        return res;
    }

    paint_line(type) {
        let def_rand = this.rInt(1, 15);
        let coutn_rnd = this.rInt(10, 100);
        let point;
        
        if(type === 'land'){
            point = this.regen_point(20);
        }else{
            point = this.gen_point(20);
        }
        
        for (let i = 0; i < coutn_rnd; i++) {
            for (let s = 0; s < Object.keys(point).length - 1; s += 1) {
                switch (type) {
                    case 'rand':
                        point[s].x += this.rInt(1, 15) - this.rInt(1, 15);
                        point[s].y += this.rInt(1, 15) - this.rInt(1, 15);
                        break;
                    case 'wave':
                        point[s].y += def_rand;
                        break;
                    case 'land':
                        if(this.global_rand > 0.5){
                            point[s].x += Math.tan(this.rInt(0, this.h));
                            point[s].y += Math.abs(Math.tan(s)) + s * this.rInt(1,4);
                        }else{
                            point[s].y += Math.abs(Math.tan(s));
                        }
                        //
                        
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

    dragon(x1, y1, x2, y2, k, rand) {
        if (k > 0) {
            let xs, ys;
            if (this.global_rand < 0.5) {
                xs = (x1 + x2) / 2 + (y2 - y1) / (this.global_rand * 10);
                ys = (y1 + y2) / 2 - (x2 - x1) / (this.global_rand * 10);
            } else {
                xs = (x1 + x2) / 2 + (y2 - y1) / 2;
                ys = (y1 + y2) / 2 - (x2 - x1) / 2;
            }

            this.dragon(x2, y2, xs, ys, k - 1, rand);
            this.dragon(x1, y1, xs, ys, k - 1, rand);

        } else {
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            if (rand === true && this.rInt(0, 1) === 1) {
                this.ctx.lineTo(x2, y1);
                this.ctx.lineTo(x1, y2);
            }
        }
    }

    dragon_texture() {
        let n = this.rInt(1, 10);
        this.ctx.lineWidth = this.rInt(1, 45);
        for (let i = n; i > 0; i--) {
            this.rand_color();
            if (this.global_rand > 0.5) {
                this.dragon(this.w - this.w / i, this.h / i - this.h / (this.global_rand * 10), this.w + this.w / i, this.h * i * (this.global_rand * 10), 15 - this.rInt(0, i), false);
            } else {
                this.dragon(0, this.h / i, 0, this.h * i * 2, 15 - this.rInt(0, i), false);
            }
            
        this.ctx.stroke(); 
       }
        
    }

    compose_dragon(n = 5, rand_line = true) {
        let i = this.rInt(5, 11);

        let w = this.rInt(0, this.w * this.rInt(1, 3));
        let h = this.rInt(0, this.h);
        this.ctx.lineWidth = this.rInt(1, 100);

        for (let z = 0; z < n; z++) {
            this.dragon(w, h, this.rInt(0, this.w), this.rInt(0, this.h), i, rand_line);
            this.ctx.stroke();
            if (this.rInt(1, 3) === 3) {
                this.ctx.beginPath();
            }
        }
    }

    man_color() {
        let res = [];
        let rnd = Math.random();
        res[0] = (rnd > 0.5) ? this.rInt(0, 255) : 0;
        for (let i = 1; i < 104; i++) {
            res[i] = (rnd > 0.5) ? this.rInt(0, 255) : res[i - 1] + this.rInt(1, 10);
        }
        return res;
    }
    
    

    man_function(coord, x, y, c, type, rnd) {
        let res = (coord === 'x') ? x * x - y * y + c.x : 2 * x * y + c.y;
        if (type === 'rand') {
            let t = (rnd === 16) ? this.rInt(1,15) : rnd;
            switch (t) {
                case 1:
                    res = (coord === 'x') ? Math.tan(res) : Math.tan(res);
                    break;
                case 2:
                    res = (coord === 'x') ? Math.tan(res) : res;
                    break;
                case 3:
                    res = (coord === 'x') ? Math.cos(res) : res;
                    break;
                case 4:
                    res = (coord === 'x') ? res : Math.cos(res);
                    break;
                case 5:
                    res = (coord === 'x') ? Math.abs(res) : Math.abs(res);
                    break;
                case 6:
                    res = (coord === 'x') ? res : Math.abs(res);
                    break;
                case 7:
                    res = (coord === 'x') ? Math.abs(res) : res;
                    break;
                case 8:
                    res = (coord === 'x') ? Math.tan(res) : Math.abs(res);
                    break;
                case 9:
                    res = (coord === 'x') ? Math.tan(res) : Math.tan(Math.abs(res));
                    break;
                case 10:
                    res = (coord === 'x') ? Math.tan(res) : Math.sin(Math.abs(res));
                    break;
                case 11:
                    res = (coord === 'x') ? Math.tan(res) : Math.cos(Math.abs(res));
                    break;
                case 12:
                    res = (coord === 'x') ? Math.cos(res) : Math.abs(res);
                    break;
                case 13:
                    res = (coord === 'x') ? Math.abs(Math.sin(res)) : res;
                    break;
                case 14:
                    res = (coord === 'x') ? Math.abs(Math.sin(res)) : Math.tan(Math.abs(res));
                    break;
                case 15:
                    res = (coord === 'x') ? res : Math.tan(Math.abs(res));
                    break;
                default:
                    res = (coord === 'x') ? Math.abs(res) : Math.abs(res);
                    break;
            }
        }
        return res;
    }
     mandelbrot_alt(x_min, x_max, y_min, y_max, sx = 0, sy = 0) {
        let r_color = this.def_color();

        let img_w = this.w;
        let img_h = this.h;

        let c = {
            x: sx,
            y: sy
        };
        
        let step;
        
        if (x_min >= 0 && x_max >= 0) {
            step = (x_min + x_max) / img_w;
        } else if (x_min < 0 && x_max >= 0) {
            step = (x_max - x_min) / img_w;
        } else {
            step = ((-1) * x_min + x_max) / img_w;
        }

        let image = this.ctx.createImageData(img_w, img_h);
        let yy = 0, xx = 0;
       
        for (let y = y_min; y < y_max; y = y + step) {
            xx = 0;
            for (let x = x_min; x < x_max; x = x + step) {
                let x0 = x;
                let y0 = y;
                let X = 0;
                let Y = 0;
                
                let n = 0, lim = 64, xtemp;
                while ((X + Y <= 4) && (n < lim)) {
                    xtemp = X*X - Y*Y + x0 + c.x;
                    Y = 2*X*Y + y0 + c.y;
                    X = xtemp;
                    n++;
                }
                let pixelindex = (yy * img_w + xx) * 4;
                image.data[pixelindex] = r_color[n];
                image.data[pixelindex + 1] = r_color[n];
                image.data[pixelindex + 2] = r_color[n];
                image.data[pixelindex + 3] = 255;
                xx++;
            }
            yy++;
        }
        
        

        if (Math.random() > 0.4) {
            this.set_smooth();
        }

        this.ctx.putImageData(image, 0, 0);
    }
    
}
    mandelbrot() {
        let rand_f = (this.global_rand > 0.5) ? 'rand' : '';
        let rand_type = this.rInt(1,16);
        let r_color = this.man_color();

        let img_w = this.w;
        let img_h = this.h;

        let c = {
            x: 2 * Math.random() - 2 * Math.random(),
            y: 2 * Math.random() - 2 * Math.random()
        };
        let scalefactor = Math.random() - Math.random(), scale = this.rInt(1, 2);
        let x_min = -1 * scale + scalefactor;
        let x_max = 1 * scale + scalefactor;
        let y_min = -1 * scale + 1 + scalefactor;
        let y_max = 1 * scale + scalefactor;
        let step;
        if (x_min >= 0 && x_max >= 0) {
            step = (x_min + x_max) / img_w;
        } else if (x_min < 0 && x_max >= 0) {
            step = (x_max - x_min) / img_w;
        } else {
            step = ((-1) * x_min + x_max) / img_w;
        }

        let image = this.ctx.createImageData(img_w, img_h);
        let yy = 0, xx = 0;
        let red = this.rInt(1, 4), green = this.rInt(1, 4), blue = this.rInt(1, 4);

        for (let y = y_min; y < y_max; y = y + step) {
            xx = 0;
            for (let x = x_min; x < x_max; x = x + step) {
                let X = x;
                let Y = y;
                let ix = 0, iy = 0, n = 0, lim = 64;
                while ((ix * ix + iy * iy < 4) && (n < lim)) {
                    lim = (this.global_rand > 0.5) ? this.rInt(24, 104) : 64;
                    ix = this.man_function('x', X, Y, c, rand_f, rand_type);
                    iy = this.man_function('y', X, Y, c, rand_f, rand_type);
                    X = ix;
                    Y = iy;
                    n += 1;
                }
                let pixelindex = (yy * img_w + xx) * 4;
                image.data[pixelindex] = r_color[n * red];
                image.data[pixelindex + 1] = r_color[n * green];
                image.data[pixelindex + 2] = r_color[n * blue];
                image.data[pixelindex + 3] = 255;
                xx++;
            }
            yy++;
        }

        if (Math.random() > 0.4) {
            this.set_smooth();
        }

        this.ctx.putImageData(image, 0, 0);
    }
}

class AttractArt extends ArtCanvas {

    constructor(id) {
        super(id);
        this.init();
    }

    grad_color() {
        let res = [];
        res[0] = this.rInt(0, 255);
        for (let i = 1; i < 1000000; i++) {
            res[i] = 0;
            if (res[i] > 255) {
                res[i] = 0;
            }
        }
        return res;
    }

    lorenc() {
        this.set_smooth();
        var x = this.rInt(1, 10), y = this.rInt(1, 15), z = this.rInt(1, 20), x1, y1, z1;
        var dt = 0.0001 + this.global_rand / 100000;
        var a = this.rInt(4, 7), b = this.rInt(10, 20), c = this.rInt(1, 2);

        var id = this.ctx.createImageData(this.w, this.h);
        var rd = Math.round;
        var idx = 0;
        let i = 100000 * this.rInt(1, 10);

        let color = this.grad_color();

        let point = {};

        while (i--) {
            x1 = x + a * (-x + y) * dt;
            y1 = y + (b * x - y - z * x) * dt;
            z1 = z + (-c * z + x * y) * dt;
            x = x1;
            y = y1;
            z = z1;
            idx = 4 * (rd(50 * (y - x * Math.random()) + this.h) + rd(-10 * (z + x * Math.random()) + this.h / 2) * this.w);

            id.data[idx] = color[i];
            id.data[idx + 1] = color[i];
            id.data[idx + 2] = color[i];

            id.data[idx + 3] = 255;
        }
        this.ctx.putImageData(id, 0, 0);
    }

}

let id = 'test';
var circArt = new CircArt(id);
var lineArt = new LineArt(id);
var facArt = new FacArt(id);
var attArt = new AttractArt(id);


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
    land() {
        lineArt.paint_lines_texture();
        lineArt.paint_line('land');
    }
    dragon(num = 10) {
        facArt.dragon_texture();
    }
    dragon_compose(){
        attArt.lorenc();
        facArt.compose_dragon();
    }
    fra_man(){
        facArt.mandelbrot();
    }
}

var sets = new ArtPresets();
sets.fra_man();

//var f = 30;
//let xxx = 0;
//let yyy = 0;
//let tmp = 1;
//$.doTimeout( 'someid', 50, function(){
//    
//  if ( f < 1 ) {
//    return false;
//  }
//  tmp -= 0.1;
//  facArt.mandelbrot_alt(tmp*-1, tmp,-1,1, xxx, yyy);
//  xxx -= 0.01;
//  yyy -= 0.001;
//  f--;
//  return true;
//});
