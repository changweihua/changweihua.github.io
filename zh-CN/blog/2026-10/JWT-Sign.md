---
lastUpdated: true
commentabled: true
recommended: true
title: JWT 的签名到底验的是什么
description: 能解码不等于能信任
date: 2026-10-19 09:35:00
pageClass: blog-page-class
cover: /covers/platform.svg
---

> 任何人都能读出 JWT 里的内容——它只是 Base64URL，不是加密。真正决定这个令牌能否被信任的是签名，而签名的验证有几种经典的绕过方式。

## 先亲手造一个，再亲手读出来 ##

关于 JWT 的所有误解，都能靠亲手造一个来消除。不需要任何依赖，Node 自带的 crypto 就够：

```ts
import { createHmac } from 'node:crypto';

const b64u = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const secret = 'dev-secret-not-a-real-key';

const h = b64u({ alg: 'HS256', typ: 'JWT' });
const p = b64u({ sub: 'u_1024', role: 'user', exp: 1790000000 });
const s = createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');

console.log(`${h}.${p}.${s}`);
```

我在 Node v22.17.1 / macOS 26.5.2 上跑出来的结果，本文后面所有例子都基于这一个令牌：

```txt
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1XzEwMjQiLCJyb2xlIjoidXNlciIsImV4cCI6MTc5MDAwMDAwMH0.1Uq490UTCjQu_qA7RScjHcHUgT65G2nBnogsqjkr3P0
```

三段用点号隔开，长度分别是 36 / 63 / 43 个字符。把前两段丢回去解码，得到的就是你刚刚写进去的那两个 JSON 对象——一个字节都没变：

```ts
Buffer.from(h, 'base64url').toString(); // {"alg":"HS256","typ":"JWT"}
Buffer.from(p, 'base64url').toString(); // {"sub":"u_1024","role":"user","exp":1790000000}
Buffer.from(s, 'base64url').length;     // 32
```

第三段解码出来是 32 个`字节`而不是文本——那是 HMAC-SHA256 的输出，256 位。它不是「加密后的前两段」，前两段并没有被藏起来，它只是对前两段算出来的一个固定长度的摘要。顺带解释一个人人都见过、很少有人追问的现象：几乎所有 JWT 都以 `eyJ` 开头，因为紧凑序列化的 header JSON 必然以 `{"` 加一个字母开头，而 `{"a` 编码出来是 `eyJh`、`{"z` 是 `eyJ6`，前三个字符恒为 `eyJ`。这不是什么魔法前缀，只是 Base64 的对齐结果。

## Base64URL 不是加密，而且它和 Base64 差三个字符 ##

「JWT 是加密的吗」这个问题之所以反复被问，很大程度上是因为那一长串东西看起来像密文。它不是。Base64URL 是编码，编码是可逆的、不需要密钥的公开变换，它和 Base64 的区别只有三处：`+` 换成 `-`、`/` 换成 `_`、末尾的 `=` 填充去掉。用五个字节就能把这三处差异一次看全：

```ts
const b = Buffer.from([0xfb, 0xef, 0xbe, 0x3f, 0xff]);
b.toString('base64');    // '++++P/8='
b.toString('base64url'); // '----P_8'
```

这三处差异的用意是让编码结果能安全地出现在 URL 路径、查询串和 HTTP 头里，不必再做一次百分号转义。但它也埋了一个很容易踩的坑：*很多命令行 base64 工具既不认 `-` 和 `_`，也不容忍缺失的填充*，而且出错时不吭声。在 macOS 上直接把 `payload` 段喂给 `base64 -d`：

```bash
T='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1XzEwMjQiLCJyb2xlIjoidXNlciIsImV4cCI6MTc5MDAwMDAwMH0.1Uq490UTCjQu_qA7RScjHcHUgT65G2nBnogsqjkr3P0'
echo "$T" | cut -d. -f2 | base64 -d
# {"sub":"u_1024","role":"user","exp":179000000
```

