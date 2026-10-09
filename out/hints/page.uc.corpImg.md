# 导入提示：page.uc.corpImg

原 chunk `index.17516156075453.js`。导入路径和导出名以 maps 为准（来自 registry），这里只给定义片段帮助理解。Vue 运行时别名见 maps.vue。

| 本地名 | 来源 chunk | 类型 | 导入自 | 定义片段 |
|---|---|---|---|---|
| `v` | index.175161560754527.js | entry | echarts `init` | `function zZ(r,e,t){var a=!(t&&t.ssr);if(a){var n=MN(r);if(n)return n}var i=new wC(r,e,t);return i.id="ec_"+CN++,Ts[i.id]=i,a&&tT(r,Hg,i.id),xC(i),vr.trigger("afterinit",i),i}` |
| `y` | index.1751615607545.js | entry | @/legacy `http` | `new cpt({baseURL:Li,timeout:cvt})` |
| `h` | index.1751615607545.js | entry | @/legacy `decryptStorage` | `(t,e)=>{if(t&&typeof t=="string")try{return JSON.parse(Df.sm4.decrypt(t,yC))}catch(n){return console.error("解密失败:",n),localStorage.removeItem(e),null}else return null}` |
| `E` | index.1751615607545.js | entry | @/legacy `decryptText` | `t=>{if(t&&typeof t=="string")try{return Df.sm4.decrypt(t,yC)}catch(e){return console.error("解密失败:",e),null}else return null}` |
| `M` | index.1751615607545.js | entry | （不需要：_export_sfc：SFC 里不需要，忽略） | `(t,e)=>{const n=t.__vccOpts\|\|t;for(const[r,a]of e)n[r]=a;return n}` |
