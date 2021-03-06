function QR8bitByte(t) {
    this.mode = QRMode.MODE_8BIT_BYTE,
    this.data = t
}
function QRCode(t, e) {
    this.typeNumber = t,
    this.errorCorrectLevel = e,
    this.modules = null,
    this.moduleCount = 0,
    this.dataCache = null,
    this.dataList = new Array
}
function QRPolynomial(t, e) {
    var r, o;
    if (void 0 == t.length)
        throw new Error(t.length + "/" + e);
    for (r = 0; r < t.length && 0 == t[r]; )
        r++;
    for (this.num = new Array(t.length - r + e),
    o = 0; o < t.length - r; o++)
        this.num[o] = t[o + r]
}
function QRRSBlock(t, e) {
    this.totalCount = t,
    this.dataCount = e
}
function QRBitBuffer() {
    this.buffer = new Array,
    this.length = 0
}
var QRMode, QRErrorCorrectLevel, QRMaskPattern, QRUtil, QRMath, i;
for (function(t) {
    t.fn.qrcode = function(e) {
        var r, o;
        return "string" == typeof e && (e = {
            text: e
        }),
        e = t.extend({}, {
            render: "canvas",
            width: 256,
            height: 256,
            imgWidth: e.width / 2.5,
            imgHeight: e.height / 2.5,
            typeNumber: -1,
            correctLevel: QRErrorCorrectLevel.H,
            background: "#ffffff",
            foreground: "#000000"
        }, e),
        r = function() {
            var t, r, o, n, i, a, s, u, h, l = new QRCode(e.typeNumber,e.correctLevel);
            for (l.addData(e.text),
            l.make(),
            (t = document.createElement("canvas")).width = e.width,
            t.height = e.height,
            r = t.getContext("2d"),
            e.src && (o = new Image,
            o.src = e.src,
            o.onload = function() {
                r.drawImage(o, (e.width - e.imgWidth) / 2, (e.height - e.imgHeight) / 2, e.imgWidth, e.imgHeight)
            }
            ),
            n = e.width / l.getModuleCount(),
            i = e.height / l.getModuleCount(),
            a = 0; a < l.getModuleCount(); a++)
                for (s = 0; s < l.getModuleCount(); s++)
                    r.fillStyle = l.isDark(a, s) ? e.foreground : e.background,
                    u = Math.ceil((s + 1) * n) - Math.floor(s * n),
                    h = Math.ceil((a + 1) * n) - Math.floor(a * n),
                    r.fillRect(Math.round(s * n), Math.round(a * i), u, h);
            return t
        }
        ,
        o = function() {
            var r, o, n, i, a, s, u = new QRCode(e.typeNumber,e.correctLevel);
            for (u.addData(e.text),
            u.make(),
            r = t("<table></table>").css("width", e.width + "px").css("height", e.height + "px").css("border", "0px").css("border-collapse", "collapse").css("background-color", e.background),
            o = e.width / u.getModuleCount(),
            n = e.height / u.getModuleCount(),
            i = 0; i < u.getModuleCount(); i++)
                for (a = t("<tr></tr>").css("height", n + "px").appendTo(r),
                s = 0; s < u.getModuleCount(); s++)
                    t("<td></td>").css("width", o + "px").css("background-color", u.isDark(i, s) ? e.foreground : e.background).appendTo(a);
            return r
        }
        ,
        this.each(function() {
            var n = "canvas" == e.render ? r() : o();
            t(n).appendTo(this)
        })
    }
}(jQuery),
QR8bitByte.prototype = {
    getLength: function() {
        return this.data.length
    },
    write: function(t) {
        for (var e = 0; e < this.data.length; e++)
            t.put(this.data.charCodeAt(e), 8)
    }
},
QRCode.prototype = {
    addData: function(t) {
        var e = new QR8bitByte(t);
        this.dataList.push(e),
        this.dataCache = null
    },
    isDark: function(t, e) {
        if (0 > t || this.moduleCount <= t || 0 > e || this.moduleCount <= e)
            throw new Error(t + "," + e);
        return this.modules[t][e]
    },
    getModuleCount: function() {
        return this.moduleCount
    },
    make: function() {
        var t, e, r, o, n, i;
        if (this.typeNumber < 1) {
            for (t = 1,
            t = 1; 40 > t; t++) {
                for (e = QRRSBlock.getRSBlocks(t, this.errorCorrectLevel),
                r = new QRBitBuffer,
                o = 0,
                n = 0; n < e.length; n++)
                    o += e[n].dataCount;
                for (n = 0; n < this.dataList.length; n++)
                    i = this.dataList[n],
                    r.put(i.mode, 4),
                    r.put(i.getLength(), QRUtil.getLengthInBits(i.mode, t)),
                    i.write(r);
                if (r.getLengthInBits() <= 8 * o)
                    break
            }
            this.typeNumber = t
        }
        this.makeImpl(!1, this.getBestMaskPattern())
    },
    makeImpl: function(t, e) {
        var r, o;
        for (this.moduleCount = 4 * this.typeNumber + 17,
        this.modules = new Array(this.moduleCount),
        r = 0; r < this.moduleCount; r++)
            for (this.modules[r] = new Array(this.moduleCount),
            o = 0; o < this.moduleCount; o++)
                this.modules[r][o] = null;
        this.setupPositionProbePattern(0, 0),
        this.setupPositionProbePattern(this.moduleCount - 7, 0),
        this.setupPositionProbePattern(0, this.moduleCount - 7),
        this.setupPositionAdjustPattern(),
        this.setupTimingPattern(),
        this.setupTypeInfo(t, e),
        this.typeNumber >= 7 && this.setupTypeNumber(t),
        null == this.dataCache && (this.dataCache = QRCode.createData(this.typeNumber, this.errorCorrectLevel, this.dataList)),
        this.mapData(this.dataCache, e)
    },
    setupPositionProbePattern: function(t, e) {
        var r, o;
        for (r = -1; 7 >= r; r++)
            if (!(-1 >= t + r || this.moduleCount <= t + r))
                for (o = -1; 7 >= o; o++)
                    -1 >= e + o || this.moduleCount <= e + o || (this.modules[t + r][e + o] = r >= 0 && 6 >= r && (0 == o || 6 == o) || o >= 0 && 6 >= o && (0 == r || 6 == r) || r >= 2 && 4 >= r && o >= 2 && 4 >= o)
    },
    getBestMaskPattern: function() {
        var t, e, r = 0, o = 0;
        for (t = 0; 8 > t; t++)
            this.makeImpl(!0, t),
            e = QRUtil.getLostPoint(this),
            (0 == t || r > e) && (r = e,
            o = t);
        return o
    },
    createMovieClip: function(t, e, r) {
        var o, n, i, a, s = t.createEmptyMovieClip(e, r);
        for (this.make(),
        o = 0; o < this.modules.length; o++)
            for (n = 1 * o,
            i = 0; i < this.modules[o].length; i++)
                a = 1 * i,
                this.modules[o][i] && (s.beginFill(0, 100),
                s.moveTo(a, n),
                s.lineTo(a + 1, n),
                s.lineTo(a + 1, n + 1),
                s.lineTo(a, n + 1),
                s.endFill());
        return s
    },
    setupTimingPattern: function() {
        var t, e;
        for (t = 8; t < this.moduleCount - 8; t++)
            null == this.modules[t][6] && (this.modules[t][6] = 0 == t % 2);
        for (e = 8; e < this.moduleCount - 8; e++)
            null == this.modules[6][e] && (this.modules[6][e] = 0 == e % 2)
    },
    setupPositionAdjustPattern: function() {
        var t, e, r, o, n, i, a = QRUtil.getPatternPosition(this.typeNumber);
        for (t = 0; t < a.length; t++)
            for (e = 0; e < a.length; e++)
                if (r = a[t],
                o = a[e],
                null == this.modules[r][o])
                    for (n = -2; 2 >= n; n++)
                        for (i = -2; 2 >= i; i++)
                            this.modules[r + n][o + i] = -2 == n || 2 == n || -2 == i || 2 == i || 0 == n && 0 == i
    },
    setupTypeNumber: function(t) {
        var e, r, o = QRUtil.getBCHTypeNumber(this.typeNumber);
        for (e = 0; 18 > e; e++)
            r = !t && 1 == (1 & o >> e),
            this.modules[Math.floor(e / 3)][e % 3 + this.moduleCount - 8 - 3] = r;
        for (e = 0; 18 > e; e++)
            r = !t && 1 == (1 & o >> e),
            this.modules[e % 3 + this.moduleCount - 8 - 3][Math.floor(e / 3)] = r
    },
    setupTypeInfo: function(t, e) {
        var r, o, n = this.errorCorrectLevel << 3 | e, i = QRUtil.getBCHTypeInfo(n);
        for (r = 0; 15 > r; r++)
            o = !t && 1 == (1 & i >> r),
            6 > r ? this.modules[r][8] = o : 8 > r ? this.modules[r + 1][8] = o : this.modules[this.moduleCount - 15 + r][8] = o;
        for (r = 0; 15 > r; r++)
            o = !t && 1 == (1 & i >> r),
            8 > r ? this.modules[8][this.moduleCount - r - 1] = o : 9 > r ? this.modules[8][15 - r - 1 + 1] = o : this.modules[8][15 - r - 1] = o;
        this.modules[this.moduleCount - 8][8] = !t
    },
    mapData: function(t, e) {
        var r, o, n, i = -1, a = this.moduleCount - 1, s = 7, u = 0;
        for (r = this.moduleCount - 1; r > 0; r -= 2)
            for (6 == r && r--; ; ) {
                for (o = 0; 2 > o; o++)
                    null == this.modules[a][r - o] && (n = !1,
                    u < t.length && (n = 1 == (1 & t[u] >>> s)),
                    QRUtil.getMask(e, a, r - o) && (n = !n),
                    this.modules[a][r - o] = n,
                    -1 == --s && (u++,
                    s = 7));
                if (0 > (a += i) || this.moduleCount <= a) {
                    a -= i,
                    i = -i;
                    break
                }
            }
    }
},
QRCode.PAD0 = 236,
QRCode.PAD1 = 17,
QRCode.createData = function(t, e, r) {
    var o, n, i, a = QRRSBlock.getRSBlocks(t, e), s = new QRBitBuffer;
    for (o = 0; o < r.length; o++)
        n = r[o],
        s.put(n.mode, 4),
        s.put(n.getLength(), QRUtil.getLengthInBits(n.mode, t)),
        n.write(s);
    for (i = 0,
    o = 0; o < a.length; o++)
        i += a[o].dataCount;
    if (s.getLengthInBits() > 8 * i)
        throw new Error("code length overflow. (" + s.getLengthInBits() + ">" + 8 * i + ")");
    for (s.getLengthInBits() + 4 <= 8 * i && s.put(0, 4); 0 != s.getLengthInBits() % 8; )
        s.putBit(!1);
    for (; !(s.getLengthInBits() >= 8 * i) && (s.put(QRCode.PAD0, 8),
    !(s.getLengthInBits() >= 8 * i)); )
        s.put(QRCode.PAD1, 8);
    return QRCode.createBytes(s, a)
}
,
QRCode.createBytes = function(t, e) {
    var r, o, n, i, a, s, u, h, l, g, f = 0, d = 0, R = 0, c = new Array(e.length), m = new Array(e.length);
    for (r = 0; r < e.length; r++) {
        for (o = e[r].dataCount,
        n = e[r].totalCount - o,
        d = Math.max(d, o),
        R = Math.max(R, n),
        c[r] = new Array(o),
        i = 0; i < c[r].length; i++)
            c[r][i] = 255 & t.buffer[i + f];
        for (f += o,
        a = QRUtil.getErrorCorrectPolynomial(n),
        s = new QRPolynomial(c[r],a.getLength() - 1).mod(a),
        m[r] = new Array(a.getLength() - 1),
        i = 0; i < m[r].length; i++)
            u = i + s.getLength() - m[r].length,
            m[r][i] = u >= 0 ? s.get(u) : 0
    }
    for (h = 0,
    i = 0; i < e.length; i++)
        h += e[i].totalCount;
    for (l = new Array(h),
    g = 0,
    i = 0; d > i; i++)
        for (r = 0; r < e.length; r++)
            i < c[r].length && (l[g++] = c[r][i]);
    for (i = 0; R > i; i++)
        for (r = 0; r < e.length; r++)
            i < m[r].length && (l[g++] = m[r][i]);
    return l
}
,
QRMode = {
    MODE_NUMBER: 1,
    MODE_ALPHA_NUM: 2,
    MODE_8BIT_BYTE: 4,
    MODE_KANJI: 8
},
QRErrorCorrectLevel = {
    L: 1,
    M: 0,
    Q: 3,
    H: 2
},
QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
},
QRUtil = {
    PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]],
    G15: 1335,
    G18: 7973,
    G15_MASK: 21522,
    getBCHTypeInfo: function(t) {
        for (var e = t << 10; QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G15) >= 0; )
            e ^= QRUtil.G15 << QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G15);
        return (t << 10 | e) ^ QRUtil.G15_MASK
    },
    getBCHTypeNumber: function(t) {
        for (var e = t << 12; QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G18) >= 0; )
            e ^= QRUtil.G18 << QRUtil.getBCHDigit(e) - QRUtil.getBCHDigit(QRUtil.G18);
        return t << 12 | e
    },
    getBCHDigit: function(t) {
        for (var e = 0; 0 != t; )
            e++,
            t >>>= 1;
        return e
    },
    getPatternPosition: function(t) {
        return QRUtil.PATTERN_POSITION_TABLE[t - 1]
    },
    getMask: function(t, e, r) {
        switch (t) {
        case QRMaskPattern.PATTERN000:
            return 0 == (e + r) % 2;
        case QRMaskPattern.PATTERN001:
            return 0 == e % 2;
        case QRMaskPattern.PATTERN010:
            return 0 == r % 3;
        case QRMaskPattern.PATTERN011:
            return 0 == (e + r) % 3;
        case QRMaskPattern.PATTERN100:
            return 0 == (Math.floor(e / 2) + Math.floor(r / 3)) % 2;
        case QRMaskPattern.PATTERN101:
            return 0 == e * r % 2 + e * r % 3;
        case QRMaskPattern.PATTERN110:
            return 0 == (e * r % 2 + e * r % 3) % 2;
        case QRMaskPattern.PATTERN111:
            return 0 == (e * r % 3 + (e + r) % 2) % 2;
        default:
            throw new Error("bad maskPattern:" + t)
        }
    },
    getErrorCorrectPolynomial: function(t) {
        var e, r = new QRPolynomial([1],0);
        for (e = 0; t > e; e++)
            r = r.multiply(new QRPolynomial([1, QRMath.gexp(e)],0));
        return r
    },
    getLengthInBits: function(t, e) {
        if (e >= 1 && 10 > e)
            switch (t) {
            case QRMode.MODE_NUMBER:
                return 10;
            case QRMode.MODE_ALPHA_NUM:
                return 9;
            case QRMode.MODE_8BIT_BYTE:
            case QRMode.MODE_KANJI:
                return 8;
            default:
                throw new Error("mode:" + t)
            }
        else if (27 > e)
            switch (t) {
            case QRMode.MODE_NUMBER:
                return 12;
            case QRMode.MODE_ALPHA_NUM:
                return 11;
            case QRMode.MODE_8BIT_BYTE:
                return 16;
            case QRMode.MODE_KANJI:
                return 10;
            default:
                throw new Error("mode:" + t)
            }
        else {
            if (!(41 > e))
                throw new Error("type:" + e);
            switch (t) {
            case QRMode.MODE_NUMBER:
                return 14;
            case QRMode.MODE_ALPHA_NUM:
                return 13;
            case QRMode.MODE_8BIT_BYTE:
                return 16;
            case QRMode.MODE_KANJI:
                return 12;
            default:
                throw new Error("mode:" + t)
            }
        }
    },
    getLostPoint: function(t) {
        var e, r, o, n, i, a, s, u, h, l = t.getModuleCount(), g = 0;
        for (e = 0; l > e; e++)
            for (r = 0; l > r; r++) {
                for (o = 0,
                n = t.isDark(e, r),
                i = -1; 1 >= i; i++)
                    if (!(0 > e + i || e + i >= l))
                        for (a = -1; 1 >= a; a++)
                            0 > r + a || r + a >= l || (0 != i || 0 != a) && n == t.isDark(e + i, r + a) && o++;
                o > 5 && (g += 3 + o - 5)
            }
        for (e = 0; l - 1 > e; e++)
            for (r = 0; l - 1 > r; r++)
                s = 0,
                t.isDark(e, r) && s++,
                t.isDark(e + 1, r) && s++,
                t.isDark(e, r + 1) && s++,
                t.isDark(e + 1, r + 1) && s++,
                (0 == s || 4 == s) && (g += 3);
        for (e = 0; l > e; e++)
            for (r = 0; l - 6 > r; r++)
                t.isDark(e, r) && !t.isDark(e, r + 1) && t.isDark(e, r + 2) && t.isDark(e, r + 3) && t.isDark(e, r + 4) && !t.isDark(e, r + 5) && t.isDark(e, r + 6) && (g += 40);
        for (r = 0; l > r; r++)
            for (e = 0; l - 6 > e; e++)
                t.isDark(e, r) && !t.isDark(e + 1, r) && t.isDark(e + 2, r) && t.isDark(e + 3, r) && t.isDark(e + 4, r) && !t.isDark(e + 5, r) && t.isDark(e + 6, r) && (g += 40);
        for (u = 0,
        r = 0; l > r; r++)
            for (e = 0; l > e; e++)
                t.isDark(e, r) && u++;
        return h = Math.abs(100 * u / l / l - 50) / 5,
        g += 10 * h
    }
},
QRMath = {
    glog: function(t) {
        if (1 > t)
            throw new Error("glog(" + t + ")");
        return QRMath.LOG_TABLE[t]
    },
    gexp: function(t) {
        for (; 0 > t; )
            t += 255;
        for (; t >= 256; )
            t -= 255;
        return QRMath.EXP_TABLE[t]
    },
    EXP_TABLE: new Array(256),
    LOG_TABLE: new Array(256)
},
i = 0; 8 > i; i++)
    QRMath.EXP_TABLE[i] = 1 << i;