它的退出码是 0，没有任何警告。payload 段是 63 个字符，63 除以 4 余 3，最后那组三个字符还差一个 `=` 才完整，于是 FreeBSD 版 base64（macOS 自带的就是它）把这不完整的一组整个丢掉了——少了两个字符 `0}`。注意后果的形状：花括号没了，输出连合法 JSON 都不是；更阴险的是 `exp` 从 1790000000 变成了 179000000，少一个零，*看起来仍然是个像模像样的时间戳*。这一段里恰好没有 - 和 _，所以它栽的纯粹是填充；换成签名段就是另一种栽法——那一段里有一个 `_`，`base64 -d` 同样一声不吭，吐出 30 个字节，而真正的 HMAC-SHA256 签名是 32 个字节。换成 Node 的 `base64url` 解码就没有这个问题：

```bash
node -e "console.log(Buffer.from(process.argv[1].split('.')[1],'base64url').toString())" "$T"
# {"sub":"u_1024","role":"user","exp":1790000000}
```

结论很直接：payload 里的每一项声明，对任何拿到令牌的人都是明文可读的。用户 ID、角色、租户编号放进去没问题，因为它们本来就是这个用户自己的身份；但内部主键、手机号、邮箱、任何你不愿写进日志的字段，都不该出现在那里。*签名保证的是「没被改过」，不是「看不见」*。

## 签名覆盖的是前两段，而且只覆盖前两段 ##

签名的输入是 `header段 + "." + payload段` 这个字符串——注意是编码后的两段原文，不是解码出来的对象。所以只要这两段里任何一个字节变了，签名就对不上。改 payload 会被抓到，改 header 里一个跟算法毫不相干的字段也会：

```t
const sign = (h, p) => createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url');

// 把 role 从 user 改成 admin，签名段沿用原来的
sign(h, b64u({ sub: 'u_1024', role: 'admin', exp: 1790000000 })) === s; // false
// 只把 typ 从 JWT 改成 at+jwt，签名段沿用原来的
sign(b64u({ alg: 'HS256', typ: 'at+jwt' }), p) === s;                   // false
```

两次都是 false。把这件事说到位：*签名验证通过，能证明的只有一句话——这个 header 与 payload 的组合，确实由持有密钥的一方签发过，并且此后一个字节都没改*。 它不能证明的东西比能证明的多得多：不能证明令牌没过期，不能证明它没被吊销，不能证明它是发给你这个服务的，也不能证明用户此刻还有那个角色。这些都得靠另外的检查，而且那些检查跟密码学没有半点关系。

## 病根只有一句话：验证方读了令牌自称的算法 ##

下面这个验证函数写得非常自然，自然到很多人第一次看不出问题在哪：

```ts
function naiveVerify(token, hmacKey, rsaPublicKey) {
  const [h, p, s] = token.split('.');
  const alg = JSON.parse(Buffer.from(h, 'base64url').toString()).alg; // ← 病根在这一行
  if (alg === 'none') return true;
  if (alg === 'HS256') return s === createHmac('sha256', hmacKey).update(`${h}.${p}`).digest('base64url');
  if (alg === 'RS256') return createVerify('RSA-SHA256').update(`${h}.${p}`)
    .verify(rsaPublicKey, Buffer.from(s, 'base64url'));
  return false;
}
```

问题在于 `alg` 是从 header 里读出来的，而 header 是攻击者可以随便改的那两段之一。于是「怎么验这个令牌」这个决定，被交给了那个等待被验证的令牌自己。

最短的利用方式就是 `alg: none`。规范里保留这个取值，本意是留给「完整性由传输层等其他手段保证」的场景，但落到一个会照着 header 办事的实现上，它等于一句「不用验」：

```ts
const forged = `${b64u({ alg: 'none', typ: 'JWT' })}.${b64u({ sub: 'u_1024', role: 'admin', exp: 1790000000 })}.`;
// eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJ1XzEwMjQiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3OTAwMDAwMDB9.
naiveVerify(forged, secret);  // true —— role 已经是 admin
```

注意末尾那个孤零零的点号：第三段是空的，因为攻击者把签名整个删掉了。伪造这个令牌不需要任何密钥，不需要爆破，甚至不需要看懂 HMAC 是什么——把 header 里的 `HS256` 改成 `none`、把 payload 改成想要的样子、把签名段清空，三步。

## 同一个病根的第二副面孔：HS256 / RS256 混淆 ##

