const {ccclass, property} = cc._decorator;
@ccclass
export default class FireComponent extends cc.Component {
    @property
    isWidget: boolean = false;
    @property(cc.Node)
    _widgetTarget: cc.Node = null;
    @property(cc.Node)
    public get widgetTarget () {
        return this._widgetTarget;
    }
    public set widgetTarget (value) {
        this._widgetTarget = value;
        this.isWidget = !!this._widgetTarget;
        if (!CC_EDITOR) {
            this.initWidgit();
        }
    }

    private gfx: cc.Graphics = null;
    private particles: any[] = [];
    private all: any[] = [];
    onLoad () {
        this.gfx = this.node.addComponent(cc.Graphics);
        // widgit
        this.initWidgit();
        // touch
        this.initTouch();
    }

    onDestroy () {

    }

    private initWidgit () {
        // 全屏适配
        if (!this.isWidget) return;
        let canvas = cc.find("Canvas");
        let widget = this.node.addComponent(cc.Widget);
        widget.target = this.widgetTarget || canvas;
        widget.isAlignTop = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.isAlignBottom = true;
        widget.left = 0;
        widget.right = 0;
        widget.top = 0;
        widget.bottom = 0;
        widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
    }

    private initTouch () {
        // 点击事件
        this.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch)=>{
            let wpos = event.getLocation();
            let npos = this.node.convertToNodeSpaceAR(wpos);
            this.fire(npos.x, npos.y);
        })
    }

    private fire (x, y) {
        // 生成烟花
        this.createFireworks(x, y);
    }

    private tick () {
        this.drawFireworks();
    }

    private createFireworks (sx, sy) {
        this.particles=[];
        this.all = [];
        var hue = Math.floor(Math.random()*51)+150;
        var hueVariance = 30;
        var count = 100;
        for(var i = 0 ;i<count;i++){
            var angle = Math.floor(Math.random()*360);
            var phue = Math.floor(Math.random()*2*hueVariance)+(hue-hueVariance);
            var brightness = Math.floor(Math.random()*31)+50;
            var alpha = (Math.floor(Math.random()*61)+40)/100;
            var color = this.hsla2rgba('hsla('+phue+', 100%, '+brightness+'%)', alpha);
            var p = {
                radians: angle * Math.PI / 180,
                x: sx,
                y: sy,
                speed: (Math.random()*5)+.4,
                radius: 0,
                size: Math.floor(Math.random()*3)+1,
                r: color.r,
                g: color.g,
                b: color.b,
                alpha: alpha,
            };
            p.radius = p.speed;
            this.particles.push(p);
            var n = this.cloneObject(p);
            this.all.push(n);
        }
    }

    private colorBlend (c1: cc.Color, c2: cc.Color) : cc.Color {
        let c = cc.color();
        let alpha = 1-(1-c1.a/255)*(1-c2.a/255);
        c.a = Math.round(alpha * 255);
        c.r = Math.round((c1.r * (c1.a / 255) / alpha) + (c2.r * c2.a / 255 * (1 - (c1.a / 255)) / alpha));
        c.g = Math.round((c1.g * (c1.a / 255) / alpha) + (c2.g * c2.a / 255 * (1 - (c1.a / 255)) / alpha));
        c.b = Math.round((c1.b * (c1.a / 255) / alpha) + (c2.b * c2.a / 255 * (1 - (c1.a / 255)) / alpha));
        return c;
    }

    private isBlack (c: cc.Color) : boolean {
        let filter = 255 * 0.1;
        return c.r < filter && c.g < filter && c.b < filter; 
    }

    private cloneObject (p): any {
        let n = {};
        let keys = Object.keys(p);
        keys.forEach(key=>{
            n[key] = p[key];
        })
        return n;
    }

    private drawFireworks () {
        this.gfx.clear();
        // 混合
        let c = cc.color(0,0,0,26);
        for (var i = 0; i < this.all.length; ++i) {
            let p = this.all[i];
            let color = cc.color(p.r, p.g, p.b);
            color.a = Math.round(p.alpha * 255)
            color = this.colorBlend(c, color);
            p.alpha = color.a / 255;
            p.r = color.r;
            p.g = color.g;
            p.b = color.b;
            let isBlack = this.isBlack(cc.color(p.r, p.g, p.b));
            if (!isBlack) {
                this.gfx.arc(p.x, p.y, p.size, 0, Math.PI*2, false);
                this.gfx.fillColor = cc.color(p.r, p.g, p.b, Math.round(p.alpha * 255));
                this.gfx.fill();
            }
        }

        let isDraw = false;
        for(var i = 0 ;i<this.particles.length;i++){
            var p = this.particles[i];
            var vx = Math.cos(p.radians) * p.radius;
            var vy = Math.sin(p.radians) * p.radius + 0.4;
            p.x -= vx;
            p.y -= vy;
            p.radius *= 1 - p.speed/100;
            p.alpha -= 0.005;
            if (p.alpha > 0) {
                let color = cc.color(p.r, p.g, p.b);
                color.a = Math.round(p.alpha * 255);
                isDraw = true;
                this.gfx.arc(p.x, p.y, p.size, 0, Math.PI*2, false);
                this.gfx.fillColor = color;
                this.gfx.fill();
            }
        }

        if (isDraw) {
            this.all = this.all.filter(p=>!this.isBlack(cc.color(p.r, p.g, p.b)));
            this.particles.forEach(p=>{
                if (p.alpha > 0) {
                    let n = this.cloneObject(p);
                    this.all.push(n);
                }
            })
        } else {
            this.all = [];
            this.particles = [];
            this.gfx.clear();
        }
    }

    private hsla2rgba (str, alpha): cc.Color {
        const colorArr = str.match(/\d+/g);
        let [h, s, l] = colorArr;
        h = parseFloat(h) / 360;  
        s = parseFloat(s) / 100;  
        l = parseFloat(l) / 100;
        if (s === 0) {    
            l = Math.round(l * 255);
            return cc.color(l, l, l, Math.round(alpha * 255));
        }  
        const getRGB = num => {    
            let q = l >= 0.5 ? l + s - l * s : l * (1 + s); // 注意是数字1加上s，不是字母l
            let p = 2 * l - q;    
            if (num < 0) {      
                num += 1;    
            }    
            if (num > 1) {     
                num -= 1;    
            }    
            switch (true) {      
                case num > 2 / 3:        
                num = p;
                break;
                case num >= 1 / 2:
                num = p + (q - p) * 6 * (2 / 3 - num);
                break;
                case num >= 1 / 6:
                num = q;        
                break;      
                default:        
                num = p + (q - p) * 6 * num;        
                break;    
            }    
            return Math.round(num * 255);  
        };  
        let r = getRGB(h + 1 / 3);  
        let g = getRGB(h);  
        let b = getRGB(h - 1 / 3);
        return cc.color(r, g, b, Math.round(alpha * 255));
    }

    update () {
        this.tick();
    }
}