for (i = 8; 256 > i; i++)
    QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
for (i = 0; 255 > i; i++)
    QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
QRPolynomial.prototype = {
    get: function(t) {
        return this.num[t]
    },
    getLength: function() {
        return this.num.length
    },
    multiply: function(t) {
        var e, r, o = new Array(this.getLength() + t.getLength() - 1);
        for (e = 0; e < this.getLength(); e++)
            for (r = 0; r < t.getLength(); r++)
                o[e + r] ^= QRMath.gexp(QRMath.glog(this.get(e)) + QRMath.glog(t.get(r)));
        return new QRPolynomial(o,0)
    },
    mod: function(t) {
        var e, r, o;
        if (this.getLength() - t.getLength() < 0)
            return this;
        for (e = QRMath.glog(this.get(0)) - QRMath.glog(t.get(0)),
        r = new Array(this.getLength()),
        o = 0; o < this.getLength(); o++)
            r[o] = this.get(o);
        for (o = 0; o < t.getLength(); o++)
            r[o] ^= QRMath.gexp(QRMath.glog(t.get(o)) + e);
        return new QRPolynomial(r,0).mod(t)
    }
},
QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]],
QRRSBlock.getRSBlocks = function(t, e) {
    var r, o, n, i, a, s, u, h = QRRSBlock.getRsBlockTable(t, e);
    if (void 0 == h)
        throw new Error("bad rs block @ typeNumber:" + t + "/errorCorrectLevel:" + e);
    for (r = h.length / 3,
    o = new Array,
    n = 0; r > n; n++)
        for (i = h[3 * n + 0],
        a = h[3 * n + 1],
        s = h[3 * n + 2],
        u = 0; i > u; u++)
            o.push(new QRRSBlock(a,s));
    return o
}
,
QRRSBlock.getRsBlockTable = function(t, e) {
    switch (e) {
    case QRErrorCorrectLevel.L:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 0];
    case QRErrorCorrectLevel.M:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 1];
    case QRErrorCorrectLevel.Q:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 2];
    case QRErrorCorrectLevel.H:
        return QRRSBlock.RS_BLOCK_TABLE[4 * (t - 1) + 3];
    default:
        return
    }
}
,
QRBitBuffer.prototype = {
    get: function(t) {
        var e = Math.floor(t / 8);
        return 1 == (1 & this.buffer[e] >>> 7 - t % 8)
    },
    put: function(t, e) {
        for (var r = 0; e > r; r++)
            this.putBit(1 == (1 & t >>> e - r - 1))
    },
    getLengthInBits: function() {
        return this.length
    },
    putBit: function(t) {
        var e = Math.floor(this.length / 8);
        this.buffer.length <= e && this.buffer.push(0),
        t && (this.buffer[e] |= 128 >>> this.length % 8),
        this.length++
    }
};