`alg: none` 太出名了，今天大多数库都会显式拒绝它。但只要「算法由令牌自称」这个病根还在，同一个洞就会换个形状再出现一次，而且这次不需要任何一个可疑的取值。

前提是服务端用 RS256：*私钥*签发，*公钥*验签。公钥按定义是公开的——它可能挂在 `/.well-known/jwks.json` 上，可能就印在你的 API 文档里。攻击者拿到这份公钥，把 header 的 `alg` 改成 HS256，然后*把公钥的文本当作 HMAC 的密钥*去签名：

```ts
const pub = publicKey.export({ type: 'spki', format: 'pem' });  // 公开的东西
const hh = b64u({ alg: 'HS256', typ: 'JWT' });
const pp = b64u({ sub: 'u_1024', role: 'admin', exp: 1790000000 });
const forged = `${hh}.${pp}.${createHmac('sha256', pub).update(`${hh}.${pp}`).digest('base64url')}`;

naiveVerify(forged, pub, pub);  // true
```

我实测的结果就是 `true`。成立的原因很朴素：验证方手上只有一份密钥材料，也就是那个公钥；它读到 header 说「这是 HS256」，就把这份材料当成 HMAC 的共享密钥用了。而 HMAC 的验证与签发用的是同一个密钥——于是一个本该只能验证、不能签发的公钥，被降格成了一个人人都有的签发密钥。顺带一提，两种令牌在外形上差别很明显：RS256（2048 位）的签名段是 342 个字符，HS256 的是 43 个，肉眼就能分辨；但没有任何代码会去看这个。

## 正确的做法：算法由验证方规定 ##

两种攻击的修法是同一个，而且只有一句话：*验证方自己决定接受哪个算法，用哪把密钥，然后拿令牌去对照——绝不反过来问令牌*。 header 里的 `alg` 从此只有一个用途，就是和你规定的那个比一下，不相等就直接拒绝。

```ts
function verify(token, { algorithms, secret, now = Math.floor(Date.now() / 1000), leeway = 60 }) {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, why: '不是三段结构' };
  const [h, p, s] = parts;

  const head = JSON.parse(Buffer.from(h, 'base64url').toString());
  if (!algorithms.includes(head.alg)) return { ok: false, why: `算法 ${head.alg} 不在允许列表内` };

  const expect = Buffer.from(createHmac('sha256', secret).update(`${h}.${p}`).digest('base64url'), 'base64url');
  const got = Buffer.from(s, 'base64url');
  if (got.length !== expect.length || !timingSafeEqual(got, expect)) return { ok: false, why: '签名不匹配' };

  const c = JSON.parse(Buffer.from(p, 'base64url').toString());
  if (typeof c.exp === 'number' && now > c.exp + leeway) return { ok: false, why: '已过期' };
  if (typeof c.nbf === 'number' && now + leeway < c.nbf) return { ok: false, why: '尚未生效' };
  return { ok: true, claims: c };
}
```

同样的三个令牌喂给它，实测输出是：原令牌 `{"ok":true,...}，alg: none` 伪造 `{"ok":false,"why":"算法 none 不在允许列表内"}`，一个过期的令牌 `{"ok":false,"why":"已过期"}`。而 HS256/RS256 混淆那个令牌，只要把允许列表写成 `['RS256']`，它在算法那一关就被拦下了——实测返回 `{"ok":false,"why":"算法 HS256 不在允许列表内"}`，根本走不到验签那一步。

几个细节值得单独点出来。*算法列表是白名单，不是黑名单*——只拒绝 `none` 是不够的，上一节那个例子里没有出现任何可疑取值。*密钥要和算法绑死*，HS256 用共享密钥、RS256 用公钥，不要让同一份材料被两条分支共用，那正是混淆攻击的落脚点。签名比对要用 `timingSafeEqual`，而不是 `===`；字符串比较可能在第一个不同的字符处就返回，于是耗时会随着攻击者猜对的前缀变长而变化。顺序不能反：先验签名，再读声明。签名没通过之前，payload 里的每一个字段都是攻击者写的。

## `exp` 只是一个数字，不检查就等于没有 ##

