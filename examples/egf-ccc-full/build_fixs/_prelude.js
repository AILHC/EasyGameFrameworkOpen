(function e(t, n, r) {
    function s(o, u, npmPkgName) {
        if (!n[o]) {
            if (!t[o]) {
                var b = o;
                if (o.includes("./")) {
                    //内部代码
                    b = o.split("/");
                    b = b[b.length - 1];
                } else {
                    //npm包代码
                }
                if (!t[b]) {
                    var a = "function" == typeof __require && __require;
                    if (!u && a) return a(b, !0);
                    if (i) return i(b, !0);
                    throw new Error("Cannot find module '" + o + "'");
                }
                o = b;
            }
            var f = n[o] = {
                exports: {}
            };
            t[o][0].call(f.exports, function (e) {
                var n = t[o][1][e];
                //判断是不是npm包，是就传包名
                return s(n || e, undefined, !e.includes("./") ? e : undefined);
            }, f, f.exports, e, t, n, r);
        }
        //判断是不是npm包，是就用包名作为key存一下模块引用
        if (npmPkgName && n[o] && !n[npmPkgName]) {
            n[npmPkgName] = n[o];
        }
        return n[o].exports;
    }
    var i = "function" == typeof __require && __require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})