export type Direction = "encode" | "decode";

export interface EncodingMethod {
  id: string;
  label: string;
  icon: string;
  /** 인코딩 입력 placeholder */
  encodePlaceholder: string;
  /** 디코딩 입력 placeholder */
  decodePlaceholder: string;
  /** 인코딩 결과 예시 (짧은 텍스트) */
  encodeExample: string;
  /** 디코딩 결과 예시 (짧은 텍스트) */
  decodeExample: string;
  encode: (text: string) => string;
  decode: (text: string) => string;
}

function tryCatch(fn: (s: string) => string): (s: string) => string {
  return (s: string) => {
    try {
      return fn(s);
    } catch {
      return "❌ 변환 실패 — 입력이 유효하지 않습니다";
    }
  };
}

export const encodingMethods: EncodingMethod[] = [
  {
    id: "url",
    label: "URL 인코딩",
    icon: "🔗",
    encodePlaceholder: "안녕하세요?test=1&q=한글",
    decodePlaceholder: "%EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94%3Ftest%3D1%26q%3D%ED%95%9C%EA%B8%80",
    encodeExample: "안녕하세요 → %EC%95%88%EB%85%95%ED%95%98%EC%84%B8%EC%9A%94",
    decodeExample: "%EC%95%88%EB%85%95 → 안녕",
    encode: (s) => encodeURIComponent(s),
    decode: tryCatch((s) => decodeURIComponent(s)),
  },
  {
    id: "url-all",
    label: "URL 인코딩 (전체)",
    icon: "🔗",
    encodePlaceholder: "Hello, 한글!",
    decodePlaceholder: "%48%65%6C%6C%6F%2C%20%ED%95%9C%EA%B8%80%21",
    encodeExample: "Hello → %48%65%6C%6C%6F",
    decodeExample: "%48%65%6C%6C%6F → Hello",
    encode: (s) =>
      s
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase()}`)
        .join(""),
    decode: tryCatch((s) =>
      s
        .split(/(%[0-9A-Fa-f]{2})/)
        .filter(Boolean)
        .map((part) => {
          if (part.startsWith("%")) {
            return String.fromCharCode(parseInt(part.slice(1), 16));
          }
          return part;
        })
        .join("")
    ),
  },
  {
    id: "base64",
    label: "Base64",
    icon: "🗜️",
    encodePlaceholder: "안녕하세요, 세상!",
    decodePlaceholder: "7JWI64WK7ZmU7IucLCDshJjsmpDshLg=",
    encodeExample: "안녕 → 7JWI64WK",
    decodeExample: "7JWI64WK → 안녕",
    encode: (s) => btoa(unescape(encodeURIComponent(s))),
    decode: tryCatch((s) => decodeURIComponent(escape(atob(s)))),
  },
  {
    id: "base64url",
    label: "Base64URL",
    icon: "🗜️",
    encodePlaceholder: "안녕하세요, 세상!",
    decodePlaceholder: "7JWI64WK7ZmU7IucLCDshJjsmpDshLg",
    encodeExample: "안녕 → 7JWI64WK",
    decodeExample: "7JWI64WK → 안녕",
    encode: (s) =>
      btoa(unescape(encodeURIComponent(s)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, ""),
    decode: tryCatch((s) => {
      let t = s.replace(/-/g, "+").replace(/_/g, "/");
      const pad = t.length % 4;
      if (pad === 2) t += "==";
      else if (pad === 3) t += "=";
      return decodeURIComponent(escape(atob(t)));
    }),
  },
  {
    id: "html",
    label: "HTML Entity",
    icon: "🏷️",
    encodePlaceholder: "<div>안녕 & \"세상\"!</div>",
    decodePlaceholder: "&lt;div&gt;안녕 &amp; &quot;세상&quot;!&lt;/div&gt;",
    encodeExample: "& → &amp;",
    decodeExample: "&amp; → &",
    encode: (s) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\n/g, "&#10;")
        .replace(/\r/g, "&#13;"),
    decode: tryCatch((s) => {
      const el = document.createElement("textarea");
      el.innerHTML = s;
      return el.value;
    }),
  },
  {
    id: "unicode-escape",
    label: "Unicode Escape (JS)",
    icon: "🌐",
    encodePlaceholder: "안녕, 세상! 𠜎",
    decodePlaceholder: "\\uC548\\uB155, \\uC138\\uC0C1! \\u{2070E}",
    encodeExample: "안 → \\uC548",
    decodeExample: "\\uC548 → 안",
    encode: (s) =>
      s
        .split("")
        .map((c) => {
          const cp = c.codePointAt(0) ?? 0;
          if (cp < 128 && cp >= 32) return c;
          return cp <= 0xffff ? `\\u${cp.toString(16).padStart(4, "0")}` : `\\u{${cp.toString(16)}}`;
        })
        .join(""),
    decode: tryCatch((s) =>
      s
        .replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    ),
  },
  {
    id: "hex",
    label: "HEX (16진수)",
    icon: "🔢",
    encodePlaceholder: "안녕",
    decodePlaceholder: "EC 95 88 EB 85 95",
    encodeExample: "안 → EC 95 88",
    decodeExample: "EC 95 88 → 안",
    encode: (s) =>
      s
        .split("")
        .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0").toUpperCase())
        .join(" "),
    decode: tryCatch((s) =>
      s
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((hex) => String.fromCharCode(parseInt(hex, 16)))
        .join("")
    ),
  },
  {
    id: "binary",
    label: "Binary (2진수)",
    icon: "0️⃣",
    encodePlaceholder: "안녕",
    decodePlaceholder: "11101100 10010101 10001000 11101011 10000101 10010101",
    encodeExample: "안 → 11101100 10010101 10001000",
    decodeExample: "11101100... → 안",
    encode: (s) =>
      s
        .split("")
        .map((c) => c.charCodeAt(0).toString(2).padStart(8, "0"))
        .join(" "),
    decode: tryCatch((s) =>
      s
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((bin) => String.fromCharCode(parseInt(bin, 2)))
        .join("")
    ),
  },
  {
    id: "rot13",
    label: "ROT13",
    icon: "🔁",
    encodePlaceholder: "Hello World! 안녕",
    decodePlaceholder: "Uryyb Jbeyq! 안녕",
    encodeExample: "Hello → Uryyb",
    decodeExample: "Uryyb → Hello",
    encode: (s) =>
      s
        .split("")
        .map((c) => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + 13) % 26) + 65);
          if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + 13) % 26) + 97);
          return c;
        })
        .join(""),
    decode: (s) =>
      s
        .split("")
        .map((c) => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + 13) % 26) + 65);
          if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + 13) % 26) + 97);
          return c;
        })
        .join(""),
  },
  {
    id: "md5",
    label: "MD5 해시",
    icon: "🔒",
    encodePlaceholder: "안녕하세요",
    decodePlaceholder: "(MD5는 단방향 해시입니다)",
    encodeExample: "안녕 → e7c7... (32자)",
    decodeExample: "❌ 복호화 불가",
    encode: (s) => {
      // Simple MD5 implementation (RFC 1321)
      function md5cycle(x: number[], k: number[]) {
        let a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);
      }

      function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & c) | (~b & d), a, b, x, s, t);
      }
      function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn((b & d) | (c & ~d), a, b, x, s, t);
      }
      function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
      }
      function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
        return cmn(c ^ (b | ~d), a, b, x, s, t);
      }
      function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
      }
      function add32(a: number, b: number) {
        return (a + b) & 0xffffffff;
      }

      const n = s.length;
      const state = [1732584193, -271733879, -1732584194, 271733878];
      const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      let i = 0;
      while (i + 64 <= n) {
        const w = [];
        for (let j = 0; j < 64; j += 4) {
          w.push(
            (s.charCodeAt(i + j) & 0xff) |
            ((s.charCodeAt(i + j + 1) & 0xff) << 8) |
            ((s.charCodeAt(i + j + 2) & 0xff) << 16) |
            ((s.charCodeAt(i + j + 3) & 0xff) << 24)
          );
        }
        md5cycle(state, w);
        i += 64;
      }
      const w = [];
      for (let j = 0; j < 16; j++) w.push(0);
      let j = 0;
      while (j < n - i) {
        w[j >> 2] |= (s.charCodeAt(i + j) & 0xff) << ((j & 3) << 3);
        j++;
      }
      w[j >> 2] |= 0x80 << ((j & 3) << 3);
      if (j > 55) {
        md5cycle(state, w);
        for (let k = 0; k < 16; k++) w[k] = 0;
      }
      w[14] = n * 8;
      w[15] = 0;
      md5cycle(state, w);

      let h = "";
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          h += ((state[i] >> (j * 8)) & 0xff).toString(16).padStart(2, "0");
        }
      }
      return h;
    },
    decode: () => "❌ MD5는 단방향 해시 — 복호화할 수 없습니다",
  },
];

export function transform(methodId: string, direction: Direction, text: string): string {
  const method = encodingMethods.find((m) => m.id === methodId);
  if (!method) return "❌ 지원하지 않는 인코딩입니다";
  return direction === "encode" ? method.encode(text) : method.decode(text);
}