`exp`、`nbf`、`iat` 都是普通的 JSON 字段，签名只保证它们没被改过，不会替你比较它们。这一点在实测里非常直观：我用一个 `exp` 为 1789000000（2026-09-10T00:26:40Z，写这篇文章时是四天前）的令牌，用正确的密钥签好，再交给前面那个 `naiveVerify`——它返回 `true`。签名确实是有效的，令牌确实是我签发的，而它确实已经过期了。*「签名有效」和「令牌可用」是两个问题，第二个问题的答案不在密码学里，在你的那行 `if` 里*。

按 RFC 7519，这三个字段的类型都是 `NumericDate`，也就是*以秒为单位*的 Unix 时间戳。JavaScript 的 Date 要的是毫秒，两者差三个数量级，于是这里成了一个高频 bug 点：把 `Date.now()` 直接写进 `exp`，令牌会变成永不过期；把 `exp` 直接丢给 `new Date()`，会得到 1970 年的某一天，于是每个请求都 401。关于这个千倍差在实践中还有哪些形状，可以看时间戳的三个坑。另外别忘了留一点时钟容差（上面那段代码里的 `leeway`）：签发方和验证方是两台机器，NTP 有漂移，几十秒的容差能挡掉一大类「刚签发就说过期」的诡异报障。

## 吊销是签名在结构上就表达不了的一件事 ##

过期至少还写在令牌里，吊销连写都没处写。回头看上一节那个 `verify()` 函数：它从头到尾没有做任何一次 I/O——没查数据库，没发网络请求，全部计算都在本地完成。这正是 JWT 被选中的理由（验证方不必和签发方共享会话存储），但同一件事反过来说就是：*令牌一旦签发出去，服务端就不再持有对它的任何控制*。

具体后果是这样的：用户改了密码，那个在三十分钟前签发、还有二十分钟才到期的令牌，照样能用；管理员把某个账号停用了，已经发出去的令牌照样能用；你把 `role` 从 `admin` 降成 `user`，旧令牌里那个 `admin` 照样有效，直到它自己过期为止。这些都不是实现 bug，而是「验证方只做本地计算」这个设计的必然推论——它没有任何渠道知道你在服务端改了什么。

减损的办法只有两条，而且都要付代价。*一是把 `exp` 压短*，比如访问令牌只给 5 到 15 分钟，配一个可以在服务端撤销的刷新令牌；代价是刷新逻辑本身的复杂度，以及刷新接口成了新的攻击面。*二是引入一份需要查询的状态*——按 `jti` 建吊销名单，或者在用户记录上放一个版本号、令牌里带上同一个版本号，不一致就拒绝；代价是每次验证都要读一次那份状态，于是「无状态验证」这个卖点被还了回去。没有第三条路：要么容忍一个已知长度的时间窗口，要么花一次查询把窗口关掉。选哪个是业务决定，但*必须是一个被明确做出的决定*，而不是「我们用了 JWT，所以踢下线应该是即时的吧」。

## 这个解码器能告诉你什么，不能告诉你什么 ##

JWT 解码工具只做解码，不验签。原因不是没实现，而是验签需要密钥，而向你*索取生产环境的签名密钥这个动作本身就是错的*——尤其是 HMAC，验证用的密钥和签发用的是同一个，交出去就等于交出了以你的名义签发任意令牌的能力。一个网页可以承诺「不上传」，但你没有办法在粘贴之前验证这个承诺；解码则完全不需要密钥，所以这个工具只做那件能安全做完的事。

还有一个边界更靠前：解码器只处理三段结构。如果你粘进去的东西有五段，那多半不是 JWT 而是 JWE——RFC 7516 的紧凑序列化是「受保护头.加密密钥.初始向量.密文.认证标签」五段，其中真正的载荷是加密过的，没有密钥就是一堆二进制，任何解码器都读不出人话。段数不对的时候，先确认你手上的到底是哪一种东西，再去怀疑工具。

把边界写清楚：这个工具能告诉你这个令牌*说了什么*——三段各自的内容、`exp` 换算成本地时间是什么时候、按你本机的钟算它过没过期。它不能告诉你这个令牌*是不是真的*。一个能干净解码、格式完好、还没到期的令牌，完全可以是前面那种三步伪造出来的东西。真正回答「能不能信」的只有持有密钥的那台服务器，而它回答这个问题的方式，就是本文中间那几节反复说的那一句：算法由它自己规定，不问令牌。
