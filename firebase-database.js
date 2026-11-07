/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://apache.org
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@firebase/app-compat'), require('@firebase/app')) :
    typeof define === 'function' && define.amd ? define(['@firebase/app-compat', '@firebase/app'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.firebase, global.firebase.app));
})(this, (function (firebase, app$1) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var firebase__default = /*#__PURE__*/_interopDefaultLegacy(firebase);

    const stringToByteArray = function (str) {
        const out = [];
        let p = 0;
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 128) {
                out[p++] = c;
            } else if (c < 2048) {
                out[p++] = (c >> 6) | 192;
                out[p++] = (c & 63) | 128;
            } else if ((c & 0xfc00) === 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
                c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
                out[p++] = (c >> 18) | 240;
                out[p++] = ((c >> 12) & 63) | 128;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            } else {
                out[p++] = (c >> 12) | 224;
                out[p++] = ((c >> 6) & 63) | 128;
                out[p++] = (c & 63) | 128;
            }
        }
        return out;
    };

    const byteArrayToString = function (bytes) {
        const out = [];
        let pos = 0, c = 0;
        while (pos < bytes.length) {
            const c1 = bytes[pos++];
            if (c1 < 128) {
                out[c++] = String.fromCharCode(c1);
            } else if (c1 > 191 && c1 < 224) {
                const c2 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
            } else if (c1 > 239 && c1 < 365) {
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                const c4 = bytes[pos++];
                const u = (((c1 & 7) << 18) | ((c2 & 63) << 12) | ((c3 & 63) << 6) | (c4 & 63)) - 0x10000;
                out[c++] = String.fromCharCode(0xd800 + (u >> 10));
                out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
            } else {
                const c2 = bytes[pos++];
                const c3 = bytes[pos++];
                out[c++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            }
        }
        return out.join('');
    };

    const base64 = {
        byteToCharMap_: null,
        charToByteMap_: null,
        byteToCharMapWebSafe_: null,
        charToByteMapWebSafe_: null,
        ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        get ENCODED_VALS() { return this.ENCODED_VALS_BASE + '+/='; },
        get ENCODED_VALS_WEBSAFE() { return this.ENCODED_VALS_BASE + '-_.'; },
        HAS_NATIVE_SUPPORT: typeof atob === 'function',
        encodeByteArray(input, webSafe) {
            if (!Array.isArray(input)) { throw Error('encodeByteArray takes an array as a parameter'); }
            this.init_();
            const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
            const output = [];
            for (let i = 0; i < input.length; i += 3) {
                const byte1 = input[i];
                const haveByte2 = i + 1 < input.length;
                const byte2 = haveByte2 ? input[i + 1] : 0;
                const haveByte3 = i + 2 < input.length;
                const byte3 = haveByte3 ? input[i + 2] : 0;
                const outByte1 = byte1 >> 2;
                const outByte2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
                let outByte3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
                let outByte4 = byte3 & 0x3f;
                if (!haveByte3) {
                    outByte4 = 64;
                    if (!haveByte2) { outByte3 = 64; }
                }
                output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
            }
            return output.join('');
        },
        encodeString(input, webSafe) {
            if (this.HAS_NATIVE_SUPPORT && !webSafe) { return btoa(input); }
            return this.encodeByteArray(stringToByteArray(input), webSafe);
        },
        decodeString(input, webSafe) {
            if (this.HAS_NATIVE_SUPPORT && !webSafe) { return atob(input); }
            return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
        },
        decodeStringToByteArray(input, webSafe) {
            this.init_();
            const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
            const output = [];
            for (let i = 0; i < input.length;) {
                const byte1 = charToByteMap[input.charAt(i++)];
                const haveByte2 = i < input.length;
                const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0; ++i;
                const haveByte3 = i < input.length;
                const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64; ++i;
                const haveByte4 = i < input.length;
                const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64; ++i;
                if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) { throw Error('Invalid base64 string'); }
                const outByte1 = (byte1 << 2) | (byte2 >> 4);
                output.push(outByte1);
                if (byte3 !== 64) {
                    const outByte2 = ((byte2 << 4) & 0xf0) | (byte3 >> 2);
                    output.push(outByte2);
                    if (byte4 !== 64) {
                        const outByte3 = ((byte3 << 6) & 0xc0) | byte4;
                        output.push(outByte3);
                    }
                }
            }
            return output;
        },
        init_() {
            if (!this.byteToCharMap_) {
                this.byteToCharMap_ = {}; this.charToByteMap_ = {};
                this.byteToCharMapWebSafe_ = {}; this.charToByteMapWebSafe_ = {};
                for (let i = 0; i < this.ENCODED_VALS.length; i++) {
                    this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                    this.charToByteMap_[this.byteToCharMap_[i]] = i;
                    this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                    this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                    if (i >= this.ENCODED_VALS_BASE.length) {
                        this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                        this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                    }
                }
            }
        }
    };

    const base64Decode = function (str) {
        try { return base64.decodeString(str, true); } catch (e) { console.error('base64Decode failed: ', e); }
        return null;
    };
    class SafeMatcher {
        constructor(regexStr) {
            this.regex = new RegExp(regexStr);
        }
        test(str) { return this.regex.test(str); }
    }

    const jsonEval = function (str) {
        try { return JSON.parse(str); } catch (e) { return null; }
    };

    const LUIDGenerator = (function () {
        let count = 0;
        return function () { return 'luid_' + count++; };
    })();

    const Sha1 = function () {
        this.chain_ =;
        this.buf_ = new Uint8Array(64);
        this.bufLen_ = 0;
        this.totalLen_ = 0;
    };
    Sha1.prototype.update = function (bytes) {
        let pos = 0;
        this.totalLen_ += bytes.length;
        if (this.bufLen_ > 0) {
            while (this.bufLen_ < 64 && pos < bytes.length) {
                this.buf_.set([bytes[pos++]], this.bufLen_++);
            }
            if (this.bufLen_ === 64) {
                this.processBlock_(this.buf_);
                this.bufLen_ = 0;
            }
        }
        while (pos + 64 <= bytes.length) {
            this.processBlock_(bytes.subarray(pos, pos + 64));
            pos += 64;
        }
        while (pos < bytes.length) {
            this.buf_.set([bytes[pos++]], this.bufLen_++);
        }
    };
