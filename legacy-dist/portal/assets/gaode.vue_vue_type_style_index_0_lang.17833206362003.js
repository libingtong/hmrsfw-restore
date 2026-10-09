var k=(n,u,s)=>new Promise((y,r)=>{var p=a=>{try{i(s.next(a))}catch(l){r(l)}},c=a=>{try{i(s.throw(a))}catch(l){r(l)}},i=a=>a.done?y(a.value):Promise.resolve(a.value).then(p,c);i((s=s.apply(n,u)).next())});import{A as $,__tla as z}from"./index.1783320636200116.js";import{d as S,c as I,a8 as j,l as m,o as q,f as P,t as L,Y as G,Z as E,a4 as Z}from"./vue.1783320636200.js";import{B as f,f as h,__tla as H}from"./index.1783320636200.js";let x,J=Promise.all([(()=>{try{return z}catch(n){}})(),(()=>{try{return H}catch(n){}})()]).then(()=>k(void 0,null,function*(){let n,u;n=Z("div",{id:"container"},null,-1),u=[n],x=S({__name:"gaode",props:{markers:{type:Array,required:!1},latitude:{type:String,required:!1},queryParam:{type:Object,required:!1},gaodekey:{type:Array,required:!1}},emits:["zoomendData","geolactionData","moveendData"],setup(s,{expose:y,emit:r}){const p=s,c=I(()=>store.getters.targetWay),i=j();let a;const l=m([]),_=m({}),w=m(15),v=m("");console.log("props",p),q(()=>{window._AMapSecurityConfig={securityJsCode:p.gaodekey[1]},b()}),P(()=>{a&&(a==null||a.destroy())});const b=()=>{L(()=>{$.load({version:"2.0",key:p.gaodekey[0],plugins:["AMap.Geolocation","AMap.PlaceSearch","AMap.LabelMarker","AMap.InfoWindow","AMap.Geocoder"]}).then(e=>{B()}).catch(e=>{})})},C=()=>{const e=[];l.value.map((t,o)=>{var d='<div class="custom-content-marker">   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png">   <div class="close-btn">'+(o+1)+"</div></div>";e.push(new AMap.Marker({map:a,content:d,position:[t.lng,t.lat],icon:"//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",offset:new AMap.Pixel(-13,-30)}))}),e.forEach(t=>{t==null||t.on("click",function(o){var d;A((d=o==null?void 0:o.target)==null?void 0:d._position)})}),a.add(e)},A=e=>{let t=l.value.find(g=>g.lng==e[0]&&g.lat==e[1]);if(t){if(_.value=t,v.value=="1")var o=`
        <div class='gdMapWindowStyle'>
            <div class='left'>
                <div><a-image fallback="/default/corp.png" style="border-radius: 18px; width: 36px; height: 36px" src="${f+h+"/"+t.logo}" /></div>
            </div>
            <div class='right'>
                <div >${t.title}</div>
                <div >\u6B22\u8FCE\u67E5\u770B\u6211\u516C\u53F8\u62DB\u8058\u4FE1\u606F\uFF0C\u5982\u6709\u5174\u8DA3\u60A8\u53EF\u4EE5</div>
            </div>
            <div class='close' onclick="closeWindow()"></div>
        </div>
        <a-button
            onClick='goDtl()'
            type="default"
            class="defaultBtn radius5 hoverBgBlue buttonClass"
            shape="round"
            style="margin-left: 30px;"
            >\u67E5\u770B\u516C\u53F8\u8BE6\u60C5
        </a-button>
                `;else var o=`
        <div class='gdMapWindowStyle'>
            <div class='left'>
                <div><img style="border-radius: 18px; width: 36px; height: 36px" src="${f+h+"/"+t.logo}" /></div>
            </div>
            <div class='right'>
                <div >${t.title}</div>
                <div >${t.adr}</div>
            </div>
            <div class='close' onclick="closeWindow()"></div>
        </div>
        <a-button
            onClick='goDtl()'
            type="default"
            class="defaultBtn radius5 hoverBgBlue buttonClass"
            shape="round"
            style="margin-left: 30px;"
            >\u67E5\u770B\u516C\u53F8\u8BE6\u60C5
        </a-button>
                `;var d=new AMap.InfoWindow({anchor:"top-center",autoMove:!0,content:o,isCustom:!1});window.goDtl=()=>{v.value=="1"?window.open(i.resolve("/CorpDetail?companyId="+t.id).href,c):window.open(i.resolve("/jobMarketDetail?id="+t.id).href,c)},d.open(a,e)}},D=e=>{if(v.value=="1")var t=`
        <div class='gdMapWindowStyle'>
            <div class='left'>
                <div><img style="border-radius: 18px; width: 36px; height: 36px" src="${f+h+"/"+e.logo}" /></div>
            </div>
            <div class='right'>
                <div >${e.title}</div>
                <div >\u6B22\u8FCE\u67E5\u770B\u6211\u516C\u53F8\u62DB\u8058\u4FE1\u606F\uFF0C\u5982\u6709\u5174\u8DA3\u60A8\u53EF\u4EE5</div>
            </div>
            <div class='close' onclick="closeWindow()"></div>
        </div>
        <a-button
            onClick='goDtl()'
            type="default"
            class="defaultBtn radius5 hoverBgBlue buttonClass"
            shape="round"
            style="margin-left: 30px;"
            >\u67E5\u770B\u516C\u53F8\u8BE6\u60C5
        </a-button>
                `;else var t=`
        <div class='gdMapWindowStyle'>
            <div class='left'>
                <div><img style="border-radius: 18px; width: 36px; height: 36px" src="${f+h+"/"+e.logo}" /></div>
            </div>
            <div class='right'>
                <div >${e.title}</div>
                <div >${e.adr}</div>
            </div>
            <div class='close' onclick="closeWindow()"></div>
        </div>
        <a-button
            onClick='goDtl()'
            type="default"
            class="defaultBtn radius5 hoverBgBlue buttonClass"
            shape="round"
            style="margin-left: 30px;"
            >\u67E5\u770B\u516C\u53F8\u8BE6\u60C5
        </a-button>
                `;var o=new AMap.InfoWindow({anchor:"top-center",autoMove:!0,content:t,isCustom:!1});window.goDtl=()=>{v.value=="1"?window.open(i.resolve("/CorpDetail?companyId="+e.id).href,c):window.open(i.resolve("/jobMarketDetail?id="+e.id).href,c)},o.open(a,[e.lng,e.lat])},B=()=>{let e=new AMap.Geolocation({enableHighAccuracy:!0,timeout:1e3,needAddress:!1,extensions:"all",zoomToAccuracy:!0,convert:!1});e&&e.getCurrentPosition(function(t,o){t=="complete"?W(o):e.getCityInfo(function(d,g){M(g.position)})})},W=e=>{M(e.position)},M=e=>{a=new AMap.Map("container",{center:e,zoom:w.value,resizeEnable:!0}),a.on("zoomchange",()=>{}),a.on("zoomend",t=>{w.value=a.getZoom(),r("zoomendData",t)}),a.on("moveend",t=>{r("moveendData",t)}),a.on("complete",function(){r("geolactionData",a)})};return y({dataList:(e,t)=>{l.value=[],v.value="",l.value=e,v.value=t,a==null||a.clearMap(),C()},dataListCenter:e=>{a.setCenter([e.lng,e.lat]),D(e)},init:b}),(e,t)=>(G(),E("div",null,u))}})}));export{x as _,J as __tla};
