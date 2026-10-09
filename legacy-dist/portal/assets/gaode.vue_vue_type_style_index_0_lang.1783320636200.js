var k=(s,v,n)=>new Promise((h,u)=>{var l=a=>{try{o(n.next(a))}catch(d){u(d)}},r=a=>{try{o(n.throw(a))}catch(d){u(d)}},o=a=>a.done?h(a.value):Promise.resolve(a.value).then(l,r);o((n=n.apply(s,v)).next())});import{A as W,__tla as S}from"./index.1783320636200116.js";import{d as j,c as z,a8 as $,l as g,o as q,f as I,t as G,Y as L,Z as P,a4 as E}from"./vue.1783320636200.js";import{B as m,f,__tla as Z}from"./index.1783320636200.js";let b,J=Promise.all([(()=>{try{return S}catch(s){}})(),(()=>{try{return Z}catch(s){}})()]).then(()=>k(void 0,null,function*(){let s,v;s=E("div",{id:"container"},null,-1),v=[s],b=j({__name:"gaode",props:{markers:{type:Array,required:!1},latitudeGcj02:{type:String,required:!1},longitudeGcj02:{type:String,required:!1},queryParam:{type:Object,required:!1},gaodekey:{type:Array,required:!1}},emits:["zoomendData","geolactionData"],setup(n,{expose:h,emit:u}){const l=n,r=z(()=>store.getters.targetWay),o=$();let a;const d=g([]),_=g({}),w=g(15),c=g("");console.log("props",l),q(()=>{window._AMapSecurityConfig={securityJsCode:l.gaodekey[1]},y()}),I(()=>{a&&(a==null||a.destroy())});const y=()=>{G(()=>{W.load({version:"2.0",key:l.gaodekey[0],plugins:["AMap.Geolocation","AMap.PlaceSearch","AMap.LabelMarker","AMap.InfoWindow","AMap.Geocoder"]}).then(e=>{B([l.longitudeGcj02,l.latitudeGcj02])}).catch(e=>{})})},x=()=>{const e=[];d.value.map((t,i)=>{var p='<div class="custom-content-marker">   <img src="//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png">   <div class="close-btn">'+(i+1)+"</div></div>";e.push(new AMap.Marker({map:a,content:p,position:[t.lng,t.lat],icon:"//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-default.png",offset:new AMap.Pixel(-13,-30)}))}),e.forEach(t=>{t==null||t.on("click",function(i){var p;A((p=i==null?void 0:i.target)==null?void 0:p._position)})}),a.add(e)},A=e=>{let t=d.value.find(M=>M.lng==e[0]&&M.lat==e[1]);if(t){if(_.value=t,c.value=="1")var i=`
          <div class='gdMapWindowStyle'>
              <div class='left'>
                  <div><a-image fallback="/default/corp.png" style="border-radius: 18px; width: 36px; height: 36px" src="${m+f+"/"+t.logo}" /></div>
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
                  `;else var i=`
          <div class='gdMapWindowStyle'>
              <div class='left'>
                  <div><img style="border-radius: 18px; width: 36px; height: 36px" src="${m+f+"/"+t.logo}" /></div>
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
                  `;var p=new AMap.InfoWindow({anchor:"top-center",autoMove:!0,content:i,isCustom:!1});window.goDtl=()=>{c.value=="1"?window.open(o.resolve("/CorpDetail?companyId="+t.id).href,r):window.open(o.resolve("/jobMarketDetail?id="+t.id).href,r)},p.open(a,e)}},C=e=>{if(c.value=="1")var t=`
          <div class='gdMapWindowStyle'>
              <div class='left'>
                  <div><img style="border-radius: 18px; width: 36px; height: 36px" src="${m+f+"/"+e.logo}" /></div>
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
                  <div><img style="border-radius: 18px; width: 36px; height: 36px" src="${m+f+"/"+e.logo}" /></div>
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
                  `;var i=new AMap.InfoWindow({anchor:"top-center",autoMove:!0,content:t,isCustom:!1});window.goDtl=()=>{c.value=="1"?window.open(o.resolve("/CorpDetail?companyId="+e.id).href,r):window.open(o.resolve("/jobMarketDetail?id="+e.id).href,r)},i.open(a,[e.lng,e.lat])},B=e=>{a=new AMap.Map("container",{center:e,zoom:w.value,resizeEnable:!0}),a.on("zoomchange",()=>{}),a.on("zoomend",t=>{w.value=a.getZoom(),u("zoomendData",t)}),a.on("complete",function(){D(e)})},D=e=>{let t=new AMap.Marker({map:a,icon:new AMap.Icon({size:new AMap.Size(40,40),image:"//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png",imageSize:new AMap.Size(20,25)}),position:e});a.add(t)};return h({dataList:(e,t)=>{d.value=[],c.value="",d.value=e,c.value=t,a==null||a.clearMap(),x()},dataListCenter:e=>{a.setCenter([e.lng,e.lat]),C(e)},init:y}),(e,t)=>(L(),P("div",null,v))}})}));export{b as _,J as __tla};