Sha1.prototype.processBlock_ = function (block) {
    let words = new Uint32Array(80);
    for (let i = 0; i < 16; i++) {
        words[i] = (block[i * 4] << 24) | (block[i * 4 + 1] << 16) | (block[i * 4 + 2] << 8) | block[i * 4 + 3];
    }
    for (let i = 16; i < 80; i++) {
        let val = words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16];
        words[i] = (val << 1) | (val >>> 31);
    }
    let a = this.chain_[0], b = this.chain_[1], c = this.chain_[2], d = this.chain_[3], e = this.chain_[4];
    for (let i = 0; i < 80; i++) {
        let f, k;
        if (i < 20) {
            f = (b & c) | (~b & d); k = 1518500249;
        } else if (i < 40) {
            f = b ^ c ^ d; k = 1859775393;
        } else if (i < 60) {
            f = (b & c) | (b & d) | (c & d); k = 2400959708;
        } else {
            f = b ^ c ^ d; k = 3395469782;
        }
        let t = (((a << 5) | (a >>> 27)) + f + e + k + words[i]) | 0;
        e = d; d = c; c = ((b << 30) | (b >>> 2)) | 0; b = a; a = t;
    }
    this.chain_[0] = (this.chain_[0] + a) | 0;
    this.chain_[1] = (this.chain_[1] + b) | 0;
    this.chain_[2] = (this.chain_[2] + c) | 0;
    this.chain_[3] = (this.chain_[3] + d) | 0;
    this.chain_[4] = (this.chain_[4] + e) | 0;
};
Sha1.prototype.digest = function () {
    let block = new Uint8Array(64);
    block.set(this.buf_.subarray(0, this.bufLen_), 0);
    block.set([128], this.bufLen_);
    if (this.bufLen_ >= 56) {
        this.processBlock_(block);
        block.fill(0);
    }
    let bits = this.totalLen_ * 8;
    for (let i = 0; i < 8; i++) {
        block[63 - i] = bits & 255;
        bits >>>= 8;
    }
    this.processBlock_(block);
    let res = [];
    for (let i = 0; i < 5; i++) {
        let w = this.chain_[i];
        res.push((w >>> 24) & 255, (w >>> 16) & 255, (w >>> 8) & 255, w & 255);
    }
    return res;
};
    // Inyección e integración con el SDK de compatibilidad clásico
    const registerDatabase = function (firebaseNamespace) {
        const _FirebaseAppCompat = firebaseNamespace.app;
        
        // Atar la base de datos heredada al ecosistema global de compatibilidad
        firebaseNamespace.INTERNAL.registerComponent(
            new firebaseNamespace.INTERNAL.Component(
                'database',
                (container, { instanceIdentifier }) => {
                    const app = container.getProvider('app').getImmediate();
                    const databaseDeps = container.getProvider('database-internal').getImmediate({ identifier: instanceIdentifier });
                    return databaseDeps;
                },
                'PUBLIC'
            )
        );
        
        // Mapear funciones clásicas como ref(), set(), update() y on()
        firebaseNamespace.database = function (app) {
            return _FirebaseAppCompat(app).database();
        };
    };

    // Inicialización automática dentro de la ventana del navegador
    if (typeof firebase !== 'undefined') {
        registerDatabase(firebase);
    }

}));
