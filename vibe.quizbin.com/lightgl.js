/*
 * lightgl.js
 * http://github.com/evanw/lightgl.js/
 *
 * Copyright 2011 Evan Wallace
 * Released under the MIT license
 */
var GL = function() {
    var t;
    var r = {
        create: function(r) {
            r = r || {};
            var a = document.createElement("canvas");
            a.width = 800;
            a.height = 600;
            if (!("alpha"in r))
                r.alpha = false;
            try {
                t = a.getContext("webgl", r)
            } catch (o) {}
            try {
                t = t || a.getContext("experimental-webgl", r)
            } catch (o) {}
            if (!t)
                throw new Error("WebGL not supported");
            t.HALF_FLOAT_OES = 36193;
            e();
            i();
            n();
            u();
            return t
        },
        keys: {},
        Matrix: c,
        Indexer: h,
        Buffer: m,
        Mesh: d,
        HitTest: p,
        Raytracer: x,
        Shader: E,
        Texture: _,
        Vector: P
    };
    function e() {
        t.MODELVIEW = f | 1;
        t.PROJECTION = f | 2;
        var r = new c;
        var e = new c;
        t.modelviewMatrix = new c;
        t.projectionMatrix = new c;
        var i = [];
        var n = [];
        var a, o;
        t.matrixMode = function(r) {
            switch (r) {
            case t.MODELVIEW:
                a = "modelviewMatrix";
                o = i;
                break;
            case t.PROJECTION:
                a = "projectionMatrix";
                o = n;
                break;
            default:
                throw new Error("invalid matrix mode " + r)
            }
        }
        ;
        t.loadIdentity = function() {
            c.identity(t[a])
        }
        ;
        t.loadMatrix = function(r) {
            var e = r.m
              , i = t[a].m;
            for (var n = 0; n < 16; n++) {
                i[n] = e[n]
            }
        }
        ;
        t.multMatrix = function(r) {
            t.loadMatrix(c.multiply(t[a], r, e))
        }
        ;
        t.perspective = function(e, i, n, a) {
            t.multMatrix(c.perspective(e, i, n, a, r))
        }
        ;
        t.frustum = function(e, i, n, a, o, s) {
            t.multMatrix(c.frustum(e, i, n, a, o, s, r))
        }
        ;
        t.ortho = function(e, i, n, a, o, s) {
            t.multMatrix(c.ortho(e, i, n, a, o, s, r))
        }
        ;
        t.scale = function(e, i, n) {
            t.multMatrix(c.scale(e, i, n, r))
        }
        ;
        t.translate = function(e, i, n) {
            t.multMatrix(c.translate(e, i, n, r))
        }
        ;
        t.rotate = function(e, i, n, a) {
            t.multMatrix(c.rotate(e, i, n, a, r))
        }
        ;
        t.lookAt = function(e, i, n, a, o, s, u, f, l) {
            t.multMatrix(c.lookAt(e, i, n, a, o, s, u, f, l, r))
        }
        ;
        t.pushMatrix = function() {
            o.push(Array.prototype.slice.call(t[a].m))
        }
        ;
        t.popMatrix = function() {
            var r = o.pop();
            t[a].m = l ? new Float32Array(r) : r
        }
        ;
        t.project = function(r, e, i, n, a, o) {
            n = n || t.modelviewMatrix;
            a = a || t.projectionMatrix;
            o = o || t.getParameter(t.VIEWPORT);
            var s = a.transformPoint(n.transformPoint(new P(r,e,i)));
            return new P(o[0] + o[2] * (s.x * .5 + .5),o[1] + o[3] * (s.y * .5 + .5),s.z * .5 + .5)
        }
        ;
        t.unProject = function(i, n, a, o, s, u) {
            o = o || t.modelviewMatrix;
            s = s || t.projectionMatrix;
            u = u || t.getParameter(t.VIEWPORT);
            var f = new P((i - u[0]) / u[2] * 2 - 1,(n - u[1]) / u[3] * 2 - 1,a * 2 - 1);
            return c.inverse(c.multiply(s, o, r), e).transformPoint(f)
        }
        ;
        t.matrixMode(t.MODELVIEW)
    }
    function i() {
        var r = {
            mesh: new d({
                coords: true,
                colors: true,
                triangles: false
            }),
            mode: -1,
            coord: [0, 0, 0, 0],
            color: [1, 1, 1, 1],
            pointSize: 1,
            shader: new E("uniform float pointSize;varying vec4 color;varying vec4 coord;void main(){color=gl_Color;coord=gl_TexCoord;gl_Position=gl_ModelViewProjectionMatrix*gl_Vertex;gl_PointSize=pointSize;}","uniform sampler2D texture;uniform float pointSize;uniform bool useTexture;varying vec4 color;varying vec4 coord;void main(){gl_FragColor=color;if(useTexture)gl_FragColor*=texture2D(texture,coord.xy);}")
        };
        t.pointSize = function(t) {
            r.shader.uniforms({
                pointSize: t
            })
        }
        ;
        t.begin = function(t) {
            if (r.mode != -1)
                throw new Error("mismatched gl.begin() and gl.end() calls");
            r.mode = t;
            r.mesh.colors = [];
            r.mesh.coords = [];
            r.mesh.vertices = []
        }
        ;
        t.color = function(t, e, i, n) {
            r.color = arguments.length == 1 ? t.toArray().concat(1) : [t, e, i, n || 1]
        }
        ;
        t.texCoord = function(t, e) {
            r.coord = arguments.length == 1 ? t.toArray(2) : [t, e]
        }
        ;
        t.vertex = function(t, e, i) {
            r.mesh.colors.push(r.color);
            r.mesh.coords.push(r.coord);
            r.mesh.vertices.push(arguments.length == 1 ? t.toArray() : [t, e, i])
        }
        ;
        t.end = function() {
            if (r.mode == -1)
                throw new Error("mismatched gl.begin() and gl.end() calls");
            r.mesh.compile();
            r.shader.uniforms({
                useTexture: !!t.getParameter(t.TEXTURE_BINDING_2D)
            }).draw(r.mesh, r.mode);
            r.mode = -1
        }
    }
    function n() {
        var r = t
          , e = 0
          , i = 0
          , n = {}
          , a = false;
        var u = Object.prototype.hasOwnProperty;
        function f() {
            for (var t in n) {
                if (u.call(n, t) && n[t])
                    return true
            }
            return false
        }
        function l(r) {
            var n = {};
            for (var o in r) {
                if (typeof r[o] == "function") {
                    n[o] = function(t) {
                        return function() {
                            t.apply(r, arguments)
                        }
                    }(r[o])
                } else {
                    n[o] = r[o]
                }
            }
            n.original = r;
            n.x = n.pageX;
            n.y = n.pageY;
            for (var s = t.canvas; s; s = s.offsetParent) {
                n.x -= s.offsetLeft;
                n.y -= s.offsetTop
            }
            if (a) {
                n.deltaX = n.x - e;
                n.deltaY = n.y - i
            } else {
                n.deltaX = 0;
                n.deltaY = 0;
                a = true
            }
            e = n.x;
            i = n.y;
            n.dragging = f();
            n.preventDefault = function() {
                n.original.preventDefault()
            }
            ;
            n.stopPropagation = function() {
                n.original.stopPropagation()
            }
            ;
            return n
        }
        function c(e) {
            t = r;
            if (!f()) {
                o(document, "mousemove", h);
                o(document, "mouseup", m);
                s(t.canvas, "mousemove", h);
                s(t.canvas, "mouseup", m)
            }
            n[e.which] = true;
            e = l(e);
            if (t.onmousedown)
                t.onmousedown(e);
            e.preventDefault()
        }
        function h(e) {
            t = r;
            e = l(e);
            if (t.onmousemove)
                t.onmousemove(e);
            e.preventDefault()
        }
        function m(e) {
            t = r;
            n[e.which] = false;
            if (!f()) {
                s(document, "mousemove", h);
                s(document, "mouseup", m);
                o(t.canvas, "mousemove", h);
                o(t.canvas, "mouseup", m)
            }
            e = l(e);
            if (t.onmouseup)
                t.onmouseup(e);
            e.preventDefault()
        }
        function d() {
            a = false
        }
        function v() {
            n = {};
            a = false
        }
        o(t.canvas, "mousedown", c);
        o(t.canvas, "mousemove", h);
        o(t.canvas, "mouseup", m);
        o(t.canvas, "mouseover", d);
        o(t.canvas, "mouseout", d);
        o(document, "contextmenu", v)
    }
    function a(t) {
        var r = {
            8: "BACKSPACE",
            9: "TAB",
            13: "ENTER",
            16: "SHIFT",
            27: "ESCAPE",
            32: "SPACE",
            37: "LEFT",
            38: "UP",
            39: "RIGHT",
            40: "DOWN"
        };
        return r[t] || (t >= 65 && t <= 90 ? String.fromCharCode(t) : null)
    }
    function o(t, r, e) {
        t.addEventListener(r, e)
    }
    function s(t, r, e) {
        t.removeEventListener(r, e)
    }
    o(document, "keydown", function(t) {
        if (!t.altKey && !t.ctrlKey && !t.metaKey) {
            var e = a(t.keyCode);
            if (e)
                r.keys[e] = true;
            r.keys[t.keyCode] = true
        }
    });
    o(document, "keyup", function(t) {
        if (!t.altKey && !t.ctrlKey && !t.metaKey) {
            var e = a(t.keyCode);
            if (e)
                r.keys[e] = false;
            r.keys[t.keyCode] = false
        }
    });
    function u() {
        (function(r) {
            t.makeCurrent = function() {
                t = r
            }
        }
        )(t);
        t.animate = function() {
            var r = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || function(t) {
                setTimeout(t, 1e3 / 60)
            }
            ;
            var e = (new Date).getTime();
            var i = t;
            function n() {
                t = i;
                var a = (new Date).getTime();
                if (t.onupdate)
                    t.onupdate((a - e) / 1e3);
                if (t.ondraw)
                    t.ondraw();
                r(n);
                e = a
            }
            n()
        }
        ;
        t.fullscreen = function(r) {
            r = r || {};
            var e = r.paddingTop || 0;
            var i = r.paddingLeft || 0;
            var n = r.paddingRight || 0;
            var a = r.paddingBottom || 0;
            if (!document.body) {
                throw new Error("document.body doesn't exist yet (call gl.fullscreen() from " + "window.onload() or from inside the <body> tag)")
            }
            document.body.appendChild(t.canvas);
            document.body.style.overflow = "hidden";
            t.canvas.style.position = "absolute";
            t.canvas.style.left = i + "px";
            t.canvas.style.top = e + "px";
            function s() {
                t.canvas.width = window.innerWidth - i - n;
                t.canvas.height = window.innerHeight - e - a;
                t.viewport(0, 0, t.canvas.width, t.canvas.height);
                if (r.camera || !("camera"in r)) {
                    t.matrixMode(t.PROJECTION);
                    t.loadIdentity();
                    t.perspective(r.fov || 45, t.canvas.width / t.canvas.height, r.near || .1, r.far || 1e3);
                    t.matrixMode(t.MODELVIEW)
                }
                if (t.ondraw)
                    t.ondraw()
            }
            o(window, "resize", s);
            s()
        }
    }
    var f = 305397760;
    var l = typeof Float32Array != "undefined";
    function c() {
        var t = Array.prototype.concat.apply([], arguments);
        if (!t.length) {
            t = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
        }
        this.m = l ? new Float32Array(t) : t
    }
    c.prototype = {
        inverse: function() {
            return c.inverse(this, new c)
        },
        transpose: function() {
            return c.transpose(this, new c)
        },
        multiply: function(t) {
            return c.multiply(this, t, new c)
        },
        transformPoint: function(t) {
            var r = this.m;
            return new P(r[0] * t.x + r[1] * t.y + r[2] * t.z + r[3],r[4] * t.x + r[5] * t.y + r[6] * t.z + r[7],r[8] * t.x + r[9] * t.y + r[10] * t.z + r[11]).divide(r[12] * t.x + r[13] * t.y + r[14] * t.z + r[15])
        },
        transformVector: function(t) {
            var r = this.m;
            return new P(r[0] * t.x + r[1] * t.y + r[2] * t.z,r[4] * t.x + r[5] * t.y + r[6] * t.z,r[8] * t.x + r[9] * t.y + r[10] * t.z)
        }
    };
    c.inverse = function(t, r) {
        r = r || new c;
        var e = t.m
          , i = r.m;
        i[0] = e[5] * e[10] * e[15] - e[5] * e[14] * e[11] - e[6] * e[9] * e[15] + e[6] * e[13] * e[11] + e[7] * e[9] * e[14] - e[7] * e[13] * e[10];
        i[1] = -e[1] * e[10] * e[15] + e[1] * e[14] * e[11] + e[2] * e[9] * e[15] - e[2] * e[13] * e[11] - e[3] * e[9] * e[14] + e[3] * e[13] * e[10];
        i[2] = e[1] * e[6] * e[15] - e[1] * e[14] * e[7] - e[2] * e[5] * e[15] + e[2] * e[13] * e[7] + e[3] * e[5] * e[14] - e[3] * e[13] * e[6];
        i[3] = -e[1] * e[6] * e[11] + e[1] * e[10] * e[7] + e[2] * e[5] * e[11] - e[2] * e[9] * e[7] - e[3] * e[5] * e[10] + e[3] * e[9] * e[6];
        i[4] = -e[4] * e[10] * e[15] + e[4] * e[14] * e[11] + e[6] * e[8] * e[15] - e[6] * e[12] * e[11] - e[7] * e[8] * e[14] + e[7] * e[12] * e[10];
        i[5] = e[0] * e[10] * e[15] - e[0] * e[14] * e[11] - e[2] * e[8] * e[15] + e[2] * e[12] * e[11] + e[3] * e[8] * e[14] - e[3] * e[12] * e[10];
        i[6] = -e[0] * e[6] * e[15] + e[0] * e[14] * e[7] + e[2] * e[4] * e[15] - e[2] * e[12] * e[7] - e[3] * e[4] * e[14] + e[3] * e[12] * e[6];
        i[7] = e[0] * e[6] * e[11] - e[0] * e[10] * e[7] - e[2] * e[4] * e[11] + e[2] * e[8] * e[7] + e[3] * e[4] * e[10] - e[3] * e[8] * e[6];
        i[8] = e[4] * e[9] * e[15] - e[4] * e[13] * e[11] - e[5] * e[8] * e[15] + e[5] * e[12] * e[11] + e[7] * e[8] * e[13] - e[7] * e[12] * e[9];
        i[9] = -e[0] * e[9] * e[15] + e[0] * e[13] * e[11] + e[1] * e[8] * e[15] - e[1] * e[12] * e[11] - e[3] * e[8] * e[13] + e[3] * e[12] * e[9];
        i[10] = e[0] * e[5] * e[15] - e[0] * e[13] * e[7] - e[1] * e[4] * e[15] + e[1] * e[12] * e[7] + e[3] * e[4] * e[13] - e[3] * e[12] * e[5];
        i[11] = -e[0] * e[5] * e[11] + e[0] * e[9] * e[7] + e[1] * e[4] * e[11] - e[1] * e[8] * e[7] - e[3] * e[4] * e[9] + e[3] * e[8] * e[5];
        i[12] = -e[4] * e[9] * e[14] + e[4] * e[13] * e[10] + e[5] * e[8] * e[14] - e[5] * e[12] * e[10] - e[6] * e[8] * e[13] + e[6] * e[12] * e[9];
        i[13] = e[0] * e[9] * e[14] - e[0] * e[13] * e[10] - e[1] * e[8] * e[14] + e[1] * e[12] * e[10] + e[2] * e[8] * e[13] - e[2] * e[12] * e[9];
        i[14] = -e[0] * e[5] * e[14] + e[0] * e[13] * e[6] + e[1] * e[4] * e[14] - e[1] * e[12] * e[6] - e[2] * e[4] * e[13] + e[2] * e[12] * e[5];
        i[15] = e[0] * e[5] * e[10] - e[0] * e[9] * e[6] - e[1] * e[4] * e[10] + e[1] * e[8] * e[6] + e[2] * e[4] * e[9] - e[2] * e[8] * e[5];
        var n = e[0] * i[0] + e[1] * i[4] + e[2] * i[8] + e[3] * i[12];
        for (var a = 0; a < 16; a++)
            i[a] /= n;
        return r
    }
    ;
    c.transpose = function(t, r) {
        r = r || new c;
        var e = t.m
          , i = r.m;
        i[0] = e[0];
        i[1] = e[4];
        i[2] = e[8];
        i[3] = e[12];
        i[4] = e[1];
        i[5] = e[5];
        i[6] = e[9];
        i[7] = e[13];
        i[8] = e[2];
        i[9] = e[6];
        i[10] = e[10];
        i[11] = e[14];
        i[12] = e[3];
        i[13] = e[7];
        i[14] = e[11];
        i[15] = e[15];
        return r
    }
    ;
    c.multiply = function(t, r, e) {
        e = e || new c;
        var i = t.m
          , n = r.m
          , a = e.m;
        a[0] = i[0] * n[0] + i[1] * n[4] + i[2] * n[8] + i[3] * n[12];
        a[1] = i[0] * n[1] + i[1] * n[5] + i[2] * n[9] + i[3] * n[13];
        a[2] = i[0] * n[2] + i[1] * n[6] + i[2] * n[10] + i[3] * n[14];
        a[3] = i[0] * n[3] + i[1] * n[7] + i[2] * n[11] + i[3] * n[15];
        a[4] = i[4] * n[0] + i[5] * n[4] + i[6] * n[8] + i[7] * n[12];
        a[5] = i[4] * n[1] + i[5] * n[5] + i[6] * n[9] + i[7] * n[13];
        a[6] = i[4] * n[2] + i[5] * n[6] + i[6] * n[10] + i[7] * n[14];
        a[7] = i[4] * n[3] + i[5] * n[7] + i[6] * n[11] + i[7] * n[15];
        a[8] = i[8] * n[0] + i[9] * n[4] + i[10] * n[8] + i[11] * n[12];
        a[9] = i[8] * n[1] + i[9] * n[5] + i[10] * n[9] + i[11] * n[13];
        a[10] = i[8] * n[2] + i[9] * n[6] + i[10] * n[10] + i[11] * n[14];
        a[11] = i[8] * n[3] + i[9] * n[7] + i[10] * n[11] + i[11] * n[15];
        a[12] = i[12] * n[0] + i[13] * n[4] + i[14] * n[8] + i[15] * n[12];
        a[13] = i[12] * n[1] + i[13] * n[5] + i[14] * n[9] + i[15] * n[13];
        a[14] = i[12] * n[2] + i[13] * n[6] + i[14] * n[10] + i[15] * n[14];
        a[15] = i[12] * n[3] + i[13] * n[7] + i[14] * n[11] + i[15] * n[15];
        return e
    }
    ;
    c.identity = function(t) {
        t = t || new c;
        var r = t.m;
        r[0] = r[5] = r[10] = r[15] = 1;
        r[1] = r[2] = r[3] = r[4] = r[6] = r[7] = r[8] = r[9] = r[11] = r[12] = r[13] = r[14] = 0;
        return t
    }
    ;
    c.perspective = function(t, r, e, i, n) {
        var a = Math.tan(t * Math.PI / 360) * e;
        var o = a * r;
        return c.frustum(-o, o, -a, a, e, i, n)
    }
    ;
    c.frustum = function(t, r, e, i, n, a, o) {
        o = o || new c;
        var s = o.m;
        s[0] = 2 * n / (r - t);
        s[1] = 0;
        s[2] = (r + t) / (r - t);
        s[3] = 0;
        s[4] = 0;
        s[5] = 2 * n / (i - e);
        s[6] = (i + e) / (i - e);
        s[7] = 0;
        s[8] = 0;
        s[9] = 0;
        s[10] = -(a + n) / (a - n);
        s[11] = -2 * a * n / (a - n);
        s[12] = 0;
        s[13] = 0;
        s[14] = -1;
        s[15] = 0;
        return o
    }
    ;
    c.ortho = function(t, r, e, i, n, a, o) {
        o = o || new c;
        var s = o.m;
        s[0] = 2 / (r - t);
        s[1] = 0;
        s[2] = 0;
        s[3] = -(r + t) / (r - t);
        s[4] = 0;
        s[5] = 2 / (i - e);
        s[6] = 0;
        s[7] = -(i + e) / (i - e);
        s[8] = 0;
        s[9] = 0;
        s[10] = -2 / (a - n);
        s[11] = -(a + n) / (a - n);
        s[12] = 0;
        s[13] = 0;
        s[14] = 0;
        s[15] = 1;
        return o
    }
    ;
    c.scale = function(t, r, e, i) {
        i = i || new c;
        var n = i.m;
        n[0] = t;
        n[1] = 0;
        n[2] = 0;
        n[3] = 0;
        n[4] = 0;
        n[5] = r;
        n[6] = 0;
        n[7] = 0;
        n[8] = 0;
        n[9] = 0;
        n[10] = e;
        n[11] = 0;
        n[12] = 0;
        n[13] = 0;
        n[14] = 0;
        n[15] = 1;
        return i
    }
    ;
    c.translate = function(t, r, e, i) {
        i = i || new c;
        var n = i.m;
        n[0] = 1;
        n[1] = 0;
        n[2] = 0;
        n[3] = t;
        n[4] = 0;
        n[5] = 1;
        n[6] = 0;
        n[7] = r;
        n[8] = 0;
        n[9] = 0;
        n[10] = 1;
        n[11] = e;
        n[12] = 0;
        n[13] = 0;
        n[14] = 0;
        n[15] = 1;
        return i
    }
    ;
    c.rotate = function(t, r, e, i, n) {
        if (!t || !r && !e && !i) {
            return c.identity(n)
        }
        n = n || new c;
        var a = n.m;
        var o = Math.sqrt(r * r + e * e + i * i);
        t *= Math.PI / 180;
        r /= o;
        e /= o;
        i /= o;
        var s = Math.cos(t)
          , u = Math.sin(t)
          , f = 1 - s;
        a[0] = r * r * f + s;
        a[1] = r * e * f - i * u;
        a[2] = r * i * f + e * u;
        a[3] = 0;
        a[4] = e * r * f + i * u;
        a[5] = e * e * f + s;
        a[6] = e * i * f - r * u;
        a[7] = 0;
        a[8] = i * r * f - e * u;
        a[9] = i * e * f + r * u;
        a[10] = i * i * f + s;
        a[11] = 0;
        a[12] = 0;
        a[13] = 0;
        a[14] = 0;
        a[15] = 1;
        return n
    }
    ;
    c.lookAt = function(t, r, e, i, n, a, o, s, u, f) {
        f = f || new c;
        var l = f.m;
        var h = new P(t,r,e);
        var m = new P(i,n,a);
        var d = new P(o,s,u);
        var v = h.subtract(m).unit();
        var g = d.cross(v).unit();
        var p = v.cross(g).unit();
        l[0] = g.x;
        l[1] = g.y;
        l[2] = g.z;
        l[3] = -g.dot(h);
        l[4] = p.x;
        l[5] = p.y;
        l[6] = p.z;
        l[7] = -p.dot(h);
        l[8] = v.x;
        l[9] = v.y;
        l[10] = v.z;
        l[11] = -v.dot(h);
        l[12] = 0;
        l[13] = 0;
        l[14] = 0;
        l[15] = 1;
        return f
    }
    ;
    function h() {
        this.unique = [];
        this.indices = [];
        this.map = {}
    }
    h.prototype = {
        add: function(t) {
            var r = JSON.stringify(t);
            if (!(r in this.map)) {
                this.map[r] = this.unique.length;
                this.unique.push(t)
            }
            return this.map[r]
        }
    };
    function m(t, r) {
        this.buffer = null;
        this.target = t;
        this.type = r;
        this.data = []
    }
    m.prototype = {
        compile: function(r) {
            var e = [];
            for (var i = 0, n = 1e4; i < this.data.length; i += n) {
                e = Array.prototype.concat.apply(e, this.data.slice(i, i + n))
            }
            var a = this.data.length ? e.length / this.data.length : 0;
            if (a != Math.round(a))
                throw new Error("buffer elements not of consistent size, average size is " + a);
            this.buffer = this.buffer || t.createBuffer();
            this.buffer.length = e.length;
            this.buffer.spacing = a;
            t.bindBuffer(this.target, this.buffer);
            t.bufferData(this.target, new this.type(e), r || t.STATIC_DRAW)
        }
    };
    function d(t) {
        t = t || {};
        this.vertexBuffers = {};
        this.indexBuffers = {};
        this.addVertexBuffer("vertices", "gl_Vertex");
        if (t.coords)
            this.addVertexBuffer("coords", "gl_TexCoord");
        if (t.normals)
            this.addVertexBuffer("normals", "gl_Normal");
        if (t.colors)
            this.addVertexBuffer("colors", "gl_Color");
        if (!("triangles"in t) || t.triangles)
            this.addIndexBuffer("triangles");
        if (t.lines)
            this.addIndexBuffer("lines")
    }
    d.prototype = {
        addVertexBuffer: function(r, e) {
            var i = this.vertexBuffers[e] = new m(t.ARRAY_BUFFER,Float32Array);
            i.name = r;
            this[r] = []
        },
        addIndexBuffer: function(r) {
            var e = this.indexBuffers[r] = new m(t.ELEMENT_ARRAY_BUFFER,Uint16Array);
            this[r] = []
        },
        compile: function() {
            for (var t in this.vertexBuffers) {
                var r = this.vertexBuffers[t];
                r.data = this[r.name];
                r.compile()
            }
            for (var e in this.indexBuffers) {
                var r = this.indexBuffers[e];
                r.data = this[e];
                r.compile()
            }
        },
        transform: function(t) {
            this.vertices = this.vertices.map(function(r) {
                return t.transformPoint(P.fromArray(r)).toArray()
            });
            if (this.normals) {
                var r = t.inverse().transpose();
                this.normals = this.normals.map(function(t) {
                    return r.transformVector(P.fromArray(t)).unit().toArray()
                })
            }
            this.compile();
            return this
        },
        computeNormals: function() {
            if (!this.normals)
                this.addVertexBuffer("normals", "gl_Normal");
            for (var t = 0; t < this.vertices.length; t++) {
                this.normals[t] = new P
            }
            for (var t = 0; t < this.triangles.length; t++) {
                var r = this.triangles[t];
                var e = P.fromArray(this.vertices[r[0]]);
                var i = P.fromArray(this.vertices[r[1]]);
                var n = P.fromArray(this.vertices[r[2]]);
                var a = i.subtract(e).cross(n.subtract(e)).unit();
                this.normals[r[0]] = this.normals[r[0]].add(a);
                this.normals[r[1]] = this.normals[r[1]].add(a);
                this.normals[r[2]] = this.normals[r[2]].add(a)
            }
            for (var t = 0; t < this.vertices.length; t++) {
                this.normals[t] = this.normals[t].unit().toArray()
            }
            this.compile();
            return this
        },
        computeWireframe: function() {
            var t = new h;
            for (var r = 0; r < this.triangles.length; r++) {
                var e = this.triangles[r];
                for (var i = 0; i < e.length; i++) {
                    var n = e[i]
                      , a = e[(i + 1) % e.length];
                    t.add([Math.min(n, a), Math.max(n, a)])
                }
            }
            if (!this.lines)
                this.addIndexBuffer("lines");
            this.lines = t.unique;
            this.compile();
            return this
        },
        getAABB: function() {
            var t = {
                min: new P(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE)
            };
            t.max = t.min.negative();
            for (var r = 0; r < this.vertices.length; r++) {
                var e = P.fromArray(this.vertices[r]);
                t.min = P.min(t.min, e);
                t.max = P.max(t.max, e)
            }
            return t
        },
        getBoundingSphere: function() {
            var t = this.getAABB();
            var r = {
                center: t.min.add(t.max).divide(2),
                radius: 0
            };
            for (var e = 0; e < this.vertices.length; e++) {
                r.radius = Math.max(r.radius, P.fromArray(this.vertices[e]).subtract(r.center).length())
            }
            return r
        }
    };
    d.plane = function(t) {
        t = t || {};
        var r = new d(t);
        detailX = t.detailX || t.detail || 1;
        detailY = t.detailY || t.detail || 1;
        for (var e = 0; e <= detailY; e++) {
            var i = e / detailY;
            for (var n = 0; n <= detailX; n++) {
                var a = n / detailX;
                r.vertices.push([2 * a - 1, 2 * i - 1, 0]);
                if (r.coords)
                    r.coords.push([a, i]);
                if (r.normals)
                    r.normals.push([0, 0, 1]);
                if (n < detailX && e < detailY) {
                    var o = n + e * (detailX + 1);
                    r.triangles.push([o, o + 1, o + detailX + 1]);
                    r.triangles.push([o + detailX + 1, o + 1, o + detailX + 2])
                }
            }
        }
        r.compile();
        return r
    }
    ;
    var v = [[0, 4, 2, 6, -1, 0, 0], [1, 3, 5, 7, +1, 0, 0], [0, 1, 4, 5, 0, -1, 0], [2, 6, 3, 7, 0, +1, 0], [0, 2, 1, 3, 0, 0, -1], [4, 5, 6, 7, 0, 0, +1]];
    function g(t) {
        return new P((t & 1) * 2 - 1,(t & 2) - 1,(t & 4) / 2 - 1)
    }
    d.cube = function(t) {
        var r = new d(t);
        for (var e = 0; e < v.length; e++) {
            var i = v[e]
              , n = e * 4;
            for (var a = 0; a < 4; a++) {
                var o = i[a];
                r.vertices.push(g(o).toArray());
                if (r.coords)
                    r.coords.push([a & 1, (a & 2) / 2]);
                if (r.normals)
                    r.normals.push(i.slice(4, 7))
            }
            r.triangles.push([n, n + 1, n + 2]);
            r.triangles.push([n + 2, n + 1, n + 3])
        }
        r.compile();
        return r
    }
    ;
    d.sphere = function(t) {
        function r(t, r, e) {
            return s ? [t, e, r] : [t, r, e]
        }
        function e(t) {
            return t + (t - t * t) / 2
        }
        t = t || {};
        var i = new d(t);
        var n = new h;
        detail = t.detail || 6;
        for (var a = 0; a < 8; a++) {
            var o = g(a);
            var s = o.x * o.y * o.z > 0;
            var u = [];
            for (var f = 0; f <= detail; f++) {
                for (var l = 0; f + l <= detail; l++) {
                    var c = f / detail;
                    var m = l / detail;
                    var v = (detail - f - l) / detail;
                    var p = {
                        vertex: new P(e(c),e(m),e(v)).unit().multiply(o).toArray()
                    };
                    if (i.coords)
                        p.coord = o.y > 0 ? [1 - c, v] : [v, 1 - c];
                    u.push(n.add(p))
                }
                if (f > 0) {
                    for (var l = 0; f + l <= detail; l++) {
                        var c = (f - 1) * (detail + 1) + (f - 1 - (f - 1) * (f - 1)) / 2 + l;
                        var m = f * (detail + 1) + (f - f * f) / 2 + l;
                        i.triangles.push(r(u[c], u[c + 1], u[m]));
                        if (f + l < detail) {
                            i.triangles.push(r(u[m], u[c + 1], u[m + 1]))
                        }
                    }
                }
            }
        }
        i.vertices = n.unique.map(function(t) {
            return t.vertex
        });
        if (i.coords)
            i.coords = n.unique.map(function(t) {
                return t.coord
            });
        if (i.normals)
            i.normals = i.vertices;
        i.compile();
        return i
    }
    ;
    d.load = function(t, r) {
        r = r || {};
        if (!("coords"in r))
            r.coords = !!t.coords;
        if (!("normals"in r))
            r.normals = !!t.normals;
        if (!("colors"in r))
            r.colors = !!t.colors;
        if (!("triangles"in r))
            r.triangles = !!t.triangles;
        if (!("lines"in r))
            r.lines = !!t.lines;
        var e = new d(r);
        e.vertices = t.vertices;
        if (e.coords)
            e.coords = t.coords;
        if (e.normals)
            e.normals = t.normals;
        if (e.colors)
            e.colors = t.colors;
        if (e.triangles)
            e.triangles = t.triangles;
        if (e.lines)
            e.lines = t.lines;
        e.compile();
        return e
    }
    ;
    function p(t, r, e) {
        this.t = arguments.length ? t : Number.MAX_VALUE;
        this.hit = r;
        this.normal = e
    }
    p.prototype = {
        mergeWith: function(t) {
            if (t.t > 0 && t.t < this.t) {
                this.t = t.t;
                this.hit = t.hit;
                this.normal = t.normal
            }
        }
    };
    function x() {
        var r = t.getParameter(t.VIEWPORT);
        var e = t.modelviewMatrix.m;
        var i = new P(e[0],e[4],e[8]);
        var n = new P(e[1],e[5],e[9]);
        var a = new P(e[2],e[6],e[10]);
        var o = new P(e[3],e[7],e[11]);
        this.eye = new P((-o.dot(i)),(-o.dot(n)),(-o.dot(a)));
        var s = r[0]
          , u = s + r[2];
        var f = r[1]
          , l = f + r[3];
        this.ray00 = t.unProject(s, f, 1).subtract(this.eye);
        this.ray10 = t.unProject(u, f, 1).subtract(this.eye);
        this.ray01 = t.unProject(s, l, 1).subtract(this.eye);
        this.ray11 = t.unProject(u, l, 1).subtract(this.eye);
        this.viewport = r
    }
    x.prototype = {
        getRayForPixel: function(t, r) {
            t = (t - this.viewport[0]) / this.viewport[2];
            r = 1 - (r - this.viewport[1]) / this.viewport[3];
            var e = P.lerp(this.ray00, this.ray10, t);
            var i = P.lerp(this.ray01, this.ray11, t);
            return P.lerp(e, i, r).unit()
        }
    };
    x.hitTestBox = function(t, r, e, i) {
        var n = e.subtract(t).divide(r);
        var a = i.subtract(t).divide(r);
        var o = P.min(n, a);
        var s = P.max(n, a);
        var u = o.max();
        var f = s.min();
        if (u > 0 && u < f) {
            var l = 1e-6
              , c = t.add(r.multiply(u));
            e = e.add(l);
            i = i.subtract(l);
            return new p(u,c,new P((c.x > i.x) - (c.x < e.x),(c.y > i.y) - (c.y < e.y),(c.z > i.z) - (c.z < e.z)))
        }
        return null
    }
    ;
    x.hitTestSphere = function(t, r, e, i) {
        var n = t.subtract(e);
        var a = r.dot(r);
        var o = 2 * r.dot(n);
        var s = n.dot(n) - i * i;
        var u = o * o - 4 * a * s;
        if (u > 0) {
            var f = (-o - Math.sqrt(u)) / (2 * a)
              , l = t.add(r.multiply(f));
            return new p(f,l,l.subtract(e).divide(i))
        }
        return null
    }
    ;
    x.hitTestTriangle = function(t, r, e, i, n) {
        var a = i.subtract(e);
        var o = n.subtract(e);
        var s = a.cross(o).unit();
        var u = s.dot(e.subtract(t)) / s.dot(r);
        if (u > 0) {
            var f = t.add(r.multiply(u));
            var l = f.subtract(e);
            var c = o.dot(o);
            var h = o.dot(a);
            var m = o.dot(l);
            var d = a.dot(a);
            var v = a.dot(l);
            var g = c * d - h * h;
            var x = (d * m - h * v) / g;
            var y = (c * v - h * m) / g;
            if (x >= 0 && y >= 0 && x + y <= 1)
                return new p(u,f,s)
        }
        return null
    }
    ;
    function y(t, r, e) {
        while ((result = t.exec(r)) != null) {
            e(result)
        }
    }
    var w = "LIGHTGL";
    function E(r, e) {
        function i(t) {
            var r = document.getElementById(t);
            return r ? r.text : t
        }
        r = i(r);
        e = i(e);
        var n = "uniform mat3 gl_NormalMatrix;uniform mat4 gl_ModelViewMatrix;uniform mat4 gl_ProjectionMatrix;uniform mat4 gl_ModelViewProjectionMatrix;uniform mat4 gl_ModelViewMatrixInverse;uniform mat4 gl_ProjectionMatrixInverse;uniform mat4 gl_ModelViewProjectionMatrixInverse;";
        var a = n + "attribute vec4 gl_Vertex;attribute vec4 gl_TexCoord;attribute vec3 gl_Normal;attribute vec4 gl_Color;vec4 ftransform(){return gl_ModelViewProjectionMatrix*gl_Vertex;}";
        var o = "precision highp float;" + n;
        var s = r + e;
        var u = {};
        y(/\b(gl_[^;]*)\b;/g, n, function(t) {
            var r = t[1];
            if (s.indexOf(r) != -1) {
                var e = r.replace(/[a-z_]/g, "");
                u[e] = w + r
            }
        });
        if (s.indexOf("ftransform") != -1)
            u.MVPM = w + "gl_ModelViewProjectionMatrix";
        this.usedMatrices = u;
        function f(t, r) {
            var e = {};
            var i = /^((\s*\/\/.*\n|\s*#extension.*\n)+)[^]*$/.exec(r);
            r = i ? i[1] + t + r.substr(i[1].length) : t + r;
            y(/\bgl_\w+\b/g, t, function(t) {
                if (!(t in e)) {
                    r = r.replace(new RegExp("\\b" + t + "\\b","g"), w + t);
                    e[t] = true
                }
            });
            return r
        }
        r = f(a, r);
        e = f(o, e);
        function l(r, e) {
            var i = t.createShader(r);
            t.shaderSource(i, e);
            t.compileShader(i);
            if (!t.getShaderParameter(i, t.COMPILE_STATUS)) {
                throw new Error("compile error: " + t.getShaderInfoLog(i))
            }
            return i
        }
        this.program = t.createProgram();
        t.attachShader(this.program, l(t.VERTEX_SHADER, r));
        t.attachShader(this.program, l(t.FRAGMENT_SHADER, e));
        t.linkProgram(this.program);
        if (!t.getProgramParameter(this.program, t.LINK_STATUS)) {
            throw new Error("link error: " + t.getProgramInfoLog(this.program))
        }
        this.attributes = {};
        this.uniformLocations = {};
        var c = {};
        y(/uniform\s+sampler(1D|2D|3D|Cube)\s+(\w+)\s*;/g, r + e, function(t) {
            c[t[2]] = 1
        });
        this.isSampler = c
    }
    function M(t) {
        var r = Object.prototype.toString.call(t);
        return r == "[object Array]" || r == "[object Float32Array]"
    }
    function b(t) {
        var r = Object.prototype.toString.call(t);
        return r == "[object Number]" || r == "[object Boolean]"
    }
    var T = new c;
    var A = new c;
    E.prototype = {
        uniforms: function(r) {
            t.useProgram(this.program);
            for (var e in r) {
                var i = this.uniformLocations[e] || t.getUniformLocation(this.program, e);
                if (!i)
                    continue;
                this.uniformLocations[e] = i;
                var n = r[e];
                if (n instanceof P) {
                    n = [n.x, n.y, n.z]
                } else if (n instanceof c) {
                    n = n.m
                }
                if (M(n)) {
                    switch (n.length) {
                    case 1:
                        t.uniform1fv(i, new Float32Array(n));
                        break;
                    case 2:
                        t.uniform2fv(i, new Float32Array(n));
                        break;
                    case 3:
                        t.uniform3fv(i, new Float32Array(n));
                        break;
                    case 4:
                        t.uniform4fv(i, new Float32Array(n));
                        break;
                    case 9:
                        t.uniformMatrix3fv(i, false, new Float32Array([n[0], n[3], n[6], n[1], n[4], n[7], n[2], n[5], n[8]]));
                        break;
                    case 16:
                        t.uniformMatrix4fv(i, false, new Float32Array([n[0], n[4], n[8], n[12], n[1], n[5], n[9], n[13], n[2], n[6], n[10], n[14], n[3], n[7], n[11], n[15]]));
                        break;
                    default:
                        throw new Error("don't know how to load uniform \"" + e + '" of length ' + n.length)
                    }
                } else if (b(n)) {
                    (this.isSampler[e] ? t.uniform1i : t.uniform1f).call(t, i, n)
                } else {
                    throw new Error('attempted to set uniform "' + e + '" to invalid value ' + n)
                }
            }
            return this
        },
        draw: function(r, e) {
            this.drawBuffers(r.vertexBuffers, r.indexBuffers[e == t.LINES ? "lines" : "triangles"], arguments.length < 2 ? t.TRIANGLES : e)
        },
        drawBuffers: function(r, e, i) {
            var n = this.usedMatrices;
            var a = t.modelviewMatrix;
            var o = t.projectionMatrix;
            var s = n.MVMI || n.NM ? a.inverse() : null;
            var u = n.PMI ? o.inverse() : null;
            var f = n.MVPM || n.MVPMI ? o.multiply(a) : null;
            var l = {};
            if (n.MVM)
                l[n.MVM] = a;
            if (n.MVMI)
                l[n.MVMI] = s;
            if (n.PM)
                l[n.PM] = o;
            if (n.PMI)
                l[n.PMI] = u;
            if (n.MVPM)
                l[n.MVPM] = f;
            if (n.MVPMI)
                l[n.MVPMI] = f.inverse();
            if (n.NM) {
                var c = s.m;
                l[n.NM] = [c[0], c[4], c[8], c[1], c[5], c[9], c[2], c[6], c[10]]
            }
            this.uniforms(l);
            var h = 0;
            for (var m in r) {
                var d = r[m];
                var v = this.attributes[m] || t.getAttribLocation(this.program, m.replace(/^(gl_.*)$/, w + "$1"));
                if (v == -1 || !d.buffer)
                    continue;
                this.attributes[m] = v;
                t.bindBuffer(t.ARRAY_BUFFER, d.buffer);
                t.enableVertexAttribArray(v);
                t.vertexAttribPointer(v, d.buffer.spacing, t.FLOAT, false, 0, 0);
                h = d.buffer.length / d.buffer.spacing
            }
            for (var m in this.attributes) {
                if (!(m in r)) {
                    t.disableVertexAttribArray(this.attributes[m])
                }
            }
            if (h && (!e || e.buffer)) {
                if (e) {
                    t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, e.buffer);
                    t.drawElements(i, e.buffer.length, t.UNSIGNED_SHORT, 0)
                } else {
                    t.drawArrays(i, 0, h)
                }
            }
            return this
        }
    };
    function _(r, e, i) {
        i = i || {};
        this.id = t.createTexture();
        this.width = r;
        this.height = e;
        this.format = i.format || t.RGBA;
        this.type = i.type || t.UNSIGNED_BYTE;
        var n = i.filter || i.magFilter || t.LINEAR;
        var a = i.filter || i.minFilter || t.LINEAR;
        if (this.type === t.FLOAT) {
            if (!_.canUseFloatingPointTextures()) {
                throw new Error("OES_texture_float is required but not supported")
            }
            if ((a !== t.NEAREST || n !== t.NEAREST) && !_.canUseFloatingPointLinearFiltering()) {
                throw new Error("OES_texture_float_linear is required but not supported")
            }
        } else if (this.type === t.HALF_FLOAT_OES) {
            if (!_.canUseHalfFloatingPointTextures()) {
                throw new Error("OES_texture_half_float is required but not supported")
            }
            if ((a !== t.NEAREST || n !== t.NEAREST) && !_.canUseHalfFloatingPointLinearFiltering()) {
                throw new Error("OES_texture_half_float_linear is required but not supported")
            }
        }
        t.bindTexture(t.TEXTURE_2D, this.id);
        t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL, 1);
        t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, n);
        t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, a);
        t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, i.wrap || i.wrapS || t.CLAMP_TO_EDGE);
        t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, i.wrap || i.wrapT || t.CLAMP_TO_EDGE);
        t.texImage2D(t.TEXTURE_2D, 0, this.format, r, e, 0, this.format, this.type, i.data || null)
    }
    var R;
    var F;
    var z;
    _.prototype = {
        bind: function(r) {
            t.activeTexture(t.TEXTURE0 + (r || 0));
            t.bindTexture(t.TEXTURE_2D, this.id)
        },
        unbind: function(r) {
            t.activeTexture(t.TEXTURE0 + (r || 0));
            t.bindTexture(t.TEXTURE_2D, null)
        },
        canDrawTo: function() {
            R = R || t.createFramebuffer();
            t.bindFramebuffer(t.FRAMEBUFFER, R);
            t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, this.id, 0);
            var r = t.checkFramebufferStatus(t.FRAMEBUFFER) == t.FRAMEBUFFER_COMPLETE;
            t.bindFramebuffer(t.FRAMEBUFFER, null);
            return r
        },
        drawTo: function(r) {
            var e = t.getParameter(t.VIEWPORT);
            R = R || t.createFramebuffer();
            F = F || t.createRenderbuffer();
            t.bindFramebuffer(t.FRAMEBUFFER, R);
            t.bindRenderbuffer(t.RENDERBUFFER, F);
            if (this.width != F.width || this.height != F.height) {
                F.width = this.width;
                F.height = this.height;
                t.renderbufferStorage(t.RENDERBUFFER, t.DEPTH_COMPONENT16, this.width, this.height)
            }
            t.framebufferTexture2D(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, this.id, 0);
            t.framebufferRenderbuffer(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.RENDERBUFFER, F);
            if (t.checkFramebufferStatus(t.FRAMEBUFFER) != t.FRAMEBUFFER_COMPLETE) {
                throw new Error("Rendering to this texture is not supported (incomplete framebuffer)")
            }
            t.viewport(0, 0, this.width, this.height);
            r();
            t.bindFramebuffer(t.FRAMEBUFFER, null);
            t.bindRenderbuffer(t.RENDERBUFFER, null);
            t.viewport(e[0], e[1], e[2], e[3])
        },
        swapWith: function(t) {
            var r;
            r = t.id;
            t.id = this.id;
            this.id = r;
            r = t.width;
            t.width = this.width;
            this.width = r;
            r = t.height;
            t.height = this.height;
            this.height = r
        }
    };
    _.fromImage = function(r, e) {
        e = e || {};
        var i = new _(r.width,r.height,e);
        try {
            t.texImage2D(t.TEXTURE_2D, 0, i.format, i.format, i.type, r)
        } catch (n) {
            if (location.protocol == "file:") {
                throw new Error('image not loaded for security reasons (serve this page over "http://" instead)')
            } else {
                throw new Error("image not loaded for security reasons (image must originate from the same " + "domain as this page or use Cross-Origin Resource Sharing)")
            }
        }
        if (e.minFilter && e.minFilter != t.NEAREST && e.minFilter != t.LINEAR) {
            t.generateMipmap(t.TEXTURE_2D)
        }
        return i
    }
    ;
    _.fromURL = function(r, e) {
        z = z || function() {
            var t = document.createElement("canvas").getContext("2d");
            t.canvas.width = t.canvas.height = 128;
            for (var r = 0; r < t.canvas.height; r += 16) {
                for (var e = 0; e < t.canvas.width; e += 16) {
                    t.fillStyle = (e ^ r) & 16 ? "#FFF" : "#DDD";
                    t.fillRect(e, r, 16, 16)
                }
            }
            return t.canvas
        }();
        var i = _.fromImage(z, e);
        var n = new Image;
        var a = t;
        n.onload = function() {
            a.makeCurrent();
            _.fromImage(n, e).swapWith(i)
        }
        ;
        n.src = r;
        return i
    }
    ;
    _.canUseFloatingPointTextures = function() {
        return !!t.getExtension("OES_texture_float")
    }
    ;
    _.canUseFloatingPointLinearFiltering = function() {
        return !!t.getExtension("OES_texture_float_linear")
    }
    ;
    _.canUseHalfFloatingPointTextures = function() {
        return !!t.getExtension("OES_texture_half_float")
    }
    ;
    _.canUseHalfFloatingPointLinearFiltering = function() {
        return !!t.getExtension("OES_texture_half_float_linear")
    }
    ;
    function P(t, r, e) {
        this.x = t || 0;
        this.y = r || 0;
        this.z = e || 0
    }
    P.prototype = {
        negative: function() {
            return new P((-this.x),(-this.y),(-this.z))
        },
        add: function(t) {
            if (t instanceof P)
                return new P(this.x + t.x,this.y + t.y,this.z + t.z);
            else
                return new P(this.x + t,this.y + t,this.z + t)
        },
        subtract: function(t) {
            if (t instanceof P)
                return new P(this.x - t.x,this.y - t.y,this.z - t.z);
            else
                return new P(this.x - t,this.y - t,this.z - t)
        },
        multiply: function(t) {
            if (t instanceof P)
                return new P(this.x * t.x,this.y * t.y,this.z * t.z);
            else
                return new P(this.x * t,this.y * t,this.z * t)
        },
        divide: function(t) {
            if (t instanceof P)
                return new P(this.x / t.x,this.y / t.y,this.z / t.z);
            else
                return new P(this.x / t,this.y / t,this.z / t)
        },
        equals: function(t) {
            return this.x == t.x && this.y == t.y && this.z == t.z
        },
        dot: function(t) {
            return this.x * t.x + this.y * t.y + this.z * t.z
        },
        cross: function(t) {
            return new P(this.y * t.z - this.z * t.y,this.z * t.x - this.x * t.z,this.x * t.y - this.y * t.x)
        },
        length: function() {
            return Math.sqrt(this.dot(this))
        },
        unit: function() {
            return this.divide(this.length())
        },
        min: function() {
            return Math.min(Math.min(this.x, this.y), this.z)
        },
        max: function() {
            return Math.max(Math.max(this.x, this.y), this.z)
        },
        toAngles: function() {
            return {
                theta: Math.atan2(this.z, this.x),
                phi: Math.asin(this.y / this.length())
            }
        },
        angleTo: function(t) {
            return Math.acos(this.dot(t) / (this.length() * t.length()))
        },
        toArray: function(t) {
            return [this.x, this.y, this.z].slice(0, t || 3)
        },
        clone: function() {
            return new P(this.x,this.y,this.z)
        },
        init: function(t, r, e) {
            this.x = t;
            this.y = r;
            this.z = e;
            return this
        }
    };
    P.negative = function(t, r) {
        r.x = -t.x;
        r.y = -t.y;
        r.z = -t.z;
        return r
    }
    ;
    P.add = function(t, r, e) {
        if (r instanceof P) {
            e.x = t.x + r.x;
            e.y = t.y + r.y;
            e.z = t.z + r.z
        } else {
            e.x = t.x + r;
            e.y = t.y + r;
            e.z = t.z + r
        }
        return e
    }
    ;
    P.subtract = function(t, r, e) {
        if (r instanceof P) {
            e.x = t.x - r.x;
            e.y = t.y - r.y;
            e.z = t.z - r.z
        } else {
            e.x = t.x - r;
            e.y = t.y - r;
            e.z = t.z - r
        }
        return e
    }
    ;
    P.multiply = function(t, r, e) {
        if (r instanceof P) {
            e.x = t.x * r.x;
            e.y = t.y * r.y;
            e.z = t.z * r.z
        } else {
            e.x = t.x * r;
            e.y = t.y * r;
            e.z = t.z * r
        }
        return e
    }
    ;
    P.divide = function(t, r, e) {
        if (r instanceof P) {
            e.x = t.x / r.x;
            e.y = t.y / r.y;
            e.z = t.z / r.z
        } else {
            e.x = t.x / r;
            e.y = t.y / r;
            e.z = t.z / r
        }
        return e
    }
    ;
    P.cross = function(t, r, e) {
        e.x = t.y * r.z - t.z * r.y;
        e.y = t.z * r.x - t.x * r.z;
        e.z = t.x * r.y - t.y * r.x;
        return e
    }
    ;
    P.unit = function(t, r) {
        var e = t.length();
        r.x = t.x / e;
        r.y = t.y / e;
        r.z = t.z / e;
        return r
    }
    ;
    P.fromAngles = function(t, r) {
        return new P(Math.cos(t) * Math.cos(r),Math.sin(r),Math.sin(t) * Math.cos(r))
    }
    ;
    P.randomDirection = function() {
        return P.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1))
    }
    ;
    P.min = function(t, r) {
        return new P(Math.min(t.x, r.x),Math.min(t.y, r.y),Math.min(t.z, r.z))
    }
    ;
    P.max = function(t, r) {
        return new P(Math.max(t.x, r.x),Math.max(t.y, r.y),Math.max(t.z, r.z))
    }
    ;
    P.lerp = function(t, r, e) {
        return r.subtract(t).multiply(e).add(t)
    }
    ;
    P.fromArray = function(t) {
        return new P(t[0],t[1],t[2])
    }
    ;
    P.angleBetween = function(t, r) {
        return t.angleTo(r)
    }
    ;
    return r
}();
