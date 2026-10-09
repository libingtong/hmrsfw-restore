var Tg=Object.defineProperty,Sg=Object.defineProperties;var wg=Object.getOwnPropertyDescriptors;var tc=Object.getOwnPropertySymbols;var Ag=Object.prototype.hasOwnProperty,Rg=Object.prototype.propertyIsEnumerable;var Ka=Math.pow,ic=(gt,Mt,vt)=>Mt in gt?Tg(gt,Mt,{enumerable:!0,configurable:!0,writable:!0,value:vt}):gt[Mt]=vt,Ct=(gt,Mt)=>{for(var vt in Mt||(Mt={}))Ag.call(Mt,vt)&&ic(gt,vt,Mt[vt]);if(tc)for(var vt of tc(Mt))Rg.call(Mt,vt)&&ic(gt,vt,Mt[vt]);return gt},$a=(gt,Mt)=>Sg(gt,wg(Mt));var Vr=(gt,Mt,vt)=>new Promise((tn,zs)=>{var rn=ui=>{try{Gr(vt.next(ui))}catch(Wr){zs(Wr)}},sn=ui=>{try{Gr(vt.throw(ui))}catch(Wr){zs(Wr)}},Gr=ui=>ui.done?tn(ui.value):Promise.resolve(ui.value).then(rn,sn);Gr((vt=vt.apply(gt,Mt)).next())});import{d as Cg,a8 as Lg,ac as Pg,r as Ug,f as Dg,o as Ig,a1 as Og,Y as Ja,Z as Qa,h as Ng,a5 as rc,a4 as en,F as Fg,a2 as zg,aa as Hg,ab as Bg}from"./vue.1783320636200.js";import{z as kg,B as sc,f as ac,_ as Vg,__tla as Gg}from"./index.1783320636200.js";let nc,Wg=Promise.all([(()=>{try{return Gg}catch(gt){}})()]).then(()=>Vr(void 0,null,function*(){const gt="159",Nt="",ct="srgb",Zt="srgb-linear",Hs="display-p3",Xr="display-p3-linear",jr="linear",Ze="srgb",Yr="rec709",qr="p3",an="300 es";class zi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(t)===-1&&r[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const r=this._listeners;return r[e]!==void 0&&r[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const t=this._listeners[e.type];if(t!==void 0){e.target=this;const r=t.slice(0);for(let s=0,a=r.length;s<a;s++)r[s].call(this,e);e.target=null}}}const _t=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let nn=1234567;const ur=Math.PI/180,pr=180/Math.PI;function Hi(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(_t[i&255]+_t[i>>8&255]+_t[i>>16&255]+_t[i>>24&255]+"-"+_t[e&255]+_t[e>>8&255]+"-"+_t[e>>16&15|64]+_t[e>>24&255]+"-"+_t[t&63|128]+_t[t>>8&255]+"-"+_t[t>>16&255]+_t[t>>24&255]+_t[r&255]+_t[r>>8&255]+_t[r>>16&255]+_t[r>>24&255]).toLowerCase()}function ht(i,e,t){return Math.max(e,Math.min(t,i))}function Bs(i,e){return(i%e+e)%e}function Hc(i,e,t,r,s){return r+(i-e)*(s-r)/(t-e)}function Bc(i,e,t){return i!==e?(t-i)/(e-i):0}function fr(i,e,t){return(1-t)*i+t*e}function kc(i,e,t,r){return fr(i,e,1-Math.exp(-t*r))}function Vc(i,e=1){return e-Math.abs(Bs(i,e*2)-e)}function Gc(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Wc(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Xc(i,e){return i+Math.floor(Math.random()*(e-i+1))}function jc(i,e){return i+Math.random()*(e-i)}function Yc(i){return i*(.5-Math.random())}function qc(i){i!==void 0&&(nn=i);let e=nn+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Zc(i){return i*ur}function Kc(i){return i*pr}function ks(i){return(i&i-1)===0&&i!==0}function $c(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Zr(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Jc(i,e,t,r,s){const a=Math.cos,o=Math.sin,n=a(t/2),l=o(t/2),c=a((e+r)/2),h=o((e+r)/2),p=a((e-r)/2),u=o((e-r)/2),f=a((r-e)/2),v=o((r-e)/2);switch(s){case"XYX":i.set(n*h,l*p,l*u,n*c);break;case"YZY":i.set(l*u,n*h,l*p,n*c);break;case"ZXZ":i.set(l*p,l*u,n*h,n*c);break;case"XZX":i.set(n*h,l*v,l*f,n*c);break;case"YXY":i.set(l*f,n*h,l*v,n*c);break;case"ZYZ":i.set(l*v,l*f,n*h,n*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Bi(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function bt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const it={DEG2RAD:ur,RAD2DEG:pr,generateUUID:Hi,clamp:ht,euclideanModulo:Bs,mapLinear:Hc,inverseLerp:Bc,lerp:fr,damp:kc,pingpong:Vc,smoothstep:Gc,smootherstep:Wc,randInt:Xc,randFloat:jc,randFloatSpread:Yc,seededRandom:qc,degToRad:Zc,radToDeg:Kc,isPowerOfTwo:ks,ceilPowerOfTwo:$c,floorPowerOfTwo:Zr,setQuaternionFromProperEuler:Jc,normalize:bt,denormalize:Bi};class He{constructor(e=0,t=0){He.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,r=this.y,s=e.elements;return this.x=s[0]*t+s[3]*r+s[6],this.y=s[1]*t+s[4]*r+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(ht(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y;return t*t+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const r=Math.cos(t),s=Math.sin(t),a=this.x-e.x,o=this.y-e.y;return this.x=a*r-o*s+e.x,this.y=a*s+o*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class De{constructor(e,t,r,s,a,o,n,l,c){De.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,r,s,a,o,n,l,c)}set(e,t,r,s,a,o,n,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=n,h[3]=t,h[4]=a,h[5]=l,h[6]=r,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],this}extractBasis(e,t,r){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,s=t.elements,a=this.elements,o=r[0],n=r[3],l=r[6],c=r[1],h=r[4],p=r[7],u=r[2],f=r[5],v=r[8],g=s[0],m=s[3],d=s[6],b=s[1],E=s[4],w=s[7],S=s[2],A=s[5],C=s[8];return a[0]=o*g+n*b+l*S,a[3]=o*m+n*E+l*A,a[6]=o*d+n*w+l*C,a[1]=c*g+h*b+p*S,a[4]=c*m+h*E+p*A,a[7]=c*d+h*w+p*C,a[2]=u*g+f*b+v*S,a[5]=u*m+f*E+v*A,a[8]=u*d+f*w+v*C,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[1],s=e[2],a=e[3],o=e[4],n=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*n*c-r*a*h+r*n*l+s*a*c-s*o*l}invert(){const e=this.elements,t=e[0],r=e[1],s=e[2],a=e[3],o=e[4],n=e[5],l=e[6],c=e[7],h=e[8],p=h*o-n*c,u=n*l-h*a,f=c*a-o*l,v=t*p+r*u+s*f;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/v;return e[0]=p*g,e[1]=(s*c-h*r)*g,e[2]=(n*r-s*o)*g,e[3]=u*g,e[4]=(h*t-s*l)*g,e[5]=(s*a-n*t)*g,e[6]=f*g,e[7]=(r*l-c*t)*g,e[8]=(o*t-r*a)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,r,s,a,o,n){const l=Math.cos(a),c=Math.sin(a);return this.set(r*l,r*c,-r*(l*o+c*n)+o+e,-s*c,s*l,-s*(-c*o+l*n)+n+t,0,0,1),this}scale(e,t){return this.premultiply(Vs.makeScale(e,t)),this}rotate(e){return this.premultiply(Vs.makeRotation(-e)),this}translate(e,t){return this.premultiply(Vs.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,r,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,r=e.elements;for(let s=0;s<9;s++)if(t[s]!==r[s])return!1;return!0}fromArray(e,t=0){for(let r=0;r<9;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Vs=new De;function on(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function mr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Qc(){const i=mr("canvas");return i.style.display="block",i}const ln={};function gr(i){i in ln||(ln[i]=!0,console.warn(i))}const cn=new De().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),hn=new De().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Kr={[Zt]:{transfer:jr,primaries:Yr,toReference:i=>i,fromReference:i=>i},[ct]:{transfer:Ze,primaries:Yr,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Xr]:{transfer:jr,primaries:qr,toReference:i=>i.applyMatrix3(hn),fromReference:i=>i.applyMatrix3(cn)},[Hs]:{transfer:Ze,primaries:qr,toReference:i=>i.convertSRGBToLinear().applyMatrix3(hn),fromReference:i=>i.applyMatrix3(cn).convertLinearToSRGB()}},eh=new Set([Zt,Xr]),Ve={enabled:!0,_workingColorSpace:Zt,get legacyMode(){return console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."),!this.enabled},set legacyMode(i){console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."),this.enabled=!i},get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!eh.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const r=Kr[e].toReference,s=Kr[t].fromReference;return s(r(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return Kr[i].primaries},getTransfer:function(i){return i===Nt?jr:Kr[i].transfer}};function ki(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Gs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Vi;class dn{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Vi===void 0&&(Vi=mr("canvas")),Vi.width=e.width,Vi.height=e.height;const r=Vi.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),t=Vi}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=mr("canvas");t.width=e.width,t.height=e.height;const r=t.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const s=r.getImageData(0,0,e.width,e.height),a=s.data;for(let o=0;o<a.length;o++)a[o]=ki(a[o]/255)*255;return r.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let r=0;r<t.length;r++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[r]=Math.floor(ki(t[r]/255)*255):t[r]=ki(t[r]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let th=0;class un{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:th++}),this.uuid=Hi(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let o=0,n=s.length;o<n;o++)s[o].isDataTexture?a.push(Ws(s[o].image)):a.push(Ws(s[o]))}else a=Ws(s);r.url=a}return t||(e.images[this.uuid]=r),r}}function Ws(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?dn.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let ih=0;class At extends zi{constructor(e=At.DEFAULT_IMAGE,t=At.DEFAULT_MAPPING,r=1001,s=1001,a=1006,o=1008,n=1023,l=1009,c=At.DEFAULT_ANISOTROPY,h=Nt){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ih++}),this.uuid=Hi(),this.name="",this.source=new un(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=r,this.wrapT=s,this.magFilter=a,this.minFilter=o,this.anisotropy=c,this.format=n,this.internalFormat=null,this.type=l,this.offset=new He(0,0),this.repeat=new He(1,1),this.center=new He(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new De,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof h=="string"?this.colorSpace=h:(gr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=h===3001?ct:Nt),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),t||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1e3:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1e3:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return gr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===ct?3001:3e3}set encoding(e){gr("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===3001?ct:Nt}}At.DEFAULT_IMAGE=null,At.DEFAULT_MAPPING=300,At.DEFAULT_ANISOTROPY=1;class dt{constructor(e=0,t=0,r=0,s=1){dt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=r,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,r,s){return this.x=e,this.y=t,this.z=r,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,r=this.y,s=this.z,a=this.w,o=e.elements;return this.x=o[0]*t+o[4]*r+o[8]*s+o[12]*a,this.y=o[1]*t+o[5]*r+o[9]*s+o[13]*a,this.z=o[2]*t+o[6]*r+o[10]*s+o[14]*a,this.w=o[3]*t+o[7]*r+o[11]*s+o[15]*a,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,r,s,a;const o=e.elements,n=o[0],l=o[4],c=o[8],h=o[1],p=o[5],u=o[9],f=o[2],v=o[6],g=o[10];if(Math.abs(l-h)<.01&&Math.abs(c-f)<.01&&Math.abs(u-v)<.01){if(Math.abs(l+h)<.1&&Math.abs(c+f)<.1&&Math.abs(u+v)<.1&&Math.abs(n+p+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const d=(n+1)/2,b=(p+1)/2,E=(g+1)/2,w=(l+h)/4,S=(c+f)/4,A=(u+v)/4;return d>b&&d>E?d<.01?(r=0,s=.707106781,a=.707106781):(r=Math.sqrt(d),s=w/r,a=S/r):b>E?b<.01?(r=.707106781,s=0,a=.707106781):(s=Math.sqrt(b),r=w/s,a=A/s):E<.01?(r=.707106781,s=.707106781,a=0):(a=Math.sqrt(E),r=S/a,s=A/a),this.set(r,s,a,t),this}let m=Math.sqrt((v-u)*(v-u)+(c-f)*(c-f)+(h-l)*(h-l));return Math.abs(m)<.001&&(m=1),this.x=(v-u)/m,this.y=(c-f)/m,this.z=(h-l)/m,this.w=Math.acos((n+p+g-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this.w=e.w+(t.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class rh extends zi{constructor(e=1,t=1,r={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new dt(0,0,e,t),this.scissorTest=!1,this.viewport=new dt(0,0,e,t);const s={width:e,height:t,depth:1};r.encoding!==void 0&&(gr("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),r.colorSpace=r.encoding===3001?ct:Nt),r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},r),this.texture=new At(s,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=r.generateMipmaps,this.texture.internalFormat=r.internalFormat,this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.depthTexture=r.depthTexture,this.samples=r.samples}setSize(e,t,r=1){(this.width!==e||this.height!==t||this.depth!==r)&&(this.width=e,this.height=t,this.depth=r,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=r,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new un(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class pi extends rh{constructor(e=1,t=1,r={}){super(e,t,r),this.isWebGLRenderTarget=!0}}class pn extends At{constructor(e=null,t=1,r=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:r,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class sh extends At{constructor(e=null,t=1,r=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:r,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Gi{constructor(e=0,t=0,r=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=r,this._w=s}static slerpFlat(e,t,r,s,a,o,n){let l=r[s+0],c=r[s+1],h=r[s+2],p=r[s+3];const u=a[o+0],f=a[o+1],v=a[o+2],g=a[o+3];if(n===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=p;return}if(n===1){e[t+0]=u,e[t+1]=f,e[t+2]=v,e[t+3]=g;return}if(p!==g||l!==u||c!==f||h!==v){let m=1-n;const d=l*u+c*f+h*v+p*g,b=d>=0?1:-1,E=1-d*d;if(E>Number.EPSILON){const S=Math.sqrt(E),A=Math.atan2(S,d*b);m=Math.sin(m*A)/S,n=Math.sin(n*A)/S}const w=n*b;if(l=l*m+u*w,c=c*m+f*w,h=h*m+v*w,p=p*m+g*w,m===1-n){const S=1/Math.sqrt(l*l+c*c+h*h+p*p);l*=S,c*=S,h*=S,p*=S}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=p}static multiplyQuaternionsFlat(e,t,r,s,a,o){const n=r[s],l=r[s+1],c=r[s+2],h=r[s+3],p=a[o],u=a[o+1],f=a[o+2],v=a[o+3];return e[t]=n*v+h*p+l*f-c*u,e[t+1]=l*v+h*u+c*p-n*f,e[t+2]=c*v+h*f+n*u-l*p,e[t+3]=h*v-n*p-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,r,s){return this._x=e,this._y=t,this._z=r,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t){const r=e._x,s=e._y,a=e._z,o=e._order,n=Math.cos,l=Math.sin,c=n(r/2),h=n(s/2),p=n(a/2),u=l(r/2),f=l(s/2),v=l(a/2);switch(o){case"XYZ":this._x=u*h*p+c*f*v,this._y=c*f*p-u*h*v,this._z=c*h*v+u*f*p,this._w=c*h*p-u*f*v;break;case"YXZ":this._x=u*h*p+c*f*v,this._y=c*f*p-u*h*v,this._z=c*h*v-u*f*p,this._w=c*h*p+u*f*v;break;case"ZXY":this._x=u*h*p-c*f*v,this._y=c*f*p+u*h*v,this._z=c*h*v+u*f*p,this._w=c*h*p-u*f*v;break;case"ZYX":this._x=u*h*p-c*f*v,this._y=c*f*p+u*h*v,this._z=c*h*v-u*f*p,this._w=c*h*p+u*f*v;break;case"YZX":this._x=u*h*p+c*f*v,this._y=c*f*p+u*h*v,this._z=c*h*v-u*f*p,this._w=c*h*p-u*f*v;break;case"XZY":this._x=u*h*p-c*f*v,this._y=c*f*p-u*h*v,this._z=c*h*v+u*f*p,this._w=c*h*p+u*f*v;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t!==!1&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const r=t/2,s=Math.sin(r);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,r=t[0],s=t[4],a=t[8],o=t[1],n=t[5],l=t[9],c=t[2],h=t[6],p=t[10],u=r+n+p;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(a-c)*f,this._z=(o-s)*f}else if(r>n&&r>p){const f=2*Math.sqrt(1+r-n-p);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(a+c)/f}else if(n>p){const f=2*Math.sqrt(1+n-r-p);this._w=(a-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+p-r-n);this._w=(o-s)/f,this._x=(a+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let r=e.dot(t)+1;return r<Number.EPSILON?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ht(this.dot(e),-1,1)))}rotateTowards(e,t){const r=this.angleTo(e);if(r===0)return this;const s=Math.min(1,t/r);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const r=e._x,s=e._y,a=e._z,o=e._w,n=t._x,l=t._y,c=t._z,h=t._w;return this._x=r*h+o*n+s*c-a*l,this._y=s*h+o*l+a*n-r*c,this._z=a*h+o*c+r*l-s*n,this._w=o*h-r*n-s*l-a*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const r=this._x,s=this._y,a=this._z,o=this._w;let n=o*e._w+r*e._x+s*e._y+a*e._z;if(n<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,n=-n):this.copy(e),n>=1)return this._w=o,this._x=r,this._y=s,this._z=a,this;const l=1-n*n;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*r+t*this._x,this._y=f*s+t*this._y,this._z=f*a+t*this._z,this.normalize(),this._onChangeCallback(),this}const c=Math.sqrt(l),h=Math.atan2(c,n),p=Math.sin((1-t)*h)/c,u=Math.sin(t*h)/c;return this._w=o*p+this._w*u,this._x=r*p+this._x*u,this._y=s*p+this._y*u,this._z=a*p+this._z*u,this._onChangeCallback(),this}slerpQuaternions(e,t,r){return this.copy(e).slerp(t,r)}random(){const e=Math.random(),t=Math.sqrt(1-e),r=Math.sqrt(e),s=2*Math.PI*Math.random(),a=2*Math.PI*Math.random();return this.set(t*Math.cos(s),r*Math.sin(a),r*Math.cos(a),t*Math.sin(s))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class U{constructor(e=0,t=0,r=0){U.prototype.isVector3=!0,this.x=e,this.y=t,this.z=r}set(e,t,r){return r===void 0&&(r=this.z),this.x=e,this.y=t,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(fn.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(fn.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,r=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[3]*r+a[6]*s,this.y=a[1]*t+a[4]*r+a[7]*s,this.z=a[2]*t+a[5]*r+a[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,r=this.y,s=this.z,a=e.elements,o=1/(a[3]*t+a[7]*r+a[11]*s+a[15]);return this.x=(a[0]*t+a[4]*r+a[8]*s+a[12])*o,this.y=(a[1]*t+a[5]*r+a[9]*s+a[13])*o,this.z=(a[2]*t+a[6]*r+a[10]*s+a[14])*o,this}applyQuaternion(e){const t=this.x,r=this.y,s=this.z,a=e.x,o=e.y,n=e.z,l=e.w,c=2*(o*s-n*r),h=2*(n*t-a*s),p=2*(a*r-o*t);return this.x=t+l*c+o*p-n*h,this.y=r+l*h+n*c-a*p,this.z=s+l*p+a*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,r=this.y,s=this.z,a=e.elements;return this.x=a[0]*t+a[4]*r+a[8]*s,this.y=a[1]*t+a[5]*r+a[9]*s,this.z=a[2]*t+a[6]*r+a[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Math.max(e,Math.min(t,r)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,r){return this.x=e.x+(t.x-e.x)*r,this.y=e.y+(t.y-e.y)*r,this.z=e.z+(t.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const r=e.x,s=e.y,a=e.z,o=t.x,n=t.y,l=t.z;return this.x=s*l-a*n,this.y=a*o-r*l,this.z=r*n-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const r=e.dot(this)/t;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return Xs.copy(this).projectOnVector(e),this.sub(Xs)}reflect(e){return this.sub(Xs.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const r=this.dot(e)/t;return Math.acos(ht(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,r=this.y-e.y,s=this.z-e.z;return t*t+r*r+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,r){const s=Math.sin(t)*e;return this.x=s*Math.sin(r),this.y=Math.cos(t)*e,this.z=s*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,r){return this.x=e*Math.sin(t),this.y=r,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=r,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,r=Math.sqrt(1-Ka(e,2));return this.x=r*Math.cos(t),this.y=r*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Xs=new U,fn=new Gi;class Wi{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t+=3)this.expandByPoint(Gt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,r=e.count;t<r;t++)this.expandByPoint(Gt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,r=e.length;t<r;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const r=Gt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const a=r.getAttribute("position");if(t===!0&&a!==void 0&&e.isInstancedMesh!==!0)for(let o=0,n=a.count;o<n;o++)e.isMesh===!0?e.getVertexPosition(o,Gt):Gt.fromBufferAttribute(a,o),Gt.applyMatrix4(e.matrixWorld),this.expandByPoint(Gt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),$r.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),$r.copy(r.boundingBox)),$r.applyMatrix4(e.matrixWorld),this.union($r)}const s=e.children;for(let a=0,o=s.length;a<o;a++)this.expandByObject(s[a],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Gt),Gt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,r;return e.normal.x>0?(t=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),t<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(vr),Jr.subVectors(this.max,vr),Xi.subVectors(e.a,vr),ji.subVectors(e.b,vr),Yi.subVectors(e.c,vr),fi.subVectors(ji,Xi),mi.subVectors(Yi,ji),Ai.subVectors(Xi,Yi);let t=[0,-fi.z,fi.y,0,-mi.z,mi.y,0,-Ai.z,Ai.y,fi.z,0,-fi.x,mi.z,0,-mi.x,Ai.z,0,-Ai.x,-fi.y,fi.x,0,-mi.y,mi.x,0,-Ai.y,Ai.x,0];return!js(t,Xi,ji,Yi,Jr)||(t=[1,0,0,0,1,0,0,0,1],!js(t,Xi,ji,Yi,Jr))?!1:(Qr.crossVectors(fi,mi),t=[Qr.x,Qr.y,Qr.z],js(t,Xi,ji,Yi,Jr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Gt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Gt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ii[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ii[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ii[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ii[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ii[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ii[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ii[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ii[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ii),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const ii=[new U,new U,new U,new U,new U,new U,new U,new U],Gt=new U,$r=new Wi,Xi=new U,ji=new U,Yi=new U,fi=new U,mi=new U,Ai=new U,vr=new U,Jr=new U,Qr=new U,Ri=new U;function js(i,e,t,r,s){for(let a=0,o=i.length-3;a<=o;a+=3){Ri.fromArray(i,a);const n=s.x*Math.abs(Ri.x)+s.y*Math.abs(Ri.y)+s.z*Math.abs(Ri.z),l=e.dot(Ri),c=t.dot(Ri),h=r.dot(Ri);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>n)return!1}return!0}const ah=new Wi,_r=new U,Ys=new U;class qs{constructor(e=new U,t=-1){this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const r=this.center;t!==void 0?r.copy(t):ah.setFromPoints(e).getCenter(r);let s=0;for(let a=0,o=e.length;a<o;a++)s=Math.max(s,r.distanceToSquared(e[a]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const r=this.center.distanceToSquared(e);return t.copy(e),r>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;_r.subVectors(e,this.center);const t=_r.lengthSq();if(t>this.radius*this.radius){const r=Math.sqrt(t),s=(r-this.radius)*.5;this.center.addScaledVector(_r,s/r),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ys.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(_r.copy(e.center).add(Ys)),this.expandByPoint(_r.copy(e.center).sub(Ys))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ri=new U,Zs=new U,es=new U,gi=new U,Ks=new U,ts=new U,$s=new U;class mn{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ri)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const r=t.dot(this.direction);return r<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=ri.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(ri.copy(this.origin).addScaledVector(this.direction,t),ri.distanceToSquared(e))}distanceSqToSegment(e,t,r,s){Zs.copy(e).add(t).multiplyScalar(.5),es.copy(t).sub(e).normalize(),gi.copy(this.origin).sub(Zs);const a=e.distanceTo(t)*.5,o=-this.direction.dot(es),n=gi.dot(this.direction),l=-gi.dot(es),c=gi.lengthSq(),h=Math.abs(1-o*o);let p,u,f,v;if(h>0)if(p=o*l-n,u=o*n-l,v=a*h,p>=0)if(u>=-v)if(u<=v){const g=1/h;p*=g,u*=g,f=p*(p+o*u+2*n)+u*(o*p+u+2*l)+c}else u=a,p=Math.max(0,-(o*u+n)),f=-p*p+u*(u+2*l)+c;else u=-a,p=Math.max(0,-(o*u+n)),f=-p*p+u*(u+2*l)+c;else u<=-v?(p=Math.max(0,-(-o*a+n)),u=p>0?-a:Math.min(Math.max(-a,-l),a),f=-p*p+u*(u+2*l)+c):u<=v?(p=0,u=Math.min(Math.max(-a,-l),a),f=u*(u+2*l)+c):(p=Math.max(0,-(o*a+n)),u=p>0?a:Math.min(Math.max(-a,-l),a),f=-p*p+u*(u+2*l)+c);else u=o>0?-a:a,p=Math.max(0,-(o*u+n)),f=-p*p+u*(u+2*l)+c;return r&&r.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(Zs).addScaledVector(es,u),f}intersectSphere(e,t){ri.subVectors(e.center,this.origin);const r=ri.dot(this.direction),s=ri.dot(ri)-r*r,a=e.radius*e.radius;if(s>a)return null;const o=Math.sqrt(a-s),n=r-o,l=r+o;return l<0?null:n<0?this.at(l,t):this.at(n,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/t;return r>=0?r:null}intersectPlane(e,t){const r=this.distanceToPlane(e);return r===null?null:this.at(r,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let r,s,a,o,n,l;const c=1/this.direction.x,h=1/this.direction.y,p=1/this.direction.z,u=this.origin;return c>=0?(r=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(r=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(a=(e.min.y-u.y)*h,o=(e.max.y-u.y)*h):(a=(e.max.y-u.y)*h,o=(e.min.y-u.y)*h),r>o||a>s||((a>r||isNaN(r))&&(r=a),(o<s||isNaN(s))&&(s=o),p>=0?(n=(e.min.z-u.z)*p,l=(e.max.z-u.z)*p):(n=(e.max.z-u.z)*p,l=(e.min.z-u.z)*p),r>l||n>s)||((n>r||r!==r)&&(r=n),(l<s||s!==s)&&(s=l),s<0)?null:this.at(r>=0?r:s,t)}intersectsBox(e){return this.intersectBox(e,ri)!==null}intersectTriangle(e,t,r,s,a){Ks.subVectors(t,e),ts.subVectors(r,e),$s.crossVectors(Ks,ts);let o=this.direction.dot($s),n;if(o>0){if(s)return null;n=1}else if(o<0)n=-1,o=-o;else return null;gi.subVectors(this.origin,e);const l=n*this.direction.dot(ts.crossVectors(gi,ts));if(l<0)return null;const c=n*this.direction.dot(Ks.cross(gi));if(c<0||l+c>o)return null;const h=-n*gi.dot($s);return h<0?null:this.at(h/o,a)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class rt{constructor(e,t,r,s,a,o,n,l,c,h,p,u,f,v,g,m){rt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,r,s,a,o,n,l,c,h,p,u,f,v,g,m)}set(e,t,r,s,a,o,n,l,c,h,p,u,f,v,g,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=r,d[12]=s,d[1]=a,d[5]=o,d[9]=n,d[13]=l,d[2]=c,d[6]=h,d[10]=p,d[14]=u,d[3]=f,d[7]=v,d[11]=g,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new rt().fromArray(this.elements)}copy(e){const t=this.elements,r=e.elements;return t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],t[4]=r[4],t[5]=r[5],t[6]=r[6],t[7]=r[7],t[8]=r[8],t[9]=r[9],t[10]=r[10],t[11]=r[11],t[12]=r[12],t[13]=r[13],t[14]=r[14],t[15]=r[15],this}copyPosition(e){const t=this.elements,r=e.elements;return t[12]=r[12],t[13]=r[13],t[14]=r[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,r){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,t,r){return this.set(e.x,t.x,r.x,0,e.y,t.y,r.y,0,e.z,t.z,r.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,r=e.elements,s=1/qi.setFromMatrixColumn(e,0).length(),a=1/qi.setFromMatrixColumn(e,1).length(),o=1/qi.setFromMatrixColumn(e,2).length();return t[0]=r[0]*s,t[1]=r[1]*s,t[2]=r[2]*s,t[3]=0,t[4]=r[4]*a,t[5]=r[5]*a,t[6]=r[6]*a,t[7]=0,t[8]=r[8]*o,t[9]=r[9]*o,t[10]=r[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,r=e.x,s=e.y,a=e.z,o=Math.cos(r),n=Math.sin(r),l=Math.cos(s),c=Math.sin(s),h=Math.cos(a),p=Math.sin(a);if(e.order==="XYZ"){const u=o*h,f=o*p,v=n*h,g=n*p;t[0]=l*h,t[4]=-l*p,t[8]=c,t[1]=f+v*c,t[5]=u-g*c,t[9]=-n*l,t[2]=g-u*c,t[6]=v+f*c,t[10]=o*l}else if(e.order==="YXZ"){const u=l*h,f=l*p,v=c*h,g=c*p;t[0]=u+g*n,t[4]=v*n-f,t[8]=o*c,t[1]=o*p,t[5]=o*h,t[9]=-n,t[2]=f*n-v,t[6]=g+u*n,t[10]=o*l}else if(e.order==="ZXY"){const u=l*h,f=l*p,v=c*h,g=c*p;t[0]=u-g*n,t[4]=-o*p,t[8]=v+f*n,t[1]=f+v*n,t[5]=o*h,t[9]=g-u*n,t[2]=-o*c,t[6]=n,t[10]=o*l}else if(e.order==="ZYX"){const u=o*h,f=o*p,v=n*h,g=n*p;t[0]=l*h,t[4]=v*c-f,t[8]=u*c+g,t[1]=l*p,t[5]=g*c+u,t[9]=f*c-v,t[2]=-c,t[6]=n*l,t[10]=o*l}else if(e.order==="YZX"){const u=o*l,f=o*c,v=n*l,g=n*c;t[0]=l*h,t[4]=g-u*p,t[8]=v*p+f,t[1]=p,t[5]=o*h,t[9]=-n*h,t[2]=-c*h,t[6]=f*p+v,t[10]=u-g*p}else if(e.order==="XZY"){const u=o*l,f=o*c,v=n*l,g=n*c;t[0]=l*h,t[4]=-p,t[8]=c*h,t[1]=u*p+g,t[5]=o*h,t[9]=f*p-v,t[2]=v*p-f,t[6]=n*h,t[10]=g*p+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(nh,e,oh)}lookAt(e,t,r){const s=this.elements;return Lt.subVectors(e,t),Lt.lengthSq()===0&&(Lt.z=1),Lt.normalize(),vi.crossVectors(r,Lt),vi.lengthSq()===0&&(Math.abs(r.z)===1?Lt.x+=1e-4:Lt.z+=1e-4,Lt.normalize(),vi.crossVectors(r,Lt)),vi.normalize(),is.crossVectors(Lt,vi),s[0]=vi.x,s[4]=is.x,s[8]=Lt.x,s[1]=vi.y,s[5]=is.y,s[9]=Lt.y,s[2]=vi.z,s[6]=is.z,s[10]=Lt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const r=e.elements,s=t.elements,a=this.elements,o=r[0],n=r[4],l=r[8],c=r[12],h=r[1],p=r[5],u=r[9],f=r[13],v=r[2],g=r[6],m=r[10],d=r[14],b=r[3],E=r[7],w=r[11],S=r[15],A=s[0],C=s[4],G=s[8],x=s[12],T=s[1],B=s[5],W=s[9],$=s[13],L=s[2],H=s[6],X=s[10],V=s[14],ee=s[3],j=s[7],q=s[11],J=s[15];return a[0]=o*A+n*T+l*L+c*ee,a[4]=o*C+n*B+l*H+c*j,a[8]=o*G+n*W+l*X+c*q,a[12]=o*x+n*$+l*V+c*J,a[1]=h*A+p*T+u*L+f*ee,a[5]=h*C+p*B+u*H+f*j,a[9]=h*G+p*W+u*X+f*q,a[13]=h*x+p*$+u*V+f*J,a[2]=v*A+g*T+m*L+d*ee,a[6]=v*C+g*B+m*H+d*j,a[10]=v*G+g*W+m*X+d*q,a[14]=v*x+g*$+m*V+d*J,a[3]=b*A+E*T+w*L+S*ee,a[7]=b*C+E*B+w*H+S*j,a[11]=b*G+E*W+w*X+S*q,a[15]=b*x+E*$+w*V+S*J,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],r=e[4],s=e[8],a=e[12],o=e[1],n=e[5],l=e[9],c=e[13],h=e[2],p=e[6],u=e[10],f=e[14],v=e[3],g=e[7],m=e[11],d=e[15];return v*(+a*l*p-s*c*p-a*n*u+r*c*u+s*n*f-r*l*f)+g*(+t*l*f-t*c*u+a*o*u-s*o*f+s*c*h-a*l*h)+m*(+t*c*p-t*n*f-a*o*p+r*o*f+a*n*h-r*c*h)+d*(-s*n*h-t*l*p+t*n*u+s*o*p-r*o*u+r*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,r){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=r),this}invert(){const e=this.elements,t=e[0],r=e[1],s=e[2],a=e[3],o=e[4],n=e[5],l=e[6],c=e[7],h=e[8],p=e[9],u=e[10],f=e[11],v=e[12],g=e[13],m=e[14],d=e[15],b=p*m*c-g*u*c+g*l*f-n*m*f-p*l*d+n*u*d,E=v*u*c-h*m*c-v*l*f+o*m*f+h*l*d-o*u*d,w=h*g*c-v*p*c+v*n*f-o*g*f-h*n*d+o*p*d,S=v*p*l-h*g*l-v*n*u+o*g*u+h*n*m-o*p*m,A=t*b+r*E+s*w+a*S;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/A;return e[0]=b*C,e[1]=(g*u*a-p*m*a-g*s*f+r*m*f+p*s*d-r*u*d)*C,e[2]=(n*m*a-g*l*a+g*s*c-r*m*c-n*s*d+r*l*d)*C,e[3]=(p*l*a-n*u*a-p*s*c+r*u*c+n*s*f-r*l*f)*C,e[4]=E*C,e[5]=(h*m*a-v*u*a+v*s*f-t*m*f-h*s*d+t*u*d)*C,e[6]=(v*l*a-o*m*a-v*s*c+t*m*c+o*s*d-t*l*d)*C,e[7]=(o*u*a-h*l*a+h*s*c-t*u*c-o*s*f+t*l*f)*C,e[8]=w*C,e[9]=(v*p*a-h*g*a-v*r*f+t*g*f+h*r*d-t*p*d)*C,e[10]=(o*g*a-v*n*a+v*r*c-t*g*c-o*r*d+t*n*d)*C,e[11]=(h*n*a-o*p*a-h*r*c+t*p*c+o*r*f-t*n*f)*C,e[12]=S*C,e[13]=(h*g*s-v*p*s+v*r*u-t*g*u-h*r*m+t*p*m)*C,e[14]=(v*n*s-o*g*s-v*r*l+t*g*l+o*r*m-t*n*m)*C,e[15]=(o*p*s-h*n*s+h*r*l-t*p*l-o*r*u+t*n*u)*C,this}scale(e){const t=this.elements,r=e.x,s=e.y,a=e.z;return t[0]*=r,t[4]*=s,t[8]*=a,t[1]*=r,t[5]*=s,t[9]*=a,t[2]*=r,t[6]*=s,t[10]*=a,t[3]*=r,t[7]*=s,t[11]*=a,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,r,s))}makeTranslation(e,t,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,r,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,t,-r,0,0,r,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,0,r,0,0,1,0,0,-r,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),r=Math.sin(e);return this.set(t,-r,0,0,r,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const r=Math.cos(t),s=Math.sin(t),a=1-r,o=e.x,n=e.y,l=e.z,c=a*o,h=a*n;return this.set(c*o+r,c*n-s*l,c*l+s*n,0,c*n+s*l,h*n+r,h*l-s*o,0,c*l-s*n,h*l+s*o,a*l*l+r,0,0,0,0,1),this}makeScale(e,t,r){return this.set(e,0,0,0,0,t,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,t,r,s,a,o){return this.set(1,r,a,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,r){const s=this.elements,a=t._x,o=t._y,n=t._z,l=t._w,c=a+a,h=o+o,p=n+n,u=a*c,f=a*h,v=a*p,g=o*h,m=o*p,d=n*p,b=l*c,E=l*h,w=l*p,S=r.x,A=r.y,C=r.z;return s[0]=(1-(g+d))*S,s[1]=(f+w)*S,s[2]=(v-E)*S,s[3]=0,s[4]=(f-w)*A,s[5]=(1-(u+d))*A,s[6]=(m+b)*A,s[7]=0,s[8]=(v+E)*C,s[9]=(m-b)*C,s[10]=(1-(u+g))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,r){const s=this.elements;let a=qi.set(s[0],s[1],s[2]).length();const o=qi.set(s[4],s[5],s[6]).length(),n=qi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(a=-a),e.x=s[12],e.y=s[13],e.z=s[14],Wt.copy(this);const l=1/a,c=1/o,h=1/n;return Wt.elements[0]*=l,Wt.elements[1]*=l,Wt.elements[2]*=l,Wt.elements[4]*=c,Wt.elements[5]*=c,Wt.elements[6]*=c,Wt.elements[8]*=h,Wt.elements[9]*=h,Wt.elements[10]*=h,t.setFromRotationMatrix(Wt),r.x=a,r.y=o,r.z=n,this}makePerspective(e,t,r,s,a,o,n=2e3){const l=this.elements,c=2*a/(t-e),h=2*a/(r-s),p=(t+e)/(t-e),u=(r+s)/(r-s);let f,v;if(n===2e3)f=-(o+a)/(o-a),v=-2*o*a/(o-a);else if(n===2001)f=-o/(o-a),v=-o*a/(o-a);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+n);return l[0]=c,l[4]=0,l[8]=p,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,r,s,a,o,n=2e3){const l=this.elements,c=1/(t-e),h=1/(r-s),p=1/(o-a),u=(t+e)*c,f=(r+s)*h;let v,g;if(n===2e3)v=(o+a)*p,g=-2*p;else if(n===2001)v=a*p,g=-1*p;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+n);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=g,l[14]=-v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,r=e.elements;for(let s=0;s<16;s++)if(t[s]!==r[s])return!1;return!0}fromArray(e,t=0){for(let r=0;r<16;r++)this.elements[r]=e[r+t];return this}toArray(e=[],t=0){const r=this.elements;return e[t]=r[0],e[t+1]=r[1],e[t+2]=r[2],e[t+3]=r[3],e[t+4]=r[4],e[t+5]=r[5],e[t+6]=r[6],e[t+7]=r[7],e[t+8]=r[8],e[t+9]=r[9],e[t+10]=r[10],e[t+11]=r[11],e[t+12]=r[12],e[t+13]=r[13],e[t+14]=r[14],e[t+15]=r[15],e}}const qi=new U,Wt=new rt,nh=new U(0,0,0),oh=new U(1,1,1),vi=new U,is=new U,Lt=new U,gn=new rt,vn=new Gi;class xr{constructor(e=0,t=0,r=0,s=xr.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=r,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,r,s=this._order){return this._x=e,this._y=t,this._z=r,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,r=!0){const s=e.elements,a=s[0],o=s[4],n=s[8],l=s[1],c=s[5],h=s[9],p=s[2],u=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(ht(n,-1,1)),Math.abs(n)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,a)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ht(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(n,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-p,a),this._z=0);break;case"ZXY":this._x=Math.asin(ht(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,a));break;case"ZYX":this._y=Math.asin(-ht(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,a)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ht(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-p,a)):(this._x=0,this._y=Math.atan2(n,f));break;case"XZY":this._z=Math.asin(-ht(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(n,a)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,r){return gn.makeRotationFromQuaternion(e),this.setFromRotationMatrix(gn,t,r)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return vn.setFromEuler(this),this.setFromQuaternion(vn,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}xr.DEFAULT_ORDER="XYZ";class Js{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let lh=0;const _n=new U,Zi=new Gi,si=new rt,rs=new U,yr=new U,ch=new U,hh=new Gi,xn=new U(1,0,0),yn=new U(0,1,0),En=new U(0,0,1),dh={type:"added"},uh={type:"removed"};class Pt extends zi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:lh++}),this.uuid=Hi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Pt.DEFAULT_UP.clone();const e=new U,t=new xr,r=new Gi,s=new U(1,1,1);function a(){r.setFromEuler(t,!1)}function o(){t.setFromQuaternion(r,void 0,!1)}t._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new rt},normalMatrix:{value:new De}}),this.matrix=new rt,this.matrixWorld=new rt,this.matrixAutoUpdate=Pt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Js,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Zi.setFromAxisAngle(e,t),this.quaternion.multiply(Zi),this}rotateOnWorldAxis(e,t){return Zi.setFromAxisAngle(e,t),this.quaternion.premultiply(Zi),this}rotateX(e){return this.rotateOnAxis(xn,e)}rotateY(e){return this.rotateOnAxis(yn,e)}rotateZ(e){return this.rotateOnAxis(En,e)}translateOnAxis(e,t){return _n.copy(e).applyQuaternion(this.quaternion),this.position.add(_n.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(xn,e)}translateY(e){return this.translateOnAxis(yn,e)}translateZ(e){return this.translateOnAxis(En,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(si.copy(this.matrixWorld).invert())}lookAt(e,t,r){e.isVector3?rs.copy(e):rs.set(e,t,r);const s=this.parent;this.updateWorldMatrix(!0,!1),yr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?si.lookAt(yr,rs,this.up):si.lookAt(rs,yr,this.up),this.quaternion.setFromRotationMatrix(si),s&&(si.extractRotation(s.matrixWorld),Zi.setFromRotationMatrix(si),this.quaternion.premultiply(Zi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(dh)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(uh)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),si.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),si.multiply(e.parent.matrixWorld)),e.applyMatrix4(si),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let r=0,s=this.children.length;r<s;r++){const a=this.children[r].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,r=[]){this[e]===t&&r.push(this);const s=this.children;for(let a=0,o=s.length;a<o;a++)s[a].getObjectsByProperty(e,t,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yr,e,ch),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yr,hh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let r=0,s=t.length;r<s;r++)t[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let r=0,s=t.length;r<s;r++)t[r].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let r=0,s=t.length;r<s;r++){const a=t[r];(a.matrixWorldAutoUpdate===!0||e===!0)&&a.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const r=this.parent;if(e===!0&&r!==null&&r.matrixWorldAutoUpdate===!0&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const s=this.children;for(let a=0,o=s.length;a<o;a++){const n=s[a];n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",r={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(n=>({boxInitialized:n.boxInitialized,boxMin:n.box.min.toArray(),boxMax:n.box.max.toArray(),sphereInitialized:n.sphereInitialized,sphereRadius:n.sphere.radius,sphereCenter:n.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function a(n,l){return n[l.uuid]===void 0&&(n[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(e.geometries,this.geometry);const n=this.geometry.parameters;if(n!==void 0&&n.shapes!==void 0){const l=n.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const p=l[c];a(e.shapes,p)}else a(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(a(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const n=[];for(let l=0,c=this.material.length;l<c;l++)n.push(a(e.materials,this.material[l]));s.material=n}else s.material=a(e.materials,this.material);if(this.children.length>0){s.children=[];for(let n=0;n<this.children.length;n++)s.children.push(this.children[n].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let n=0;n<this.animations.length;n++){const l=this.animations[n];s.animations.push(a(e.animations,l))}}if(t){const n=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),p=o(e.shapes),u=o(e.skeletons),f=o(e.animations),v=o(e.nodes);n.length>0&&(r.geometries=n),l.length>0&&(r.materials=l),c.length>0&&(r.textures=c),h.length>0&&(r.images=h),p.length>0&&(r.shapes=p),u.length>0&&(r.skeletons=u),f.length>0&&(r.animations=f),v.length>0&&(r.nodes=v)}return r.object=s,r;function o(n){const l=[];for(const c in n){const h=n[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let r=0;r<e.children.length;r++){const s=e.children[r];this.add(s.clone())}return this}}Pt.DEFAULT_UP=new U(0,1,0),Pt.DEFAULT_MATRIX_AUTO_UPDATE=!0,Pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Xt=new U,ai=new U,Qs=new U,ni=new U,Ki=new U,$i=new U,Mn=new U,ea=new U,ta=new U,ia=new U;let ss=!1;class jt{constructor(e=new U,t=new U,r=new U){this.a=e,this.b=t,this.c=r}static getNormal(e,t,r,s){s.subVectors(r,t),Xt.subVectors(e,t),s.cross(Xt);const a=s.lengthSq();return a>0?s.multiplyScalar(1/Math.sqrt(a)):s.set(0,0,0)}static getBarycoord(e,t,r,s,a){Xt.subVectors(s,t),ai.subVectors(r,t),Qs.subVectors(e,t);const o=Xt.dot(Xt),n=Xt.dot(ai),l=Xt.dot(Qs),c=ai.dot(ai),h=ai.dot(Qs),p=o*c-n*n;if(p===0)return a.set(-2,-1,-1);const u=1/p,f=(c*l-n*h)*u,v=(o*h-n*l)*u;return a.set(1-f-v,v,f)}static containsPoint(e,t,r,s){return this.getBarycoord(e,t,r,s,ni),ni.x>=0&&ni.y>=0&&ni.x+ni.y<=1}static getUV(e,t,r,s,a,o,n,l){return ss===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ss=!0),this.getInterpolation(e,t,r,s,a,o,n,l)}static getInterpolation(e,t,r,s,a,o,n,l){return this.getBarycoord(e,t,r,s,ni),l.setScalar(0),l.addScaledVector(a,ni.x),l.addScaledVector(o,ni.y),l.addScaledVector(n,ni.z),l}static isFrontFacing(e,t,r,s){return Xt.subVectors(r,t),ai.subVectors(e,t),Xt.cross(ai).dot(s)<0}set(e,t,r){return this.a.copy(e),this.b.copy(t),this.c.copy(r),this}setFromPointsAndIndices(e,t,r,s){return this.a.copy(e[t]),this.b.copy(e[r]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,r,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Xt.subVectors(this.c,this.b),ai.subVectors(this.a,this.b),Xt.cross(ai).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return jt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return jt.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,r,s,a){return ss===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),ss=!0),jt.getInterpolation(e,this.a,this.b,this.c,t,r,s,a)}getInterpolation(e,t,r,s,a){return jt.getInterpolation(e,this.a,this.b,this.c,t,r,s,a)}containsPoint(e){return jt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return jt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const r=this.a,s=this.b,a=this.c;let o,n;Ki.subVectors(s,r),$i.subVectors(a,r),ea.subVectors(e,r);const l=Ki.dot(ea),c=$i.dot(ea);if(l<=0&&c<=0)return t.copy(r);ta.subVectors(e,s);const h=Ki.dot(ta),p=$i.dot(ta);if(h>=0&&p<=h)return t.copy(s);const u=l*p-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(r).addScaledVector(Ki,o);ia.subVectors(e,a);const f=Ki.dot(ia),v=$i.dot(ia);if(v>=0&&f<=v)return t.copy(a);const g=f*c-l*v;if(g<=0&&c>=0&&v<=0)return n=c/(c-v),t.copy(r).addScaledVector($i,n);const m=h*v-f*p;if(m<=0&&p-h>=0&&f-v>=0)return Mn.subVectors(a,s),n=(p-h)/(p-h+(f-v)),t.copy(s).addScaledVector(Mn,n);const d=1/(m+g+u);return o=g*d,n=u*d,t.copy(r).addScaledVector(Ki,o).addScaledVector($i,n)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const bn={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_i={h:0,s:0,l:0},as={h:0,s:0,l:0};function ra(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Ge{constructor(e,t,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,r)}set(e,t,r){if(t===void 0&&r===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ct){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ve.toWorkingColorSpace(this,t),this}setRGB(e,t,r,s=Ve.workingColorSpace){return this.r=e,this.g=t,this.b=r,Ve.toWorkingColorSpace(this,s),this}setHSL(e,t,r,s=Ve.workingColorSpace){if(e=Bs(e,1),t=ht(t,0,1),r=ht(r,0,1),t===0)this.r=this.g=this.b=r;else{const a=r<=.5?r*(1+t):r+t-r*t,o=2*r-a;this.r=ra(o,a,e+1/3),this.g=ra(o,a,e),this.b=ra(o,a,e-1/3)}return Ve.toWorkingColorSpace(this,s),this}setStyle(e,t=ct){function r(a){a!==void 0&&parseFloat(a)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let a;const o=s[1],n=s[2];switch(o){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(n))return r(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,t);if(a=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(n))return r(a[4]),this.setRGB(Math.min(100,parseInt(a[1],10))/100,Math.min(100,parseInt(a[2],10))/100,Math.min(100,parseInt(a[3],10))/100,t);break;case"hsl":case"hsla":if(a=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(n))return r(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const a=s[1],o=a.length;if(o===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(a,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ct){const r=bn[e.toLowerCase()];return r!==void 0?this.setHex(r,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ki(e.r),this.g=ki(e.g),this.b=ki(e.b),this}copyLinearToSRGB(e){return this.r=Gs(e.r),this.g=Gs(e.g),this.b=Gs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ct){return Ve.fromWorkingColorSpace(xt.copy(this),e),Math.round(ht(xt.r*255,0,255))*65536+Math.round(ht(xt.g*255,0,255))*256+Math.round(ht(xt.b*255,0,255))}getHexString(e=ct){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ve.workingColorSpace){Ve.fromWorkingColorSpace(xt.copy(this),t);const r=xt.r,s=xt.g,a=xt.b,o=Math.max(r,s,a),n=Math.min(r,s,a);let l,c;const h=(n+o)/2;if(n===o)l=0,c=0;else{const p=o-n;switch(c=h<=.5?p/(o+n):p/(2-o-n),o){case r:l=(s-a)/p+(s<a?6:0);break;case s:l=(a-r)/p+2;break;case a:l=(r-s)/p+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ve.workingColorSpace){return Ve.fromWorkingColorSpace(xt.copy(this),t),e.r=xt.r,e.g=xt.g,e.b=xt.b,e}getStyle(e=ct){Ve.fromWorkingColorSpace(xt.copy(this),e);const t=xt.r,r=xt.g,s=xt.b;return e!==ct?`color(${e} ${t.toFixed(3)} ${r.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(r*255)},${Math.round(s*255)})`}offsetHSL(e,t,r){return this.getHSL(_i),this.setHSL(_i.h+e,_i.s+t,_i.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,r){return this.r=e.r+(t.r-e.r)*r,this.g=e.g+(t.g-e.g)*r,this.b=e.b+(t.b-e.b)*r,this}lerpHSL(e,t){this.getHSL(_i),e.getHSL(as);const r=fr(_i.h,as.h,t),s=fr(_i.s,as.s,t),a=fr(_i.l,as.l,t);return this.setHSL(r,s,a),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,r=this.g,s=this.b,a=e.elements;return this.r=a[0]*t+a[3]*r+a[6]*s,this.g=a[1]*t+a[4]*r+a[7]*s,this.b=a[2]*t+a[5]*r+a[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const xt=new Ge;Ge.NAMES=bn;let ph=0;class ns extends zi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ph++}),this.uuid=Hi(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ge(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const r=e[t];if(r===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(r):s&&s.isVector3&&r&&r.isVector3?s.copy(r):this[t]=r}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(r.blending=this.blending),this.side!==0&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==204&&(r.blendSrc=this.blendSrc),this.blendDst!==205&&(r.blendDst=this.blendDst),this.blendEquation!==100&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(r.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function s(a){const o=[];for(const n in a){const l=a[n];delete l.metadata,o.push(l)}return o}if(t){const a=s(e.textures),o=s(e.images);a.length>0&&(r.textures=a),o.length>0&&(r.images=o)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let r=null;if(t!==null){const s=t.length;r=new Array(s);for(let a=0;a!==s;++a)r[a]=t[a].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Tn extends ns{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ge(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const et=new U,os=new He;class Kt{constructor(e,t,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=r,this.usage=35044,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn('THREE.BufferAttribute: "updateRange" is deprecated and removed in r169. Use "addUpdateRange()" instead.'),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,r){e*=this.itemSize,r*=t.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[e+s]=t.array[r+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,r=this.count;t<r;t++)os.fromBufferAttribute(this,t),os.applyMatrix3(e),this.setXY(t,os.x,os.y);else if(this.itemSize===3)for(let t=0,r=this.count;t<r;t++)et.fromBufferAttribute(this,t),et.applyMatrix3(e),this.setXYZ(t,et.x,et.y,et.z);return this}applyMatrix4(e){for(let t=0,r=this.count;t<r;t++)et.fromBufferAttribute(this,t),et.applyMatrix4(e),this.setXYZ(t,et.x,et.y,et.z);return this}applyNormalMatrix(e){for(let t=0,r=this.count;t<r;t++)et.fromBufferAttribute(this,t),et.applyNormalMatrix(e),this.setXYZ(t,et.x,et.y,et.z);return this}transformDirection(e){for(let t=0,r=this.count;t<r;t++)et.fromBufferAttribute(this,t),et.transformDirection(e),this.setXYZ(t,et.x,et.y,et.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let r=this.array[e*this.itemSize+t];return this.normalized&&(r=Bi(r,this.array)),r}setComponent(e,t,r){return this.normalized&&(r=bt(r,this.array)),this.array[e*this.itemSize+t]=r,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Bi(t,this.array)),t}setX(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Bi(t,this.array)),t}setY(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Bi(t,this.array)),t}setZ(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Bi(t,this.array)),t}setW(e,t){return this.normalized&&(t=bt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,r){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array)),this.array[e+0]=t,this.array[e+1]=r,this}setXYZ(e,t,r,s){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array),s=bt(s,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=s,this}setXYZW(e,t,r,s,a){return e*=this.itemSize,this.normalized&&(t=bt(t,this.array),r=bt(r,this.array),s=bt(s,this.array),a=bt(a,this.array)),this.array[e+0]=t,this.array[e+1]=r,this.array[e+2]=s,this.array[e+3]=a,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}}class Sn extends Kt{constructor(e,t,r){super(new Uint16Array(e),t,r)}}class wn extends Kt{constructor(e,t,r){super(new Uint32Array(e),t,r)}}class $t extends Kt{constructor(e,t,r){super(new Float32Array(e),t,r)}}let fh=0;const Ft=new rt,sa=new Pt,Ji=new U,Ut=new Wi,Er=new Wi,ot=new U;class xi extends zi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:fh++}),this.uuid=Hi(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(on(e)?wn:Sn)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,r=0){this.groups.push({start:e,count:t,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const a=new De().getNormalMatrix(e);r.applyNormalMatrix(a),r.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Ft.makeRotationFromQuaternion(e),this.applyMatrix4(Ft),this}rotateX(e){return Ft.makeRotationX(e),this.applyMatrix4(Ft),this}rotateY(e){return Ft.makeRotationY(e),this.applyMatrix4(Ft),this}rotateZ(e){return Ft.makeRotationZ(e),this.applyMatrix4(Ft),this}translate(e,t,r){return Ft.makeTranslation(e,t,r),this.applyMatrix4(Ft),this}scale(e,t,r){return Ft.makeScale(e,t,r),this.applyMatrix4(Ft),this}lookAt(e){return sa.lookAt(e),sa.updateMatrix(),this.applyMatrix4(sa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ji).negate(),this.translate(Ji.x,Ji.y,Ji.z),this}setFromPoints(e){const t=[];for(let r=0,s=e.length;r<s;r++){const a=e[r];t.push(a.x,a.y,a.z||0)}return this.setAttribute("position",new $t(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let r=0,s=t.length;r<s;r++){const a=t[r];Ut.setFromBufferAttribute(a),this.morphTargetsRelative?(ot.addVectors(this.boundingBox.min,Ut.min),this.boundingBox.expandByPoint(ot),ot.addVectors(this.boundingBox.max,Ut.max),this.boundingBox.expandByPoint(ot)):(this.boundingBox.expandByPoint(Ut.min),this.boundingBox.expandByPoint(Ut.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new U,1/0);return}if(e){const r=this.boundingSphere.center;if(Ut.setFromBufferAttribute(e),t)for(let a=0,o=t.length;a<o;a++){const n=t[a];Er.setFromBufferAttribute(n),this.morphTargetsRelative?(ot.addVectors(Ut.min,Er.min),Ut.expandByPoint(ot),ot.addVectors(Ut.max,Er.max),Ut.expandByPoint(ot)):(Ut.expandByPoint(Er.min),Ut.expandByPoint(Er.max))}Ut.getCenter(r);let s=0;for(let a=0,o=e.count;a<o;a++)ot.fromBufferAttribute(e,a),s=Math.max(s,r.distanceToSquared(ot));if(t)for(let a=0,o=t.length;a<o;a++){const n=t[a],l=this.morphTargetsRelative;for(let c=0,h=n.count;c<h;c++)ot.fromBufferAttribute(n,c),l&&(Ji.fromBufferAttribute(e,c),ot.add(Ji)),s=Math.max(s,r.distanceToSquared(ot))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=e.array,s=t.position.array,a=t.normal.array,o=t.uv.array,n=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Kt(new Float32Array(4*n),4));const l=this.getAttribute("tangent").array,c=[],h=[];for(let T=0;T<n;T++)c[T]=new U,h[T]=new U;const p=new U,u=new U,f=new U,v=new He,g=new He,m=new He,d=new U,b=new U;function E(T,B,W){p.fromArray(s,T*3),u.fromArray(s,B*3),f.fromArray(s,W*3),v.fromArray(o,T*2),g.fromArray(o,B*2),m.fromArray(o,W*2),u.sub(p),f.sub(p),g.sub(v),m.sub(v);const $=1/(g.x*m.y-m.x*g.y);isFinite($)&&(d.copy(u).multiplyScalar(m.y).addScaledVector(f,-g.y).multiplyScalar($),b.copy(f).multiplyScalar(g.x).addScaledVector(u,-m.x).multiplyScalar($),c[T].add(d),c[B].add(d),c[W].add(d),h[T].add(b),h[B].add(b),h[W].add(b))}let w=this.groups;w.length===0&&(w=[{start:0,count:r.length}]);for(let T=0,B=w.length;T<B;++T){const W=w[T],$=W.start,L=W.count;for(let H=$,X=$+L;H<X;H+=3)E(r[H+0],r[H+1],r[H+2])}const S=new U,A=new U,C=new U,G=new U;function x(T){C.fromArray(a,T*3),G.copy(C);const B=c[T];S.copy(B),S.sub(C.multiplyScalar(C.dot(B))).normalize(),A.crossVectors(G,B);const W=A.dot(h[T])<0?-1:1;l[T*4]=S.x,l[T*4+1]=S.y,l[T*4+2]=S.z,l[T*4+3]=W}for(let T=0,B=w.length;T<B;++T){const W=w[T],$=W.start,L=W.count;for(let H=$,X=$+L;H<X;H+=3)x(r[H+0]),x(r[H+1]),x(r[H+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new Kt(new Float32Array(t.count*3),3),this.setAttribute("normal",r);else for(let u=0,f=r.count;u<f;u++)r.setXYZ(u,0,0,0);const s=new U,a=new U,o=new U,n=new U,l=new U,c=new U,h=new U,p=new U;if(e)for(let u=0,f=e.count;u<f;u+=3){const v=e.getX(u+0),g=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,v),a.fromBufferAttribute(t,g),o.fromBufferAttribute(t,m),h.subVectors(o,a),p.subVectors(s,a),h.cross(p),n.fromBufferAttribute(r,v),l.fromBufferAttribute(r,g),c.fromBufferAttribute(r,m),n.add(h),l.add(h),c.add(h),r.setXYZ(v,n.x,n.y,n.z),r.setXYZ(g,l.x,l.y,l.z),r.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)s.fromBufferAttribute(t,u+0),a.fromBufferAttribute(t,u+1),o.fromBufferAttribute(t,u+2),h.subVectors(o,a),p.subVectors(s,a),h.cross(p),r.setXYZ(u+0,h.x,h.y,h.z),r.setXYZ(u+1,h.x,h.y,h.z),r.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,r=e.count;t<r;t++)ot.fromBufferAttribute(e,t),ot.normalize(),e.setXYZ(t,ot.x,ot.y,ot.z)}toNonIndexed(){function e(n,l){const c=n.array,h=n.itemSize,p=n.normalized,u=new c.constructor(l.length*h);let f=0,v=0;for(let g=0,m=l.length;g<m;g++){n.isInterleavedBufferAttribute?f=l[g]*n.data.stride+n.offset:f=l[g]*h;for(let d=0;d<h;d++)u[v++]=c[f++]}return new Kt(u,h,p)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new xi,r=this.index.array,s=this.attributes;for(const n in s){const l=s[n],c=e(l,r);t.setAttribute(n,c)}const a=this.morphAttributes;for(const n in a){const l=[],c=a[n];for(let h=0,p=c.length;h<p;h++){const u=c[h],f=e(u,r);l.push(f)}t.morphAttributes[n]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let n=0,l=o.length;n<l;n++){const c=o[n];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const r=this.attributes;for(const l in r){const c=r[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let a=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let p=0,u=c.length;p<u;p++){const f=c[p];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,a=!0)}a&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const n=this.boundingSphere;return n!==null&&(e.data.boundingSphere={center:n.center.toArray(),radius:n.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone(t));const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const a=e.morphAttributes;for(const c in a){const h=[],p=a[c];for(let u=0,f=p.length;u<f;u++)h.push(p[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const p=o[c];this.addGroup(p.start,p.count,p.materialIndex)}const n=e.boundingBox;n!==null&&(this.boundingBox=n.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const An=new rt,Ci=new mn,ls=new qs,Rn=new U,Qi=new U,er=new U,tr=new U,aa=new U,cs=new U,hs=new He,ds=new He,us=new He,Cn=new U,Ln=new U,Pn=new U,ps=new U,fs=new U;class oi extends Pt{constructor(e=new xi,t=new Tn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){const r=e[t[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,a=r.length;s<a;s++){const o=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(e,t){const r=this.geometry,s=r.attributes.position,a=r.morphAttributes.position,o=r.morphTargetsRelative;t.fromBufferAttribute(s,e);const n=this.morphTargetInfluences;if(a&&n){cs.set(0,0,0);for(let l=0,c=a.length;l<c;l++){const h=n[l],p=a[l];h!==0&&(aa.fromBufferAttribute(p,e),o?cs.addScaledVector(aa,h):cs.addScaledVector(aa.sub(t),h))}t.add(cs)}return t}raycast(e,t){const r=this.geometry,s=this.material,a=this.matrixWorld;s!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),ls.copy(r.boundingSphere),ls.applyMatrix4(a),Ci.copy(e.ray).recast(e.near),!(ls.containsPoint(Ci.origin)===!1&&(Ci.intersectSphere(ls,Rn)===null||Ci.origin.distanceToSquared(Rn)>Ka(e.far-e.near,2)))&&(An.copy(a).invert(),Ci.copy(e.ray).applyMatrix4(An),!(r.boundingBox!==null&&Ci.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,t,Ci)))}_computeIntersections(e,t,r){let s;const a=this.geometry,o=this.material,n=a.index,l=a.attributes.position,c=a.attributes.uv,h=a.attributes.uv1,p=a.attributes.normal,u=a.groups,f=a.drawRange;if(n!==null)if(Array.isArray(o))for(let v=0,g=u.length;v<g;v++){const m=u[v],d=o[m.materialIndex],b=Math.max(m.start,f.start),E=Math.min(n.count,Math.min(m.start+m.count,f.start+f.count));for(let w=b,S=E;w<S;w+=3){const A=n.getX(w),C=n.getX(w+1),G=n.getX(w+2);s=ms(this,d,e,r,c,h,p,A,C,G),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const v=Math.max(0,f.start),g=Math.min(n.count,f.start+f.count);for(let m=v,d=g;m<d;m+=3){const b=n.getX(m),E=n.getX(m+1),w=n.getX(m+2);s=ms(this,o,e,r,c,h,p,b,E,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let v=0,g=u.length;v<g;v++){const m=u[v],d=o[m.materialIndex],b=Math.max(m.start,f.start),E=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let w=b,S=E;w<S;w+=3){const A=w,C=w+1,G=w+2;s=ms(this,d,e,r,c,h,p,A,C,G),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const v=Math.max(0,f.start),g=Math.min(l.count,f.start+f.count);for(let m=v,d=g;m<d;m+=3){const b=m,E=m+1,w=m+2;s=ms(this,o,e,r,c,h,p,b,E,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function mh(i,e,t,r,s,a,o,n){let l;if(e.side===1?l=r.intersectTriangle(o,a,s,!0,n):l=r.intersectTriangle(s,a,o,e.side===0,n),l===null)return null;fs.copy(n),fs.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(fs);return c<t.near||c>t.far?null:{distance:c,point:fs.clone(),object:i}}function ms(i,e,t,r,s,a,o,n,l,c){i.getVertexPosition(n,Qi),i.getVertexPosition(l,er),i.getVertexPosition(c,tr);const h=mh(i,e,t,r,Qi,er,tr,ps);if(h){s&&(hs.fromBufferAttribute(s,n),ds.fromBufferAttribute(s,l),us.fromBufferAttribute(s,c),h.uv=jt.getInterpolation(ps,Qi,er,tr,hs,ds,us,new He)),a&&(hs.fromBufferAttribute(a,n),ds.fromBufferAttribute(a,l),us.fromBufferAttribute(a,c),h.uv1=jt.getInterpolation(ps,Qi,er,tr,hs,ds,us,new He),h.uv2=h.uv1),o&&(Cn.fromBufferAttribute(o,n),Ln.fromBufferAttribute(o,l),Pn.fromBufferAttribute(o,c),h.normal=jt.getInterpolation(ps,Qi,er,tr,Cn,Ln,Pn,new U),h.normal.dot(r.direction)>0&&h.normal.multiplyScalar(-1));const p={a:n,b:l,c,normal:new U,materialIndex:0};jt.getNormal(Qi,er,tr,p.normal),h.face=p}return h}class Mr extends xi{constructor(e=1,t=1,r=1,s=1,a=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:r,widthSegments:s,heightSegments:a,depthSegments:o};const n=this;s=Math.floor(s),a=Math.floor(a),o=Math.floor(o);const l=[],c=[],h=[],p=[];let u=0,f=0;v("z","y","x",-1,-1,r,t,e,o,a,0),v("z","y","x",1,-1,r,t,-e,o,a,1),v("x","z","y",1,1,e,r,t,s,o,2),v("x","z","y",1,-1,e,r,-t,s,o,3),v("x","y","z",1,-1,e,t,r,s,a,4),v("x","y","z",-1,-1,e,t,-r,s,a,5),this.setIndex(l),this.setAttribute("position",new $t(c,3)),this.setAttribute("normal",new $t(h,3)),this.setAttribute("uv",new $t(p,2));function v(g,m,d,b,E,w,S,A,C,G,x){const T=w/C,B=S/G,W=w/2,$=S/2,L=A/2,H=C+1,X=G+1;let V=0,ee=0;const j=new U;for(let q=0;q<X;q++){const J=q*B-$;for(let he=0;he<H;he++){const z=he*T-W;j[g]=z*b,j[m]=J*E,j[d]=L,c.push(j.x,j.y,j.z),j[g]=0,j[m]=0,j[d]=A>0?1:-1,h.push(j.x,j.y,j.z),p.push(he/C),p.push(1-q/G),V+=1}}for(let q=0;q<G;q++)for(let J=0;J<C;J++){const he=u+J+H*q,z=u+J+H*(q+1),Y=u+(J+1)+H*(q+1),de=u+(J+1)+H*q;l.push(he,z,de),l.push(z,Y,de),ee+=6}n.addGroup(f,ee,x),f+=ee,u+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function ir(i){const e={};for(const t in i){e[t]={};for(const r in i[t]){const s=i[t][r];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][r]=null):e[t][r]=s.clone():Array.isArray(s)?e[t][r]=s.slice():e[t][r]=s}}return e}function Tt(i){const e={};for(let t=0;t<i.length;t++){const r=ir(i[t]);for(const s in r)e[s]=r[s]}return e}function gh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Un(i){return i.getRenderTarget()===null?i.outputColorSpace:Ve.workingColorSpace}const vh={clone:ir,merge:Tt};var _h=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,xh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class yi extends ns{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_h,this.fragmentShader=xh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ir(e.uniforms),this.uniformsGroups=gh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const r={};for(const s in this.extensions)this.extensions[s]===!0&&(r[s]=!0);return Object.keys(r).length>0&&(t.extensions=r),t}}class Dn extends Pt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new rt,this.projectionMatrix=new rt,this.projectionMatrixInverse=new rt,this.coordinateSystem=2e3}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class zt extends Dn{constructor(e=50,t=1,r=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=pr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ur*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return pr*2*Math.atan(Math.tan(ur*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,r,s,a,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=s,this.view.width=a,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ur*.5*this.fov)/this.zoom,r=2*t,s=this.aspect*r,a=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;a+=o.offsetX*s/l,t-=o.offsetY*r/c,s*=o.width/l,r*=o.height/c}const n=this.filmOffset;n!==0&&(a+=e*n/this.getFilmWidth()),this.projectionMatrix.makePerspective(a,a+s,t,t-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const rr=-90,sr=1;class yh extends Pt{constructor(e,t,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new zt(rr,sr,e,t);s.layers=this.layers,this.add(s);const a=new zt(rr,sr,e,t);a.layers=this.layers,this.add(a);const o=new zt(rr,sr,e,t);o.layers=this.layers,this.add(o);const n=new zt(rr,sr,e,t);n.layers=this.layers,this.add(n);const l=new zt(rr,sr,e,t);l.layers=this.layers,this.add(l);const c=new zt(rr,sr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[r,s,a,o,n,l]=t;for(const c of t)this.remove(c);if(e===2e3)r.up.set(0,1,0),r.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),n.up.set(0,1,0),n.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===2001)r.up.set(0,-1,0),r.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),n.up.set(0,-1,0),n.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[a,o,n,l,c,h]=this.children,p=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),v=e.xr.enabled;e.xr.enabled=!1;const g=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,s),e.render(t,a),e.setRenderTarget(r,1,s),e.render(t,o),e.setRenderTarget(r,2,s),e.render(t,n),e.setRenderTarget(r,3,s),e.render(t,l),e.setRenderTarget(r,4,s),e.render(t,c),r.texture.generateMipmaps=g,e.setRenderTarget(r,5,s),e.render(t,h),e.setRenderTarget(p,u,f),e.xr.enabled=v,r.texture.needsPMREMUpdate=!0}}class In extends At{constructor(e,t,r,s,a,o,n,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:301,super(e,t,r,s,a,o,n,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Eh extends pi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},s=[r,r,r,r,r,r];t.encoding!==void 0&&(gr("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===3001?ct:Nt),this.texture=new In(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:1006}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Mr(5,5,5),a=new yi({name:"CubemapFromEquirect",uniforms:ir(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:1,blending:0});a.uniforms.tEquirect.value=t;const o=new oi(s,a),n=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new yh(1,10,this).update(e,o),t.minFilter=n,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,r,s){const a=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,r,s);e.setRenderTarget(a)}}const na=new U,Mh=new U,bh=new De;class Li{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,r,s){return this.normal.set(e,t,r),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,r){const s=na.subVectors(r,t).cross(Mh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const r=e.delta(na),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/s;return a<0||a>1?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){const t=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return t<0&&r>0||r<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const r=t||bh.getNormalMatrix(e),s=this.coplanarPoint(na).applyMatrix4(e),a=this.normal.applyMatrix3(r).normalize();return this.constant=-s.dot(a),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Pi=new qs,gs=new U;class oa{constructor(e=new Li,t=new Li,r=new Li,s=new Li,a=new Li,o=new Li){this.planes=[e,t,r,s,a,o]}set(e,t,r,s,a,o){const n=this.planes;return n[0].copy(e),n[1].copy(t),n[2].copy(r),n[3].copy(s),n[4].copy(a),n[5].copy(o),this}copy(e){const t=this.planes;for(let r=0;r<6;r++)t[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,t=2e3){const r=this.planes,s=e.elements,a=s[0],o=s[1],n=s[2],l=s[3],c=s[4],h=s[5],p=s[6],u=s[7],f=s[8],v=s[9],g=s[10],m=s[11],d=s[12],b=s[13],E=s[14],w=s[15];if(r[0].setComponents(l-a,u-c,m-f,w-d).normalize(),r[1].setComponents(l+a,u+c,m+f,w+d).normalize(),r[2].setComponents(l+o,u+h,m+v,w+b).normalize(),r[3].setComponents(l-o,u-h,m-v,w-b).normalize(),r[4].setComponents(l-n,u-p,m-g,w-E).normalize(),t===2e3)r[5].setComponents(l+n,u+p,m+g,w+E).normalize();else if(t===2001)r[5].setComponents(n,p,g,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Pi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Pi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Pi)}intersectsSprite(e){return Pi.center.set(0,0,0),Pi.radius=.7071067811865476,Pi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Pi)}intersectsSphere(e){const t=this.planes,r=e.center,s=-e.radius;for(let a=0;a<6;a++)if(t[a].distanceToPoint(r)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let r=0;r<6;r++){const s=t[r];if(gs.x=s.normal.x>0?e.max.x:e.min.x,gs.y=s.normal.y>0?e.max.y:e.min.y,gs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(gs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let r=0;r<6;r++)if(t[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function On(){let i=null,e=!1,t=null,r=null;function s(a,o){t(a,o),r=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(r=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(a){t=a},setContext:function(a){i=a}}}function Th(i,e){const t=e.isWebGL2,r=new WeakMap;function s(c,h){const p=c.array,u=c.usage,f=p.byteLength,v=i.createBuffer();i.bindBuffer(h,v),i.bufferData(h,p,u),c.onUploadCallback();let g;if(p instanceof Float32Array)g=i.FLOAT;else if(p instanceof Uint16Array)if(c.isFloat16BufferAttribute)if(t)g=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else g=i.UNSIGNED_SHORT;else if(p instanceof Int16Array)g=i.SHORT;else if(p instanceof Uint32Array)g=i.UNSIGNED_INT;else if(p instanceof Int32Array)g=i.INT;else if(p instanceof Int8Array)g=i.BYTE;else if(p instanceof Uint8Array)g=i.UNSIGNED_BYTE;else if(p instanceof Uint8ClampedArray)g=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+p);return{buffer:v,type:g,bytesPerElement:p.BYTES_PER_ELEMENT,version:c.version,size:f}}function a(c,h,p){const u=h.array,f=h._updateRange,v=h.updateRanges;if(i.bindBuffer(p,c),f.count===-1&&v.length===0&&i.bufferSubData(p,0,u),v.length!==0){for(let g=0,m=v.length;g<m;g++){const d=v[g];t?i.bufferSubData(p,d.start*u.BYTES_PER_ELEMENT,u,d.start,d.count):i.bufferSubData(p,d.start*u.BYTES_PER_ELEMENT,u.subarray(d.start,d.start+d.count))}h.clearUpdateRanges()}f.count!==-1&&(t?i.bufferSubData(p,f.offset*u.BYTES_PER_ELEMENT,u,f.offset,f.count):i.bufferSubData(p,f.offset*u.BYTES_PER_ELEMENT,u.subarray(f.offset,f.offset+f.count)),f.count=-1),h.onUploadCallback()}function o(c){return c.isInterleavedBufferAttribute&&(c=c.data),r.get(c)}function n(c){c.isInterleavedBufferAttribute&&(c=c.data);const h=r.get(c);h&&(i.deleteBuffer(h.buffer),r.delete(c))}function l(c,h){if(c.isGLBufferAttribute){const u=r.get(c);(!u||u.version<c.version)&&r.set(c,{buffer:c.buffer,type:c.type,bytesPerElement:c.elementSize,version:c.version});return}c.isInterleavedBufferAttribute&&(c=c.data);const p=r.get(c);if(p===void 0)r.set(c,s(c,h));else if(p.version<c.version){if(p.size!==c.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");a(p.buffer,c,h),p.version=c.version}}return{get:o,remove:n,update:l}}class la extends xi{constructor(e=1,t=1,r=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:r,heightSegments:s};const a=e/2,o=t/2,n=Math.floor(r),l=Math.floor(s),c=n+1,h=l+1,p=e/n,u=t/l,f=[],v=[],g=[],m=[];for(let d=0;d<h;d++){const b=d*u-o;for(let E=0;E<c;E++){const w=E*p-a;v.push(w,-b,0),g.push(0,0,1),m.push(E/n),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let b=0;b<n;b++){const E=b+c*d,w=b+c*(d+1),S=b+1+c*(d+1),A=b+1+c*d;f.push(E,w,A),f.push(w,S,A)}this.setIndex(f),this.setAttribute("position",new $t(v,3)),this.setAttribute("normal",new $t(g,3)),this.setAttribute("uv",new $t(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new la(e.width,e.height,e.widthSegments,e.heightSegments)}}var Sh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,wh=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ah=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Rh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ch=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Lh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ph=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Uh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Dh=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Ih=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Oh=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Nh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Fh=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,zh=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Hh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Bh=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,kh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Vh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Gh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Wh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Xh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,jh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,Yh=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,qh=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Zh=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_v0 0.339
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_v1 0.276
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_v4 0.046
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_v5 0.016
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_v6 0.0038
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Kh=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,$h=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Jh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Qh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ed=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,td="gl_FragColor = linearToOutputTexel( gl_FragColor );",id=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,rd=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,sd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ad=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,nd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,od=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ld=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,cd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,hd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,dd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ud=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,pd=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,fd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,md=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gd=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,vd=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,_d=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,xd=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,yd=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ed=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Md=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bd=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Td=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Sd=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,wd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Ad=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Rd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Cd=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ld=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Pd=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Ud=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Dd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Id=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Od=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Nd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Fd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zd=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Hd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,Bd=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,kd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,Vd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Gd=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Wd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Xd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Yd=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,qd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Zd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Kd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,$d=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Jd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Qd=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,eu=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,tu=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,iu=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ru=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,su=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,au=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,nu=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,ou=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,lu=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,cu=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,hu=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,du=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,uu=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,pu=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,fu=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,mu=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,gu=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,vu=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_u=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,xu=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,yu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Eu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Mu=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,bu=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Tu=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Su=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wu=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Au=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ru=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cu=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lu=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Pu=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Uu=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Du=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Iu=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ou=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Nu=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Fu=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,zu=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Hu=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bu=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ku=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Vu=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Gu=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wu=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Xu=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,ju=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Yu=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qu=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Zu=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ku=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$u=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ju=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Qu=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ep=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tp=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ip=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,rp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Re={alphahash_fragment:Sh,alphahash_pars_fragment:wh,alphamap_fragment:Ah,alphamap_pars_fragment:Rh,alphatest_fragment:Ch,alphatest_pars_fragment:Lh,aomap_fragment:Ph,aomap_pars_fragment:Uh,batching_pars_vertex:Dh,batching_vertex:Ih,begin_vertex:Oh,beginnormal_vertex:Nh,bsdfs:Fh,iridescence_fragment:zh,bumpmap_pars_fragment:Hh,clipping_planes_fragment:Bh,clipping_planes_pars_fragment:kh,clipping_planes_pars_vertex:Vh,clipping_planes_vertex:Gh,color_fragment:Wh,color_pars_fragment:Xh,color_pars_vertex:jh,color_vertex:Yh,common:qh,cube_uv_reflection_fragment:Zh,defaultnormal_vertex:Kh,displacementmap_pars_vertex:$h,displacementmap_vertex:Jh,emissivemap_fragment:Qh,emissivemap_pars_fragment:ed,colorspace_fragment:td,colorspace_pars_fragment:id,envmap_fragment:rd,envmap_common_pars_fragment:sd,envmap_pars_fragment:ad,envmap_pars_vertex:nd,envmap_physical_pars_fragment:_d,envmap_vertex:od,fog_vertex:ld,fog_pars_vertex:cd,fog_fragment:hd,fog_pars_fragment:dd,gradientmap_pars_fragment:ud,lightmap_fragment:pd,lightmap_pars_fragment:fd,lights_lambert_fragment:md,lights_lambert_pars_fragment:gd,lights_pars_begin:vd,lights_toon_fragment:xd,lights_toon_pars_fragment:yd,lights_phong_fragment:Ed,lights_phong_pars_fragment:Md,lights_physical_fragment:bd,lights_physical_pars_fragment:Td,lights_fragment_begin:Sd,lights_fragment_maps:wd,lights_fragment_end:Ad,logdepthbuf_fragment:Rd,logdepthbuf_pars_fragment:Cd,logdepthbuf_pars_vertex:Ld,logdepthbuf_vertex:Pd,map_fragment:Ud,map_pars_fragment:Dd,map_particle_fragment:Id,map_particle_pars_fragment:Od,metalnessmap_fragment:Nd,metalnessmap_pars_fragment:Fd,morphcolor_vertex:zd,morphnormal_vertex:Hd,morphtarget_pars_vertex:Bd,morphtarget_vertex:kd,normal_fragment_begin:Vd,normal_fragment_maps:Gd,normal_pars_fragment:Wd,normal_pars_vertex:Xd,normal_vertex:jd,normalmap_pars_fragment:Yd,clearcoat_normal_fragment_begin:qd,clearcoat_normal_fragment_maps:Zd,clearcoat_pars_fragment:Kd,iridescence_pars_fragment:$d,opaque_fragment:Jd,packing:Qd,premultiplied_alpha_fragment:eu,project_vertex:tu,dithering_fragment:iu,dithering_pars_fragment:ru,roughnessmap_fragment:su,roughnessmap_pars_fragment:au,shadowmap_pars_fragment:nu,shadowmap_pars_vertex:ou,shadowmap_vertex:lu,shadowmask_pars_fragment:cu,skinbase_vertex:hu,skinning_pars_vertex:du,skinning_vertex:uu,skinnormal_vertex:pu,specularmap_fragment:fu,specularmap_pars_fragment:mu,tonemapping_fragment:gu,tonemapping_pars_fragment:vu,transmission_fragment:_u,transmission_pars_fragment:xu,uv_pars_fragment:yu,uv_pars_vertex:Eu,uv_vertex:Mu,worldpos_vertex:bu,background_vert:Tu,background_frag:Su,backgroundCube_vert:wu,backgroundCube_frag:Au,cube_vert:Ru,cube_frag:Cu,depth_vert:Lu,depth_frag:Pu,distanceRGBA_vert:Uu,distanceRGBA_frag:Du,equirect_vert:Iu,equirect_frag:Ou,linedashed_vert:Nu,linedashed_frag:Fu,meshbasic_vert:zu,meshbasic_frag:Hu,meshlambert_vert:Bu,meshlambert_frag:ku,meshmatcap_vert:Vu,meshmatcap_frag:Gu,meshnormal_vert:Wu,meshnormal_frag:Xu,meshphong_vert:ju,meshphong_frag:Yu,meshphysical_vert:qu,meshphysical_frag:Zu,meshtoon_vert:Ku,meshtoon_frag:$u,points_vert:Ju,points_frag:Qu,shadow_vert:ep,shadow_frag:tp,sprite_vert:ip,sprite_frag:rp},ne={common:{diffuse:{value:new Ge(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new De}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new De}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new De}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new De},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new De},normalScale:{value:new He(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new De},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new De}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new De}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new De}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ge(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ge(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0},uvTransform:{value:new De}},sprite:{diffuse:{value:new Ge(16777215)},opacity:{value:1},center:{value:new He(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new De},alphaMap:{value:null},alphaMapTransform:{value:new De},alphaTest:{value:0}}},Jt={basic:{uniforms:Tt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.fog]),vertexShader:Re.meshbasic_vert,fragmentShader:Re.meshbasic_frag},lambert:{uniforms:Tt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ge(0)}}]),vertexShader:Re.meshlambert_vert,fragmentShader:Re.meshlambert_frag},phong:{uniforms:Tt([ne.common,ne.specularmap,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,ne.lights,{emissive:{value:new Ge(0)},specular:{value:new Ge(1118481)},shininess:{value:30}}]),vertexShader:Re.meshphong_vert,fragmentShader:Re.meshphong_frag},standard:{uniforms:Tt([ne.common,ne.envmap,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.roughnessmap,ne.metalnessmap,ne.fog,ne.lights,{emissive:{value:new Ge(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Re.meshphysical_vert,fragmentShader:Re.meshphysical_frag},toon:{uniforms:Tt([ne.common,ne.aomap,ne.lightmap,ne.emissivemap,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.gradientmap,ne.fog,ne.lights,{emissive:{value:new Ge(0)}}]),vertexShader:Re.meshtoon_vert,fragmentShader:Re.meshtoon_frag},matcap:{uniforms:Tt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,ne.fog,{matcap:{value:null}}]),vertexShader:Re.meshmatcap_vert,fragmentShader:Re.meshmatcap_frag},points:{uniforms:Tt([ne.points,ne.fog]),vertexShader:Re.points_vert,fragmentShader:Re.points_frag},dashed:{uniforms:Tt([ne.common,ne.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Re.linedashed_vert,fragmentShader:Re.linedashed_frag},depth:{uniforms:Tt([ne.common,ne.displacementmap]),vertexShader:Re.depth_vert,fragmentShader:Re.depth_frag},normal:{uniforms:Tt([ne.common,ne.bumpmap,ne.normalmap,ne.displacementmap,{opacity:{value:1}}]),vertexShader:Re.meshnormal_vert,fragmentShader:Re.meshnormal_frag},sprite:{uniforms:Tt([ne.sprite,ne.fog]),vertexShader:Re.sprite_vert,fragmentShader:Re.sprite_frag},background:{uniforms:{uvTransform:{value:new De},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Re.background_vert,fragmentShader:Re.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Re.backgroundCube_vert,fragmentShader:Re.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Re.cube_vert,fragmentShader:Re.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Re.equirect_vert,fragmentShader:Re.equirect_frag},distanceRGBA:{uniforms:Tt([ne.common,ne.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Re.distanceRGBA_vert,fragmentShader:Re.distanceRGBA_frag},shadow:{uniforms:Tt([ne.lights,ne.fog,{color:{value:new Ge(0)},opacity:{value:1}}]),vertexShader:Re.shadow_vert,fragmentShader:Re.shadow_frag}};Jt.physical={uniforms:Tt([Jt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new De},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new De},clearcoatNormalScale:{value:new He(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new De},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new De},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new De},sheen:{value:0},sheenColor:{value:new Ge(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new De},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new De},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new De},transmissionSamplerSize:{value:new He},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new De},attenuationDistance:{value:0},attenuationColor:{value:new Ge(0)},specularColor:{value:new Ge(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new De},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new De},anisotropyVector:{value:new He},anisotropyMap:{value:null},anisotropyMapTransform:{value:new De}}]),vertexShader:Re.meshphysical_vert,fragmentShader:Re.meshphysical_frag};const vs={r:0,b:0,g:0};function sp(i,e,t,r,s,a,o){const n=new Ge(0);let l=a===!0?0:1,c,h,p=null,u=0,f=null;function v(m,d){let b=!1,E=d.isScene===!0?d.background:null;E&&E.isTexture&&(E=(d.backgroundBlurriness>0?t:e).get(E)),E===null?g(n,l):E&&E.isColor&&(g(E,1),b=!0);const w=i.xr.getEnvironmentBlendMode();w==="additive"?r.buffers.color.setClear(0,0,0,1,o):w==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,o),(i.autoClear||b)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),E&&(E.isCubeTexture||E.mapping===306)?(h===void 0&&(h=new oi(new Mr(1,1,1),new yi({name:"BackgroundCubeMaterial",uniforms:ir(Jt.backgroundCube.uniforms),vertexShader:Jt.backgroundCube.vertexShader,fragmentShader:Jt.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(S,A,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),h.material.uniforms.envMap.value=E,h.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=d.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=d.backgroundIntensity,h.material.toneMapped=Ve.getTransfer(E.colorSpace)!==Ze,(p!==E||u!==E.version||f!==i.toneMapping)&&(h.material.needsUpdate=!0,p=E,u=E.version,f=i.toneMapping),h.layers.enableAll(),m.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new oi(new la(2,2),new yi({name:"BackgroundMaterial",uniforms:ir(Jt.background.uniforms),vertexShader:Jt.background.vertexShader,fragmentShader:Jt.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=d.backgroundIntensity,c.material.toneMapped=Ve.getTransfer(E.colorSpace)!==Ze,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(p!==E||u!==E.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,p=E,u=E.version,f=i.toneMapping),c.layers.enableAll(),m.unshift(c,c.geometry,c.material,0,0,null))}function g(m,d){m.getRGB(vs,Un(i)),r.buffers.color.setClear(vs.r,vs.g,vs.b,d,o)}return{getClearColor:function(){return n},setClearColor:function(m,d=1){n.set(m),l=d,g(n,l)},getClearAlpha:function(){return l},setClearAlpha:function(m){l=m,g(n,l)},render:v}}function ap(i,e,t,r){const s=i.getParameter(i.MAX_VERTEX_ATTRIBS),a=r.isWebGL2?null:e.get("OES_vertex_array_object"),o=r.isWebGL2||a!==null,n={},l=m(null);let c=l,h=!1;function p(L,H,X,V,ee){let j=!1;if(o){const q=g(V,X,H);c!==q&&(c=q,f(c.object)),j=d(L,V,X,ee),j&&b(L,V,X,ee)}else{const q=H.wireframe===!0;(c.geometry!==V.id||c.program!==X.id||c.wireframe!==q)&&(c.geometry=V.id,c.program=X.id,c.wireframe=q,j=!0)}ee!==null&&t.update(ee,i.ELEMENT_ARRAY_BUFFER),(j||h)&&(h=!1,G(L,H,X,V),ee!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(ee).buffer))}function u(){return r.isWebGL2?i.createVertexArray():a.createVertexArrayOES()}function f(L){return r.isWebGL2?i.bindVertexArray(L):a.bindVertexArrayOES(L)}function v(L){return r.isWebGL2?i.deleteVertexArray(L):a.deleteVertexArrayOES(L)}function g(L,H,X){const V=X.wireframe===!0;let ee=n[L.id];ee===void 0&&(ee={},n[L.id]=ee);let j=ee[H.id];j===void 0&&(j={},ee[H.id]=j);let q=j[V];return q===void 0&&(q=m(u()),j[V]=q),q}function m(L){const H=[],X=[],V=[];for(let ee=0;ee<s;ee++)H[ee]=0,X[ee]=0,V[ee]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:H,enabledAttributes:X,attributeDivisors:V,object:L,attributes:{},index:null}}function d(L,H,X,V){const ee=c.attributes,j=H.attributes;let q=0;const J=X.getAttributes();for(const he in J)if(J[he].location>=0){const z=ee[he];let Y=j[he];if(Y===void 0&&(he==="instanceMatrix"&&L.instanceMatrix&&(Y=L.instanceMatrix),he==="instanceColor"&&L.instanceColor&&(Y=L.instanceColor)),z===void 0||z.attribute!==Y||Y&&z.data!==Y.data)return!0;q++}return c.attributesNum!==q||c.index!==V}function b(L,H,X,V){const ee={},j=H.attributes;let q=0;const J=X.getAttributes();for(const he in J)if(J[he].location>=0){let z=j[he];z===void 0&&(he==="instanceMatrix"&&L.instanceMatrix&&(z=L.instanceMatrix),he==="instanceColor"&&L.instanceColor&&(z=L.instanceColor));const Y={};Y.attribute=z,z&&z.data&&(Y.data=z.data),ee[he]=Y,q++}c.attributes=ee,c.attributesNum=q,c.index=V}function E(){const L=c.newAttributes;for(let H=0,X=L.length;H<X;H++)L[H]=0}function w(L){S(L,0)}function S(L,H){const X=c.newAttributes,V=c.enabledAttributes,ee=c.attributeDivisors;X[L]=1,V[L]===0&&(i.enableVertexAttribArray(L),V[L]=1),ee[L]!==H&&((r.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[r.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](L,H),ee[L]=H)}function A(){const L=c.newAttributes,H=c.enabledAttributes;for(let X=0,V=H.length;X<V;X++)H[X]!==L[X]&&(i.disableVertexAttribArray(X),H[X]=0)}function C(L,H,X,V,ee,j,q){q===!0?i.vertexAttribIPointer(L,H,X,ee,j):i.vertexAttribPointer(L,H,X,V,ee,j)}function G(L,H,X,V){if(r.isWebGL2===!1&&(L.isInstancedMesh||V.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;E();const ee=V.attributes,j=X.getAttributes(),q=H.defaultAttributeValues;for(const J in j){const he=j[J];if(he.location>=0){let z=ee[J];if(z===void 0&&(J==="instanceMatrix"&&L.instanceMatrix&&(z=L.instanceMatrix),J==="instanceColor"&&L.instanceColor&&(z=L.instanceColor)),z!==void 0){const Y=z.normalized,de=z.itemSize,pe=t.get(z);if(pe===void 0)continue;const me=pe.buffer,Ce=pe.type,Se=pe.bytesPerElement,be=r.isWebGL2===!0&&(Ce===i.INT||Ce===i.UNSIGNED_INT||z.gpuType===1013);if(z.isInterleavedBufferAttribute){const Le=z.data,O=Le.stride,St=z.offset;if(Le.isInstancedInterleavedBuffer){for(let ve=0;ve<he.locationSize;ve++)S(he.location+ve,Le.meshPerAttribute);L.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=Le.meshPerAttribute*Le.count)}else for(let ve=0;ve<he.locationSize;ve++)w(he.location+ve);i.bindBuffer(i.ARRAY_BUFFER,me);for(let ve=0;ve<he.locationSize;ve++)C(he.location+ve,de/he.locationSize,Ce,Y,O*Se,(St+de/he.locationSize*ve)*Se,be)}else{if(z.isInstancedBufferAttribute){for(let Le=0;Le<he.locationSize;Le++)S(he.location+Le,z.meshPerAttribute);L.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=z.meshPerAttribute*z.count)}else for(let Le=0;Le<he.locationSize;Le++)w(he.location+Le);i.bindBuffer(i.ARRAY_BUFFER,me);for(let Le=0;Le<he.locationSize;Le++)C(he.location+Le,de/he.locationSize,Ce,Y,de*Se,de/he.locationSize*Le*Se,be)}}else if(q!==void 0){const Y=q[J];if(Y!==void 0)switch(Y.length){case 2:i.vertexAttrib2fv(he.location,Y);break;case 3:i.vertexAttrib3fv(he.location,Y);break;case 4:i.vertexAttrib4fv(he.location,Y);break;default:i.vertexAttrib1fv(he.location,Y)}}}}A()}function x(){W();for(const L in n){const H=n[L];for(const X in H){const V=H[X];for(const ee in V)v(V[ee].object),delete V[ee];delete H[X]}delete n[L]}}function T(L){if(n[L.id]===void 0)return;const H=n[L.id];for(const X in H){const V=H[X];for(const ee in V)v(V[ee].object),delete V[ee];delete H[X]}delete n[L.id]}function B(L){for(const H in n){const X=n[H];if(X[L.id]===void 0)continue;const V=X[L.id];for(const ee in V)v(V[ee].object),delete V[ee];delete X[L.id]}}function W(){$(),h=!0,c!==l&&(c=l,f(c.object))}function $(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:p,reset:W,resetDefaultState:$,dispose:x,releaseStatesOfGeometry:T,releaseStatesOfProgram:B,initAttributes:E,enableAttribute:w,disableUnusedAttributes:A}}function np(i,e,t,r){const s=r.isWebGL2;let a;function o(h){a=h}function n(h,p){i.drawArrays(a,h,p),t.update(p,a,1)}function l(h,p,u){if(u===0)return;let f,v;if(s)f=i,v="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),v="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[v](a,h,p,u),t.update(p,a,u)}function c(h,p,u){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let v=0;v<u;v++)this.render(h[v],p[v]);else{f.multiDrawArraysWEBGL(a,h,0,p,0,u);let v=0;for(let g=0;g<u;g++)v+=p[g];t.update(v,a,1)}}this.setMode=o,this.render=n,this.renderInstances=l,this.renderMultiDraw=c}function op(i,e,t){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const C=e.get("EXT_texture_filter_anisotropic");r=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function a(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext";let n=t.precision!==void 0?t.precision:"highp";const l=a(n);l!==n&&(console.warn("THREE.WebGLRenderer:",n,"not supported, using",l,"instead."),n=l);const c=o||e.has("WEBGL_draw_buffers"),h=t.logarithmicDepthBuffer===!0,p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),u=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),f=i.getParameter(i.MAX_TEXTURE_SIZE),v=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),m=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),d=i.getParameter(i.MAX_VARYING_VECTORS),b=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=u>0,w=o||e.has("OES_texture_float"),S=E&&w,A=o?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:c,getMaxAnisotropy:s,getMaxPrecision:a,precision:n,logarithmicDepthBuffer:h,maxTextures:p,maxVertexTextures:u,maxTextureSize:f,maxCubemapSize:v,maxAttributes:g,maxVertexUniforms:m,maxVaryings:d,maxFragmentUniforms:b,vertexTextures:E,floatFragmentTextures:w,floatVertexTextures:S,maxSamples:A}}function lp(i){const e=this;let t=null,r=0,s=!1,a=!1;const o=new Li,n=new De,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){const f=p.length!==0||u||r!==0||s;return s=u,r=p.length,f},this.beginShadows=function(){a=!0,h(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(p,u){t=h(p,u,0)},this.setState=function(p,u,f){const v=p.clippingPlanes,g=p.clipIntersection,m=p.clipShadows,d=i.get(p);if(!s||v===null||v.length===0||a&&!m)a?h(null):c();else{const b=a?0:r,E=b*4;let w=d.clippingState||null;l.value=w,w=h(v,u,E,f);for(let S=0;S!==E;++S)w[S]=t[S];d.clippingState=w,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function h(p,u,f,v){const g=p!==null?p.length:0;let m=null;if(g!==0){if(m=l.value,v!==!0||m===null){const d=f+g*4,b=u.matrixWorldInverse;n.getNormalMatrix(b),(m===null||m.length<d)&&(m=new Float32Array(d));for(let E=0,w=f;E!==g;++E,w+=4)o.copy(p[E]).applyMatrix4(b,n),o.normal.toArray(m,w),m[w+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,m}}function cp(i){let e=new WeakMap;function t(o,n){return n===303?o.mapping=301:n===304&&(o.mapping=302),o}function r(o){if(o&&o.isTexture){const n=o.mapping;if(n===303||n===304)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Eh(l.height/2);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const n=o.target;n.removeEventListener("dispose",s);const l=e.get(n);l!==void 0&&(e.delete(n),l.dispose())}function a(){e=new WeakMap}return{get:r,dispose:a}}class hp extends Dn{constructor(e=-1,t=1,r=1,s=-1,a=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=r,this.bottom=s,this.near=a,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,r,s,a,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=r,this.view.offsetY=s,this.view.width=a,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let a=r-e,o=r+e,n=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=c*this.view.offsetX,o=a+c*this.view.width,n-=h*this.view.offsetY,l=n-h*this.view.height}this.projectionMatrix.makeOrthographic(a,o,n,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const ar=4,Nn=[.125,.215,.35,.446,.526,.582],Ui=20,ca=new hp,Fn=new Ge;let ha=null,da=0,ua=0;const Di=(1+Math.sqrt(5))/2,nr=1/Di,zn=[new U(1,1,1),new U(-1,1,1),new U(1,1,-1),new U(-1,1,-1),new U(0,Di,nr),new U(0,Di,-nr),new U(nr,0,Di),new U(-nr,0,Di),new U(Di,nr,0),new U(-Di,nr,0)];class Hn{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,r=.1,s=100){ha=this._renderer.getRenderTarget(),da=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),this._setSize(256);const a=this._allocateTargets();return a.depthBuffer=!0,this._sceneToCubeUV(e,r,s,a),t>0&&this._blur(a,0,0,t),this._applyPMREM(a),this._cleanup(a),a}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vn(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=kn(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ha,da,ua),e.scissorTest=!1,_s(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ha=this._renderer.getRenderTarget(),da=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel();const r=t||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,r={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,colorSpace:Zt,depthBuffer:!1},s=Bn(e,t,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bn(e,t,r);const{_lodMax:a}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=dp(a)),this._blurMaterial=up(a,e,t)}return s}_compileMaterial(e){const t=new oi(this._lodPlanes[0],e);this._renderer.compile(t,ca)}_sceneToCubeUV(e,t,r,s){const a=new zt(90,1,t,r),o=[1,-1,1,1,1,1],n=[1,1,1,-1,-1,-1],l=this._renderer,c=l.autoClear,h=l.toneMapping;l.getClearColor(Fn),l.toneMapping=0,l.autoClear=!1;const p=new Tn({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),u=new oi(new Mr,p);let f=!1;const v=e.background;v?v.isColor&&(p.color.copy(v),e.background=null,f=!0):(p.color.copy(Fn),f=!0);for(let g=0;g<6;g++){const m=g%3;m===0?(a.up.set(0,o[g],0),a.lookAt(n[g],0,0)):m===1?(a.up.set(0,0,o[g]),a.lookAt(0,n[g],0)):(a.up.set(0,o[g],0),a.lookAt(0,0,n[g]));const d=this._cubeSize;_s(s,m*d,g>2?d:0,d,d),l.setRenderTarget(s),f&&l.render(u,a),l.render(e,a)}u.geometry.dispose(),u.material.dispose(),l.toneMapping=h,l.autoClear=c,e.background=v}_textureToCubeUV(e,t){const r=this._renderer,s=e.mapping===301||e.mapping===302;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vn()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=kn());const a=s?this._cubemapMaterial:this._equirectMaterial,o=new oi(this._lodPlanes[0],a),n=a.uniforms;n.envMap.value=e;const l=this._cubeSize;_s(t,0,0,3*l,2*l),r.setRenderTarget(t),r.render(o,ca)}_applyPMREM(e){const t=this._renderer,r=t.autoClear;t.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){const a=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=zn[(s-1)%zn.length];this._blur(e,s-1,s,a,o)}t.autoClear=r}_blur(e,t,r,s,a){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,r,s,"latitudinal",a),this._halfBlur(o,e,r,r,s,"longitudinal",a)}_halfBlur(e,t,r,s,a,o,n){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,p=new oi(this._lodPlanes[s],c),u=c.uniforms,f=this._sizeLods[r]-1,v=isFinite(a)?Math.PI/(2*f):2*Math.PI/(2*Ui-1),g=a/v,m=isFinite(a)?1+Math.floor(h*g):Ui;m>Ui&&console.warn(`sigmaRadians, ${a}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ui}`);const d=[];let b=0;for(let C=0;C<Ui;++C){const G=C/g,x=Math.exp(-G*G/2);d.push(x),C===0?b+=x:C<m&&(b+=2*x)}for(let C=0;C<d.length;C++)d[C]=d[C]/b;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=d,u.latitudinal.value=o==="latitudinal",n&&(u.poleAxis.value=n);const{_lodMax:E}=this;u.dTheta.value=v,u.mipInt.value=E-r;const w=this._sizeLods[s],S=3*w*(s>E-ar?s-E+ar:0),A=4*(this._cubeSize-w);_s(t,S,A,3*w,2*w),l.setRenderTarget(t),l.render(p,ca)}}function dp(i){const e=[],t=[],r=[];let s=i;const a=i-ar+1+Nn.length;for(let o=0;o<a;o++){const n=Math.pow(2,s);t.push(n);let l=1/n;o>i-ar?l=Nn[o-i+ar-1]:o===0&&(l=0),r.push(l);const c=1/(n-2),h=-c,p=1+c,u=[h,h,p,h,p,p,h,h,p,p,h,p],f=6,v=6,g=3,m=2,d=1,b=new Float32Array(g*v*f),E=new Float32Array(m*v*f),w=new Float32Array(d*v*f);for(let A=0;A<f;A++){const C=A%3*2/3-1,G=A>2?0:-1,x=[C,G,0,C+2/3,G,0,C+2/3,G+1,0,C,G,0,C+2/3,G+1,0,C,G+1,0];b.set(x,g*v*A),E.set(u,m*v*A);const T=[A,A,A,A,A,A];w.set(T,d*v*A)}const S=new xi;S.setAttribute("position",new Kt(b,g)),S.setAttribute("uv",new Kt(E,m)),S.setAttribute("faceIndex",new Kt(w,d)),e.push(S),s>ar&&s--}return{lodPlanes:e,sizeLods:t,sigmas:r}}function Bn(i,e,t){const r=new pi(i,e,t);return r.texture.mapping=306,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function _s(i,e,t,r,s){i.viewport.set(e,t,r,s),i.scissor.set(e,t,r,s)}function up(i,e,t){const r=new Float32Array(Ui),s=new U(0,1,0);return new yi({name:"SphericalGaussianBlur",defines:{n:Ui,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:pa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function kn(){return new yi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:pa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Vn(){return new yi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:pa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function pa(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function pp(i){let e=new WeakMap,t=null;function r(n){if(n&&n.isTexture){const l=n.mapping,c=l===303||l===304,h=l===301||l===302;if(c||h)if(n.isRenderTargetTexture&&n.needsPMREMUpdate===!0){n.needsPMREMUpdate=!1;let p=e.get(n);return t===null&&(t=new Hn(i)),p=c?t.fromEquirectangular(n,p):t.fromCubemap(n,p),e.set(n,p),p.texture}else{if(e.has(n))return e.get(n).texture;{const p=n.image;if(c&&p&&p.height>0||h&&p&&s(p)){t===null&&(t=new Hn(i));const u=c?t.fromEquirectangular(n):t.fromCubemap(n);return e.set(n,u),n.addEventListener("dispose",a),u.texture}else return null}}}return n}function s(n){let l=0;const c=6;for(let h=0;h<c;h++)n[h]!==void 0&&l++;return l===c}function a(n){const l=n.target;l.removeEventListener("dispose",a);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:r,dispose:o}}function fp(i){const e={};function t(r){if(e[r]!==void 0)return e[r];let s;switch(r){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(r)}return e[r]=s,s}return{has:function(r){return t(r)!==null},init:function(r){r.isWebGL2?t("EXT_color_buffer_float"):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(r){const s=t(r);return s===null&&console.warn("THREE.WebGLRenderer: "+r+" extension not supported."),s}}}function mp(i,e,t,r){const s={},a=new WeakMap;function o(p){const u=p.target;u.index!==null&&e.remove(u.index);for(const v in u.attributes)e.remove(u.attributes[v]);for(const v in u.morphAttributes){const g=u.morphAttributes[v];for(let m=0,d=g.length;m<d;m++)e.remove(g[m])}u.removeEventListener("dispose",o),delete s[u.id];const f=a.get(u);f&&(e.remove(f),a.delete(u)),r.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function n(p,u){return s[u.id]===!0||(u.addEventListener("dispose",o),s[u.id]=!0,t.memory.geometries++),u}function l(p){const u=p.attributes;for(const v in u)e.update(u[v],i.ARRAY_BUFFER);const f=p.morphAttributes;for(const v in f){const g=f[v];for(let m=0,d=g.length;m<d;m++)e.update(g[m],i.ARRAY_BUFFER)}}function c(p){const u=[],f=p.index,v=p.attributes.position;let g=0;if(f!==null){const b=f.array;g=f.version;for(let E=0,w=b.length;E<w;E+=3){const S=b[E+0],A=b[E+1],C=b[E+2];u.push(S,A,A,C,C,S)}}else if(v!==void 0){const b=v.array;g=v.version;for(let E=0,w=b.length/3-1;E<w;E+=3){const S=E+0,A=E+1,C=E+2;u.push(S,A,A,C,C,S)}}else return;const m=new(on(u)?wn:Sn)(u,1);m.version=g;const d=a.get(p);d&&e.remove(d),a.set(p,m)}function h(p){const u=a.get(p);if(u){const f=p.index;f!==null&&u.version<f.version&&c(p)}else c(p);return a.get(p)}return{get:n,update:l,getWireframeAttribute:h}}function gp(i,e,t,r){const s=r.isWebGL2;let a;function o(f){a=f}let n,l;function c(f){n=f.type,l=f.bytesPerElement}function h(f,v){i.drawElements(a,v,n,f*l),t.update(v,a,1)}function p(f,v,g){if(g===0)return;let m,d;if(s)m=i,d="drawElementsInstanced";else if(m=e.get("ANGLE_instanced_arrays"),d="drawElementsInstancedANGLE",m===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[d](a,v,n,f*l,g),t.update(v,a,g)}function u(f,v,g){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<g;d++)this.render(f[d]/l,v[d]);else{m.multiDrawElementsWEBGL(a,v,0,n,f,0,g);let d=0;for(let b=0;b<g;b++)d+=v[b];t.update(d,a,1)}}this.setMode=o,this.setIndex=c,this.render=h,this.renderInstances=p,this.renderMultiDraw=u}function vp(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function r(a,o,n){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=n*(a/3);break;case i.LINES:t.lines+=n*(a/2);break;case i.LINE_STRIP:t.lines+=n*(a-1);break;case i.LINE_LOOP:t.lines+=n*a;break;case i.POINTS:t.points+=n*a;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:r}}function _p(i,e){return i[0]-e[0]}function xp(i,e){return Math.abs(e[1])-Math.abs(i[1])}function yp(i,e,t){const r={},s=new Float32Array(8),a=new WeakMap,o=new dt,n=[];for(let c=0;c<8;c++)n[c]=[c,0];function l(c,h,p){const u=c.morphTargetInfluences;if(e.isWebGL2===!0){const f=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,v=f!==void 0?f.length:0;let g=a.get(h);if(g===void 0||g.count!==v){let b=function(){$.dispose(),a.delete(h),h.removeEventListener("dispose",b)};g!==void 0&&g.texture.dispose();const E=h.morphAttributes.position!==void 0,w=h.morphAttributes.normal!==void 0,S=h.morphAttributes.color!==void 0,A=h.morphAttributes.position||[],C=h.morphAttributes.normal||[],G=h.morphAttributes.color||[];let x=0;E===!0&&(x=1),w===!0&&(x=2),S===!0&&(x=3);let T=h.attributes.position.count*x,B=1;T>e.maxTextureSize&&(B=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const W=new Float32Array(T*B*4*v),$=new pn(W,T,B,v);$.type=1015,$.needsUpdate=!0;const L=x*4;for(let H=0;H<v;H++){const X=A[H],V=C[H],ee=G[H],j=T*B*4*H;for(let q=0;q<X.count;q++){const J=q*L;E===!0&&(o.fromBufferAttribute(X,q),W[j+J+0]=o.x,W[j+J+1]=o.y,W[j+J+2]=o.z,W[j+J+3]=0),w===!0&&(o.fromBufferAttribute(V,q),W[j+J+4]=o.x,W[j+J+5]=o.y,W[j+J+6]=o.z,W[j+J+7]=0),S===!0&&(o.fromBufferAttribute(ee,q),W[j+J+8]=o.x,W[j+J+9]=o.y,W[j+J+10]=o.z,W[j+J+11]=ee.itemSize===4?o.w:1)}}g={count:v,texture:$,size:new He(T,B)},a.set(h,g),h.addEventListener("dispose",b)}let m=0;for(let b=0;b<u.length;b++)m+=u[b];const d=h.morphTargetsRelative?1:1-m;p.getUniforms().setValue(i,"morphTargetBaseInfluence",d),p.getUniforms().setValue(i,"morphTargetInfluences",u),p.getUniforms().setValue(i,"morphTargetsTexture",g.texture,t),p.getUniforms().setValue(i,"morphTargetsTextureSize",g.size)}else{const f=u===void 0?0:u.length;let v=r[h.id];if(v===void 0||v.length!==f){v=[];for(let E=0;E<f;E++)v[E]=[E,0];r[h.id]=v}for(let E=0;E<f;E++){const w=v[E];w[0]=E,w[1]=u[E]}v.sort(xp);for(let E=0;E<8;E++)E<f&&v[E][1]?(n[E][0]=v[E][0],n[E][1]=v[E][1]):(n[E][0]=Number.MAX_SAFE_INTEGER,n[E][1]=0);n.sort(_p);const g=h.morphAttributes.position,m=h.morphAttributes.normal;let d=0;for(let E=0;E<8;E++){const w=n[E],S=w[0],A=w[1];S!==Number.MAX_SAFE_INTEGER&&A?(g&&h.getAttribute("morphTarget"+E)!==g[S]&&h.setAttribute("morphTarget"+E,g[S]),m&&h.getAttribute("morphNormal"+E)!==m[S]&&h.setAttribute("morphNormal"+E,m[S]),s[E]=A,d+=A):(g&&h.hasAttribute("morphTarget"+E)===!0&&h.deleteAttribute("morphTarget"+E),m&&h.hasAttribute("morphNormal"+E)===!0&&h.deleteAttribute("morphNormal"+E),s[E]=0)}const b=h.morphTargetsRelative?1:1-d;p.getUniforms().setValue(i,"morphTargetBaseInfluence",b),p.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:l}}function Ep(i,e,t,r){let s=new WeakMap;function a(l){const c=r.render.frame,h=l.geometry,p=e.get(l,h);if(s.get(p)!==c&&(e.update(p),s.set(p,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",n)===!1&&l.addEventListener("dispose",n),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const u=l.skeleton;s.get(u)!==c&&(u.update(),s.set(u,c))}return p}function o(){s=new WeakMap}function n(l){const c=l.target;c.removeEventListener("dispose",n),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:a,dispose:o}}class Gn extends At{constructor(e,t,r,s,a,o,n,l,c,h){if(h=h!==void 0?h:1026,h!==1026&&h!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&h===1026&&(r=1014),r===void 0&&h===1027&&(r=1020),super(null,s,a,o,n,l,h,r,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=n!==void 0?n:1003,this.minFilter=l!==void 0?l:1003,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const Wn=new At,Xn=new Gn(1,1);Xn.compareFunction=515;const jn=new pn,Yn=new sh,qn=new In,Zn=[],Kn=[],$n=new Float32Array(16),Jn=new Float32Array(9),Qn=new Float32Array(4);function or(i,e,t){const r=i[0];if(r<=0||r>0)return i;const s=e*t;let a=Zn[s];if(a===void 0&&(a=new Float32Array(s),Zn[s]=a),e!==0){r.toArray(a,0);for(let o=1,n=0;o!==e;++o)n+=t,i[o].toArray(a,n)}return a}function st(i,e){if(i.length!==e.length)return!1;for(let t=0,r=i.length;t<r;t++)if(i[t]!==e[t])return!1;return!0}function at(i,e){for(let t=0,r=e.length;t<r;t++)i[t]=e[t]}function xs(i,e){let t=Kn[e];t===void 0&&(t=new Int32Array(e),Kn[e]=t);for(let r=0;r!==e;++r)t[r]=i.allocateTextureUnit();return t}function Mp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function bp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(st(t,e))return;i.uniform2fv(this.addr,e),at(t,e)}}function Tp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(st(t,e))return;i.uniform3fv(this.addr,e),at(t,e)}}function Sp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(st(t,e))return;i.uniform4fv(this.addr,e),at(t,e)}}function wp(i,e){const t=this.cache,r=e.elements;if(r===void 0){if(st(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),at(t,e)}else{if(st(t,r))return;Qn.set(r),i.uniformMatrix2fv(this.addr,!1,Qn),at(t,r)}}function Ap(i,e){const t=this.cache,r=e.elements;if(r===void 0){if(st(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),at(t,e)}else{if(st(t,r))return;Jn.set(r),i.uniformMatrix3fv(this.addr,!1,Jn),at(t,r)}}function Rp(i,e){const t=this.cache,r=e.elements;if(r===void 0){if(st(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),at(t,e)}else{if(st(t,r))return;$n.set(r),i.uniformMatrix4fv(this.addr,!1,$n),at(t,r)}}function Cp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Lp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(st(t,e))return;i.uniform2iv(this.addr,e),at(t,e)}}function Pp(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(st(t,e))return;i.uniform3iv(this.addr,e),at(t,e)}}function Up(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(st(t,e))return;i.uniform4iv(this.addr,e),at(t,e)}}function Dp(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Ip(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(st(t,e))return;i.uniform2uiv(this.addr,e),at(t,e)}}function Op(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(st(t,e))return;i.uniform3uiv(this.addr,e),at(t,e)}}function Np(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(st(t,e))return;i.uniform4uiv(this.addr,e),at(t,e)}}function Fp(i,e,t){const r=this.cache,s=t.allocateTextureUnit();r[0]!==s&&(i.uniform1i(this.addr,s),r[0]=s);const a=this.type===i.SAMPLER_2D_SHADOW?Xn:Wn;t.setTexture2D(e||a,s)}function zp(i,e,t){const r=this.cache,s=t.allocateTextureUnit();r[0]!==s&&(i.uniform1i(this.addr,s),r[0]=s),t.setTexture3D(e||Yn,s)}function Hp(i,e,t){const r=this.cache,s=t.allocateTextureUnit();r[0]!==s&&(i.uniform1i(this.addr,s),r[0]=s),t.setTextureCube(e||qn,s)}function Bp(i,e,t){const r=this.cache,s=t.allocateTextureUnit();r[0]!==s&&(i.uniform1i(this.addr,s),r[0]=s),t.setTexture2DArray(e||jn,s)}function kp(i){switch(i){case 5126:return Mp;case 35664:return bp;case 35665:return Tp;case 35666:return Sp;case 35674:return wp;case 35675:return Ap;case 35676:return Rp;case 5124:case 35670:return Cp;case 35667:case 35671:return Lp;case 35668:case 35672:return Pp;case 35669:case 35673:return Up;case 5125:return Dp;case 36294:return Ip;case 36295:return Op;case 36296:return Np;case 35678:case 36198:case 36298:case 36306:case 35682:return Fp;case 35679:case 36299:case 36307:return zp;case 35680:case 36300:case 36308:case 36293:return Hp;case 36289:case 36303:case 36311:case 36292:return Bp}}function Vp(i,e){i.uniform1fv(this.addr,e)}function Gp(i,e){const t=or(e,this.size,2);i.uniform2fv(this.addr,t)}function Wp(i,e){const t=or(e,this.size,3);i.uniform3fv(this.addr,t)}function Xp(i,e){const t=or(e,this.size,4);i.uniform4fv(this.addr,t)}function jp(i,e){const t=or(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Yp(i,e){const t=or(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function qp(i,e){const t=or(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Zp(i,e){i.uniform1iv(this.addr,e)}function Kp(i,e){i.uniform2iv(this.addr,e)}function $p(i,e){i.uniform3iv(this.addr,e)}function Jp(i,e){i.uniform4iv(this.addr,e)}function Qp(i,e){i.uniform1uiv(this.addr,e)}function ef(i,e){i.uniform2uiv(this.addr,e)}function tf(i,e){i.uniform3uiv(this.addr,e)}function rf(i,e){i.uniform4uiv(this.addr,e)}function sf(i,e,t){const r=this.cache,s=e.length,a=xs(t,s);st(r,a)||(i.uniform1iv(this.addr,a),at(r,a));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||Wn,a[o])}function af(i,e,t){const r=this.cache,s=e.length,a=xs(t,s);st(r,a)||(i.uniform1iv(this.addr,a),at(r,a));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Yn,a[o])}function nf(i,e,t){const r=this.cache,s=e.length,a=xs(t,s);st(r,a)||(i.uniform1iv(this.addr,a),at(r,a));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||qn,a[o])}function of(i,e,t){const r=this.cache,s=e.length,a=xs(t,s);st(r,a)||(i.uniform1iv(this.addr,a),at(r,a));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||jn,a[o])}function lf(i){switch(i){case 5126:return Vp;case 35664:return Gp;case 35665:return Wp;case 35666:return Xp;case 35674:return jp;case 35675:return Yp;case 35676:return qp;case 5124:case 35670:return Zp;case 35667:case 35671:return Kp;case 35668:case 35672:return $p;case 35669:case 35673:return Jp;case 5125:return Qp;case 36294:return ef;case 36295:return tf;case 36296:return rf;case 35678:case 36198:case 36298:case 36306:case 35682:return sf;case 35679:case 36299:case 36307:return af;case 35680:case 36300:case 36308:case 36293:return nf;case 36289:case 36303:case 36311:case 36292:return of}}class cf{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.setValue=kp(t.type)}}class hf{constructor(e,t,r){this.id=e,this.addr=r,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=lf(t.type)}}class df{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,r){const s=this.seq;for(let a=0,o=s.length;a!==o;++a){const n=s[a];n.setValue(e,t[n.id],r)}}}const fa=/(\w+)(\])?(\[|\.)?/g;function eo(i,e){i.seq.push(e),i.map[e.id]=e}function uf(i,e,t){const r=i.name,s=r.length;for(fa.lastIndex=0;;){const a=fa.exec(r),o=fa.lastIndex;let n=a[1];const l=a[2]==="]",c=a[3];if(l&&(n=n|0),c===void 0||c==="["&&o+2===s){eo(t,c===void 0?new cf(n,i,e):new hf(n,i,e));break}else{let h=t.map[n];h===void 0&&(h=new df(n),eo(t,h)),t=h}}}class ys{constructor(e,t){this.seq=[],this.map={};const r=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<r;++s){const a=e.getActiveUniform(t,s),o=e.getUniformLocation(t,a.name);uf(a,o,this)}}setValue(e,t,r,s){const a=this.map[t];a!==void 0&&a.setValue(e,r,s)}setOptional(e,t,r){const s=t[r];s!==void 0&&this.setValue(e,r,s)}static upload(e,t,r,s){for(let a=0,o=t.length;a!==o;++a){const n=t[a],l=r[n.id];l.needsUpdate!==!1&&n.setValue(e,l.value,s)}}static seqWithValue(e,t){const r=[];for(let s=0,a=e.length;s!==a;++s){const o=e[s];o.id in t&&r.push(o)}return r}}function to(i,e,t){const r=i.createShader(e);return i.shaderSource(r,t),i.compileShader(r),r}const pf=37297;let ff=0;function mf(i,e){const t=i.split(`
`),r=[],s=Math.max(e-6,0),a=Math.min(e+6,t.length);for(let o=s;o<a;o++){const n=o+1;r.push(`${n===e?">":" "} ${n}: ${t[o]}`)}return r.join(`
`)}function gf(i){const e=Ve.getPrimaries(Ve.workingColorSpace),t=Ve.getPrimaries(i);let r;switch(e===t?r="":e===qr&&t===Yr?r="LinearDisplayP3ToLinearSRGB":e===Yr&&t===qr&&(r="LinearSRGBToLinearDisplayP3"),i){case Zt:case Xr:return[r,"LinearTransferOETF"];case ct:case Hs:return[r,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[r,"LinearTransferOETF"]}}function io(i,e,t){const r=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(r&&s==="")return"";const a=/ERROR: 0:(\d+)/.exec(s);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+s+`

`+mf(i.getShaderSource(e),o)}else return s}function vf(i,e){const t=gf(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function _f(i,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="OptimizedCineon";break;case 4:t="ACESFilmic";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function xf(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(br).join(`
`)}function yf(i){const e=[];for(const t in i){const r=i[t];r!==!1&&e.push("#define "+t+" "+r)}return e.join(`
`)}function Ef(i,e){const t={},r=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<r;s++){const a=i.getActiveAttrib(e,s),o=a.name;let n=1;a.type===i.FLOAT_MAT2&&(n=2),a.type===i.FLOAT_MAT3&&(n=3),a.type===i.FLOAT_MAT4&&(n=4),t[o]={type:a.type,location:i.getAttribLocation(e,o),locationSize:n}}return t}function br(i){return i!==""}function ro(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function so(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Mf=/^[ \t]*#include +<([\w\d./]+)>/gm;function ma(i){return i.replace(Mf,Tf)}const bf=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Tf(i,e){let t=Re[e];if(t===void 0){const r=bf.get(e);if(r!==void 0)t=Re[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return ma(t)}const Sf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ao(i){return i.replace(Sf,wf)}function wf(i,e,t,r){let s="";for(let a=parseInt(e);a<parseInt(t);a++)s+=r.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return s}function no(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Af(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===1?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===2?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===3&&(e="SHADOWMAP_TYPE_VSM"),e}function Rf(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case 301:case 302:e="ENVMAP_TYPE_CUBE";break;case 306:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Cf(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case 302:e="ENVMAP_MODE_REFRACTION";break}return e}function Lf(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case 0:e="ENVMAP_BLENDING_MULTIPLY";break;case 1:e="ENVMAP_BLENDING_MIX";break;case 2:e="ENVMAP_BLENDING_ADD";break}return e}function Pf(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:r,maxMip:t}}function Uf(i,e,t,r){const s=i.getContext(),a=t.defines;let o=t.vertexShader,n=t.fragmentShader;const l=Af(t),c=Rf(t),h=Cf(t),p=Lf(t),u=Pf(t),f=t.isWebGL2?"":xf(t),v=yf(a),g=s.createProgram();let m,d,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(br).join(`
`),m.length>0&&(m+=`
`),d=[f,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(br).join(`
`),d.length>0&&(d+=`
`)):(m=[no(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(br).join(`
`),d=[f,no(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?Re.tonemapping_pars_fragment:"",t.toneMapping!==0?_f("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Re.colorspace_pars_fragment,vf("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(br).join(`
`)),o=ma(o),o=ro(o,t),o=so(o,t),n=ma(n),n=ro(n,t),n=so(n,t),o=ao(o),n=ao(n),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=["precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===an?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===an?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const E=b+m+o,w=b+d+n,S=to(s,s.VERTEX_SHADER,E),A=to(s,s.FRAGMENT_SHADER,w);s.attachShader(g,S),s.attachShader(g,A),t.index0AttributeName!==void 0?s.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function C(B){if(i.debug.checkShaderErrors){const W=s.getProgramInfoLog(g).trim(),$=s.getShaderInfoLog(S).trim(),L=s.getShaderInfoLog(A).trim();let H=!0,X=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,g,S,A);else{const V=io(s,S,"vertex"),ee=io(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Program Info Log: `+W+`
`+V+`
`+ee)}else W!==""?console.warn("THREE.WebGLProgram: Program Info Log:",W):($===""||L==="")&&(X=!1);X&&(B.diagnostics={runnable:H,programLog:W,vertexShader:{log:$,prefix:m},fragmentShader:{log:L,prefix:d}})}s.deleteShader(S),s.deleteShader(A),G=new ys(s,g),x=Ef(s,g)}let G;this.getUniforms=function(){return G===void 0&&C(this),G};let x;this.getAttributes=function(){return x===void 0&&C(this),x};let T=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=s.getProgramParameter(g,pf)),T},this.destroy=function(){r.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ff++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=S,this.fragmentShader=A,this}let Df=0;class If{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,r=e.fragmentShader,s=this._getShaderStage(t),a=this._getShaderStage(r),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(a)===!1&&(o.add(a),a.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const r of t)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let r=t.get(e);return r===void 0&&(r=new Set,t.set(e,r)),r}_getShaderStage(e){const t=this.shaderCache;let r=t.get(e);return r===void 0&&(r=new Of(e),t.set(e,r)),r}}class Of{constructor(e){this.id=Df++,this.code=e,this.usedTimes=0}}function Nf(i,e,t,r,s,a,o){const n=new Js,l=new If,c=[],h=s.isWebGL2,p=s.logarithmicDepthBuffer,u=s.vertexTextures;let f=s.precision;const v={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return x===0?"uv":`uv${x}`}function m(x,T,B,W,$){const L=W.fog,H=$.geometry,X=x.isMeshStandardMaterial?W.environment:null,V=(x.isMeshStandardMaterial?t:e).get(x.envMap||X),ee=V&&V.mapping===306?V.image.height:null,j=v[x.type];x.precision!==null&&(f=s.getMaxPrecision(x.precision),f!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));const q=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,J=q!==void 0?q.length:0;let he=0;H.morphAttributes.position!==void 0&&(he=1),H.morphAttributes.normal!==void 0&&(he=2),H.morphAttributes.color!==void 0&&(he=3);let z,Y,de,pe;if(j){const tt=Jt[j];z=tt.vertexShader,Y=tt.fragmentShader}else z=x.vertexShader,Y=x.fragmentShader,l.update(x),de=l.getVertexShaderID(x),pe=l.getFragmentShaderID(x);const me=i.getRenderTarget(),Ce=$.isInstancedMesh===!0,Se=$.isBatchedMesh===!0,be=!!x.map,Le=!!x.matcap,O=!!V,St=!!x.aoMap,ve=!!x.lightMap,Ne=!!x.bumpMap,Ee=!!x.normalMap,Je=!!x.displacementMap,Ie=!!x.emissiveMap,Ae=!!x.metalnessMap,Xe=!!x.roughnessMap,ft=x.anisotropy>0,mt=x.clearcoat>0,M=x.iridescence>0,_=x.sheen>0,D=x.transmission>0,te=ft&&!!x.anisotropyMap,K=mt&&!!x.clearcoatMap,Q=mt&&!!x.clearcoatNormalMap,ue=mt&&!!x.clearcoatRoughnessMap,se=M&&!!x.iridescenceMap,oe=M&&!!x.iridescenceThicknessMap,ye=_&&!!x.sheenColorMap,ke=_&&!!x.sheenRoughnessMap,ie=!!x.specularMap,je=!!x.specularColorMap,we=!!x.specularIntensityMap,Me=D&&!!x.transmissionMap,_e=D&&!!x.thicknessMap,ce=!!x.gradientMap,Fe=!!x.alphaMap,R=x.alphaTest>0,le=!!x.alphaHash,Z=!!x.extensions,k=!!H.attributes.uv1,re=!!H.attributes.uv2,fe=!!H.attributes.uv3;let Ye=0;return x.toneMapped&&(me===null||me.isXRRenderTarget===!0)&&(Ye=i.toneMapping),{isWebGL2:h,shaderID:j,shaderType:x.type,shaderName:x.name,vertexShader:z,fragmentShader:Y,defines:x.defines,customVertexShaderID:de,customFragmentShaderID:pe,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:Se,instancing:Ce,instancingColor:Ce&&$.instanceColor!==null,supportsVertexTextures:u,outputColorSpace:me===null?i.outputColorSpace:me.isXRRenderTarget===!0?me.texture.colorSpace:Zt,map:be,matcap:Le,envMap:O,envMapMode:O&&V.mapping,envMapCubeUVHeight:ee,aoMap:St,lightMap:ve,bumpMap:Ne,normalMap:Ee,displacementMap:u&&Je,emissiveMap:Ie,normalMapObjectSpace:Ee&&x.normalMapType===1,normalMapTangentSpace:Ee&&x.normalMapType===0,metalnessMap:Ae,roughnessMap:Xe,anisotropy:ft,anisotropyMap:te,clearcoat:mt,clearcoatMap:K,clearcoatNormalMap:Q,clearcoatRoughnessMap:ue,iridescence:M,iridescenceMap:se,iridescenceThicknessMap:oe,sheen:_,sheenColorMap:ye,sheenRoughnessMap:ke,specularMap:ie,specularColorMap:je,specularIntensityMap:we,transmission:D,transmissionMap:Me,thicknessMap:_e,gradientMap:ce,opaque:x.transparent===!1&&x.blending===1,alphaMap:Fe,alphaTest:R,alphaHash:le,combine:x.combine,mapUv:be&&g(x.map.channel),aoMapUv:St&&g(x.aoMap.channel),lightMapUv:ve&&g(x.lightMap.channel),bumpMapUv:Ne&&g(x.bumpMap.channel),normalMapUv:Ee&&g(x.normalMap.channel),displacementMapUv:Je&&g(x.displacementMap.channel),emissiveMapUv:Ie&&g(x.emissiveMap.channel),metalnessMapUv:Ae&&g(x.metalnessMap.channel),roughnessMapUv:Xe&&g(x.roughnessMap.channel),anisotropyMapUv:te&&g(x.anisotropyMap.channel),clearcoatMapUv:K&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:Q&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ue&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:se&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:oe&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:ke&&g(x.sheenRoughnessMap.channel),specularMapUv:ie&&g(x.specularMap.channel),specularColorMapUv:je&&g(x.specularColorMap.channel),specularIntensityMapUv:we&&g(x.specularIntensityMap.channel),transmissionMapUv:Me&&g(x.transmissionMap.channel),thicknessMapUv:_e&&g(x.thicknessMap.channel),alphaMapUv:Fe&&g(x.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(Ee||ft),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,vertexUv1s:k,vertexUv2s:re,vertexUv3s:fe,pointsUvs:$.isPoints===!0&&!!H.attributes.uv&&(be||Fe),fog:!!L,useFog:x.fog===!0,fogExp2:L&&L.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:p,skinning:$.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:J,morphTextureStride:he,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&B.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ye,useLegacyLights:i._useLegacyLights,decodeVideoTexture:be&&x.map.isVideoTexture===!0&&Ve.getTransfer(x.map.colorSpace)===Ze,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===2,flipSided:x.side===1,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionDerivatives:Z&&x.extensions.derivatives===!0,extensionFragDepth:Z&&x.extensions.fragDepth===!0,extensionDrawBuffers:Z&&x.extensions.drawBuffers===!0,extensionShaderTextureLOD:Z&&x.extensions.shaderTextureLOD===!0,rendererExtensionFragDepth:h||r.has("EXT_frag_depth"),rendererExtensionDrawBuffers:h||r.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:h||r.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()}}function d(x){const T=[];if(x.shaderID?T.push(x.shaderID):(T.push(x.customVertexShaderID),T.push(x.customFragmentShaderID)),x.defines!==void 0)for(const B in x.defines)T.push(B),T.push(x.defines[B]);return x.isRawShaderMaterial===!1&&(b(T,x),E(T,x),T.push(i.outputColorSpace)),T.push(x.customProgramCacheKey),T.join()}function b(x,T){x.push(T.precision),x.push(T.outputColorSpace),x.push(T.envMapMode),x.push(T.envMapCubeUVHeight),x.push(T.mapUv),x.push(T.alphaMapUv),x.push(T.lightMapUv),x.push(T.aoMapUv),x.push(T.bumpMapUv),x.push(T.normalMapUv),x.push(T.displacementMapUv),x.push(T.emissiveMapUv),x.push(T.metalnessMapUv),x.push(T.roughnessMapUv),x.push(T.anisotropyMapUv),x.push(T.clearcoatMapUv),x.push(T.clearcoatNormalMapUv),x.push(T.clearcoatRoughnessMapUv),x.push(T.iridescenceMapUv),x.push(T.iridescenceThicknessMapUv),x.push(T.sheenColorMapUv),x.push(T.sheenRoughnessMapUv),x.push(T.specularMapUv),x.push(T.specularColorMapUv),x.push(T.specularIntensityMapUv),x.push(T.transmissionMapUv),x.push(T.thicknessMapUv),x.push(T.combine),x.push(T.fogExp2),x.push(T.sizeAttenuation),x.push(T.morphTargetsCount),x.push(T.morphAttributeCount),x.push(T.numDirLights),x.push(T.numPointLights),x.push(T.numSpotLights),x.push(T.numSpotLightMaps),x.push(T.numHemiLights),x.push(T.numRectAreaLights),x.push(T.numDirLightShadows),x.push(T.numPointLightShadows),x.push(T.numSpotLightShadows),x.push(T.numSpotLightShadowsWithMaps),x.push(T.numLightProbes),x.push(T.shadowMapType),x.push(T.toneMapping),x.push(T.numClippingPlanes),x.push(T.numClipIntersection),x.push(T.depthPacking)}function E(x,T){n.disableAll(),T.isWebGL2&&n.enable(0),T.supportsVertexTextures&&n.enable(1),T.instancing&&n.enable(2),T.instancingColor&&n.enable(3),T.matcap&&n.enable(4),T.envMap&&n.enable(5),T.normalMapObjectSpace&&n.enable(6),T.normalMapTangentSpace&&n.enable(7),T.clearcoat&&n.enable(8),T.iridescence&&n.enable(9),T.alphaTest&&n.enable(10),T.vertexColors&&n.enable(11),T.vertexAlphas&&n.enable(12),T.vertexUv1s&&n.enable(13),T.vertexUv2s&&n.enable(14),T.vertexUv3s&&n.enable(15),T.vertexTangents&&n.enable(16),T.anisotropy&&n.enable(17),T.alphaHash&&n.enable(18),T.batching&&n.enable(19),x.push(n.mask),n.disableAll(),T.fog&&n.enable(0),T.useFog&&n.enable(1),T.flatShading&&n.enable(2),T.logarithmicDepthBuffer&&n.enable(3),T.skinning&&n.enable(4),T.morphTargets&&n.enable(5),T.morphNormals&&n.enable(6),T.morphColors&&n.enable(7),T.premultipliedAlpha&&n.enable(8),T.shadowMapEnabled&&n.enable(9),T.useLegacyLights&&n.enable(10),T.doubleSided&&n.enable(11),T.flipSided&&n.enable(12),T.useDepthPacking&&n.enable(13),T.dithering&&n.enable(14),T.transmission&&n.enable(15),T.sheen&&n.enable(16),T.opaque&&n.enable(17),T.pointsUvs&&n.enable(18),T.decodeVideoTexture&&n.enable(19),x.push(n.mask)}function w(x){const T=v[x.type];let B;if(T){const W=Jt[T];B=vh.clone(W.uniforms)}else B=x.uniforms;return B}function S(x,T){let B;for(let W=0,$=c.length;W<$;W++){const L=c[W];if(L.cacheKey===T){B=L,++B.usedTimes;break}}return B===void 0&&(B=new Uf(i,T,x,a),c.push(B)),B}function A(x){if(--x.usedTimes===0){const T=c.indexOf(x);c[T]=c[c.length-1],c.pop(),x.destroy()}}function C(x){l.remove(x)}function G(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:w,acquireProgram:S,releaseProgram:A,releaseShaderCache:C,programs:c,dispose:G}}function Ff(){let i=new WeakMap;function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function t(a){i.delete(a)}function r(a,o,n){i.get(a)[o]=n}function s(){i=new WeakMap}return{get:e,remove:t,update:r,dispose:s}}function zf(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function oo(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function lo(){const i=[];let e=0;const t=[],r=[],s=[];function a(){e=0,t.length=0,r.length=0,s.length=0}function o(p,u,f,v,g,m){let d=i[e];return d===void 0?(d={id:p.id,object:p,geometry:u,material:f,groupOrder:v,renderOrder:p.renderOrder,z:g,group:m},i[e]=d):(d.id=p.id,d.object=p,d.geometry=u,d.material=f,d.groupOrder=v,d.renderOrder=p.renderOrder,d.z=g,d.group=m),e++,d}function n(p,u,f,v,g,m){const d=o(p,u,f,v,g,m);f.transmission>0?r.push(d):f.transparent===!0?s.push(d):t.push(d)}function l(p,u,f,v,g,m){const d=o(p,u,f,v,g,m);f.transmission>0?r.unshift(d):f.transparent===!0?s.unshift(d):t.unshift(d)}function c(p,u){t.length>1&&t.sort(p||zf),r.length>1&&r.sort(u||oo),s.length>1&&s.sort(u||oo)}function h(){for(let p=e,u=i.length;p<u;p++){const f=i[p];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:r,transparent:s,init:a,push:n,unshift:l,finish:h,sort:c}}function Hf(){let i=new WeakMap;function e(r,s){const a=i.get(r);let o;return a===void 0?(o=new lo,i.set(r,[o])):s>=a.length?(o=new lo,a.push(o)):o=a[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function Bf(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new U,color:new Ge};break;case"SpotLight":t={position:new U,direction:new U,color:new Ge,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new U,color:new Ge,distance:0,decay:0};break;case"HemisphereLight":t={direction:new U,skyColor:new Ge,groundColor:new Ge};break;case"RectAreaLight":t={color:new Ge,position:new U,halfWidth:new U,halfHeight:new U};break}return i[e.id]=t,t}}}function kf(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new He,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let Vf=0;function Gf(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Wf(i,e){const t=new Bf,r=kf(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)s.probe.push(new U);const a=new U,o=new rt,n=new rt;function l(h,p){let u=0,f=0,v=0;for(let W=0;W<9;W++)s.probe[W].set(0,0,0);let g=0,m=0,d=0,b=0,E=0,w=0,S=0,A=0,C=0,G=0,x=0;h.sort(Gf);const T=p===!0?Math.PI:1;for(let W=0,$=h.length;W<$;W++){const L=h[W],H=L.color,X=L.intensity,V=L.distance,ee=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=H.r*X*T,f+=H.g*X*T,v+=H.b*X*T;else if(L.isLightProbe){for(let j=0;j<9;j++)s.probe[j].addScaledVector(L.sh.coefficients[j],X);x++}else if(L.isDirectionalLight){const j=t.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity*T),L.castShadow){const q=L.shadow,J=r.get(L);J.shadowBias=q.bias,J.shadowNormalBias=q.normalBias,J.shadowRadius=q.radius,J.shadowMapSize=q.mapSize,s.directionalShadow[g]=J,s.directionalShadowMap[g]=ee,s.directionalShadowMatrix[g]=L.shadow.matrix,w++}s.directional[g]=j,g++}else if(L.isSpotLight){const j=t.get(L);j.position.setFromMatrixPosition(L.matrixWorld),j.color.copy(H).multiplyScalar(X*T),j.distance=V,j.coneCos=Math.cos(L.angle),j.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),j.decay=L.decay,s.spot[d]=j;const q=L.shadow;if(L.map&&(s.spotLightMap[C]=L.map,C++,q.updateMatrices(L),L.castShadow&&G++),s.spotLightMatrix[d]=q.matrix,L.castShadow){const J=r.get(L);J.shadowBias=q.bias,J.shadowNormalBias=q.normalBias,J.shadowRadius=q.radius,J.shadowMapSize=q.mapSize,s.spotShadow[d]=J,s.spotShadowMap[d]=ee,A++}d++}else if(L.isRectAreaLight){const j=t.get(L);j.color.copy(H).multiplyScalar(X),j.halfWidth.set(L.width*.5,0,0),j.halfHeight.set(0,L.height*.5,0),s.rectArea[b]=j,b++}else if(L.isPointLight){const j=t.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity*T),j.distance=L.distance,j.decay=L.decay,L.castShadow){const q=L.shadow,J=r.get(L);J.shadowBias=q.bias,J.shadowNormalBias=q.normalBias,J.shadowRadius=q.radius,J.shadowMapSize=q.mapSize,J.shadowCameraNear=q.camera.near,J.shadowCameraFar=q.camera.far,s.pointShadow[m]=J,s.pointShadowMap[m]=ee,s.pointShadowMatrix[m]=L.shadow.matrix,S++}s.point[m]=j,m++}else if(L.isHemisphereLight){const j=t.get(L);j.skyColor.copy(L.color).multiplyScalar(X*T),j.groundColor.copy(L.groundColor).multiplyScalar(X*T),s.hemi[E]=j,E++}}b>0&&(e.isWebGL2||i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=ne.LTC_FLOAT_1,s.rectAreaLTC2=ne.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=ne.LTC_HALF_1,s.rectAreaLTC2=ne.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=u,s.ambient[1]=f,s.ambient[2]=v;const B=s.hash;(B.directionalLength!==g||B.pointLength!==m||B.spotLength!==d||B.rectAreaLength!==b||B.hemiLength!==E||B.numDirectionalShadows!==w||B.numPointShadows!==S||B.numSpotShadows!==A||B.numSpotMaps!==C||B.numLightProbes!==x)&&(s.directional.length=g,s.spot.length=d,s.rectArea.length=b,s.point.length=m,s.hemi.length=E,s.directionalShadow.length=w,s.directionalShadowMap.length=w,s.pointShadow.length=S,s.pointShadowMap.length=S,s.spotShadow.length=A,s.spotShadowMap.length=A,s.directionalShadowMatrix.length=w,s.pointShadowMatrix.length=S,s.spotLightMatrix.length=A+C-G,s.spotLightMap.length=C,s.numSpotLightShadowsWithMaps=G,s.numLightProbes=x,B.directionalLength=g,B.pointLength=m,B.spotLength=d,B.rectAreaLength=b,B.hemiLength=E,B.numDirectionalShadows=w,B.numPointShadows=S,B.numSpotShadows=A,B.numSpotMaps=C,B.numLightProbes=x,s.version=Vf++)}function c(h,p){let u=0,f=0,v=0,g=0,m=0;const d=p.matrixWorldInverse;for(let b=0,E=h.length;b<E;b++){const w=h[b];if(w.isDirectionalLight){const S=s.directional[u];S.direction.setFromMatrixPosition(w.matrixWorld),a.setFromMatrixPosition(w.target.matrixWorld),S.direction.sub(a),S.direction.transformDirection(d),u++}else if(w.isSpotLight){const S=s.spot[v];S.position.setFromMatrixPosition(w.matrixWorld),S.position.applyMatrix4(d),S.direction.setFromMatrixPosition(w.matrixWorld),a.setFromMatrixPosition(w.target.matrixWorld),S.direction.sub(a),S.direction.transformDirection(d),v++}else if(w.isRectAreaLight){const S=s.rectArea[g];S.position.setFromMatrixPosition(w.matrixWorld),S.position.applyMatrix4(d),n.identity(),o.copy(w.matrixWorld),o.premultiply(d),n.extractRotation(o),S.halfWidth.set(w.width*.5,0,0),S.halfHeight.set(0,w.height*.5,0),S.halfWidth.applyMatrix4(n),S.halfHeight.applyMatrix4(n),g++}else if(w.isPointLight){const S=s.point[f];S.position.setFromMatrixPosition(w.matrixWorld),S.position.applyMatrix4(d),f++}else if(w.isHemisphereLight){const S=s.hemi[m];S.direction.setFromMatrixPosition(w.matrixWorld),S.direction.transformDirection(d),m++}}}return{setup:l,setupView:c,state:s}}function co(i,e){const t=new Wf(i,e),r=[],s=[];function a(){r.length=0,s.length=0}function o(h){r.push(h)}function n(h){s.push(h)}function l(h){t.setup(r,h)}function c(h){t.setupView(r,h)}return{init:a,state:{lightsArray:r,shadowsArray:s,lights:t},setupLights:l,setupLightsView:c,pushLight:o,pushShadow:n}}function Xf(i,e){let t=new WeakMap;function r(a,o=0){const n=t.get(a);let l;return n===void 0?(l=new co(i,e),t.set(a,[l])):o>=n.length?(l=new co(i,e),n.push(l)):l=n[o],l}function s(){t=new WeakMap}return{get:r,dispose:s}}class jf extends ns{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Yf extends ns{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const qf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Zf=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Kf(i,e,t){let r=new oa;const s=new He,a=new He,o=new dt,n=new jf({depthPacking:3201}),l=new Yf,c={},h=t.maxTextureSize,p={[0]:1,[1]:0,[2]:2},u=new yi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new He},radius:{value:4}},vertexShader:qf,fragmentShader:Zf}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const v=new xi;v.setAttribute("position",new Kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new oi(v,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let d=this.type;this.render=function(S,A,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;const G=i.getRenderTarget(),x=i.getActiveCubeFace(),T=i.getActiveMipmapLevel(),B=i.state;B.setBlending(0),B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);const W=d!==3&&this.type===3,$=d===3&&this.type!==3;for(let L=0,H=S.length;L<H;L++){const X=S[L],V=X.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",X,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const ee=V.getFrameExtents();if(s.multiply(ee),a.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(a.x=Math.floor(h/ee.x),s.x=a.x*ee.x,V.mapSize.x=a.x),s.y>h&&(a.y=Math.floor(h/ee.y),s.y=a.y*ee.y,V.mapSize.y=a.y)),V.map===null||W===!0||$===!0){const q=this.type!==3?{minFilter:1003,magFilter:1003}:{};V.map!==null&&V.map.dispose(),V.map=new pi(s.x,s.y,q),V.map.texture.name=X.name+".shadowMap",V.camera.updateProjectionMatrix()}i.setRenderTarget(V.map),i.clear();const j=V.getViewportCount();for(let q=0;q<j;q++){const J=V.getViewport(q);o.set(a.x*J.x,a.y*J.y,a.x*J.z,a.y*J.w),B.viewport(o),V.updateMatrices(X,q),r=V.getFrustum(),w(A,C,V.camera,X,this.type)}V.isPointLightShadow!==!0&&this.type===3&&b(V,C),V.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(G,x,T)};function b(S,A){const C=e.update(g);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new pi(s.x,s.y)),u.uniforms.shadow_pass.value=S.map.texture,u.uniforms.resolution.value=S.mapSize,u.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(A,null,C,u,g,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(A,null,C,f,g,null)}function E(S,A,C,G){let x=null;const T=C.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(T!==void 0)x=T;else if(x=C.isPointLight===!0?l:n,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const B=x.uuid,W=A.uuid;let $=c[B];$===void 0&&($={},c[B]=$);let L=$[W];L===void 0&&(L=x.clone(),$[W]=L),x=L}if(x.visible=A.visible,x.wireframe=A.wireframe,G===3?x.side=A.shadowSide!==null?A.shadowSide:A.side:x.side=A.shadowSide!==null?A.shadowSide:p[A.side],x.alphaMap=A.alphaMap,x.alphaTest=A.alphaTest,x.map=A.map,x.clipShadows=A.clipShadows,x.clippingPlanes=A.clippingPlanes,x.clipIntersection=A.clipIntersection,x.displacementMap=A.displacementMap,x.displacementScale=A.displacementScale,x.displacementBias=A.displacementBias,x.wireframeLinewidth=A.wireframeLinewidth,x.linewidth=A.linewidth,C.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const B=i.properties.get(x);B.light=C}return x}function w(S,A,C,G,x){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&x===3)&&(!S.frustumCulled||r.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,S.matrixWorld);const B=e.update(S),W=S.material;if(Array.isArray(W)){const $=B.groups;for(let L=0,H=$.length;L<H;L++){const X=$[L],V=W[X.materialIndex];if(V&&V.visible){const ee=E(S,V,G,x);S.onBeforeShadow(i,S,A,C,B,ee,X),i.renderBufferDirect(C,null,B,ee,S,X),S.onAfterShadow(i,S,A,C,B,ee,X)}}}else if(W.visible){const $=E(S,W,G,x);S.onBeforeShadow(i,S,A,C,B,$,null),i.renderBufferDirect(C,null,B,$,S,null),S.onAfterShadow(i,S,A,C,B,$,null)}}const T=S.children;for(let B=0,W=T.length;B<W;B++)w(T[B],A,C,G,x)}}function $f(i,e,t){const r=t.isWebGL2;function s(){let R=!1;const le=new dt;let Z=null;const k=new dt(0,0,0,0);return{setMask:function(re){Z!==re&&!R&&(i.colorMask(re,re,re,re),Z=re)},setLocked:function(re){R=re},setClear:function(re,fe,Ye,tt,Bt){Bt===!0&&(re*=tt,fe*=tt,Ye*=tt),le.set(re,fe,Ye,tt),k.equals(le)===!1&&(i.clearColor(re,fe,Ye,tt),k.copy(le))},reset:function(){R=!1,Z=null,k.set(-1,0,0,0)}}}function a(){let R=!1,le=null,Z=null,k=null;return{setTest:function(re){re?Se(i.DEPTH_TEST):be(i.DEPTH_TEST)},setMask:function(re){le!==re&&!R&&(i.depthMask(re),le=re)},setFunc:function(re){if(Z!==re){switch(re){case 0:i.depthFunc(i.NEVER);break;case 1:i.depthFunc(i.ALWAYS);break;case 2:i.depthFunc(i.LESS);break;case 3:i.depthFunc(i.LEQUAL);break;case 4:i.depthFunc(i.EQUAL);break;case 5:i.depthFunc(i.GEQUAL);break;case 6:i.depthFunc(i.GREATER);break;case 7:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Z=re}},setLocked:function(re){R=re},setClear:function(re){k!==re&&(i.clearDepth(re),k=re)},reset:function(){R=!1,le=null,Z=null,k=null}}}function o(){let R=!1,le=null,Z=null,k=null,re=null,fe=null,Ye=null,tt=null,Bt=null;return{setTest:function(qe){R||(qe?Se(i.STENCIL_TEST):be(i.STENCIL_TEST))},setMask:function(qe){le!==qe&&!R&&(i.stencilMask(qe),le=qe)},setFunc:function(qe,wt,ti){(Z!==qe||k!==wt||re!==ti)&&(i.stencilFunc(qe,wt,ti),Z=qe,k=wt,re=ti)},setOp:function(qe,wt,ti){(fe!==qe||Ye!==wt||tt!==ti)&&(i.stencilOp(qe,wt,ti),fe=qe,Ye=wt,tt=ti)},setLocked:function(qe){R=qe},setClear:function(qe){Bt!==qe&&(i.clearStencil(qe),Bt=qe)},reset:function(){R=!1,le=null,Z=null,k=null,re=null,fe=null,Ye=null,tt=null,Bt=null}}}const n=new s,l=new a,c=new o,h=new WeakMap,p=new WeakMap;let u={},f={},v=new WeakMap,g=[],m=null,d=!1,b=null,E=null,w=null,S=null,A=null,C=null,G=null,x=new Ge(0,0,0),T=0,B=!1,W=null,$=null,L=null,H=null,X=null;const V=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let ee=!1,j=0;const q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(j=parseFloat(/^WebGL (\d)/.exec(q)[1]),ee=j>=1):q.indexOf("OpenGL ES")!==-1&&(j=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),ee=j>=2);let J=null,he={};const z=i.getParameter(i.SCISSOR_BOX),Y=i.getParameter(i.VIEWPORT),de=new dt().fromArray(z),pe=new dt().fromArray(Y);function me(R,le,Z,k){const re=new Uint8Array(4),fe=i.createTexture();i.bindTexture(R,fe),i.texParameteri(R,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(R,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ye=0;Ye<Z;Ye++)r&&(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)?i.texImage3D(le,0,i.RGBA,1,1,k,0,i.RGBA,i.UNSIGNED_BYTE,re):i.texImage2D(le+Ye,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,re);return fe}const Ce={};Ce[i.TEXTURE_2D]=me(i.TEXTURE_2D,i.TEXTURE_2D,1),Ce[i.TEXTURE_CUBE_MAP]=me(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),r&&(Ce[i.TEXTURE_2D_ARRAY]=me(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Ce[i.TEXTURE_3D]=me(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),n.setClear(0,0,0,1),l.setClear(1),c.setClear(0),Se(i.DEPTH_TEST),l.setFunc(3),Ie(!1),Ae(1),Se(i.CULL_FACE),Ee(0);function Se(R){u[R]!==!0&&(i.enable(R),u[R]=!0)}function be(R){u[R]!==!1&&(i.disable(R),u[R]=!1)}function Le(R,le){return f[R]!==le?(i.bindFramebuffer(R,le),f[R]=le,r&&(R===i.DRAW_FRAMEBUFFER&&(f[i.FRAMEBUFFER]=le),R===i.FRAMEBUFFER&&(f[i.DRAW_FRAMEBUFFER]=le)),!0):!1}function O(R,le){let Z=g,k=!1;if(R)if(Z=v.get(le),Z===void 0&&(Z=[],v.set(le,Z)),R.isWebGLMultipleRenderTargets){const re=R.texture;if(Z.length!==re.length||Z[0]!==i.COLOR_ATTACHMENT0){for(let fe=0,Ye=re.length;fe<Ye;fe++)Z[fe]=i.COLOR_ATTACHMENT0+fe;Z.length=re.length,k=!0}}else Z[0]!==i.COLOR_ATTACHMENT0&&(Z[0]=i.COLOR_ATTACHMENT0,k=!0);else Z[0]!==i.BACK&&(Z[0]=i.BACK,k=!0);k&&(t.isWebGL2?i.drawBuffers(Z):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(Z))}function St(R){return m!==R?(i.useProgram(R),m=R,!0):!1}const ve={[100]:i.FUNC_ADD,[101]:i.FUNC_SUBTRACT,[102]:i.FUNC_REVERSE_SUBTRACT};if(r)ve[103]=i.MIN,ve[104]=i.MAX;else{const R=e.get("EXT_blend_minmax");R!==null&&(ve[103]=R.MIN_EXT,ve[104]=R.MAX_EXT)}const Ne={[200]:i.ZERO,[201]:i.ONE,[202]:i.SRC_COLOR,[204]:i.SRC_ALPHA,[210]:i.SRC_ALPHA_SATURATE,[208]:i.DST_COLOR,[206]:i.DST_ALPHA,[203]:i.ONE_MINUS_SRC_COLOR,[205]:i.ONE_MINUS_SRC_ALPHA,[209]:i.ONE_MINUS_DST_COLOR,[207]:i.ONE_MINUS_DST_ALPHA,[211]:i.CONSTANT_COLOR,[212]:i.ONE_MINUS_CONSTANT_COLOR,[213]:i.CONSTANT_ALPHA,[214]:i.ONE_MINUS_CONSTANT_ALPHA};function Ee(R,le,Z,k,re,fe,Ye,tt,Bt,qe){if(R===0){d===!0&&(be(i.BLEND),d=!1);return}if(d===!1&&(Se(i.BLEND),d=!0),R!==5){if(R!==b||qe!==B){if((E!==100||A!==100)&&(i.blendEquation(i.FUNC_ADD),E=100,A=100),qe)switch(R){case 1:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case 2:i.blendFunc(i.ONE,i.ONE);break;case 3:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case 4:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}else switch(R){case 1:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case 2:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case 3:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case 4:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",R);break}w=null,S=null,C=null,G=null,x.set(0,0,0),T=0,b=R,B=qe}return}re=re||le,fe=fe||Z,Ye=Ye||k,(le!==E||re!==A)&&(i.blendEquationSeparate(ve[le],ve[re]),E=le,A=re),(Z!==w||k!==S||fe!==C||Ye!==G)&&(i.blendFuncSeparate(Ne[Z],Ne[k],Ne[fe],Ne[Ye]),w=Z,S=k,C=fe,G=Ye),(tt.equals(x)===!1||Bt!==T)&&(i.blendColor(tt.r,tt.g,tt.b,Bt),x.copy(tt),T=Bt),b=R,B=!1}function Je(R,le){R.side===2?be(i.CULL_FACE):Se(i.CULL_FACE);let Z=R.side===1;le&&(Z=!Z),Ie(Z),R.blending===1&&R.transparent===!1?Ee(0):Ee(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),l.setFunc(R.depthFunc),l.setTest(R.depthTest),l.setMask(R.depthWrite),n.setMask(R.colorWrite);const k=R.stencilWrite;c.setTest(k),k&&(c.setMask(R.stencilWriteMask),c.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),c.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),ft(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?Se(i.SAMPLE_ALPHA_TO_COVERAGE):be(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ie(R){W!==R&&(R?i.frontFace(i.CW):i.frontFace(i.CCW),W=R)}function Ae(R){R!==0?(Se(i.CULL_FACE),R!==$&&(R===1?i.cullFace(i.BACK):R===2?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):be(i.CULL_FACE),$=R}function Xe(R){R!==L&&(ee&&i.lineWidth(R),L=R)}function ft(R,le,Z){R?(Se(i.POLYGON_OFFSET_FILL),(H!==le||X!==Z)&&(i.polygonOffset(le,Z),H=le,X=Z)):be(i.POLYGON_OFFSET_FILL)}function mt(R){R?Se(i.SCISSOR_TEST):be(i.SCISSOR_TEST)}function M(R){R===void 0&&(R=i.TEXTURE0+V-1),J!==R&&(i.activeTexture(R),J=R)}function _(R,le,Z){Z===void 0&&(J===null?Z=i.TEXTURE0+V-1:Z=J);let k=he[Z];k===void 0&&(k={type:void 0,texture:void 0},he[Z]=k),(k.type!==R||k.texture!==le)&&(J!==Z&&(i.activeTexture(Z),J=Z),i.bindTexture(R,le||Ce[R]),k.type=R,k.texture=le)}function D(){const R=he[J];R!==void 0&&R.type!==void 0&&(i.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function te(){try{i.compressedTexImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function K(){try{i.compressedTexImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function Q(){try{i.texSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ue(){try{i.texSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function se(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function oe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ye(){try{i.texStorage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ke(){try{i.texStorage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function ie(){try{i.texImage2D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function je(){try{i.texImage3D.apply(i,arguments)}catch(R){console.error("THREE.WebGLState:",R)}}function we(R){de.equals(R)===!1&&(i.scissor(R.x,R.y,R.z,R.w),de.copy(R))}function Me(R){pe.equals(R)===!1&&(i.viewport(R.x,R.y,R.z,R.w),pe.copy(R))}function _e(R,le){let Z=p.get(le);Z===void 0&&(Z=new WeakMap,p.set(le,Z));let k=Z.get(R);k===void 0&&(k=i.getUniformBlockIndex(le,R.name),Z.set(R,k))}function ce(R,le){const Z=p.get(le).get(R);h.get(le)!==Z&&(i.uniformBlockBinding(le,Z,R.__bindingPointIndex),h.set(le,Z))}function Fe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),r===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},J=null,he={},f={},v=new WeakMap,g=[],m=null,d=!1,b=null,E=null,w=null,S=null,A=null,C=null,G=null,x=new Ge(0,0,0),T=0,B=!1,W=null,$=null,L=null,H=null,X=null,de.set(0,0,i.canvas.width,i.canvas.height),pe.set(0,0,i.canvas.width,i.canvas.height),n.reset(),l.reset(),c.reset()}return{buffers:{color:n,depth:l,stencil:c},enable:Se,disable:be,bindFramebuffer:Le,drawBuffers:O,useProgram:St,setBlending:Ee,setMaterial:Je,setFlipSided:Ie,setCullFace:Ae,setLineWidth:Xe,setPolygonOffset:ft,setScissorTest:mt,activeTexture:M,bindTexture:_,unbindTexture:D,compressedTexImage2D:te,compressedTexImage3D:K,texImage2D:ie,texImage3D:je,updateUBOMapping:_e,uniformBlockBinding:ce,texStorage2D:ye,texStorage3D:ke,texSubImage2D:Q,texSubImage3D:ue,compressedTexSubImage2D:se,compressedTexSubImage3D:oe,scissor:we,viewport:Me,reset:Fe}}function Jf(i,e,t,r,s,a,o){const n=s.isWebGL2,l=s.maxTextures,c=s.maxCubemapSize,h=s.maxTextureSize,p=s.maxSamples,u=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,f=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),v=new WeakMap;let g;const m=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(M){}function b(M,_){return d?new OffscreenCanvas(M,_):mr("canvas")}function E(M,_,D,te){let K=1;if((M.width>te||M.height>te)&&(K=te/Math.max(M.width,M.height)),K<1||_===!0)if(typeof HTMLImageElement<"u"&&M instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&M instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&M instanceof ImageBitmap){const Q=_?Zr:Math.floor,ue=Q(K*M.width),se=Q(K*M.height);g===void 0&&(g=b(ue,se));const oe=D?b(ue,se):g;return oe.width=ue,oe.height=se,oe.getContext("2d").drawImage(M,0,0,ue,se),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+M.width+"x"+M.height+") to ("+ue+"x"+se+")."),oe}else return"data"in M&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+M.width+"x"+M.height+")."),M;return M}function w(M){return ks(M.width)&&ks(M.height)}function S(M){return n?!1:M.wrapS!==1001||M.wrapT!==1001||M.minFilter!==1003&&M.minFilter!==1006}function A(M,_){return M.generateMipmaps&&_&&M.minFilter!==1003&&M.minFilter!==1006}function C(M){i.generateMipmap(M)}function G(M,_,D,te,K=!1){if(n===!1)return _;if(M!==null){if(i[M]!==void 0)return i[M];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+M+"'")}let Q=_;if(_===i.RED&&(D===i.FLOAT&&(Q=i.R32F),D===i.HALF_FLOAT&&(Q=i.R16F),D===i.UNSIGNED_BYTE&&(Q=i.R8)),_===i.RED_INTEGER&&(D===i.UNSIGNED_BYTE&&(Q=i.R8UI),D===i.UNSIGNED_SHORT&&(Q=i.R16UI),D===i.UNSIGNED_INT&&(Q=i.R32UI),D===i.BYTE&&(Q=i.R8I),D===i.SHORT&&(Q=i.R16I),D===i.INT&&(Q=i.R32I)),_===i.RG&&(D===i.FLOAT&&(Q=i.RG32F),D===i.HALF_FLOAT&&(Q=i.RG16F),D===i.UNSIGNED_BYTE&&(Q=i.RG8)),_===i.RGBA){const ue=K?jr:Ve.getTransfer(te);D===i.FLOAT&&(Q=i.RGBA32F),D===i.HALF_FLOAT&&(Q=i.RGBA16F),D===i.UNSIGNED_BYTE&&(Q=ue===Ze?i.SRGB8_ALPHA8:i.RGBA8),D===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),D===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function x(M,_,D){return A(M,D)===!0||M.isFramebufferTexture&&M.minFilter!==1003&&M.minFilter!==1006?Math.log2(Math.max(_.width,_.height))+1:M.mipmaps!==void 0&&M.mipmaps.length>0?M.mipmaps.length:M.isCompressedTexture&&Array.isArray(M.image)?_.mipmaps.length:1}function T(M){return M===1003||M===1004||M===1005?i.NEAREST:i.LINEAR}function B(M){const _=M.target;_.removeEventListener("dispose",B),$(_),_.isVideoTexture&&v.delete(_)}function W(M){const _=M.target;_.removeEventListener("dispose",W),H(_)}function $(M){const _=r.get(M);if(_.__webglInit===void 0)return;const D=M.source,te=m.get(D);if(te){const K=te[_.__cacheKey];K.usedTimes--,K.usedTimes===0&&L(M),Object.keys(te).length===0&&m.delete(D)}r.remove(M)}function L(M){const _=r.get(M);i.deleteTexture(_.__webglTexture);const D=M.source,te=m.get(D);delete te[_.__cacheKey],o.memory.textures--}function H(M){const _=M.texture,D=r.get(M),te=r.get(_);if(te.__webglTexture!==void 0&&(i.deleteTexture(te.__webglTexture),o.memory.textures--),M.depthTexture&&M.depthTexture.dispose(),M.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(D.__webglFramebuffer[K]))for(let Q=0;Q<D.__webglFramebuffer[K].length;Q++)i.deleteFramebuffer(D.__webglFramebuffer[K][Q]);else i.deleteFramebuffer(D.__webglFramebuffer[K]);D.__webglDepthbuffer&&i.deleteRenderbuffer(D.__webglDepthbuffer[K])}else{if(Array.isArray(D.__webglFramebuffer))for(let K=0;K<D.__webglFramebuffer.length;K++)i.deleteFramebuffer(D.__webglFramebuffer[K]);else i.deleteFramebuffer(D.__webglFramebuffer);if(D.__webglDepthbuffer&&i.deleteRenderbuffer(D.__webglDepthbuffer),D.__webglMultisampledFramebuffer&&i.deleteFramebuffer(D.__webglMultisampledFramebuffer),D.__webglColorRenderbuffer)for(let K=0;K<D.__webglColorRenderbuffer.length;K++)D.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(D.__webglColorRenderbuffer[K]);D.__webglDepthRenderbuffer&&i.deleteRenderbuffer(D.__webglDepthRenderbuffer)}if(M.isWebGLMultipleRenderTargets)for(let K=0,Q=_.length;K<Q;K++){const ue=r.get(_[K]);ue.__webglTexture&&(i.deleteTexture(ue.__webglTexture),o.memory.textures--),r.remove(_[K])}r.remove(_),r.remove(M)}let X=0;function V(){X=0}function ee(){const M=X;return M>=l&&console.warn("THREE.WebGLTextures: Trying to use "+M+" texture units while this GPU supports only "+l),X+=1,M}function j(M){const _=[];return _.push(M.wrapS),_.push(M.wrapT),_.push(M.wrapR||0),_.push(M.magFilter),_.push(M.minFilter),_.push(M.anisotropy),_.push(M.internalFormat),_.push(M.format),_.push(M.type),_.push(M.generateMipmaps),_.push(M.premultiplyAlpha),_.push(M.flipY),_.push(M.unpackAlignment),_.push(M.colorSpace),_.join()}function q(M,_){const D=r.get(M);if(M.isVideoTexture&&ft(M),M.isRenderTargetTexture===!1&&M.version>0&&D.__version!==M.version){const te=M.image;if(te===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(te.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Se(D,M,_);return}}t.bindTexture(i.TEXTURE_2D,D.__webglTexture,i.TEXTURE0+_)}function J(M,_){const D=r.get(M);if(M.version>0&&D.__version!==M.version){Se(D,M,_);return}t.bindTexture(i.TEXTURE_2D_ARRAY,D.__webglTexture,i.TEXTURE0+_)}function he(M,_){const D=r.get(M);if(M.version>0&&D.__version!==M.version){Se(D,M,_);return}t.bindTexture(i.TEXTURE_3D,D.__webglTexture,i.TEXTURE0+_)}function z(M,_){const D=r.get(M);if(M.version>0&&D.__version!==M.version){be(D,M,_);return}t.bindTexture(i.TEXTURE_CUBE_MAP,D.__webglTexture,i.TEXTURE0+_)}const Y={[1e3]:i.REPEAT,[1001]:i.CLAMP_TO_EDGE,[1002]:i.MIRRORED_REPEAT},de={[1003]:i.NEAREST,[1004]:i.NEAREST_MIPMAP_NEAREST,[1005]:i.NEAREST_MIPMAP_LINEAR,[1006]:i.LINEAR,[1007]:i.LINEAR_MIPMAP_NEAREST,[1008]:i.LINEAR_MIPMAP_LINEAR},pe={[512]:i.NEVER,[519]:i.ALWAYS,[513]:i.LESS,[515]:i.LEQUAL,[514]:i.EQUAL,[518]:i.GEQUAL,[516]:i.GREATER,[517]:i.NOTEQUAL};function me(M,_,D){if(D?(i.texParameteri(M,i.TEXTURE_WRAP_S,Y[_.wrapS]),i.texParameteri(M,i.TEXTURE_WRAP_T,Y[_.wrapT]),(M===i.TEXTURE_3D||M===i.TEXTURE_2D_ARRAY)&&i.texParameteri(M,i.TEXTURE_WRAP_R,Y[_.wrapR]),i.texParameteri(M,i.TEXTURE_MAG_FILTER,de[_.magFilter]),i.texParameteri(M,i.TEXTURE_MIN_FILTER,de[_.minFilter])):(i.texParameteri(M,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(M,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(M===i.TEXTURE_3D||M===i.TEXTURE_2D_ARRAY)&&i.texParameteri(M,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(_.wrapS!==1001||_.wrapT!==1001)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(M,i.TEXTURE_MAG_FILTER,T(_.magFilter)),i.texParameteri(M,i.TEXTURE_MIN_FILTER,T(_.minFilter)),_.minFilter!==1003&&_.minFilter!==1006&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),_.compareFunction&&(i.texParameteri(M,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(M,i.TEXTURE_COMPARE_FUNC,pe[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const te=e.get("EXT_texture_filter_anisotropic");if(_.magFilter===1003||_.minFilter!==1005&&_.minFilter!==1008||_.type===1015&&e.has("OES_texture_float_linear")===!1||n===!1&&_.type===1016&&e.has("OES_texture_half_float_linear")===!1)return;(_.anisotropy>1||r.get(_).__currentAnisotropy)&&(i.texParameterf(M,te.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),r.get(_).__currentAnisotropy=_.anisotropy)}}function Ce(M,_){let D=!1;M.__webglInit===void 0&&(M.__webglInit=!0,_.addEventListener("dispose",B));const te=_.source;let K=m.get(te);K===void 0&&(K={},m.set(te,K));const Q=j(_);if(Q!==M.__cacheKey){K[Q]===void 0&&(K[Q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,D=!0),K[Q].usedTimes++;const ue=K[M.__cacheKey];ue!==void 0&&(K[M.__cacheKey].usedTimes--,ue.usedTimes===0&&L(_)),M.__cacheKey=Q,M.__webglTexture=K[Q].texture}return D}function Se(M,_,D){let te=i.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(te=i.TEXTURE_2D_ARRAY),_.isData3DTexture&&(te=i.TEXTURE_3D);const K=Ce(M,_),Q=_.source;t.bindTexture(te,M.__webglTexture,i.TEXTURE0+D);const ue=r.get(Q);if(Q.version!==ue.__version||K===!0){t.activeTexture(i.TEXTURE0+D);const se=Ve.getPrimaries(Ve.workingColorSpace),oe=_.colorSpace===Nt?null:Ve.getPrimaries(_.colorSpace),ye=_.colorSpace===Nt||se===oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);const ke=S(_)&&w(_.image)===!1;let ie=E(_.image,ke,!1,h);ie=mt(_,ie);const je=w(ie)||n,we=a.convert(_.format,_.colorSpace);let Me=a.convert(_.type),_e=G(_.internalFormat,we,Me,_.colorSpace,_.isVideoTexture);me(te,_,je);let ce;const Fe=_.mipmaps,R=n&&_.isVideoTexture!==!0&&_e!==36196,le=ue.__version===void 0||K===!0,Z=x(_,ie,je);if(_.isDepthTexture)_e=i.DEPTH_COMPONENT,n?_.type===1015?_e=i.DEPTH_COMPONENT32F:_.type===1014?_e=i.DEPTH_COMPONENT24:_.type===1020?_e=i.DEPTH24_STENCIL8:_e=i.DEPTH_COMPONENT16:_.type===1015&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),_.format===1026&&_e===i.DEPTH_COMPONENT&&_.type!==1012&&_.type!==1014&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),_.type=1014,Me=a.convert(_.type)),_.format===1027&&_e===i.DEPTH_COMPONENT&&(_e=i.DEPTH_STENCIL,_.type!==1020&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),_.type=1020,Me=a.convert(_.type))),le&&(R?t.texStorage2D(i.TEXTURE_2D,1,_e,ie.width,ie.height):t.texImage2D(i.TEXTURE_2D,0,_e,ie.width,ie.height,0,we,Me,null));else if(_.isDataTexture)if(Fe.length>0&&je){R&&le&&t.texStorage2D(i.TEXTURE_2D,Z,_e,Fe[0].width,Fe[0].height);for(let k=0,re=Fe.length;k<re;k++)ce=Fe[k],R?t.texSubImage2D(i.TEXTURE_2D,k,0,0,ce.width,ce.height,we,Me,ce.data):t.texImage2D(i.TEXTURE_2D,k,_e,ce.width,ce.height,0,we,Me,ce.data);_.generateMipmaps=!1}else R?(le&&t.texStorage2D(i.TEXTURE_2D,Z,_e,ie.width,ie.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,ie.width,ie.height,we,Me,ie.data)):t.texImage2D(i.TEXTURE_2D,0,_e,ie.width,ie.height,0,we,Me,ie.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){R&&le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Z,_e,Fe[0].width,Fe[0].height,ie.depth);for(let k=0,re=Fe.length;k<re;k++)ce=Fe[k],_.format!==1023?we!==null?R?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,k,0,0,0,ce.width,ce.height,ie.depth,we,ce.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,k,_e,ce.width,ce.height,ie.depth,0,ce.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):R?t.texSubImage3D(i.TEXTURE_2D_ARRAY,k,0,0,0,ce.width,ce.height,ie.depth,we,Me,ce.data):t.texImage3D(i.TEXTURE_2D_ARRAY,k,_e,ce.width,ce.height,ie.depth,0,we,Me,ce.data)}else{R&&le&&t.texStorage2D(i.TEXTURE_2D,Z,_e,Fe[0].width,Fe[0].height);for(let k=0,re=Fe.length;k<re;k++)ce=Fe[k],_.format!==1023?we!==null?R?t.compressedTexSubImage2D(i.TEXTURE_2D,k,0,0,ce.width,ce.height,we,ce.data):t.compressedTexImage2D(i.TEXTURE_2D,k,_e,ce.width,ce.height,0,ce.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):R?t.texSubImage2D(i.TEXTURE_2D,k,0,0,ce.width,ce.height,we,Me,ce.data):t.texImage2D(i.TEXTURE_2D,k,_e,ce.width,ce.height,0,we,Me,ce.data)}else if(_.isDataArrayTexture)R?(le&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Z,_e,ie.width,ie.height,ie.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,we,Me,ie.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,_e,ie.width,ie.height,ie.depth,0,we,Me,ie.data);else if(_.isData3DTexture)R?(le&&t.texStorage3D(i.TEXTURE_3D,Z,_e,ie.width,ie.height,ie.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,we,Me,ie.data)):t.texImage3D(i.TEXTURE_3D,0,_e,ie.width,ie.height,ie.depth,0,we,Me,ie.data);else if(_.isFramebufferTexture){if(le)if(R)t.texStorage2D(i.TEXTURE_2D,Z,_e,ie.width,ie.height);else{let k=ie.width,re=ie.height;for(let fe=0;fe<Z;fe++)t.texImage2D(i.TEXTURE_2D,fe,_e,k,re,0,we,Me,null),k>>=1,re>>=1}}else if(Fe.length>0&&je){R&&le&&t.texStorage2D(i.TEXTURE_2D,Z,_e,Fe[0].width,Fe[0].height);for(let k=0,re=Fe.length;k<re;k++)ce=Fe[k],R?t.texSubImage2D(i.TEXTURE_2D,k,0,0,we,Me,ce):t.texImage2D(i.TEXTURE_2D,k,_e,we,Me,ce);_.generateMipmaps=!1}else R?(le&&t.texStorage2D(i.TEXTURE_2D,Z,_e,ie.width,ie.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,we,Me,ie)):t.texImage2D(i.TEXTURE_2D,0,_e,we,Me,ie);A(_,je)&&C(te),ue.__version=Q.version,_.onUpdate&&_.onUpdate(_)}M.__version=_.version}function be(M,_,D){if(_.image.length!==6)return;const te=Ce(M,_),K=_.source;t.bindTexture(i.TEXTURE_CUBE_MAP,M.__webglTexture,i.TEXTURE0+D);const Q=r.get(K);if(K.version!==Q.__version||te===!0){t.activeTexture(i.TEXTURE0+D);const ue=Ve.getPrimaries(Ve.workingColorSpace),se=_.colorSpace===Nt?null:Ve.getPrimaries(_.colorSpace),oe=_.colorSpace===Nt||ue===se?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,_.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,_.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,oe);const ye=_.isCompressedTexture||_.image[0].isCompressedTexture,ke=_.image[0]&&_.image[0].isDataTexture,ie=[];for(let k=0;k<6;k++)!ye&&!ke?ie[k]=E(_.image[k],!1,!0,c):ie[k]=ke?_.image[k].image:_.image[k],ie[k]=mt(_,ie[k]);const je=ie[0],we=w(je)||n,Me=a.convert(_.format,_.colorSpace),_e=a.convert(_.type),ce=G(_.internalFormat,Me,_e,_.colorSpace),Fe=n&&_.isVideoTexture!==!0,R=Q.__version===void 0||te===!0;let le=x(_,je,we);me(i.TEXTURE_CUBE_MAP,_,we);let Z;if(ye){Fe&&R&&t.texStorage2D(i.TEXTURE_CUBE_MAP,le,ce,je.width,je.height);for(let k=0;k<6;k++){Z=ie[k].mipmaps;for(let re=0;re<Z.length;re++){const fe=Z[re];_.format!==1023?Me!==null?Fe?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re,0,0,fe.width,fe.height,Me,fe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re,ce,fe.width,fe.height,0,fe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Fe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re,0,0,fe.width,fe.height,Me,_e,fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re,ce,fe.width,fe.height,0,Me,_e,fe.data)}}}else{Z=_.mipmaps,Fe&&R&&(Z.length>0&&le++,t.texStorage2D(i.TEXTURE_CUBE_MAP,le,ce,ie[0].width,ie[0].height));for(let k=0;k<6;k++)if(ke){Fe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,0,0,ie[k].width,ie[k].height,Me,_e,ie[k].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,ce,ie[k].width,ie[k].height,0,Me,_e,ie[k].data);for(let re=0;re<Z.length;re++){const fe=Z[re].image[k].image;Fe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re+1,0,0,fe.width,fe.height,Me,_e,fe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re+1,ce,fe.width,fe.height,0,Me,_e,fe.data)}}else{Fe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,0,0,Me,_e,ie[k]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,0,ce,Me,_e,ie[k]);for(let re=0;re<Z.length;re++){const fe=Z[re];Fe?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re+1,0,0,Me,_e,fe.image[k]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+k,re+1,ce,Me,_e,fe.image[k])}}}A(_,we)&&C(i.TEXTURE_CUBE_MAP),Q.__version=K.version,_.onUpdate&&_.onUpdate(_)}M.__version=_.version}function Le(M,_,D,te,K,Q){const ue=a.convert(D.format,D.colorSpace),se=a.convert(D.type),oe=G(D.internalFormat,ue,se,D.colorSpace);if(!r.get(_).__hasExternalTextures){const ye=Math.max(1,_.width>>Q),ke=Math.max(1,_.height>>Q);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?t.texImage3D(K,Q,oe,ye,ke,_.depth,0,ue,se,null):t.texImage2D(K,Q,oe,ye,ke,0,ue,se,null)}t.bindFramebuffer(i.FRAMEBUFFER,M),Xe(_)?u.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,K,r.get(D).__webglTexture,0,Ae(_)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,te,K,r.get(D).__webglTexture,Q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function O(M,_,D){if(i.bindRenderbuffer(i.RENDERBUFFER,M),_.depthBuffer&&!_.stencilBuffer){let te=n===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(D||Xe(_)){const K=_.depthTexture;K&&K.isDepthTexture&&(K.type===1015?te=i.DEPTH_COMPONENT32F:K.type===1014&&(te=i.DEPTH_COMPONENT24));const Q=Ae(_);Xe(_)?u.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Q,te,_.width,_.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,Q,te,_.width,_.height)}else i.renderbufferStorage(i.RENDERBUFFER,te,_.width,_.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,M)}else if(_.depthBuffer&&_.stencilBuffer){const te=Ae(_);D&&Xe(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,te,i.DEPTH24_STENCIL8,_.width,_.height):Xe(_)?u.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,te,i.DEPTH24_STENCIL8,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,_.width,_.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,M)}else{const te=_.isWebGLMultipleRenderTargets===!0?_.texture:[_.texture];for(let K=0;K<te.length;K++){const Q=te[K],ue=a.convert(Q.format,Q.colorSpace),se=a.convert(Q.type),oe=G(Q.internalFormat,ue,se,Q.colorSpace),ye=Ae(_);D&&Xe(_)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,ye,oe,_.width,_.height):Xe(_)?u.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ye,oe,_.width,_.height):i.renderbufferStorage(i.RENDERBUFFER,oe,_.width,_.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function St(M,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,M),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!r.get(_.depthTexture).__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),q(_.depthTexture,0);const D=r.get(_.depthTexture).__webglTexture,te=Ae(_);if(_.depthTexture.format===1026)Xe(_)?u.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,D,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,D,0);else if(_.depthTexture.format===1027)Xe(_)?u.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,D,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,D,0);else throw new Error("Unknown depthTexture format")}function ve(M){const _=r.get(M),D=M.isWebGLCubeRenderTarget===!0;if(M.depthTexture&&!_.__autoAllocateDepthBuffer){if(D)throw new Error("target.depthTexture not supported in Cube render targets");St(_.__webglFramebuffer,M)}else if(D){_.__webglDepthbuffer=[];for(let te=0;te<6;te++)t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer[te]),_.__webglDepthbuffer[te]=i.createRenderbuffer(),O(_.__webglDepthbuffer[te],M,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer=i.createRenderbuffer(),O(_.__webglDepthbuffer,M,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ne(M,_,D){const te=r.get(M);_!==void 0&&Le(te.__webglFramebuffer,M,M.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),D!==void 0&&ve(M)}function Ee(M){const _=M.texture,D=r.get(M),te=r.get(_);M.addEventListener("dispose",W),M.isWebGLMultipleRenderTargets!==!0&&(te.__webglTexture===void 0&&(te.__webglTexture=i.createTexture()),te.__version=_.version,o.memory.textures++);const K=M.isWebGLCubeRenderTarget===!0,Q=M.isWebGLMultipleRenderTargets===!0,ue=w(M)||n;if(K){D.__webglFramebuffer=[];for(let se=0;se<6;se++)if(n&&_.mipmaps&&_.mipmaps.length>0){D.__webglFramebuffer[se]=[];for(let oe=0;oe<_.mipmaps.length;oe++)D.__webglFramebuffer[se][oe]=i.createFramebuffer()}else D.__webglFramebuffer[se]=i.createFramebuffer()}else{if(n&&_.mipmaps&&_.mipmaps.length>0){D.__webglFramebuffer=[];for(let se=0;se<_.mipmaps.length;se++)D.__webglFramebuffer[se]=i.createFramebuffer()}else D.__webglFramebuffer=i.createFramebuffer();if(Q)if(s.drawBuffers){const se=M.texture;for(let oe=0,ye=se.length;oe<ye;oe++){const ke=r.get(se[oe]);ke.__webglTexture===void 0&&(ke.__webglTexture=i.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(n&&M.samples>0&&Xe(M)===!1){const se=Q?_:[_];D.__webglMultisampledFramebuffer=i.createFramebuffer(),D.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,D.__webglMultisampledFramebuffer);for(let oe=0;oe<se.length;oe++){const ye=se[oe];D.__webglColorRenderbuffer[oe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,D.__webglColorRenderbuffer[oe]);const ke=a.convert(ye.format,ye.colorSpace),ie=a.convert(ye.type),je=G(ye.internalFormat,ke,ie,ye.colorSpace,M.isXRRenderTarget===!0),we=Ae(M);i.renderbufferStorageMultisample(i.RENDERBUFFER,we,je,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+oe,i.RENDERBUFFER,D.__webglColorRenderbuffer[oe])}i.bindRenderbuffer(i.RENDERBUFFER,null),M.depthBuffer&&(D.__webglDepthRenderbuffer=i.createRenderbuffer(),O(D.__webglDepthRenderbuffer,M,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(K){t.bindTexture(i.TEXTURE_CUBE_MAP,te.__webglTexture),me(i.TEXTURE_CUBE_MAP,_,ue);for(let se=0;se<6;se++)if(n&&_.mipmaps&&_.mipmaps.length>0)for(let oe=0;oe<_.mipmaps.length;oe++)Le(D.__webglFramebuffer[se][oe],M,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,oe);else Le(D.__webglFramebuffer[se],M,_,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0);A(_,ue)&&C(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Q){const se=M.texture;for(let oe=0,ye=se.length;oe<ye;oe++){const ke=se[oe],ie=r.get(ke);t.bindTexture(i.TEXTURE_2D,ie.__webglTexture),me(i.TEXTURE_2D,ke,ue),Le(D.__webglFramebuffer,M,ke,i.COLOR_ATTACHMENT0+oe,i.TEXTURE_2D,0),A(ke,ue)&&C(i.TEXTURE_2D)}t.unbindTexture()}else{let se=i.TEXTURE_2D;if((M.isWebGL3DRenderTarget||M.isWebGLArrayRenderTarget)&&(n?se=M.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(se,te.__webglTexture),me(se,_,ue),n&&_.mipmaps&&_.mipmaps.length>0)for(let oe=0;oe<_.mipmaps.length;oe++)Le(D.__webglFramebuffer[oe],M,_,i.COLOR_ATTACHMENT0,se,oe);else Le(D.__webglFramebuffer,M,_,i.COLOR_ATTACHMENT0,se,0);A(_,ue)&&C(se),t.unbindTexture()}M.depthBuffer&&ve(M)}function Je(M){const _=w(M)||n,D=M.isWebGLMultipleRenderTargets===!0?M.texture:[M.texture];for(let te=0,K=D.length;te<K;te++){const Q=D[te];if(A(Q,_)){const ue=M.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,se=r.get(Q).__webglTexture;t.bindTexture(ue,se),C(ue),t.unbindTexture()}}}function Ie(M){if(n&&M.samples>0&&Xe(M)===!1){const _=M.isWebGLMultipleRenderTargets?M.texture:[M.texture],D=M.width,te=M.height;let K=i.COLOR_BUFFER_BIT;const Q=[],ue=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,se=r.get(M),oe=M.isWebGLMultipleRenderTargets===!0;if(oe)for(let ye=0;ye<_.length;ye++)t.bindFramebuffer(i.FRAMEBUFFER,se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,se.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,se.__webglFramebuffer);for(let ye=0;ye<_.length;ye++){Q.push(i.COLOR_ATTACHMENT0+ye),M.depthBuffer&&Q.push(ue);const ke=se.__ignoreDepthValues!==void 0?se.__ignoreDepthValues:!1;if(ke===!1&&(M.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),M.stencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),oe&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,se.__webglColorRenderbuffer[ye]),ke===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[ue]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[ue])),oe){const ie=r.get(_[ye]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,ie,0)}i.blitFramebuffer(0,0,D,te,0,0,D,te,K,i.NEAREST),f&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Q)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),oe)for(let ye=0;ye<_.length;ye++){t.bindFramebuffer(i.FRAMEBUFFER,se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.RENDERBUFFER,se.__webglColorRenderbuffer[ye]);const ke=r.get(_[ye]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ye,i.TEXTURE_2D,ke,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,se.__webglMultisampledFramebuffer)}}function Ae(M){return Math.min(p,M.samples)}function Xe(M){const _=r.get(M);return n&&M.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function ft(M){const _=o.render.frame;v.get(M)!==_&&(v.set(M,_),M.update())}function mt(M,_){const D=M.colorSpace,te=M.format,K=M.type;return M.isCompressedTexture===!0||M.isVideoTexture===!0||M.format===1035||D!==Zt&&D!==Nt&&(Ve.getTransfer(D)===Ze?n===!1?e.has("EXT_sRGB")===!0&&te===1023?(M.format=1035,M.minFilter=1006,M.generateMipmaps=!1):_=dn.sRGBToLinear(_):(te!==1023||K!==1009)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",D)),_}this.allocateTextureUnit=ee,this.resetTextureUnits=V,this.setTexture2D=q,this.setTexture2DArray=J,this.setTexture3D=he,this.setTextureCube=z,this.rebindTextures=Ne,this.setupRenderTarget=Ee,this.updateRenderTargetMipmap=Je,this.updateMultisampleRenderTarget=Ie,this.setupDepthRenderbuffer=ve,this.setupFrameBufferTexture=Le,this.useMultisampledRTT=Xe}function Qf(i,e,t){const r=t.isWebGL2;function s(a,o=Nt){let n;const l=Ve.getTransfer(o);if(a===1009)return i.UNSIGNED_BYTE;if(a===1017)return i.UNSIGNED_SHORT_4_4_4_4;if(a===1018)return i.UNSIGNED_SHORT_5_5_5_1;if(a===1010)return i.BYTE;if(a===1011)return i.SHORT;if(a===1012)return i.UNSIGNED_SHORT;if(a===1013)return i.INT;if(a===1014)return i.UNSIGNED_INT;if(a===1015)return i.FLOAT;if(a===1016)return r?i.HALF_FLOAT:(n=e.get("OES_texture_half_float"),n!==null?n.HALF_FLOAT_OES:null);if(a===1021)return i.ALPHA;if(a===1023)return i.RGBA;if(a===1024)return i.LUMINANCE;if(a===1025)return i.LUMINANCE_ALPHA;if(a===1026)return i.DEPTH_COMPONENT;if(a===1027)return i.DEPTH_STENCIL;if(a===1035)return n=e.get("EXT_sRGB"),n!==null?n.SRGB_ALPHA_EXT:null;if(a===1028)return i.RED;if(a===1029)return i.RED_INTEGER;if(a===1030)return i.RG;if(a===1031)return i.RG_INTEGER;if(a===1033)return i.RGBA_INTEGER;if(a===33776||a===33777||a===33778||a===33779)if(l===Ze)if(n=e.get("WEBGL_compressed_texture_s3tc_srgb"),n!==null){if(a===33776)return n.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(a===33777)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(a===33778)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(a===33779)return n.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(n=e.get("WEBGL_compressed_texture_s3tc"),n!==null){if(a===33776)return n.COMPRESSED_RGB_S3TC_DXT1_EXT;if(a===33777)return n.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(a===33778)return n.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(a===33779)return n.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(a===35840||a===35841||a===35842||a===35843)if(n=e.get("WEBGL_compressed_texture_pvrtc"),n!==null){if(a===35840)return n.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(a===35841)return n.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(a===35842)return n.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(a===35843)return n.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(a===36196)return n=e.get("WEBGL_compressed_texture_etc1"),n!==null?n.COMPRESSED_RGB_ETC1_WEBGL:null;if(a===37492||a===37496)if(n=e.get("WEBGL_compressed_texture_etc"),n!==null){if(a===37492)return l===Ze?n.COMPRESSED_SRGB8_ETC2:n.COMPRESSED_RGB8_ETC2;if(a===37496)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:n.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(a===37808||a===37809||a===37810||a===37811||a===37812||a===37813||a===37814||a===37815||a===37816||a===37817||a===37818||a===37819||a===37820||a===37821)if(n=e.get("WEBGL_compressed_texture_astc"),n!==null){if(a===37808)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:n.COMPRESSED_RGBA_ASTC_4x4_KHR;if(a===37809)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:n.COMPRESSED_RGBA_ASTC_5x4_KHR;if(a===37810)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:n.COMPRESSED_RGBA_ASTC_5x5_KHR;if(a===37811)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:n.COMPRESSED_RGBA_ASTC_6x5_KHR;if(a===37812)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:n.COMPRESSED_RGBA_ASTC_6x6_KHR;if(a===37813)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:n.COMPRESSED_RGBA_ASTC_8x5_KHR;if(a===37814)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:n.COMPRESSED_RGBA_ASTC_8x6_KHR;if(a===37815)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:n.COMPRESSED_RGBA_ASTC_8x8_KHR;if(a===37816)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:n.COMPRESSED_RGBA_ASTC_10x5_KHR;if(a===37817)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:n.COMPRESSED_RGBA_ASTC_10x6_KHR;if(a===37818)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:n.COMPRESSED_RGBA_ASTC_10x8_KHR;if(a===37819)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:n.COMPRESSED_RGBA_ASTC_10x10_KHR;if(a===37820)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:n.COMPRESSED_RGBA_ASTC_12x10_KHR;if(a===37821)return l===Ze?n.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:n.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(a===36492||a===36494||a===36495)if(n=e.get("EXT_texture_compression_bptc"),n!==null){if(a===36492)return l===Ze?n.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:n.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(a===36494)return n.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(a===36495)return n.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(a===36283||a===36284||a===36285||a===36286)if(n=e.get("EXT_texture_compression_rgtc"),n!==null){if(a===36492)return n.COMPRESSED_RED_RGTC1_EXT;if(a===36284)return n.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(a===36285)return n.COMPRESSED_RED_GREEN_RGTC2_EXT;if(a===36286)return n.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return a===1020?r?i.UNSIGNED_INT_24_8:(n=e.get("WEBGL_depth_texture"),n!==null?n.UNSIGNED_INT_24_8_WEBGL:null):i[a]!==void 0?i[a]:null}return{convert:s}}class em extends zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class lr extends Pt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const tm={type:"move"};class ga{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new lr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new lr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new lr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const r of e.hand.values())this._getHandJoint(t,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,r){let s=null,a=null,o=null;const n=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const g of e.hand.values()){const m=t.getJointPose(g,r),d=this._getHandJoint(c,g);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],p=c.joints["thumb-tip"],u=h.position.distanceTo(p.position),f=.02,v=.005;c.inputState.pinching&&u>f+v?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-v&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(a=t.getPose(e.gripSpace,r),a!==null&&(l.matrix.fromArray(a.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,a.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(a.linearVelocity)):l.hasLinearVelocity=!1,a.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(a.angularVelocity)):l.hasAngularVelocity=!1));n!==null&&(s=t.getPose(e.targetRaySpace,r),s===null&&a!==null&&(s=a),s!==null&&(n.matrix.fromArray(s.transform.matrix),n.matrix.decompose(n.position,n.rotation,n.scale),n.matrixWorldNeedsUpdate=!0,s.linearVelocity?(n.hasLinearVelocity=!0,n.linearVelocity.copy(s.linearVelocity)):n.hasLinearVelocity=!1,s.angularVelocity?(n.hasAngularVelocity=!0,n.angularVelocity.copy(s.angularVelocity)):n.hasAngularVelocity=!1,this.dispatchEvent(tm)))}return n!==null&&(n.visible=s!==null),l!==null&&(l.visible=a!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const r=new lr;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[t.jointName]=r,e.add(r)}return e.joints[t.jointName]}}class im extends zi{constructor(e,t){super();const r=this;let s=null,a=1,o=null,n="local-floor",l=1,c=null,h=null,p=null,u=null,f=null,v=null;const g=t.getContextAttributes();let m=null,d=null;const b=[],E=[],w=new He;let S=null;const A=new zt;A.layers.enable(1),A.viewport=new dt;const C=new zt;C.layers.enable(2),C.viewport=new dt;const G=[A,C],x=new em;x.layers.enable(1),x.layers.enable(2);let T=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(z){let Y=b[z];return Y===void 0&&(Y=new ga,b[z]=Y),Y.getTargetRaySpace()},this.getControllerGrip=function(z){let Y=b[z];return Y===void 0&&(Y=new ga,b[z]=Y),Y.getGripSpace()},this.getHand=function(z){let Y=b[z];return Y===void 0&&(Y=new ga,b[z]=Y),Y.getHandSpace()};function W(z){const Y=E.indexOf(z.inputSource);if(Y===-1)return;const de=b[Y];de!==void 0&&(de.update(z.inputSource,z.frame,c||o),de.dispatchEvent({type:z.type,data:z.inputSource}))}function $(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",L);for(let z=0;z<b.length;z++){const Y=E[z];Y!==null&&(E[z]=null,b[z].disconnect(Y))}T=null,B=null,e.setRenderTarget(m),f=null,u=null,p=null,s=null,d=null,he.stop(),r.isPresenting=!1,e.setPixelRatio(S),e.setSize(w.width,w.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(z){a=z,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(z){n=z,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(z){c=z},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return p},this.getFrame=function(){return v},this.getSession=function(){return s},this.setSession=function(z){return Vr(this,null,function*(){if(s=z,s!==null){if(m=e.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",$),s.addEventListener("inputsourceschange",L),g.xrCompatible!==!0&&(yield t.makeXRCompatible()),S=e.getPixelRatio(),e.getSize(w),s.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const Y={antialias:s.renderState.layers===void 0?g.antialias:!0,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:a};f=new XRWebGLLayer(s,t,Y),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),d=new pi(f.framebufferWidth,f.framebufferHeight,{format:1023,type:1009,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let Y=null,de=null,pe=null;g.depth&&(pe=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Y=g.stencil?1027:1026,de=g.stencil?1020:1014);const me={colorFormat:t.RGBA8,depthFormat:pe,scaleFactor:a};p=new XRWebGLBinding(s,t),u=p.createProjectionLayer(me),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),d=new pi(u.textureWidth,u.textureHeight,{format:1023,type:1009,depthTexture:new Gn(u.textureWidth,u.textureHeight,de,void 0,void 0,void 0,void 0,void 0,void 0,Y),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0});const Ce=e.properties.get(d);Ce.__ignoreDepthValues=u.ignoreDepthValues}d.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=yield s.requestReferenceSpace(n),he.setContext(s),he.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}})},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function L(z){for(let Y=0;Y<z.removed.length;Y++){const de=z.removed[Y],pe=E.indexOf(de);pe>=0&&(E[pe]=null,b[pe].disconnect(de))}for(let Y=0;Y<z.added.length;Y++){const de=z.added[Y];let pe=E.indexOf(de);if(pe===-1){for(let Ce=0;Ce<b.length;Ce++)if(Ce>=E.length){E.push(de),pe=Ce;break}else if(E[Ce]===null){E[Ce]=de,pe=Ce;break}if(pe===-1)break}const me=b[pe];me&&me.connect(de)}}const H=new U,X=new U;function V(z,Y,de){H.setFromMatrixPosition(Y.matrixWorld),X.setFromMatrixPosition(de.matrixWorld);const pe=H.distanceTo(X),me=Y.projectionMatrix.elements,Ce=de.projectionMatrix.elements,Se=me[14]/(me[10]-1),be=me[14]/(me[10]+1),Le=(me[9]+1)/me[5],O=(me[9]-1)/me[5],St=(me[8]-1)/me[0],ve=(Ce[8]+1)/Ce[0],Ne=Se*St,Ee=Se*ve,Je=pe/(-St+ve),Ie=Je*-St;Y.matrixWorld.decompose(z.position,z.quaternion,z.scale),z.translateX(Ie),z.translateZ(Je),z.matrixWorld.compose(z.position,z.quaternion,z.scale),z.matrixWorldInverse.copy(z.matrixWorld).invert();const Ae=Se+Je,Xe=be+Je,ft=Ne-Ie,mt=Ee+(pe-Ie),M=Le*be/Xe*Ae,_=O*be/Xe*Ae;z.projectionMatrix.makePerspective(ft,mt,M,_,Ae,Xe),z.projectionMatrixInverse.copy(z.projectionMatrix).invert()}function ee(z,Y){Y===null?z.matrixWorld.copy(z.matrix):z.matrixWorld.multiplyMatrices(Y.matrixWorld,z.matrix),z.matrixWorldInverse.copy(z.matrixWorld).invert()}this.updateCamera=function(z){if(s===null)return;x.near=C.near=A.near=z.near,x.far=C.far=A.far=z.far,(T!==x.near||B!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),T=x.near,B=x.far);const Y=z.parent,de=x.cameras;ee(x,Y);for(let pe=0;pe<de.length;pe++)ee(de[pe],Y);de.length===2?V(x,A,C):x.projectionMatrix.copy(A.projectionMatrix),j(z,x,Y)};function j(z,Y,de){de===null?z.matrix.copy(Y.matrixWorld):(z.matrix.copy(de.matrixWorld),z.matrix.invert(),z.matrix.multiply(Y.matrixWorld)),z.matrix.decompose(z.position,z.quaternion,z.scale),z.updateMatrixWorld(!0),z.projectionMatrix.copy(Y.projectionMatrix),z.projectionMatrixInverse.copy(Y.projectionMatrixInverse),z.isPerspectiveCamera&&(z.fov=pr*2*Math.atan(1/z.projectionMatrix.elements[5]),z.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(z){l=z,u!==null&&(u.fixedFoveation=z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=z)};let q=null;function J(z,Y){if(h=Y.getViewerPose(c||o),v=Y,h!==null){const de=h.views;f!==null&&(e.setRenderTargetFramebuffer(d,f.framebuffer),e.setRenderTarget(d));let pe=!1;de.length!==x.cameras.length&&(x.cameras.length=0,pe=!0);for(let me=0;me<de.length;me++){const Ce=de[me];let Se=null;if(f!==null)Se=f.getViewport(Ce);else{const Le=p.getViewSubImage(u,Ce);Se=Le.viewport,me===0&&(e.setRenderTargetTextures(d,Le.colorTexture,u.ignoreDepthValues?void 0:Le.depthStencilTexture),e.setRenderTarget(d))}let be=G[me];be===void 0&&(be=new zt,be.layers.enable(me),be.viewport=new dt,G[me]=be),be.matrix.fromArray(Ce.transform.matrix),be.matrix.decompose(be.position,be.quaternion,be.scale),be.projectionMatrix.fromArray(Ce.projectionMatrix),be.projectionMatrixInverse.copy(be.projectionMatrix).invert(),be.viewport.set(Se.x,Se.y,Se.width,Se.height),me===0&&(x.matrix.copy(be.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),pe===!0&&x.cameras.push(be)}}for(let de=0;de<b.length;de++){const pe=E[de],me=b[de];pe!==null&&me!==void 0&&me.update(pe,Y,c||o)}q&&q(z,Y),Y.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:Y}),v=null}const he=new On;he.setAnimationLoop(J),this.setAnimationLoop=function(z){q=z},this.dispose=function(){}}}function rm(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function r(m,d){d.color.getRGB(m.fogColor.value,Un(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,b,E,w){d.isMeshBasicMaterial||d.isMeshLambertMaterial?a(m,d):d.isMeshToonMaterial?(a(m,d),p(m,d)):d.isMeshPhongMaterial?(a(m,d),h(m,d)):d.isMeshStandardMaterial?(a(m,d),u(m,d),d.isMeshPhysicalMaterial&&f(m,d,w)):d.isMeshMatcapMaterial?(a(m,d),v(m,d)):d.isMeshDepthMaterial?a(m,d):d.isMeshDistanceMaterial?(a(m,d),g(m,d)):d.isMeshNormalMaterial?a(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&n(m,d)):d.isPointsMaterial?l(m,d,b,E):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function a(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===1&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===1&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const b=e.get(d).envMap;if(b&&(m.envMap.value=b,m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap){m.lightMap.value=d.lightMap;const E=i._useLegacyLights===!0?Math.PI:1;m.lightMapIntensity.value=d.lightMapIntensity*E,t(d.lightMap,m.lightMapTransform)}d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function n(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,b,E){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*b,m.scale.value=E*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function p(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function u(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),e.get(d).envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,b){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===1&&m.clearcoatNormalScale.value.negate())),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,d){d.matcap&&(m.matcap.value=d.matcap)}function g(m,d){const b=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:s}}function sm(i,e,t,r){let s={},a={},o=[];const n=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(b,E){const w=E.program;r.uniformBlockBinding(b,w)}function c(b,E){let w=s[b.id];w===void 0&&(v(b),w=h(b),s[b.id]=w,b.addEventListener("dispose",m));const S=E.program;r.updateUBOMapping(b,S);const A=e.render.frame;a[b.id]!==A&&(u(b),a[b.id]=A)}function h(b){const E=p();b.__bindingPointIndex=E;const w=i.createBuffer(),S=b.__size,A=b.usage;return i.bindBuffer(i.UNIFORM_BUFFER,w),i.bufferData(i.UNIFORM_BUFFER,S,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,w),w}function p(){for(let b=0;b<n;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(b){const E=s[b.id],w=b.uniforms,S=b.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let A=0,C=w.length;A<C;A++){const G=w[A];if(f(G,A,S)===!0){const x=G.__offset,T=Array.isArray(G.value)?G.value:[G.value];let B=0;for(let W=0;W<T.length;W++){const $=T[W],L=g($);typeof $=="number"?(G.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,x+B,G.__data)):$.isMatrix3?(G.__data[0]=$.elements[0],G.__data[1]=$.elements[1],G.__data[2]=$.elements[2],G.__data[3]=$.elements[0],G.__data[4]=$.elements[3],G.__data[5]=$.elements[4],G.__data[6]=$.elements[5],G.__data[7]=$.elements[0],G.__data[8]=$.elements[6],G.__data[9]=$.elements[7],G.__data[10]=$.elements[8],G.__data[11]=$.elements[0]):($.toArray(G.__data,B),B+=L.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,x,G.__data)}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(b,E,w){const S=b.value;if(w[E]===void 0){if(typeof S=="number")w[E]=S;else{const A=Array.isArray(S)?S:[S],C=[];for(let G=0;G<A.length;G++)C.push(A[G].clone());w[E]=C}return!0}else if(typeof S=="number"){if(w[E]!==S)return w[E]=S,!0}else{const A=Array.isArray(w[E])?w[E]:[w[E]],C=Array.isArray(S)?S:[S];for(let G=0;G<A.length;G++){const x=A[G];if(x.equals(C[G])===!1)return x.copy(C[G]),!0}}return!1}function v(b){const E=b.uniforms;let w=0;const S=16;let A=0;for(let C=0,G=E.length;C<G;C++){const x=E[C],T={boundary:0,storage:0},B=Array.isArray(x.value)?x.value:[x.value];for(let W=0,$=B.length;W<$;W++){const L=B[W],H=g(L);T.boundary+=H.boundary,T.storage+=H.storage}if(x.__data=new Float32Array(T.storage/Float32Array.BYTES_PER_ELEMENT),x.__offset=w,C>0){A=w%S;const W=S-A;A!==0&&W-T.boundary<0&&(w+=S-A,x.__offset=w)}w+=T.storage}return A=w%S,A>0&&(w+=S-A),b.__size=w,b.__cache={},this}function g(b){const E={boundary:0,storage:0};return typeof b=="number"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),E}function m(b){const E=b.target;E.removeEventListener("dispose",m);const w=o.indexOf(E.__bindingPointIndex);o.splice(w,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete a[E.id]}function d(){for(const b in s)i.deleteBuffer(s[b]);o=[],s={},a={}}return{bind:l,update:c,dispose:d}}class ho{constructor(e={}){const{canvas:t=Qc(),context:r=null,depth:s=!0,stencil:a=!0,alpha:o=!1,antialias:n=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:p=!1}=e;this.isWebGLRenderer=!0;let u;r!==null?u=r.getContextAttributes().alpha:u=o;const f=new Uint32Array(4),v=new Int32Array(4);let g=null,m=null;const d=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=ct,this._useLegacyLights=!1,this.toneMapping=0,this.toneMappingExposure=1;const E=this;let w=!1,S=0,A=0,C=null,G=-1,x=null;const T=new dt,B=new dt;let W=null;const $=new Ge(0);let L=0,H=t.width,X=t.height,V=1,ee=null,j=null;const q=new dt(0,0,H,X),J=new dt(0,0,H,X);let he=!1;const z=new oa;let Y=!1,de=!1,pe=null;const me=new rt,Ce=new He,Se=new U,be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function Le(){return C===null?V:1}let O=r;function St(y,P){for(let N=0;N<y.length;N++){const F=y[N],I=t.getContext(F,P);if(I!==null)return I}return null}try{const y={alpha:!0,depth:s,stencil:a,antialias:n,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${gt}`),t.addEventListener("webglcontextlost",Fe,!1),t.addEventListener("webglcontextrestored",R,!1),t.addEventListener("webglcontextcreationerror",le,!1),O===null){const P=["webgl2","webgl","experimental-webgl"];if(E.isWebGL1Renderer===!0&&P.shift(),O=St(P,y),O===null)throw St(P)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&O instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),O.getShaderPrecisionFormat===void 0&&(O.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(y){throw console.error("THREE.WebGLRenderer: "+y.message),y}let ve,Ne,Ee,Je,Ie,Ae,Xe,ft,mt,M,_,D,te,K,Q,ue,se,oe,ye,ke,ie,je,we,Me;function _e(){ve=new fp(O),Ne=new op(O,ve,e),ve.init(Ne),je=new Qf(O,ve,Ne),Ee=new $f(O,ve,Ne),Je=new vp(O),Ie=new Ff,Ae=new Jf(O,ve,Ee,Ie,Ne,je,Je),Xe=new cp(E),ft=new pp(E),mt=new Th(O,Ne),we=new ap(O,ve,mt,Ne),M=new mp(O,mt,Je,we),_=new Ep(O,M,mt,Je),ye=new yp(O,Ne,Ae),ue=new lp(Ie),D=new Nf(E,Xe,ft,ve,Ne,we,ue),te=new rm(E,Ie),K=new Hf,Q=new Xf(ve,Ne),oe=new sp(E,Xe,ft,Ee,_,u,l),se=new Kf(E,_,Ne),Me=new sm(O,Je,Ne,Ee),ke=new np(O,ve,Je,Ne),ie=new gp(O,ve,Je,Ne),Je.programs=D.programs,E.capabilities=Ne,E.extensions=ve,E.properties=Ie,E.renderLists=K,E.shadowMap=se,E.state=Ee,E.info=Je}_e();const ce=new im(E,O);this.xr=ce,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const y=ve.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=ve.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(y){y!==void 0&&(V=y,this.setSize(H,X,!1))},this.getSize=function(y){return y.set(H,X)},this.setSize=function(y,P,N=!0){if(ce.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=y,X=P,t.width=Math.floor(y*V),t.height=Math.floor(P*V),N===!0&&(t.style.width=y+"px",t.style.height=P+"px"),this.setViewport(0,0,y,P)},this.getDrawingBufferSize=function(y){return y.set(H*V,X*V).floor()},this.setDrawingBufferSize=function(y,P,N){H=y,X=P,V=N,t.width=Math.floor(y*N),t.height=Math.floor(P*N),this.setViewport(0,0,y,P)},this.getCurrentViewport=function(y){return y.copy(T)},this.getViewport=function(y){return y.copy(q)},this.setViewport=function(y,P,N,F){y.isVector4?q.set(y.x,y.y,y.z,y.w):q.set(y,P,N,F),Ee.viewport(T.copy(q).multiplyScalar(V).floor())},this.getScissor=function(y){return y.copy(J)},this.setScissor=function(y,P,N,F){y.isVector4?J.set(y.x,y.y,y.z,y.w):J.set(y,P,N,F),Ee.scissor(B.copy(J).multiplyScalar(V).floor())},this.getScissorTest=function(){return he},this.setScissorTest=function(y){Ee.setScissorTest(he=y)},this.setOpaqueSort=function(y){ee=y},this.setTransparentSort=function(y){j=y},this.getClearColor=function(y){return y.copy(oe.getClearColor())},this.setClearColor=function(){oe.setClearColor.apply(oe,arguments)},this.getClearAlpha=function(){return oe.getClearAlpha()},this.setClearAlpha=function(){oe.setClearAlpha.apply(oe,arguments)},this.clear=function(y=!0,P=!0,N=!0){let F=0;if(y){let I=!1;if(C!==null){const ae=C.texture.format;I=ae===1033||ae===1031||ae===1029}if(I){const ae=C.texture.type,ge=ae===1009||ae===1014||ae===1012||ae===1020||ae===1017||ae===1018,xe=oe.getClearColor(),Te=oe.getClearAlpha(),ze=xe.r,Pe=xe.g,Ue=xe.b;ge?(f[0]=ze,f[1]=Pe,f[2]=Ue,f[3]=Te,O.clearBufferuiv(O.COLOR,0,f)):(v[0]=ze,v[1]=Pe,v[2]=Ue,v[3]=Te,O.clearBufferiv(O.COLOR,0,v))}else F|=O.COLOR_BUFFER_BIT}P&&(F|=O.DEPTH_BUFFER_BIT),N&&(F|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O.clear(F)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Fe,!1),t.removeEventListener("webglcontextrestored",R,!1),t.removeEventListener("webglcontextcreationerror",le,!1),K.dispose(),Q.dispose(),Ie.dispose(),Xe.dispose(),ft.dispose(),_.dispose(),we.dispose(),Me.dispose(),D.dispose(),ce.dispose(),ce.removeEventListener("sessionstart",Bt),ce.removeEventListener("sessionend",qe),pe&&(pe.dispose(),pe=null),wt.stop()};function Fe(y){y.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function R(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const y=Je.autoReset,P=se.enabled,N=se.autoUpdate,F=se.needsUpdate,I=se.type;_e(),Je.autoReset=y,se.enabled=P,se.autoUpdate=N,se.needsUpdate=F,se.type=I}function le(y){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function Z(y){const P=y.target;P.removeEventListener("dispose",Z),k(P)}function k(y){re(y),Ie.remove(y)}function re(y){const P=Ie.get(y).programs;P!==void 0&&(P.forEach(function(N){D.releaseProgram(N)}),y.isShaderMaterial&&D.releaseShaderCache(y))}this.renderBufferDirect=function(y,P,N,F,I,ae){P===null&&(P=be);const ge=I.isMesh&&I.matrixWorld.determinant()<0,xe=yg(y,P,N,F,I);Ee.setMaterial(F,ge);let Te=N.index,ze=1;if(F.wireframe===!0){if(Te=M.getWireframeAttribute(N),Te===void 0)return;ze=2}const Pe=N.drawRange,Ue=N.attributes.position;let yt=Pe.start*ze,nt=(Pe.start+Pe.count)*ze;ae!==null&&(yt=Math.max(yt,ae.start*ze),nt=Math.min(nt,(ae.start+ae.count)*ze)),Te!==null?(yt=Math.max(yt,0),nt=Math.min(nt,Te.count)):Ue!=null&&(yt=Math.max(yt,0),nt=Math.min(nt,Ue.count));const kt=nt-yt;if(kt<0||kt===1/0)return;we.setup(I,F,xe,N,Te);let di,Qe=ke;if(Te!==null&&(di=mt.get(Te),Qe=ie,Qe.setIndex(di)),I.isMesh)F.wireframe===!0?(Ee.setLineWidth(F.wireframeLinewidth*Le()),Qe.setMode(O.LINES)):Qe.setMode(O.TRIANGLES);else if(I.isLine){let Oe=F.linewidth;Oe===void 0&&(Oe=1),Ee.setLineWidth(Oe*Le()),I.isLineSegments?Qe.setMode(O.LINES):I.isLineLoop?Qe.setMode(O.LINE_LOOP):Qe.setMode(O.LINE_STRIP)}else I.isPoints?Qe.setMode(O.POINTS):I.isSprite&&Qe.setMode(O.TRIANGLES);if(I.isBatchedMesh)Qe.renderMultiDraw(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount);else if(I.isInstancedMesh)Qe.renderInstances(yt,kt,I.count);else if(N.isInstancedBufferGeometry){const Oe=N._maxInstanceCount!==void 0?N._maxInstanceCount:1/0,Xa=Math.min(N.instanceCount,Oe);Qe.renderInstances(yt,kt,Xa)}else Qe.render(yt,kt)};function fe(y,P,N){y.transparent===!0&&y.side===2&&y.forceSinglePass===!1?(y.side=1,y.needsUpdate=!0,Fs(y,P,N),y.side=0,y.needsUpdate=!0,Fs(y,P,N),y.side=2):Fs(y,P,N)}this.compile=function(y,P,N=null){N===null&&(N=y),m=Q.get(N),m.init(),b.push(m),N.traverseVisible(function(I){I.isLight&&I.layers.test(P.layers)&&(m.pushLight(I),I.castShadow&&m.pushShadow(I))}),y!==N&&y.traverseVisible(function(I){I.isLight&&I.layers.test(P.layers)&&(m.pushLight(I),I.castShadow&&m.pushShadow(I))}),m.setupLights(E._useLegacyLights);const F=new Set;return y.traverse(function(I){const ae=I.material;if(ae)if(Array.isArray(ae))for(let ge=0;ge<ae.length;ge++){const xe=ae[ge];fe(xe,N,I),F.add(xe)}else fe(ae,N,I),F.add(ae)}),b.pop(),m=null,F},this.compileAsync=function(y,P,N=null){const F=this.compile(y,P,N);return new Promise(I=>{function ae(){if(F.forEach(function(ge){Ie.get(ge).currentProgram.isReady()&&F.delete(ge)}),F.size===0){I(y);return}setTimeout(ae,10)}ve.get("KHR_parallel_shader_compile")!==null?ae():setTimeout(ae,10)})};let Ye=null;function tt(y){Ye&&Ye(y)}function Bt(){wt.stop()}function qe(){wt.start()}const wt=new On;wt.setAnimationLoop(tt),typeof self<"u"&&wt.setContext(self),this.setAnimationLoop=function(y){Ye=y,ce.setAnimationLoop(y),y===null?wt.stop():wt.start()},ce.addEventListener("sessionstart",Bt),ce.addEventListener("sessionend",qe),this.render=function(y,P){if(P!==void 0&&P.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),P.parent===null&&P.matrixWorldAutoUpdate===!0&&P.updateMatrixWorld(),ce.enabled===!0&&ce.isPresenting===!0&&(ce.cameraAutoUpdate===!0&&ce.updateCamera(P),P=ce.getCamera()),y.isScene===!0&&y.onBeforeRender(E,y,P,C),m=Q.get(y,b.length),m.init(),b.push(m),me.multiplyMatrices(P.projectionMatrix,P.matrixWorldInverse),z.setFromProjectionMatrix(me),de=this.localClippingEnabled,Y=ue.init(this.clippingPlanes,de),g=K.get(y,d.length),g.init(),d.push(g),ti(y,P,0,E.sortObjects),g.finish(),E.sortObjects===!0&&g.sort(ee,j),this.info.render.frame++,Y===!0&&ue.beginShadows();const N=m.state.shadowsArray;if(se.render(N,y,P),Y===!0&&ue.endShadows(),this.info.autoReset===!0&&this.info.reset(),oe.render(g,y),m.setupLights(E._useLegacyLights),P.isArrayCamera){const F=P.cameras;for(let I=0,ae=F.length;I<ae;I++){const ge=F[I];Zl(g,y,ge,ge.viewport)}}else Zl(g,y,P);C!==null&&(Ae.updateMultisampleRenderTarget(C),Ae.updateRenderTargetMipmap(C)),y.isScene===!0&&y.onAfterRender(E,y,P),we.resetDefaultState(),G=-1,x=null,b.pop(),b.length>0?m=b[b.length-1]:m=null,d.pop(),d.length>0?g=d[d.length-1]:g=null};function ti(y,P,N,F){if(y.visible===!1)return;if(y.layers.test(P.layers)){if(y.isGroup)N=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(P);else if(y.isLight)m.pushLight(y),y.castShadow&&m.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||z.intersectsSprite(y)){F&&Se.setFromMatrixPosition(y.matrixWorld).applyMatrix4(me);const ae=_.update(y),ge=y.material;ge.visible&&g.push(y,ae,ge,N,Se.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||z.intersectsObject(y))){const ae=_.update(y),ge=y.material;if(F&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Se.copy(y.boundingSphere.center)):(ae.boundingSphere===null&&ae.computeBoundingSphere(),Se.copy(ae.boundingSphere.center)),Se.applyMatrix4(y.matrixWorld).applyMatrix4(me)),Array.isArray(ge)){const xe=ae.groups;for(let Te=0,ze=xe.length;Te<ze;Te++){const Pe=xe[Te],Ue=ge[Pe.materialIndex];Ue&&Ue.visible&&g.push(y,ae,Ue,N,Se.z,Pe)}}else ge.visible&&g.push(y,ae,ge,N,Se.z,null)}}const I=y.children;for(let ae=0,ge=I.length;ae<ge;ae++)ti(I[ae],P,N,F)}function Zl(y,P,N,F){const I=y.opaque,ae=y.transmissive,ge=y.transparent;m.setupLightsView(N),Y===!0&&ue.setGlobalState(E.clippingPlanes,N),ae.length>0&&xg(I,ae,P,N),F&&Ee.viewport(T.copy(F)),I.length>0&&Ns(I,P,N),ae.length>0&&Ns(ae,P,N),ge.length>0&&Ns(ge,P,N),Ee.buffers.depth.setTest(!0),Ee.buffers.depth.setMask(!0),Ee.buffers.color.setMask(!0),Ee.setPolygonOffset(!1)}function xg(y,P,N,F){if((N.isScene===!0?N.overrideMaterial:null)!==null)return;const I=Ne.isWebGL2;pe===null&&(pe=new pi(1,1,{generateMipmaps:!0,type:ve.has("EXT_color_buffer_half_float")?1016:1009,minFilter:1008,samples:I?4:0})),E.getDrawingBufferSize(Ce),I?pe.setSize(Ce.x,Ce.y):pe.setSize(Zr(Ce.x),Zr(Ce.y));const ae=E.getRenderTarget();E.setRenderTarget(pe),E.getClearColor($),L=E.getClearAlpha(),L<1&&E.setClearColor(16777215,.5),E.clear();const ge=E.toneMapping;E.toneMapping=0,Ns(y,N,F),Ae.updateMultisampleRenderTarget(pe),Ae.updateRenderTargetMipmap(pe);let xe=!1;for(let Te=0,ze=P.length;Te<ze;Te++){const Pe=P[Te],Ue=Pe.object,yt=Pe.geometry,nt=Pe.material,kt=Pe.group;if(nt.side===2&&Ue.layers.test(F.layers)){const di=nt.side;nt.side=1,nt.needsUpdate=!0,Kl(Ue,N,F,yt,nt,kt),nt.side=di,nt.needsUpdate=!0,xe=!0}}xe===!0&&(Ae.updateMultisampleRenderTarget(pe),Ae.updateRenderTargetMipmap(pe)),E.setRenderTarget(ae),E.setClearColor($,L),E.toneMapping=ge}function Ns(y,P,N){const F=P.isScene===!0?P.overrideMaterial:null;for(let I=0,ae=y.length;I<ae;I++){const ge=y[I],xe=ge.object,Te=ge.geometry,ze=F===null?ge.material:F,Pe=ge.group;xe.layers.test(N.layers)&&Kl(xe,P,N,Te,ze,Pe)}}function Kl(y,P,N,F,I,ae){y.onBeforeRender(E,P,N,F,I,ae),y.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),I.onBeforeRender(E,P,N,F,y,ae),I.transparent===!0&&I.side===2&&I.forceSinglePass===!1?(I.side=1,I.needsUpdate=!0,E.renderBufferDirect(N,P,F,I,y,ae),I.side=0,I.needsUpdate=!0,E.renderBufferDirect(N,P,F,I,y,ae),I.side=2):E.renderBufferDirect(N,P,F,I,y,ae),y.onAfterRender(E,P,N,F,I,ae)}function Fs(y,P,N){P.isScene!==!0&&(P=be);const F=Ie.get(y),I=m.state.lights,ae=m.state.shadowsArray,ge=I.state.version,xe=D.getParameters(y,I.state,ae,P,N),Te=D.getProgramCacheKey(xe);let ze=F.programs;F.environment=y.isMeshStandardMaterial?P.environment:null,F.fog=P.fog,F.envMap=(y.isMeshStandardMaterial?ft:Xe).get(y.envMap||F.environment),ze===void 0&&(y.addEventListener("dispose",Z),ze=new Map,F.programs=ze);let Pe=ze.get(Te);if(Pe!==void 0){if(F.currentProgram===Pe&&F.lightsStateVersion===ge)return Jl(y,xe),Pe}else xe.uniforms=D.getUniforms(y),y.onBuild(N,xe,E),y.onBeforeCompile(xe,E),Pe=D.acquireProgram(xe,Te),ze.set(Te,Pe),F.uniforms=xe.uniforms;const Ue=F.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Ue.clippingPlanes=ue.uniform),Jl(y,xe),F.needsLights=Mg(y),F.lightsStateVersion=ge,F.needsLights&&(Ue.ambientLightColor.value=I.state.ambient,Ue.lightProbe.value=I.state.probe,Ue.directionalLights.value=I.state.directional,Ue.directionalLightShadows.value=I.state.directionalShadow,Ue.spotLights.value=I.state.spot,Ue.spotLightShadows.value=I.state.spotShadow,Ue.rectAreaLights.value=I.state.rectArea,Ue.ltc_1.value=I.state.rectAreaLTC1,Ue.ltc_2.value=I.state.rectAreaLTC2,Ue.pointLights.value=I.state.point,Ue.pointLightShadows.value=I.state.pointShadow,Ue.hemisphereLights.value=I.state.hemi,Ue.directionalShadowMap.value=I.state.directionalShadowMap,Ue.directionalShadowMatrix.value=I.state.directionalShadowMatrix,Ue.spotShadowMap.value=I.state.spotShadowMap,Ue.spotLightMatrix.value=I.state.spotLightMatrix,Ue.spotLightMap.value=I.state.spotLightMap,Ue.pointShadowMap.value=I.state.pointShadowMap,Ue.pointShadowMatrix.value=I.state.pointShadowMatrix),F.currentProgram=Pe,F.uniformsList=null,Pe}function $l(y){if(y.uniformsList===null){const P=y.currentProgram.getUniforms();y.uniformsList=ys.seqWithValue(P.seq,y.uniforms)}return y.uniformsList}function Jl(y,P){const N=Ie.get(y);N.outputColorSpace=P.outputColorSpace,N.batching=P.batching,N.instancing=P.instancing,N.instancingColor=P.instancingColor,N.skinning=P.skinning,N.morphTargets=P.morphTargets,N.morphNormals=P.morphNormals,N.morphColors=P.morphColors,N.morphTargetsCount=P.morphTargetsCount,N.numClippingPlanes=P.numClippingPlanes,N.numIntersection=P.numClipIntersection,N.vertexAlphas=P.vertexAlphas,N.vertexTangents=P.vertexTangents,N.toneMapping=P.toneMapping}function yg(y,P,N,F,I){P.isScene!==!0&&(P=be),Ae.resetTextureUnits();const ae=P.fog,ge=F.isMeshStandardMaterial?P.environment:null,xe=C===null?E.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Zt,Te=(F.isMeshStandardMaterial?ft:Xe).get(F.envMap||ge),ze=F.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,Pe=!!N.attributes.tangent&&(!!F.normalMap||F.anisotropy>0),Ue=!!N.morphAttributes.position,yt=!!N.morphAttributes.normal,nt=!!N.morphAttributes.color;let kt=0;F.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(kt=E.toneMapping);const di=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,Qe=di!==void 0?di.length:0,Oe=Ie.get(F),Xa=m.state.lights;if(Y===!0&&(de===!0||y!==x)){const Vt=y===x&&F.id===G;ue.setState(F,y,Vt)}let ja=!1;F.version===Oe.__version?(Oe.needsLights&&Oe.lightsStateVersion!==Xa.state.version||Oe.outputColorSpace!==xe||I.isBatchedMesh&&Oe.batching===!1||!I.isBatchedMesh&&Oe.batching===!0||I.isInstancedMesh&&Oe.instancing===!1||!I.isInstancedMesh&&Oe.instancing===!0||I.isSkinnedMesh&&Oe.skinning===!1||!I.isSkinnedMesh&&Oe.skinning===!0||I.isInstancedMesh&&Oe.instancingColor===!0&&I.instanceColor===null||I.isInstancedMesh&&Oe.instancingColor===!1&&I.instanceColor!==null||Oe.envMap!==Te||F.fog===!0&&Oe.fog!==ae||Oe.numClippingPlanes!==void 0&&(Oe.numClippingPlanes!==ue.numPlanes||Oe.numIntersection!==ue.numIntersection)||Oe.vertexAlphas!==ze||Oe.vertexTangents!==Pe||Oe.morphTargets!==Ue||Oe.morphNormals!==yt||Oe.morphColors!==nt||Oe.toneMapping!==kt||Ne.isWebGL2===!0&&Oe.morphTargetsCount!==Qe)&&(ja=!0):(ja=!0,Oe.__version=F.version);let Ni=Oe.currentProgram;ja===!0&&(Ni=Fs(F,P,I));let Ql=!1,kr=!1,Ya=!1;const Et=Ni.getUniforms(),Fi=Oe.uniforms;if(Ee.useProgram(Ni.program)&&(Ql=!0,kr=!0,Ya=!0),F.id!==G&&(G=F.id,kr=!0),Ql||x!==y){Et.setValue(O,"projectionMatrix",y.projectionMatrix),Et.setValue(O,"viewMatrix",y.matrixWorldInverse);const Vt=Et.map.cameraPosition;Vt!==void 0&&Vt.setValue(O,Se.setFromMatrixPosition(y.matrixWorld)),Ne.logarithmicDepthBuffer&&Et.setValue(O,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(F.isMeshPhongMaterial||F.isMeshToonMaterial||F.isMeshLambertMaterial||F.isMeshBasicMaterial||F.isMeshStandardMaterial||F.isShaderMaterial)&&Et.setValue(O,"isOrthographic",y.isOrthographicCamera===!0),x!==y&&(x=y,kr=!0,Ya=!0)}if(I.isSkinnedMesh){Et.setOptional(O,I,"bindMatrix"),Et.setOptional(O,I,"bindMatrixInverse");const Vt=I.skeleton;Vt&&(Ne.floatVertexTextures?(Vt.boneTexture===null&&Vt.computeBoneTexture(),Et.setValue(O,"boneTexture",Vt.boneTexture,Ae)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}I.isBatchedMesh&&(Et.setOptional(O,I,"batchingTexture"),Et.setValue(O,"batchingTexture",I._matricesTexture,Ae));const qa=N.morphAttributes;if((qa.position!==void 0||qa.normal!==void 0||qa.color!==void 0&&Ne.isWebGL2===!0)&&ye.update(I,N,Ni),(kr||Oe.receiveShadow!==I.receiveShadow)&&(Oe.receiveShadow=I.receiveShadow,Et.setValue(O,"receiveShadow",I.receiveShadow)),F.isMeshGouraudMaterial&&F.envMap!==null&&(Fi.envMap.value=Te,Fi.flipEnvMap.value=Te.isCubeTexture&&Te.isRenderTargetTexture===!1?-1:1),kr&&(Et.setValue(O,"toneMappingExposure",E.toneMappingExposure),Oe.needsLights&&Eg(Fi,Ya),ae&&F.fog===!0&&te.refreshFogUniforms(Fi,ae),te.refreshMaterialUniforms(Fi,F,V,X,pe),ys.upload(O,$l(Oe),Fi,Ae)),F.isShaderMaterial&&F.uniformsNeedUpdate===!0&&(ys.upload(O,$l(Oe),Fi,Ae),F.uniformsNeedUpdate=!1),F.isSpriteMaterial&&Et.setValue(O,"center",I.center),Et.setValue(O,"modelViewMatrix",I.modelViewMatrix),Et.setValue(O,"normalMatrix",I.normalMatrix),Et.setValue(O,"modelMatrix",I.matrixWorld),F.isShaderMaterial||F.isRawShaderMaterial){const Vt=F.uniformsGroups;for(let Za=0,bg=Vt.length;Za<bg;Za++)if(Ne.isWebGL2){const ec=Vt[Za];Me.update(ec,Ni),Me.bind(ec,Ni)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Ni}function Eg(y,P){y.ambientLightColor.needsUpdate=P,y.lightProbe.needsUpdate=P,y.directionalLights.needsUpdate=P,y.directionalLightShadows.needsUpdate=P,y.pointLights.needsUpdate=P,y.pointLightShadows.needsUpdate=P,y.spotLights.needsUpdate=P,y.spotLightShadows.needsUpdate=P,y.rectAreaLights.needsUpdate=P,y.hemisphereLights.needsUpdate=P}function Mg(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(y,P,N){Ie.get(y.texture).__webglTexture=P,Ie.get(y.depthTexture).__webglTexture=N;const F=Ie.get(y);F.__hasExternalTextures=!0,F.__hasExternalTextures&&(F.__autoAllocateDepthBuffer=N===void 0,F.__autoAllocateDepthBuffer||ve.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),F.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(y,P){const N=Ie.get(y);N.__webglFramebuffer=P,N.__useDefaultFramebuffer=P===void 0},this.setRenderTarget=function(y,P=0,N=0){C=y,S=P,A=N;let F=!0,I=null,ae=!1,ge=!1;if(y){const xe=Ie.get(y);xe.__useDefaultFramebuffer!==void 0?(Ee.bindFramebuffer(O.FRAMEBUFFER,null),F=!1):xe.__webglFramebuffer===void 0?Ae.setupRenderTarget(y):xe.__hasExternalTextures&&Ae.rebindTextures(y,Ie.get(y.texture).__webglTexture,Ie.get(y.depthTexture).__webglTexture);const Te=y.texture;(Te.isData3DTexture||Te.isDataArrayTexture||Te.isCompressedArrayTexture)&&(ge=!0);const ze=Ie.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(ze[P])?I=ze[P][N]:I=ze[P],ae=!0):Ne.isWebGL2&&y.samples>0&&Ae.useMultisampledRTT(y)===!1?I=Ie.get(y).__webglMultisampledFramebuffer:Array.isArray(ze)?I=ze[N]:I=ze,T.copy(y.viewport),B.copy(y.scissor),W=y.scissorTest}else T.copy(q).multiplyScalar(V).floor(),B.copy(J).multiplyScalar(V).floor(),W=he;if(Ee.bindFramebuffer(O.FRAMEBUFFER,I)&&Ne.drawBuffers&&F&&Ee.drawBuffers(y,I),Ee.viewport(T),Ee.scissor(B),Ee.setScissorTest(W),ae){const xe=Ie.get(y.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+P,xe.__webglTexture,N)}else if(ge){const xe=Ie.get(y.texture),Te=P||0;O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,xe.__webglTexture,N||0,Te)}G=-1},this.readRenderTargetPixels=function(y,P,N,F,I,ae,ge){if(!(y&&y.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xe=Ie.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ge!==void 0&&(xe=xe[ge]),xe){Ee.bindFramebuffer(O.FRAMEBUFFER,xe);try{const Te=y.texture,ze=Te.format,Pe=Te.type;if(ze!==1023&&je.convert(ze)!==O.getParameter(O.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Ue=Pe===1016&&(ve.has("EXT_color_buffer_half_float")||Ne.isWebGL2&&ve.has("EXT_color_buffer_float"));if(Pe!==1009&&je.convert(Pe)!==O.getParameter(O.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Pe===1015&&(Ne.isWebGL2||ve.has("OES_texture_float")||ve.has("WEBGL_color_buffer_float")))&&!Ue){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}P>=0&&P<=y.width-F&&N>=0&&N<=y.height-I&&O.readPixels(P,N,F,I,je.convert(ze),je.convert(Pe),ae)}finally{const Te=C!==null?Ie.get(C).__webglFramebuffer:null;Ee.bindFramebuffer(O.FRAMEBUFFER,Te)}}},this.copyFramebufferToTexture=function(y,P,N=0){const F=Math.pow(2,-N),I=Math.floor(P.image.width*F),ae=Math.floor(P.image.height*F);Ae.setTexture2D(P,0),O.copyTexSubImage2D(O.TEXTURE_2D,N,0,0,y.x,y.y,I,ae),Ee.unbindTexture()},this.copyTextureToTexture=function(y,P,N,F=0){const I=P.image.width,ae=P.image.height,ge=je.convert(N.format),xe=je.convert(N.type);Ae.setTexture2D(N,0),O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,N.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,N.unpackAlignment),P.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,F,y.x,y.y,I,ae,ge,xe,P.image.data):P.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,F,y.x,y.y,P.mipmaps[0].width,P.mipmaps[0].height,ge,P.mipmaps[0].data):O.texSubImage2D(O.TEXTURE_2D,F,y.x,y.y,ge,xe,P.image),F===0&&N.generateMipmaps&&O.generateMipmap(O.TEXTURE_2D),Ee.unbindTexture()},this.copyTextureToTexture3D=function(y,P,N,F,I=0){if(E.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const ae=y.max.x-y.min.x+1,ge=y.max.y-y.min.y+1,xe=y.max.z-y.min.z+1,Te=je.convert(F.format),ze=je.convert(F.type);let Pe;if(F.isData3DTexture)Ae.setTexture3D(F,0),Pe=O.TEXTURE_3D;else if(F.isDataArrayTexture)Ae.setTexture2DArray(F,0),Pe=O.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,F.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,F.unpackAlignment);const Ue=O.getParameter(O.UNPACK_ROW_LENGTH),yt=O.getParameter(O.UNPACK_IMAGE_HEIGHT),nt=O.getParameter(O.UNPACK_SKIP_PIXELS),kt=O.getParameter(O.UNPACK_SKIP_ROWS),di=O.getParameter(O.UNPACK_SKIP_IMAGES),Qe=N.isCompressedTexture?N.mipmaps[0]:N.image;O.pixelStorei(O.UNPACK_ROW_LENGTH,Qe.width),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Qe.height),O.pixelStorei(O.UNPACK_SKIP_PIXELS,y.min.x),O.pixelStorei(O.UNPACK_SKIP_ROWS,y.min.y),O.pixelStorei(O.UNPACK_SKIP_IMAGES,y.min.z),N.isDataTexture||N.isData3DTexture?O.texSubImage3D(Pe,I,P.x,P.y,P.z,ae,ge,xe,Te,ze,Qe.data):N.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),O.compressedTexSubImage3D(Pe,I,P.x,P.y,P.z,ae,ge,xe,Te,Qe.data)):O.texSubImage3D(Pe,I,P.x,P.y,P.z,ae,ge,xe,Te,ze,Qe),O.pixelStorei(O.UNPACK_ROW_LENGTH,Ue),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,yt),O.pixelStorei(O.UNPACK_SKIP_PIXELS,nt),O.pixelStorei(O.UNPACK_SKIP_ROWS,kt),O.pixelStorei(O.UNPACK_SKIP_IMAGES,di),I===0&&F.generateMipmaps&&O.generateMipmap(Pe),Ee.unbindTexture()},this.initTexture=function(y){y.isCubeTexture?Ae.setTextureCube(y,0):y.isData3DTexture?Ae.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Ae.setTexture2DArray(y,0):Ae.setTexture2D(y,0),Ee.unbindTexture()},this.resetState=function(){S=0,A=0,C=null,Ee.reset(),we.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return 2e3}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===Hs?"display-p3":"srgb",t.unpackColorSpace=Ve.workingColorSpace===Xr?"display-p3":"srgb"}get physicallyCorrectLights(){return console.warn("THREE.WebGLRenderer: The property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."),!this.useLegacyLights}set physicallyCorrectLights(e){console.warn("THREE.WebGLRenderer: The property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."),this.useLegacyLights=!e}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===ct?3001:3e3}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===3001?ct:Zt}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class am extends ho{}am.prototype.isWebGL1Renderer=!0;class uo extends Pt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class nm{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const r=this.getUtoTmapping(e);return this.getPoint(r,t)}getPoints(e=5){const t=[];for(let r=0;r<=e;r++)t.push(this.getPoint(r/e));return t}getSpacedPoints(e=5){const t=[];for(let r=0;r<=e;r++)t.push(this.getPointAt(r/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let r,s=this.getPoint(0),a=0;t.push(0);for(let o=1;o<=e;o++)r=this.getPoint(o/e),a+=r.distanceTo(s),t.push(a),s=r;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const r=this.getLengths();let s=0;const a=r.length;let o;t?o=t:o=e*r[a-1];let n=0,l=a-1,c;for(;n<=l;)if(s=Math.floor(n+(l-n)/2),c=r[s]-o,c<0)n=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,r[s]===o)return s/(a-1);const h=r[s],p=r[s+1]-h,u=(o-h)/p;return(s+u)/(a-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const a=this.getPoint(r),o=this.getPoint(s),n=t||(a.isVector2?new He:new U);return n.copy(o).sub(a).normalize(),n}getTangentAt(e,t){const r=this.getUtoTmapping(e);return this.getTangent(r,t)}computeFrenetFrames(e,t){const r=new U,s=[],a=[],o=[],n=new U,l=new rt;for(let f=0;f<=e;f++){const v=f/e;s[f]=this.getTangentAt(v,new U)}a[0]=new U,o[0]=new U;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),p=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,r.set(1,0,0)),p<=c&&(c=p,r.set(0,1,0)),u<=c&&r.set(0,0,1),n.crossVectors(s[0],r).normalize(),a[0].crossVectors(s[0],n),o[0].crossVectors(s[0],a[0]);for(let f=1;f<=e;f++){if(a[f]=a[f-1].clone(),o[f]=o[f-1].clone(),n.crossVectors(s[f-1],s[f]),n.length()>Number.EPSILON){n.normalize();const v=Math.acos(ht(s[f-1].dot(s[f]),-1,1));a[f].applyMatrix4(l.makeRotationAxis(n,v))}o[f].crossVectors(s[f],a[f])}if(t===!0){let f=Math.acos(ht(a[0].dot(a[e]),-1,1));f/=e,s[0].dot(n.crossVectors(a[0],a[e]))>0&&(f=-f);for(let v=1;v<=e;v++)a[v].applyMatrix4(l.makeRotationAxis(s[v],f*v)),o[v].crossVectors(s[v],a[v])}return{tangents:s,normals:a,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}function po(i,e,t,r,s){const a=(r-e)*.5,o=(s-t)*.5,n=i*i,l=i*n;return(2*t-2*r+a+o)*l+(-3*t+3*r-2*a-o)*n+a*i+t}class om extends nm{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new He){const r=t,s=this.points,a=(s.length-1)*e,o=Math.floor(a),n=a-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],p=s[o>s.length-3?s.length-1:o+2];return r.set(po(n,l.x,c.x,h.x,p.x),po(n,l.y,c.y,h.y,p.y)),r}copy(e){super.copy(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,r=this.points.length;t<r;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,r=e.points.length;t<r;t++){const s=e.points[t];this.points.push(new He().fromArray(s))}return this}}class va extends xi{constructor(e=1,t=32,r=16,s=0,a=Math.PI*2,o=0,n=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:r,phiStart:s,phiLength:a,thetaStart:o,thetaLength:n},t=Math.max(3,Math.floor(t)),r=Math.max(2,Math.floor(r));const l=Math.min(o+n,Math.PI);let c=0;const h=[],p=new U,u=new U,f=[],v=[],g=[],m=[];for(let d=0;d<=r;d++){const b=[],E=d/r;let w=0;d===0&&o===0?w=.5/t:d===r&&l===Math.PI&&(w=-.5/t);for(let S=0;S<=t;S++){const A=S/t;p.x=-e*Math.cos(s+A*a)*Math.sin(o+E*n),p.y=e*Math.cos(o+E*n),p.z=e*Math.sin(s+A*a)*Math.sin(o+E*n),v.push(p.x,p.y,p.z),u.copy(p).normalize(),g.push(u.x,u.y,u.z),m.push(A+w,1-E),b.push(c++)}h.push(b)}for(let d=0;d<r;d++)for(let b=0;b<t;b++){const E=h[d][b+1],w=h[d][b],S=h[d+1][b],A=h[d+1][b+1];(d!==0||o>0)&&f.push(E,w,A),(d!==r-1||l<Math.PI)&&f.push(w,S,A)}this.setIndex(f),this.setAttribute("position",new $t(v,3)),this.setAttribute("normal",new $t(g,3)),this.setAttribute("uv",new $t(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new va(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}const Ii={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};class lm{constructor(e,t,r){const s=this;let a=!1,o=0,n=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=r,this.itemStart=function(h){n++,a===!1&&s.onStart!==void 0&&s.onStart(h,o,n),a=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,n),o===n&&(a=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,p){return c.push(h,p),this},this.removeHandler=function(h){const p=c.indexOf(h);return p!==-1&&c.splice(p,2),this},this.getHandler=function(h){for(let p=0,u=c.length;p<u;p+=2){const f=c[p],v=c[p+1];if(f.global&&(f.lastIndex=0),f.test(h))return v}return null}}}const cm=new lm;let _a=class{constructor(i){this.manager=i!==void 0?i:cm,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(i,e){const t=this;return new Promise(function(r,s){t.load(i,r,e,s)})}parse(){}setCrossOrigin(i){return this.crossOrigin=i,this}setWithCredentials(i){return this.withCredentials=i,this}setPath(i){return this.path=i,this}setResourcePath(i){return this.resourcePath=i,this}setRequestHeader(i){return this.requestHeader=i,this}};_a.DEFAULT_MATERIAL_NAME="__DEFAULT";const li={};class hm extends Error{constructor(e,t){super(e),this.response=t}}class dm extends _a{constructor(e){super(e)}load(e,t,r,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const a=Ii.get(e);if(a!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(a),this.manager.itemEnd(e)},0),a;if(li[e]!==void 0){li[e].push({onLoad:t,onProgress:r,onError:s});return}li[e]=[],li[e].push({onLoad:t,onProgress:r,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),n=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=li[e],p=c.body.getReader(),u=c.headers.get("Content-Length")||c.headers.get("X-File-Size"),f=u?parseInt(u):0,v=f!==0;let g=0;const m=new ReadableStream({start(d){b();function b(){p.read().then(({done:E,value:w})=>{if(E)d.close();else{g+=w.byteLength;const S=new ProgressEvent("progress",{lengthComputable:v,loaded:g,total:f});for(let A=0,C=h.length;A<C;A++){const G=h[A];G.onProgress&&G.onProgress(S)}d.enqueue(w),b()}})}}});return new Response(m)}else throw new hm(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,n));case"json":return c.json();default:if(n===void 0)return c.text();{const h=/charset="?([^;"\s]*)"?/i.exec(n),p=h&&h[1]?h[1].toLowerCase():void 0,u=new TextDecoder(p);return c.arrayBuffer().then(f=>u.decode(f))}}}).then(c=>{Ii.add(e,c);const h=li[e];delete li[e];for(let p=0,u=h.length;p<u;p++){const f=h[p];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=li[e];if(h===void 0)throw this.manager.itemError(e),c;delete li[e];for(let p=0,u=h.length;p<u;p++){const f=h[p];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class um extends _a{constructor(e){super(e)}load(e,t,r,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const a=this,o=Ii.get(e);if(o!==void 0)return a.manager.itemStart(e),setTimeout(function(){t&&t(o),a.manager.itemEnd(e)},0),o;const n=mr("img");function l(){h(),Ii.add(e,this),t&&t(this),a.manager.itemEnd(e)}function c(p){h(),s&&s(p),a.manager.itemError(e),a.manager.itemEnd(e)}function h(){n.removeEventListener("load",l,!1),n.removeEventListener("error",c,!1)}return n.addEventListener("load",l,!1),n.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(n.crossOrigin=this.crossOrigin),a.manager.itemStart(e),n.src=e,n}}class pm{constructor(e,t,r=0,s=1/0){this.ray=new mn(e,t),this.near=r,this.far=s,this.camera=null,this.layers=new Js,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}intersectObject(e,t=!0,r=[]){return xa(e,this,r,t),r.sort(fo),r}intersectObjects(e,t=!0,r=[]){for(let s=0,a=e.length;s<a;s++)xa(e[s],this,r,t);return r.sort(fo),r}}function fo(i,e){return i.distance-e.distance}function xa(i,e,t,r){if(i.layers.test(e.layers)&&i.raycast(e,t),r===!0){const s=i.children;for(let a=0,o=s.length;a<o;a++)xa(s[a],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gt}})),typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gt);var fm=Object.defineProperty,ya=(i,e)=>{for(var t in e)fm(i,t,{get:e[t],enumerable:!0})},mm={};ya(mm,{ACTIONS:()=>Eo,ANIMATION_MIN_DURATION:()=>Ea,CAPTURE_EVENTS_CLASS:()=>Sr,CTRLZOOM_TIMEOUT:()=>yo,DBLCLICK_DELAY:()=>vo,DEFAULT_TRANSITION:()=>mo,EASINGS:()=>Es,ICONS:()=>Yt,IDS:()=>ut,INERTIA_WINDOW:()=>Ma,KEY_CODES:()=>lt,LONGTOUCH_DELAY:()=>_o,MOVE_THRESHOLD:()=>go,SPHERE_RADIUS:()=>Tr,TWOFINGERSOVERLAY_DELAY:()=>xo,VIEWER_DATA:()=>Ei});var gm=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 40 432 432"><g transform="rotate(0, 256, 256)"><path fill="currentColor" d="M425.23 210.55H227.39a5 5 0 01-3.53-8.53l56.56-56.57a45.5 45.5 0 000-64.28 45.15 45.15 0 00-32.13-13.3 45.15 45.15 0 00-32.14 13.3L41.32 256l174.83 174.83a45.15 45.15 0 0032.14 13.3 45.15 45.15 0 0032.13-13.3 45.5 45.5 0 000-64.28l-56.57-56.57a5 5 0 013.54-8.53h197.84c25.06 0 45.45-20.39 45.45-45.45s-20.4-45.45-45.45-45.45z"/></g><!-- Created by Flatart from the Noun Project --></svg>
`,vm='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="currentColor" transform=" translate(50, 50) rotate(45)"><rect x="-5" y="-65" width="10" height="130"/><rect x="-65" y="-5" width="130" height="10"/></g></svg>',_m=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M83.3 35.6h-17V3H32.2v32.6H16.6l33.6 32.7 33-32.7z"/><path fill="currentColor" d="M83.3 64.2v16.3H16.6V64.2H-.1v32.6H100V64.2H83.3z"/><!--Created by Michael Zenaty from the Noun Project--></svg>
`,xm=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M100 40H87.1V18.8h-21V6H100zM100 93.2H66V80.3h21.1v-21H100zM34 93.2H0v-34h12.9v21.1h21zM12.9 40H0V6h34v12.9H12.8z"/><!--Created by Garrett Knoll from the Noun Project--></svg>
`,ym=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M66 7h13v21h21v13H66zM66 60.3h34v12.9H79v21H66zM0 60.3h34v34H21V73.1H0zM21 7h13v34H0V28h21z"/><!--Created by Garrett Knoll from the Noun Project--></svg>
`,Em=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="currentColor" d="M28.3 26.1c-1 2.6-1.9 4.8-2.6 7-2.5 7.4-5 14.7-7.2 22-1.3 4.4.5 7.2 4.3 7.8 1.3.2 2.8.2 4.2-.1 8.2-2 11.9-8.6 15.7-15.2l-2.2 2a18.8 18.8 0 0 1-7.4 5.2 2 2 0 0 1-1.6-.2c-.2-.1 0-1 0-1.4l.8-1.8L41.9 28c.5-1.4.9-3 .7-4.4-.2-2.6-3-4.4-6.3-4.4-8.8.2-15 4.5-19.5 11.8-.2.3-.2.6-.3 1.3 3.7-2.8 6.8-6.1 11.8-6.2z"/><circle fill="currentColor" cx="39.3" cy="9.2" r="8.2"/><!--Created by Arafat Uddin from the Noun Project--></svg>
`,Mm=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 10 80 80"><g fill="currentColor"><circle r="10" cx="20" cy="20"/><circle r="10" cx="50" cy="20"/><circle r="10" cx="80" cy="20"/><circle r="10" cx="20" cy="50"/><circle r="10" cx="50" cy="50"/><circle r="10" cx="80" cy="50"/><circle r="10" cx="20" cy="80"/><circle r="10" cx="50" cy="80"/><circle r="10" cx="80" cy="80"/></g><!-- Created by Richard Kun\xE1k from the Noun Project--></svg>
`,bm=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M14.043 12.22a7.738 7.738 0 1 0-1.823 1.822l4.985 4.985c.503.504 1.32.504 1.822 0a1.285 1.285 0 0 0 0-1.822l-4.984-4.985zm-6.305 1.043a5.527 5.527 0 1 1 0-11.053 5.527 5.527 0 0 1 0 11.053z"/><path fill="currentColor" d="M8.728 4.009H6.744v2.737H4.006V8.73h2.738v2.736h1.984V8.73h2.737V6.746H8.728z"/><!--Created by Ryan Canning from the Noun Project--></svg>
`,Tm=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fill="currentColor" d="M14.043 12.22a7.738 7.738 0 1 0-1.823 1.822l4.985 4.985c.503.504 1.32.504 1.822 0a1.285 1.285 0 0 0 0-1.822l-4.984-4.985zm-6.305 1.043a5.527 5.527 0 1 1 0-11.053 5.527 5.527 0 0 1 0 11.053z"/><path fill="currentColor" d="M4.006 6.746h7.459V8.73H4.006z"/><!--Created by Ryan Canning from the Noun Project--></svg>
`,mo=1500,Ea=500,go=4,vo=300,_o=500,xo=100,yo=2e3,Ma=300,Tr=10,Ei="photoSphereViewer",Sr="psv--capture-event",Eo=(i=>(i.ROTATE_UP="ROTATE_UP",i.ROTATE_DOWN="ROTATE_DOWN",i.ROTATE_RIGHT="ROTATE_RIGHT",i.ROTATE_LEFT="ROTATE_LEFT",i.ZOOM_IN="ZOOM_IN",i.ZOOM_OUT="ZOOM_OUT",i))(Eo||{}),ut={MENU:"menu",TWO_FINGERS:"twoFingers",CTRL_ZOOM:"ctrlZoom",ERROR:"error",DESCRIPTION:"description"},lt={Enter:"Enter",Control:"Control",Escape:"Escape",Space:" ",PageUp:"PageUp",PageDown:"PageDown",ArrowLeft:"ArrowLeft",ArrowUp:"ArrowUp",ArrowRight:"ArrowRight",ArrowDown:"ArrowDown",Delete:"Delete",Plus:"+",Minus:"-"},Yt={arrow:gm,close:vm,download:_m,fullscreenIn:xm,fullscreenOut:ym,info:Em,menu:Mm,zoomIn:bm,zoomOut:Tm},Es={linear:i=>i,inQuad:i=>i*i,outQuad:i=>i*(2-i),inOutQuad:i=>i<.5?2*i*i:-1+(4-2*i)*i,inCubic:i=>i*i*i,outCubic:i=>--i*i*i+1,inOutCubic:i=>i<.5?4*i*i*i:(i-1)*(2*i-2)*(2*i-2)+1,inQuart:i=>i*i*i*i,outQuart:i=>1- --i*i*i*i,inOutQuart:i=>i<.5?8*i*i*i*i:1-8*--i*i*i*i,inQuint:i=>i*i*i*i*i,outQuint:i=>1+--i*i*i*i*i,inOutQuint:i=>i<.5?16*i*i*i*i*i:1+16*--i*i*i*i*i,inSine:i=>1-Math.cos(i*(Math.PI/2)),outSine:i=>Math.sin(i*(Math.PI/2)),inOutSine:i=>.5-.5*Math.cos(Math.PI*i),inExpo:i=>Math.pow(2,10*(i-1)),outExpo:i=>1-Math.pow(2,-10*i),inOutExpo:i=>(i=i*2-1)<0?.5*Math.pow(2,10*i):1-.5*Math.pow(2,-10*i),inCirc:i=>1-Math.sqrt(1-i*i),outCirc:i=>Math.sqrt(1-(i-1)*(i-1)),inOutCirc:i=>(i*=2)<1?.5-.5*Math.sqrt(1-i*i):.5+.5*Math.sqrt(1-(i-=2)*i)},Sm={};ya(Sm,{Animation:()=>Rr,Dynamic:()=>Rs,MultiDynamic:()=>Vo,PressHandler:()=>Cs,Slider:()=>Wo,SliderDirection:()=>Go,addClasses:()=>Ta,angle:()=>Mo,applyEulerInverse:()=>Ia,checkStylesheet:()=>ko,checkVersion:()=>Oa,cleanCssPosition:()=>zo,clone:()=>Ar,createTexture:()=>Da,cssPositionIsOrdered:()=>Pa,dasherize:()=>Lm,deepEqual:()=>Do,deepmerge:()=>Po,distance:()=>ba,exitFullscreen:()=>Lo,firstNonNull:()=>Qt,getAbortError:()=>La,getAngle:()=>To,getClosest:()=>Sa,getConfigParser:()=>As,getElement:()=>So,getPosition:()=>Ao,getShortestArc:()=>bo,getStyle:()=>Cm,getStyleProperty:()=>ci,getTouchData:()=>wa,getXMPValue:()=>ei,greatArcDistance:()=>Am,hasParent:()=>wo,invertResolvableBoolean:()=>bs,isAbortError:()=>Oo,isEmpty:()=>Uo,isExtendedPosition:()=>Ts,isFullscreenEnabled:()=>Ro,isNil:()=>Dt,isPlainObject:()=>Ra,logWarn:()=>Ke,parseAngle:()=>Mi,parsePoint:()=>Pm,parseSpeed:()=>Ho,removeClasses:()=>Rm,requestFullscreen:()=>Co,resolveBoolean:()=>Ca,speedToDuration:()=>Ua,sum:()=>wm,throttle:()=>Aa,toggleClass:()=>Ms,wrap:()=>wr});function wr(i,e){let t=i%e;return t<0&&(t+=e),t}function wm(i){return i.reduce((e,t)=>e+t,0)}function ba(i,e){return Math.sqrt(Math.pow(i.x-e.x,2)+Math.pow(i.y-e.y,2))}function Mo(i,e){return Math.atan2(e.y-i.y,e.x-i.x)}function bo(i,e){return[0,Math.PI*2,-Math.PI*2].reduce((t,r)=>{const s=e-i+r;return Math.abs(s)<Math.abs(t)?s:t},1/0)}function To(i,e){return Math.acos(Math.cos(i.pitch)*Math.cos(e.pitch)*Math.cos(i.yaw-e.yaw)+Math.sin(i.pitch)*Math.sin(e.pitch))}function Am([i,e],[t,r]){i-t>Math.PI?i-=2*Math.PI:i-t<-Math.PI&&(i+=2*Math.PI);const s=(t-i)*Math.cos((e+r)/2),a=r-e;return Math.sqrt(s*s+a*a)}function So(i){return typeof i=="string"?i.match(/^[a-z]/i)?document.getElementById(i):document.querySelector(i):i}function Ms(i,e,t){t===void 0?i.classList.toggle(e):t?i.classList.add(e):t||i.classList.remove(e)}function Ta(i,e){i.classList.add(...e.split(" "))}function Rm(i,e){i.classList.remove(...e.split(" "))}function wo(i,e){let t=i;do{if(t===e)return!0;t=t.parentElement}while(t);return!1}function Sa(i,e){if(!(i!=null&&i.matches))return null;let t=i;do{if(t.matches(e))return t;t=t.parentElement}while(t);return null}function Ao(i){let e=0,t=0,r=i;for(;r;)e+=r.offsetLeft-r.scrollLeft+r.clientLeft,t+=r.offsetTop-r.scrollTop+r.clientTop,r=r.offsetParent;return{x:e,y:t}}function Cm(i,e){return window.getComputedStyle(i,null)[e]}function ci(i,e){return window.getComputedStyle(i).getPropertyValue(e)}function wa(i){if(i.touches.length<2)return null;const e={x:i.touches[0].clientX,y:i.touches[0].clientY},t={x:i.touches[1].clientX,y:i.touches[1].clientY};return{distance:ba(e,t),angle:Mo(e,t),center:{x:(e.x+t.x)/2,y:(e.y+t.y)/2}}}function Ro(i){return(document.fullscreenElement||document.webkitFullscreenElement)===i}function Co(i){(i.requestFullscreen||i.webkitRequestFullscreen).call(i)}function Lo(){(document.exitFullscreen||document.webkitExitFullscreen).call(document)}function Lm(i){return i.replace(/[A-Z](?:(?=[^A-Z])|[A-Z]*(?=[A-Z][^A-Z]|$))/g,(e,t)=>(t>0?"-":"")+e.toLowerCase())}function Aa(i,e){let t=!1;return function(...r){t||(t=!0,setTimeout(()=>{i.apply(this,r),t=!1},e))}}function Ra(i){if(typeof i!="object"||i===null||Object.prototype.toString.call(i)!=="[object Object]")return!1;if(Object.getPrototypeOf(i)===null)return!0;let e=i;for(;Object.getPrototypeOf(e)!==null;)e=Object.getPrototypeOf(e);return Object.getPrototypeOf(i)===e}function Po(i,e){const t=e;return function r(s,a){return Array.isArray(a)?(!s||!Array.isArray(s)?s=[]:s.length=0,a.forEach((o,n)=>{s[n]=r(null,o)})):typeof a=="object"?((!s||Array.isArray(s))&&(s={}),Object.keys(a).forEach(o=>{typeof a[o]!="object"||!a[o]||!Ra(a[o])?s[o]=a[o]:a[o]!==t&&(s[o]?r(s[o],a[o]):s[o]=r(null,a[o]))})):s=a,s}(i,e)}function Ar(i){return Po(null,i)}function Uo(i){return!i||Object.keys(i).length===0&&i.constructor===Object}function Dt(i){return i==null}function Qt(...i){for(const e of i)if(!Dt(e))return e;return null}function Do(i,e){if(i===e)return!0;if(Io(i)&&Io(e)){if(Object.keys(i).length!==Object.keys(e).length)return!1;for(const t of Object.keys(i))if(!Do(i[t],e[t]))return!1;return!0}else return!1}function Io(i){return typeof i=="object"&&i!==null}var Be=class oc extends Error{constructor(e){var t;super(e),this.name="PSVError",(t=Error.captureStackTrace)==null||t.call(Error,this,oc)}};function Ca(i,e){Ra(i)?(e(i.initial,!0),i.promise.then(t=>e(t,!1))):e(i,!0)}function bs(i){return{initial:!i.initial,promise:i.promise.then(e=>!e)}}function La(){const i=new Error("Loading was aborted.");return i.name="AbortError",i}function Oo(i){return(i==null?void 0:i.name)==="AbortError"}function Ke(i){console.warn(`PhotoSphereViewer: ${i}`)}function Ts(i){return i?[["textureX","textureY"],["yaw","pitch"]].some(([e,t])=>i[e]!==void 0&&i[t]!==void 0):!1}function ei(i,e){let t=i.match("<GPano:"+e+">(.*)</GPano:"+e+">");if(t!==null){const r=parseInt(t[1],10);return isNaN(r)?null:r}if(t=i.match("GPano:"+e+'="(.*?)"'),t!==null){const r=parseInt(t[1],10);return isNaN(r)?null:r}return null}var No={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},Ss=["left","center","right"],ws=["top","center","bottom"],Fo=[...Ss,...ws],Ht="center";function Pm(i){if(!i)return{x:.5,y:.5};if(typeof i=="object")return i;let e=i.toLocaleLowerCase().split(" ").slice(0,2);e.length===1&&(No[e[0]]?e=[e[0],Ht]:e=[e[0],e[0]]);const t=e[1]!=="left"&&e[1]!=="right"&&e[0]!=="top"&&e[0]!=="bottom";e=e.map(s=>No[s]||s),t||e.reverse();const r=e.join(" ").match(/^([0-9.]+)% ([0-9.]+)%$/);return r?{x:parseFloat(r[1])/100,y:parseFloat(r[2])/100}:{x:.5,y:.5}}function zo(i,{allowCenter:e,cssOrder:t}={allowCenter:!0,cssOrder:!0}){return i?(typeof i=="string"&&(i=i.split(" ")),i.length===1&&(i[0]===Ht?i=[Ht,Ht]:Ss.indexOf(i[0])!==-1?i=[Ht,i[0]]:ws.indexOf(i[0])!==-1&&(i=[i[0],Ht])),i.length!==2||Fo.indexOf(i[0])===-1||Fo.indexOf(i[1])===-1?(Ke(`Unparsable position ${i}`),null):!e&&i[0]===Ht&&i[1]===Ht?(Ke("Invalid position center center"),null):(t&&!Pa(i)&&(i=[i[1],i[0]]),i[1]===Ht&&Ss.indexOf(i[0])!==-1&&(i=[Ht,i[0]]),i[0]===Ht&&ws.indexOf(i[1])!==-1&&(i=[i[1],Ht]),i)):null}function Pa(i){return ws.indexOf(i[0])!==-1&&Ss.indexOf(i[1])!==-1}function Ho(i){let e;if(typeof i=="string"){const t=i.toString().trim();let r=parseFloat(t.replace(/^(-?[0-9]+(?:\.[0-9]*)?).*$/,"$1"));const s=t.replace(/^-?[0-9]+(?:\.[0-9]*)?(.*)$/,"$1").trim();switch(s.match(/(pm|per minute)$/)&&(r/=60),s){case"dpm":case"degrees per minute":case"dps":case"degrees per second":e=it.degToRad(r);break;case"rdpm":case"radians per minute":case"rdps":case"radians per second":e=r;break;case"rpm":case"revolutions per minute":case"rps":case"revolutions per second":e=r*Math.PI*2;break;default:throw new Be(`Unknown speed unit "${s}"`)}}else e=i;return e}function Ua(i,e){if(typeof i!="number"){const t=Ho(i);return e/Math.abs(t)*1e3}else return Math.abs(i)}function Mi(i,e=!1,t=e){let r;if(typeof i=="string"){const s=i.toLowerCase().trim().match(/^(-?[0-9]+(?:\.[0-9]*)?)(.*)$/);if(!s)throw new Be(`Unknown angle "${i}"`);const a=parseFloat(s[1]),o=s[2];if(o)switch(o){case"deg":case"degs":r=it.degToRad(a);break;case"rad":case"rads":r=a;break;default:throw new Be(`Unknown angle unit "${o}"`)}else r=a}else if(typeof i=="number"&&!isNaN(i))r=i;else throw new Be(`Unknown angle "${i}"`);return r=wr(e?r+Math.PI:r,Math.PI*2),e?it.clamp(r-Math.PI,-Math.PI/(t?2:1),Math.PI/(t?2:1)):r}function Da(i,e=!1){const t=new At(i);return t.needsUpdate=!0,t.minFilter=e?1008:1006,t.generateMipmaps=e,t.anisotropy=e?2:1,t}var Bo=new Gi;function Ia(i,e){Bo.setFromEuler(e).invert(),i.applyQuaternion(Bo)}function As(i,e){const t=function(r){if(!r)return Ar(i);const s=Ar(Ct(Ct({},i),r)),a={};for(let[o,n]of Object.entries(s)){if(e&&o in e)n=e[o](n,{rawConfig:s,defValue:i[o]});else if(!(o in i)){Ke(`Unknown option ${o}`);continue}a[o]=n}return a};return t.defaults=i,t.parsers=e||{},t}function ko(i,e){ci(i,`--psv-${e}-loaded`)!=="true"&&console.error(`PhotoSphereViewer: stylesheet "@photo-sphere-viewer/${e}/index.css" is not loaded`)}function Oa(i,e,t){e&&e!==t&&console.error(`PhotoSphereViewer: @photo-sphere-viewer/${i} is in version ${e} but @photo-sphere-viewer/core is in version ${t}`)}var Rr=class{constructor(i){this.easing=Es.linear,this.callbacks=[],this.resolved=!1,this.cancelled=!1,this.options=i,i?(i.easing&&(this.easing=typeof i.easing=="function"?i.easing:Es[i.easing]||Es.linear),this.delayTimeout=setTimeout(()=>{this.delayTimeout=void 0,this.animationFrame=window.requestAnimationFrame(e=>this.__run(e))},i.delay||0)):this.resolved=!0}__run(i){if(this.cancelled)return;this.start||(this.start=i);const e=(i-this.start)/this.options.duration,t={};if(e<1){for(const[r,s]of Object.entries(this.options.properties))if(s){const a=s.start+(s.end-s.start)*this.easing(e);t[r]=a}this.options.onTick(t,e),this.animationFrame=window.requestAnimationFrame(r=>this.__run(r))}else{for(const[r,s]of Object.entries(this.options.properties))s&&(t[r]=s.end);this.options.onTick(t,1),this.__resolve(!0),this.animationFrame=void 0}}__resolve(i){i?this.resolved=!0:this.cancelled=!0,this.callbacks.forEach(e=>e(i)),this.callbacks.length=0}then(i){return this.resolved||this.cancelled?Promise.resolve(this.resolved).then(i):new Promise(e=>{this.callbacks.push(e)}).then(i)}cancel(){!this.cancelled&&!this.resolved&&(this.__resolve(!1),this.delayTimeout&&(window.clearTimeout(this.delayTimeout),this.delayTimeout=void 0),this.animationFrame&&(window.cancelAnimationFrame(this.animationFrame),this.animationFrame=void 0))}},Rs=class{constructor(i,e){if(this.fn=i,this.mode=0,this.speed=0,this.speedMult=0,this.currentSpeed=0,this.target=0,this.__current=0,this.min=e.min,this.max=e.max,this.wrap=e.wrap,this.current=e.defaultValue,this.wrap&&this.min!==0)throw new Be("invalid config");this.fn&&this.fn(this.current)}get current(){return this.__current}set current(i){this.__current=i}setSpeed(i){this.speed=i}goto(i,e=1){this.mode=2,this.target=this.wrap?wr(i,this.max):it.clamp(i,this.min,this.max),this.speedMult=e}step(i,e=1){e===0?this.setValue(this.current+i):(this.mode!==2&&(this.target=this.current),this.goto(this.target+i,e))}roll(i=!1,e=1){this.mode=1,this.target=i?-1/0:1/0,this.speedMult=e}stop(){this.mode=0}setValue(i){return this.target=this.wrap?wr(i,this.max):it.clamp(i,this.min,this.max),this.mode=0,this.currentSpeed=0,this.target!==this.current?(this.current=this.target,this.fn&&this.fn(this.current),!0):!1}update(i){if(this.mode===2){this.wrap&&Math.abs(this.target-this.current)>this.max/2&&(this.current=this.current<this.target?this.current+this.max:this.current-this.max);const r=this.currentSpeed*this.currentSpeed/(this.speed*this.speedMult*4);Math.abs(this.target-this.current)<=r&&(this.mode=0)}let e=this.mode===0?0:this.speed*this.speedMult;this.target<this.current&&(e=-e),this.currentSpeed<e?this.currentSpeed=Math.min(e,this.currentSpeed+i/1e3*this.speed*this.speedMult*2):this.currentSpeed>e&&(this.currentSpeed=Math.max(e,this.currentSpeed-i/1e3*this.speed*this.speedMult*2));let t=null;return this.current>this.target&&this.currentSpeed?t=Math.max(this.target,this.current+this.currentSpeed*i/1e3):this.current<this.target&&this.currentSpeed&&(t=Math.min(this.target,this.current+this.currentSpeed*i/1e3)),t!==null&&(t=this.wrap?wr(t,this.max):it.clamp(t,this.min,this.max),t!==this.current)?(this.current=t,this.fn&&this.fn(this.current),!0):!1}},Vo=class{constructor(i,e){this.fn=i,this.dynamics=e,this.fn&&this.fn(this.current)}get current(){return Object.entries(this.dynamics).reduce((i,[e,t])=>(i[e]=t.current,i),{})}setSpeed(i){for(const e of Object.values(this.dynamics))e.setSpeed(i)}goto(i,e=1){for(const[t,r]of Object.entries(i))this.dynamics[t].goto(r,e)}step(i,e=1){if(e===0)this.setValue(Object.keys(i).reduce((t,r)=>(t[r]=i[r]+this.dynamics[r].current,t),{}));else for(const[t,r]of Object.entries(i))this.dynamics[t].step(r,e)}roll(i,e=1){for(const[t,r]of Object.entries(i))this.dynamics[t].roll(r,e)}stop(){for(const i of Object.values(this.dynamics))i.stop()}setValue(i){let e=!1;for(const[t,r]of Object.entries(i))e=this.dynamics[t].setValue(r)||e;return e&&this.fn&&this.fn(this.current),e}update(i){let e=!1;for(const t of Object.values(this.dynamics))e=t.update(i)||e;return e&&this.fn&&this.fn(this.current),e}},Cs=class{constructor(i=200){this.delay=i,this.time=0,this.delay=i}get pending(){return this.time!==0}down(){this.timeout&&(clearTimeout(this.timeout),this.timeout=void 0),this.time=new Date().getTime()}up(i){this.time&&(Date.now()-this.time<this.delay?this.timeout=setTimeout(()=>{i(),this.timeout=void 0,this.time=0},this.delay):(i(),this.time=0))}},Go=(i=>(i.VERTICAL="VERTICAL",i.HORIZONTAL="HORIZONTAL",i))(Go||{}),Wo=class{constructor(i,e,t){this.container=i,this.direction=e,this.listener=t,this.mousedown=!1,this.mouseover=!1,this.container.addEventListener("click",this),this.container.addEventListener("mousedown",this),this.container.addEventListener("mouseenter",this),this.container.addEventListener("mouseleave",this),this.container.addEventListener("touchstart",this),this.container.addEventListener("mousemove",this,!0),this.container.addEventListener("touchmove",this,!0),window.addEventListener("mouseup",this),window.addEventListener("touchend",this)}get isVertical(){return this.direction==="VERTICAL"}get isHorizontal(){return this.direction==="HORIZONTAL"}destroy(){window.removeEventListener("mouseup",this),window.removeEventListener("touchend",this)}handleEvent(i){switch(i.type){case"click":i.stopPropagation();break;case"mousedown":this.__onMouseDown(i);break;case"mouseenter":this.__onMouseEnter(i);break;case"mouseleave":this.__onMouseLeave(i);break;case"touchstart":this.__onTouchStart(i);break;case"mousemove":this.__onMouseMove(i);break;case"touchmove":this.__onTouchMove(i);break;case"mouseup":this.__onMouseUp(i);break;case"touchend":this.__onTouchEnd(i);break}}__onMouseDown(i){this.mousedown=!0,this.__update(i.clientX,i.clientY,!0)}__onMouseEnter(i){this.mouseover=!0,this.__update(i.clientX,i.clientY,!0)}__onTouchStart(i){this.mouseover=!0,this.mousedown=!0;const e=i.changedTouches[0];this.__update(e.clientX,e.clientY,!0)}__onMouseMove(i){(this.mousedown||this.mouseover)&&(i.stopPropagation(),this.__update(i.clientX,i.clientY,!0))}__onTouchMove(i){if(this.mousedown||this.mouseover){i.stopPropagation();const e=i.changedTouches[0];this.__update(e.clientX,e.clientY,!0)}}__onMouseUp(i){this.mousedown&&(this.mousedown=!1,this.__update(i.clientX,i.clientY,!1))}__onMouseLeave(i){this.mouseover&&(this.mouseover=!1,this.__update(i.clientX,i.clientY,!0))}__onTouchEnd(i){if(this.mousedown){this.mouseover=!1,this.mousedown=!1;const e=i.changedTouches[0];this.__update(e.clientX,e.clientY,!1)}}__update(i,e,t){const r=this.container.getBoundingClientRect(),s=this.isVertical?e:i,a=r[this.isVertical?"bottom":"left"],o=r[this.isVertical?"height":"width"],n=Math.abs((a-s)/o);this.listener({value:n,click:!t,mousedown:this.mousedown,mouseover:this.mouseover,cursor:{clientX:i,clientY:e}})}},Um={};ya(Um,{BeforeAnimateEvent:()=>Na,BeforeRenderEvent:()=>qo,BeforeRotateEvent:()=>Ko,ClickEvent:()=>Jo,ConfigChangedEvent:()=>Rt,DoubleClickEvent:()=>tl,FullscreenEvent:()=>Cr,HideNotificationEvent:()=>Lr,HideOverlayEvent:()=>al,HidePanelEvent:()=>bi,HideTooltipEvent:()=>ll,KeypressEvent:()=>Ti,LoadProgressEvent:()=>dl,ObjectEnterEvent:()=>Ul,ObjectEvent:()=>Ls,ObjectHoverEvent:()=>Ol,ObjectLeaveEvent:()=>za,PanoramaErrorEvent:()=>gl,PanoramaLoadEvent:()=>pl,PanoramaLoadedEvent:()=>Fa,PositionUpdatedEvent:()=>Pr,ReadyEvent:()=>Ur,RenderEvent:()=>yl,ShowNotificationEvent:()=>Dr,ShowOverlayEvent:()=>bl,ShowPanelEvent:()=>Si,ShowTooltipEvent:()=>wl,SizeUpdatedEvent:()=>Ir,StopAllEvent:()=>Cl,ViewerEvent:()=>We,ZoomUpdatedEvent:()=>hi});var Dm=class extends Event{constructor(i,e=!1){super(i,{cancelable:e})}},Xo=class extends EventTarget{dispatchEvent(i){return super.dispatchEvent(i)}addEventListener(i,e,t){super.addEventListener(i,e,t)}removeEventListener(i,e,t){super.removeEventListener(i,e,t)}},We=class extends Dm{},jo=class lc extends We{constructor(e,t){super(lc.type,!0),this.position=e,this.zoomLevel=t}};jo.type="before-animate";var Na=jo,Yo=class cc extends We{constructor(e,t){super(cc.type),this.timestamp=e,this.elapsed=t}};Yo.type="before-render";var qo=Yo,Zo=class hc extends We{constructor(e){super(hc.type,!0),this.position=e}};Zo.type="before-rotate";var Ko=Zo,$o=class dc extends We{constructor(e){super(dc.type),this.data=e}};$o.type="click";var Jo=$o,Qo=class uc extends We{constructor(e){super(uc.type),this.options=e}containsOptions(...e){return e.some(t=>this.options.includes(t))}};Qo.type="config-changed";var Rt=Qo,el=class pc extends We{constructor(e){super(pc.type),this.data=e}};el.type="dblclick";var tl=el,il=class fc extends We{constructor(e){super(fc.type),this.fullscreenEnabled=e}};il.type="fullscreen";var Cr=il,rl=class mc extends We{constructor(e){super(mc.type),this.notificationId=e}};rl.type="hide-notification";var Lr=rl,sl=class gc extends We{constructor(e){super(gc.type),this.overlayId=e}};sl.type="hide-overlay";var al=sl,nl=class vc extends We{constructor(e){super(vc.type),this.panelId=e}};nl.type="hide-panel";var bi=nl,ol=class _c extends We{constructor(e){super(_c.type),this.tooltipData=e}};ol.type="hide-tooltip";var ll=ol,cl=class xc extends We{constructor(e){super(xc.type,!0),this.key=e}};cl.type="key-press";var Ti=cl,hl=class yc extends We{constructor(e){super(yc.type),this.progress=e}};hl.type="load-progress";var dl=hl,ul=class Ec extends We{constructor(e){super(Ec.type),this.panorama=e}};ul.type="panorama-load";var pl=ul,fl=class Mc extends We{constructor(e){super(Mc.type),this.data=e}};fl.type="panorama-loaded";var Fa=fl,ml=class bc extends We{constructor(e,t){super(bc.type),this.panorama=e,this.error=t}};ml.type="panorama-error";var gl=ml,vl=class Tc extends We{constructor(e){super(Tc.type),this.position=e}};vl.type="position-updated";var Pr=vl,_l=class Sc extends We{constructor(){super(Sc.type)}};_l.type="ready";var Ur=_l,xl=class wc extends We{constructor(){super(wc.type)}};xl.type="render";var yl=xl,El=class Ac extends We{constructor(e){super(Ac.type),this.notificationId=e}};El.type="show-notification";var Dr=El,Ml=class Rc extends We{constructor(e){super(Rc.type),this.overlayId=e}};Ml.type="show-overlay";var bl=Ml,Tl=class Cc extends We{constructor(e){super(Cc.type),this.panelId=e}};Tl.type="show-panel";var Si=Tl,Sl=class Lc extends We{constructor(e,t){super(Lc.type),this.tooltip=e,this.tooltipData=t}};Sl.type="show-tooltip";var wl=Sl,Al=class Pc extends We{constructor(e){super(Pc.type),this.size=e}};Al.type="size-updated";var Ir=Al,Rl=class Uc extends We{constructor(){super(Uc.type)}};Rl.type="stop-all";var Cl=Rl,Ll=class Dc extends We{constructor(e){super(Dc.type),this.zoomLevel=e}};Ll.type="zoom-updated";var hi=Ll,Ls=class extends We{constructor(i,e,t,r,s){super(i),this.originalEvent=e,this.object=t,this.viewerPoint=r,this.userDataKey=s}},Pl=class Ic extends Ls{constructor(e,t,r,s){super(Ic.type,e,t,r,s)}};Pl.type="enter-object";var Ul=Pl,Dl=class Oc extends Ls{constructor(e,t,r,s){super(Oc.type,e,t,r,s)}};Dl.type="leave-object";var za=Dl,Il=class Nc extends Ls{constructor(e,t,r,s){super(Nc.type,e,t,r,s)}};Il.type="hover-object";var Ol=Il,Ps=class Ot{constructor(e){this.viewer=e}init(){}destroy(){}supportsTransition(e){return!1}supportsPreload(e){return!1}textureCoordsToSphericalCoords(e,t){throw new Be("Current adapter does not support texture coordinates.")}sphericalCoordsToTextureCoords(e,t){throw new Be("Current adapter does not support texture coordinates.")}setOverlay(e,t,r){throw new Be("Current adapter does not support overlay")}static createOverlayMaterial({additionalUniforms:e,overrideVertexShader:t}={}){return new yi({uniforms:$a(Ct({},e),{[Ot.OVERLAY_UNIFORMS.panorama]:{value:null},[Ot.OVERLAY_UNIFORMS.overlay]:{value:null},[Ot.OVERLAY_UNIFORMS.globalOpacity]:{value:1},[Ot.OVERLAY_UNIFORMS.overlayOpacity]:{value:0}}),vertexShader:t||`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix *  modelViewMatrix * vec4( position, 1.0 );
}`,fragmentShader:`
uniform sampler2D ${Ot.OVERLAY_UNIFORMS.panorama};
uniform sampler2D ${Ot.OVERLAY_UNIFORMS.overlay};
uniform float ${Ot.OVERLAY_UNIFORMS.globalOpacity};
uniform float ${Ot.OVERLAY_UNIFORMS.overlayOpacity};

varying vec2 vUv;

void main() {
  vec4 tColor1 = texture2D( ${Ot.OVERLAY_UNIFORMS.panorama}, vUv );
  vec4 tColor2 = texture2D( ${Ot.OVERLAY_UNIFORMS.overlay}, vUv );
  gl_FragColor = vec4(
    mix( tColor1.rgb, tColor2.rgb, tColor2.a * ${Ot.OVERLAY_UNIFORMS.overlayOpacity} ),
    ${Ot.OVERLAY_UNIFORMS.globalOpacity}
  );
}`})}};Ps.supportsDownload=!1,Ps.supportsOverlay=!1,Ps.OVERLAY_UNIFORMS={panorama:"panorama",overlay:"overlay",globalOpacity:"globalOpacity",overlayOpacity:"overlayOpacity"};var wi=Ps;function Nl(i){if(i){for(const[,e]of[["_",i],...Object.entries(i)])if(e.prototype instanceof wi)return Oa(e.id,e.VERSION,"5.5.2"),e}return null}var Or=`${Ei}_touchSupport`,pt={loaded:!1,pixelRatio:1,isWebGLSupported:!1,maxTextureWidth:0,isTouchEnabled:null,fullscreenEvent:null,__maxCanvasWidth:null,get maxCanvasWidth(){return this.__maxCanvasWidth===null&&(this.__maxCanvasWidth=Nm(this.maxTextureWidth)),this.__maxCanvasWidth},load(){if(!this.loaded){const i=Im();this.pixelRatio=window.devicePixelRatio||1,this.isWebGLSupported=i!==null,this.maxTextureWidth=i?i.getParameter(i.MAX_TEXTURE_SIZE):0,this.isTouchEnabled=Om(),this.fullscreenEvent=Fm(),this.loaded=!0}if(!pt.isWebGLSupported)throw new Be("WebGL is not supported.");if(pt.maxTextureWidth===0)throw new Be("Unable to detect system capabilities")}};function Im(){const i=document.createElement("canvas"),e=["webgl2","webgl","experimental-webgl","moz-webgl","webkit-3d"];let t=null;return i.getContext&&e.some(r=>{try{return t=i.getContext(r),t!==null}catch(s){return!1}})?t:null}function Om(){let i="ontouchstart"in window||navigator.maxTouchPoints>0;Or in localStorage&&(i=localStorage[Or]==="true");const e=new Promise(t=>{const r=()=>{window.removeEventListener("mousedown",s),window.removeEventListener("touchstart",a),clearTimeout(n)},s=()=>{r(),localStorage[Or]=!1,t(!1)},a=()=>{r(),localStorage[Or]=!0,t(!0)},o=()=>{r(),localStorage[Or]=i,t(i)};window.addEventListener("mousedown",s,!1),window.addEventListener("touchstart",a,!1);const n=setTimeout(o,1e4)});return{initial:i,promise:e}}function Nm(i){const e=document.createElement("canvas"),t=e.getContext("2d");for(e.width=i,e.height=i/2;e.width>1024;){t.fillStyle="white",t.fillRect(0,0,1,1);try{if(t.getImageData(0,0,1,1).data[0]>0)return e.width}catch(r){}e.width/=2,e.height/=2}throw new Be("Unable to detect system capabilities")}function Fm(){return"exitFullscreen"in document?"fullscreenchange":"webkitExitFullscreen"in document?"webkitfullscreenchange":null}function zm(){self.onmessage=a=>{const o=a.data.panoData,n=new OffscreenCanvas(o.fullWidth,o.fullHeight),l=n.getContext("2d"),c=new OffscreenCanvas(o.croppedWidth,o.croppedHeight);c.getContext("2d").putImageData(a.data.image,0,0),i(n,c,o),postMessage(l.getImageData(0,0,n.width,n.height))};function i(a,o,n){const l=n.fullHeight-n.croppedHeight-n.croppedY,c=n.fullWidth-n.croppedWidth-n.croppedX,h=n.croppedY+n.croppedHeight/2,p=a.width/32,u=p,f=10,v=`blur(${p}px)`,g=a.getContext("2d");if(g.drawImage(o,n.croppedX,n.croppedY,n.croppedWidth,n.croppedHeight),n.croppedY>0){if(n.croppedX>0||c>0){g.filter="none";const m=s(g,n.croppedX,n.croppedY,f,f,2),d=s(g,a.width-c-11,n.croppedY,f,f,2),b=t(m,d);n.croppedX>0&&(g.fillStyle=r(g,0,n.croppedX,b,m),g.fillRect(-u,-u,n.croppedX+u*2,h+u)),c>0&&(g.fillStyle=r(g,a.width-c,a.width,d,b),g.fillRect(a.width-c-u,-u,c+u*2,h+u))}g.filter=v,g.drawImage(o,0,0,o.width,f,n.croppedX,-u,n.croppedWidth,n.croppedY+u*2),g.fillStyle=e(s(g,0,0,a.width,f,f)),g.fillRect(-u,-u,a.width+u*2,u*2)}if(l>0){if(n.croppedX>0||c>0){g.filter="none";const m=s(g,n.croppedX,a.height-l-1-f,f,f,2),d=s(g,a.width-c-1-f,a.height-l-1-f,f,f,2),b=t(m,d);n.croppedX>0&&(g.fillStyle=r(g,0,n.croppedX,b,m),g.fillRect(-u,h,n.croppedX+u*2,a.height-h+u)),c>0&&(g.fillStyle=r(g,a.width-c,a.width,d,b),g.fillRect(a.width-c-u,h,c+u*2,a.height-h+u))}g.filter=v,g.drawImage(o,0,o.height-f,o.width,f,n.croppedX,a.height-l-u,n.croppedWidth,l+u*2),g.fillStyle=e(s(g,0,a.height-1-f,a.width,f,f)),g.fillRect(-u,a.height-u,a.width+u*2,u*2)}n.croppedX>0&&(g.filter=v,g.drawImage(o,o.width-f,0,f,o.height,-u,n.croppedY,u*2,n.croppedHeight),g.drawImage(o,0,0,f,o.height,0,n.croppedY,n.croppedX+u,n.croppedHeight)),c>0&&(g.filter=v,g.drawImage(o,0,0,f,o.height,a.width-u,n.croppedY,u*2,n.croppedHeight),g.drawImage(o,o.width-f,0,f,o.height,a.width-c-u,n.croppedY,c+u,n.croppedHeight)),g.filter="none",g.drawImage(o,n.croppedX,n.croppedY,n.croppedWidth,n.croppedHeight)}function e(a){return`rgb(${a.r}, ${a.g}, ${a.b})`}function t(a,o){return{r:Math.round(a.r/2+o.r/2),g:Math.round(a.g/2+o.g/2),b:Math.round(a.b/2+o.b/2)}}function r(a,o,n,l,c){const h=a.createLinearGradient(o,0,n,0);return h.addColorStop(0,e(l)),h.addColorStop(1,e(c)),h}function s(a,o,n,l,c,h){h=Math.round(h);let p=0,u=0,f=0,v=0;const g=a.getImageData(o,n,l,c);for(let m=0;m<c;m+=h)for(let d=0;d<l;d+=h){const b=4*(m*l+d);p+=g.data[b],u+=g.data[b+1],f+=g.data[b+2],v++}return p=Math.round(p/v),u=Math.round(u/v),f=Math.round(f/v),{r:p,g:u,b:f}}}var Hm=URL.createObjectURL(new Blob(["(",zm.toString(),")()"],{type:"application/javascript"})),Bm=As({backgroundColor:"#000",interpolateBackground:!1,resolution:64,useXmpData:!0,blur:!1},{resolution:i=>{if(!i||!it.isPowerOfTwo(i))throw new Be("EquirectangularAdapter resolution must be power of two");return i}}),Nr=class extends wi{constructor(i,e){super(i),this.config=Bm(e),Dt(this.viewer.config.useXmpData)||(this.config.useXmpData=this.viewer.config.useXmpData),Dt(this.viewer.config.canvasBackground)||(this.config.backgroundColor=this.viewer.config.canvasBackground),this.config.interpolateBackground&&(window.Worker?this.interpolationWorker=new Worker(Hm):(Ke("Web Worker API not available"),this.config.interpolateBackground=!1)),this.SPHERE_SEGMENTS=this.config.resolution,this.SPHERE_HORIZONTAL_SEGMENTS=this.SPHERE_SEGMENTS/2}supportsTransition(){return!0}supportsPreload(){return!0}destroy(){var i;(i=this.interpolationWorker)==null||i.terminate(),super.destroy()}textureCoordsToSphericalCoords(i,e){if(Dt(i.textureX)||Dt(i.textureY))throw new Be("Texture position is missing 'textureX' or 'textureY'");const t=(i.textureX+e.croppedX)/e.fullWidth*Math.PI*2,r=(i.textureY+e.croppedY)/e.fullHeight*Math.PI;return{yaw:t>=Math.PI?t-Math.PI:t+Math.PI,pitch:Math.PI/2-r}}sphericalCoordsToTextureCoords(i,e){const t=i.yaw/Math.PI/2*e.fullWidth,r=i.pitch/Math.PI*e.fullHeight;return{textureX:Math.round(i.yaw<Math.PI?t+e.fullWidth/2:t-e.fullWidth/2)-e.croppedX,textureY:Math.round(e.fullHeight/2-r)-e.croppedY}}loadTexture(s){return Vr(this,arguments,function*(i,e=!0,t,r=this.config.useXmpData){if(typeof i!="string")return Promise.reject(new Be("Invalid panorama url, are you using the right adapter?"));const a=yield this.viewer.textureLoader.loadFile(i,e?h=>this.viewer.loader.setProgress(h):null,i),o=r?yield this.loadXMP(a):null,n=yield this.viewer.textureLoader.blobToImage(a);typeof t=="function"&&(t=t(n,o)),!t&&!o&&(t=this.__defaultPanoData(n));const l={isEquirectangular:!0,fullWidth:Qt(t==null?void 0:t.fullWidth,o==null?void 0:o.fullWidth,n.width),fullHeight:Qt(t==null?void 0:t.fullHeight,o==null?void 0:o.fullHeight,n.height),croppedWidth:Qt(t==null?void 0:t.croppedWidth,o==null?void 0:o.croppedWidth,n.width),croppedHeight:Qt(t==null?void 0:t.croppedHeight,o==null?void 0:o.croppedHeight,n.height),croppedX:Qt(t==null?void 0:t.croppedX,o==null?void 0:o.croppedX,0),croppedY:Qt(t==null?void 0:t.croppedY,o==null?void 0:o.croppedY,0),poseHeading:Qt(t==null?void 0:t.poseHeading,o==null?void 0:o.poseHeading,0),posePitch:Qt(t==null?void 0:t.posePitch,o==null?void 0:o.posePitch,0),poseRoll:Qt(t==null?void 0:t.poseRoll,o==null?void 0:o.poseRoll,0)};(l.croppedWidth!==n.width||l.croppedHeight!==n.height)&&Ke(`Invalid panoData, croppedWidth/croppedHeight is not coherent with the loaded image.
            panoData: ${l.croppedWidth}x${l.croppedHeight}, image: ${n.width}x${n.height}`),Math.abs(l.fullWidth-l.fullHeight*2)>1&&(Ke("Invalid panoData, fullWidth should be twice fullHeight"),l.fullWidth=l.fullHeight*2),l.croppedX+l.croppedWidth>l.fullWidth&&(Ke("Invalid panoData, croppedX + croppedWidth > fullWidth"),l.croppedX=l.fullWidth-l.croppedWidth),l.croppedY+l.croppedHeight>l.fullHeight&&(Ke("Invalid panoData, croppedY + croppedHeight > fullHeight"),l.croppedY=l.fullHeight-l.croppedHeight);const c=this.createEquirectangularTexture(n,l);return{panorama:i,texture:c,panoData:l,cacheKey:i}})}loadXMP(i){return Vr(this,null,function*(){const e=yield this.loadBlobAsString(i),t=e.indexOf("<x:xmpmeta"),r=e.indexOf("</x:xmpmeta>"),s=e.substring(t,r);return t!==-1&&r!==-1&&s.includes("GPano:")?{isEquirectangular:!0,fullWidth:ei(s,"FullPanoWidthPixels"),fullHeight:ei(s,"FullPanoHeightPixels"),croppedWidth:ei(s,"CroppedAreaImageWidthPixels"),croppedHeight:ei(s,"CroppedAreaImageHeightPixels"),croppedX:ei(s,"CroppedAreaLeftPixels"),croppedY:ei(s,"CroppedAreaTopPixels"),poseHeading:ei(s,"PoseHeadingDegrees"),posePitch:ei(s,"PosePitchDegrees"),poseRoll:ei(s,"PoseRollDegrees")}:null})}loadBlobAsString(i){return new Promise((e,t)=>{const r=new FileReader;r.onload=()=>e(r.result),r.onerror=t,r.readAsText(i)})}createEquirectangularTexture(i,e){if(this.config.blur||e.fullWidth>pt.maxTextureWidth||e.croppedWidth!==e.fullWidth||e.croppedHeight!==e.fullHeight){const t=Math.min(1,pt.maxCanvasWidth/e.fullWidth),r={fullWidth:e.fullWidth*t,fullHeight:e.fullHeight*t,croppedWidth:e.croppedWidth*t,croppedHeight:e.croppedHeight*t,croppedX:e.croppedX*t,croppedY:e.croppedY*t},s=document.createElement("canvas");s.width=r.fullWidth,s.height=r.fullHeight;const a=s.getContext("2d");this.config.backgroundColor&&(a.fillStyle=this.config.backgroundColor,a.fillRect(0,0,s.width,s.height)),this.config.blur&&(a.filter=`blur(${s.width/2048}px)`),a.drawImage(i,r.croppedX,r.croppedY,r.croppedWidth,r.croppedHeight);const o=Da(s);return this.config.interpolateBackground&&(e.croppedWidth!==e.fullWidth||e.croppedHeight!==e.fullHeight)&&(this.interpolationWorker.postMessage({image:a.getImageData(r.croppedX,r.croppedY,r.croppedWidth,r.croppedHeight),panoData:r}),this.interpolationWorker.onmessage=n=>{a.putImageData(n.data,0,0),o.needsUpdate=!0,this.viewer.needsUpdate()}),o}return Da(i)}createMesh(i=1){const e=new va(Tr*i,this.SPHERE_SEGMENTS,this.SPHERE_HORIZONTAL_SEGMENTS,-Math.PI/2).scale(-1,1,1),t=wi.createOverlayMaterial();return new oi(e,t)}setTexture(i,e){this.__setUniform(i,wi.OVERLAY_UNIFORMS.panorama,e.texture)}setOverlay(i,e,t){this.__setUniform(i,wi.OVERLAY_UNIFORMS.overlayOpacity,t),e?this.__setUniform(i,wi.OVERLAY_UNIFORMS.overlay,e.texture):this.__setUniform(i,wi.OVERLAY_UNIFORMS.overlay,null)}setTextureOpacity(i,e){this.__setUniform(i,wi.OVERLAY_UNIFORMS.globalOpacity,e),i.material.transparent=e<1}disposeTexture(i){var e;(e=i.texture)==null||e.dispose()}__setUniform(i,e,t){i.material.uniforms[e].value=t}__defaultPanoData(i){const e=Math.max(i.width,i.height*2),t=Math.round(e/2),r=Math.round((e-i.width)/2),s=Math.round((t-i.height)/2);return{isEquirectangular:!0,fullWidth:e,fullHeight:t,croppedWidth:i.width,croppedHeight:i.height,croppedX:r,croppedY:s}}};Nr.id="equirectangular",Nr.VERSION="5.5.2",Nr.supportsDownload=!0,Nr.supportsOverlay=!0;var Oi=class Fc{constructor(e,t){this.parent=e,this.children=[],this.container=document.createElement("div"),this.state={visible:!0},this.viewer=e instanceof Fc?e.viewer:e,this.container.className=t.className||"",this.parent.children.push(this),this.parent.container.appendChild(this.container)}destroy(){this.parent.container.removeChild(this.container);const e=this.parent.children.indexOf(this);e!==-1&&this.parent.children.splice(e,1),this.children.slice().forEach(t=>t.destroy()),this.children.length=0}toggle(e=!this.isVisible()){e?this.show():this.hide()}hide(e){this.container.style.display="none",this.state.visible=!1}show(e){this.container.style.display="",this.state.visible=!0}isVisible(){return this.state.visible}},km=As({id:null,className:null,title:null,hoverScale:!1,collapsable:!1,tabbable:!0,icon:null,iconActive:null}),It=class extends Oi{constructor(i,e){super(i,{className:`psv-button ${e.hoverScale?"psv-button--hover-scale":""} ${e.className||""}`}),this.state={visible:!0,enabled:!0,supported:!0,collapsed:!1,active:!1,width:0},this.config=km(e),this.config.id=this.constructor.id,e.icon&&this.__setIcon(e.icon),this.state.width=this.container.offsetWidth,this.config.title?this.container.title=this.config.title:this.id&&this.id in this.viewer.config.lang&&(this.container.title=this.viewer.config.lang[this.id]),e.tabbable&&(this.container.tabIndex=0),this.container.addEventListener("click",t=>{this.state.enabled&&this.onClick(),t.stopPropagation()}),this.container.addEventListener("keydown",t=>{t.key===lt.Enter&&this.state.enabled&&(this.onClick(),t.stopPropagation())})}get id(){return this.config.id}get title(){return this.container.title}get content(){return this.container.innerHTML}get width(){return this.state.width}get collapsable(){return this.config.collapsable}show(i=!0){this.isVisible()||(this.state.visible=!0,this.state.collapsed||(this.container.style.display=""),i&&this.viewer.navbar.autoSize())}hide(i=!0){this.isVisible()&&(this.state.visible=!1,this.container.style.display="none",i&&this.viewer.navbar.autoSize())}checkSupported(){Ca(this.isSupported(),(i,e)=>{this.state&&(this.state.supported=i,e?i||this.hide():this.toggle(i))})}autoSize(){}isSupported(){return!0}toggleActive(i=!this.state.active){i!==this.state.active&&(this.state.active=i,Ms(this.container,"psv-button--active",this.state.active),this.config.iconActive&&this.__setIcon(this.state.active?this.config.iconActive:this.config.icon))}disable(){this.container.classList.add("psv-button--disabled"),this.state.enabled=!1}enable(){this.container.classList.remove("psv-button--disabled"),this.state.enabled=!0}collapse(){this.state.collapsed=!0,this.container.style.display="none"}uncollapse(){this.state.collapsed=!1,this.state.visible&&(this.container.style.display="")}__setIcon(i){this.container.innerHTML=i,Ta(this.container.querySelector("svg"),"psv-button-svg")}},Vm=class extends It{constructor(i,e){var t,r;super(i,{className:`psv-custom-button ${e.className||""}`,hoverScale:!1,collapsable:e.collapsable!==!1,tabbable:e.tabbable!==!1,title:e.title}),this.customOnClick=e.onClick,e.id?this.config.id=e.id:this.config.id="psvButton-"+Math.random().toString(36).substring(2),e.content&&(typeof e.content=="string"?this.container.innerHTML=e.content:(this.container.classList.add("psv-custom-button--no-padding"),e.content.style.height="100%",(r=(t=e.content).attachViewer)==null||r.call(t,this.viewer),this.container.appendChild(e.content))),this.state.width=this.container.offsetWidth,e.disabled&&this.disable(),e.visible===!1&&this.hide()}onClick(){var i;(i=this.customOnClick)==null||i.call(this,this.viewer)}},Fr=class extends It{constructor(i){super(i,{className:"psv-description-button",hoverScale:!0,collapsable:!1,tabbable:!0,icon:Yt.info}),this.mode=0,this.viewer.addEventListener(Lr.type,this),this.viewer.addEventListener(Dr.type,this),this.viewer.addEventListener(bi.type,this),this.viewer.addEventListener(Si.type,this),this.viewer.addEventListener(Rt.type,this)}destroy(){this.viewer.removeEventListener(Lr.type,this),this.viewer.removeEventListener(Dr.type,this),this.viewer.removeEventListener(bi.type,this),this.viewer.removeEventListener(Si.type,this),this.viewer.removeEventListener(Rt.type,this),super.destroy()}handleEvent(i){if(i instanceof Rt){i.containsOptions("description")&&this.autoSize(!0);return}if(!this.mode)return;let e=!1;i instanceof Lr?e=this.mode===1:i instanceof Dr?e=this.mode===1&&i.notificationId!==ut.DESCRIPTION:i instanceof bi?e=this.mode===2:i instanceof Si&&(e=this.mode===2&&i.panelId!==ut.DESCRIPTION),e&&(this.toggleActive(!1),this.mode=0)}onClick(){this.mode?this.__close():this.__open()}hide(i){super.hide(i),this.mode&&this.__close()}autoSize(i=!1){if(i){const e=this.viewer.navbar.getButton("caption",!1),t=e&&!e.isVisible(),r=!!this.viewer.config.description;t||r?this.show(!1):this.hide(!1)}}__close(){switch(this.mode){case 1:this.viewer.notification.hide(ut.DESCRIPTION);break;case 2:this.viewer.panel.hide(ut.DESCRIPTION);break}}__open(){this.toggleActive(!0),this.viewer.config.description?(this.mode=2,this.viewer.panel.show({id:ut.DESCRIPTION,content:(this.viewer.config.caption?`<p>${this.viewer.config.caption}</p>`:"")+this.viewer.config.description})):(this.mode=1,this.viewer.notification.show({id:ut.DESCRIPTION,content:this.viewer.config.caption}))}};Fr.id="description";var Fl=class extends It{constructor(i){super(i,{className:"psv-download-button",hoverScale:!0,collapsable:!0,tabbable:!0,icon:Yt.download}),this.viewer.addEventListener(Rt.type,this)}destroy(){this.viewer.removeEventListener(Rt.type,this),super.destroy()}handleEvent(i){i instanceof Rt&&i.containsOptions("downloadUrl")&&this.checkSupported()}onClick(){const i=document.createElement("a");i.href=this.viewer.config.downloadUrl||this.viewer.config.panorama,i.href.startsWith("data:")&&!this.viewer.config.downloadName?i.download="panorama."+i.href.substring(0,i.href.indexOf(";")).split("/").pop():i.download=this.viewer.config.downloadName||i.href.split("/").pop(),i.target="_blank",this.viewer.container.appendChild(i),i.click(),setTimeout(()=>{this.viewer.container.removeChild(i)},100)}checkSupported(){this.viewer.adapter.constructor.supportsDownload||this.viewer.config.downloadUrl?this.show():this.hide()}};Fl.id="download";var zl=class extends It{constructor(i){super(i,{className:"psv-fullscreen-button",hoverScale:!0,collapsable:!1,tabbable:!0,icon:Yt.fullscreenIn,iconActive:Yt.fullscreenOut}),this.viewer.addEventListener(Cr.type,this)}destroy(){this.viewer.removeEventListener(Cr.type,this),super.destroy()}handleEvent(i){i instanceof Cr&&this.toggleActive(i.fullscreenEnabled)}onClick(){this.viewer.toggleFullscreen()}};zl.id="fullscreen";var Gm="psvButton",Wm=(i,e)=>`
<div class="psv-panel-menu psv-panel-menu--stripped">
  <h1 class="psv-panel-menu-title">${Yt.menu} ${e}</h1>
  <ul class="psv-panel-menu-list">
    ${i.map(t=>`
    <li data-psv-button="${t.id}" class="psv-panel-menu-item" tabindex="0">
      <span class="psv-panel-menu-item-icon">${t.content}</span>
      <span class="psv-panel-menu-item-label">${t.title}</span>
    </li>
    `).join("")}
  </ul>
</div>
`,Us=class extends It{constructor(i){super(i,{className:"psv-menu-button",hoverScale:!0,collapsable:!1,tabbable:!0,icon:Yt.menu}),this.viewer.addEventListener(Si.type,this),this.viewer.addEventListener(bi.type,this),super.hide()}destroy(){this.viewer.removeEventListener(Si.type,this),this.viewer.removeEventListener(bi.type,this),super.destroy()}handleEvent(i){i instanceof Si?this.toggleActive(i.panelId===ut.MENU):i instanceof bi&&this.toggleActive(!1)}onClick(){this.state.active?this.__hideMenu():this.__showMenu()}hide(i){super.hide(i),this.__hideMenu()}show(i){super.show(i),this.state.active&&this.__showMenu()}__showMenu(){this.viewer.panel.show({id:ut.MENU,content:Wm(this.viewer.navbar.collapsed,this.viewer.config.lang.menu),noMargin:!0,clickHandler:i=>{const e=i?Sa(i,"li"):void 0,t=e?e.dataset[Gm]:void 0;t&&(this.viewer.navbar.getButton(t).onClick(),this.__hideMenu())}})}__hideMenu(){this.viewer.panel.hide(ut.MENU)}};Us.id="menu";function Xm(i){let e=0;switch(i){case 0:e=90;break;case 1:e=-90;break;case 3:e=180;break;default:e=0;break}return Yt.arrow.replace("rotate(0",`rotate(${e}`)}var zr=class extends It{constructor(i,e){super(i,{className:"psv-move-button",hoverScale:!0,collapsable:!1,tabbable:!0,icon:Xm(e)}),this.direction=e,this.handler=new Cs,this.container.addEventListener("mousedown",this),this.container.addEventListener("keydown",this),this.container.addEventListener("keyup",this),this.viewer.container.addEventListener("mouseup",this),this.viewer.container.addEventListener("touchend",this)}destroy(){this.__onMouseUp(),this.viewer.container.removeEventListener("mouseup",this),this.viewer.container.removeEventListener("touchend",this),super.destroy()}handleEvent(i){switch(i.type){case"mousedown":this.__onMouseDown();break;case"mouseup":this.__onMouseUp();break;case"touchend":this.__onMouseUp();break;case"keydown":i.key===lt.Enter&&this.__onMouseDown();break;case"keyup":i.key===lt.Enter&&this.__onMouseUp();break}}onClick(){}isSupported(){return bs(pt.isTouchEnabled)}__onMouseDown(){if(!this.state.enabled)return;const i={};switch(this.direction){case 0:i.pitch=!1;break;case 1:i.pitch=!0;break;case 3:i.yaw=!1;break;default:i.yaw=!0;break}this.viewer.stopAll(),this.viewer.dynamics.position.roll(i),this.handler.down()}__onMouseUp(){this.state.enabled&&this.handler.up(()=>{this.viewer.dynamics.position.stop(),this.viewer.resetIdleTimer()})}};zr.groupId="move";var Hl=class extends zr{constructor(i){super(i,1)}};Hl.id="moveDown";var Bl=class extends zr{constructor(i){super(i,2)}};Bl.id="moveLeft";var kl=class extends zr{constructor(i){super(i,3)}};kl.id="moveRight";var Vl=class extends zr{constructor(i){super(i,0)}};Vl.id="moveUp";var Ha=class extends It{constructor(i,e,t){super(i,{className:"psv-zoom-button",hoverScale:!0,collapsable:!1,tabbable:!0,icon:e}),this.direction=t,this.handler=new Cs,this.container.addEventListener("mousedown",this),this.container.addEventListener("keydown",this),this.container.addEventListener("keyup",this),this.viewer.container.addEventListener("mouseup",this),this.viewer.container.addEventListener("touchend",this)}destroy(){this.__onMouseUp(),this.viewer.container.removeEventListener("mouseup",this),this.viewer.container.removeEventListener("touchend",this),super.destroy()}handleEvent(i){switch(i.type){case"mousedown":this.__onMouseDown();break;case"mouseup":this.__onMouseUp();break;case"touchend":this.__onMouseUp();break;case"keydown":i.key===lt.Enter&&this.__onMouseDown();break;case"keyup":i.key===lt.Enter&&this.__onMouseUp();break}}onClick(){}isSupported(){return bs(pt.isTouchEnabled)}__onMouseDown(){this.state.enabled&&(this.viewer.dynamics.zoom.roll(this.direction===1),this.handler.down())}__onMouseUp(){this.state.enabled&&this.handler.up(()=>this.viewer.dynamics.zoom.stop())}};Ha.groupId="zoom";var Gl=class extends Ha{constructor(i){super(i,Yt.zoomIn,0)}};Gl.id="zoomIn";var Wl=class extends Ha{constructor(i){super(i,Yt.zoomOut,1)}};Wl.id="zoomOut";var Ba=class extends It{constructor(i){super(i,{className:"psv-zoom-range",hoverScale:!1,collapsable:!1,tabbable:!1}),this.zoomRange=document.createElement("div"),this.zoomRange.className="psv-zoom-range-line",this.container.appendChild(this.zoomRange),this.zoomValue=document.createElement("div"),this.zoomValue.className="psv-zoom-range-handle",this.zoomRange.appendChild(this.zoomValue),this.slider=new Wo(this.container,"HORIZONTAL",e=>this.__onSliderUpdate(e)),this.mediaMinWidth=parseInt(ci(this.container,"max-width"),10),this.viewer.addEventListener(hi.type,this),this.viewer.state.ready?this.__moveZoomValue(this.viewer.getZoomLevel()):this.viewer.addEventListener(Ur.type,this)}destroy(){this.slider.destroy(),this.viewer.removeEventListener(hi.type,this),this.viewer.removeEventListener(Ur.type,this),super.destroy()}handleEvent(i){i instanceof hi?this.__moveZoomValue(i.zoomLevel):i instanceof Ur&&this.__moveZoomValue(this.viewer.getZoomLevel())}onClick(){}isSupported(){return bs(pt.isTouchEnabled)}autoSize(){this.state.supported&&(this.viewer.state.size.width<=this.mediaMinWidth&&this.state.visible?this.hide(!1):this.viewer.state.size.width>this.mediaMinWidth&&!this.state.visible&&this.show(!1))}__moveZoomValue(i){this.zoomValue.style.left=i/100*this.zoomRange.offsetWidth-this.zoomValue.offsetWidth/2+"px"}__onSliderUpdate(i){i.mousedown&&this.viewer.zoom(i.value*100)}};Ba.id="zoomRange",Ba.groupId="zoom";var Xl=class extends Xo{constructor(i){super(),this.viewer=i}init(){}destroy(){}},jm=class extends Xl{constructor(i,e){super(i),this.config=this.constructor.configParser(e)}setOption(i,e){this.setOptions({[i]:e})}setOptions(i){const e=Ct(Ct({},this.config),i),t=this.constructor,r=t.configParser,s=t.readonlyOptions,a=t.id;for(let[o,n]of Object.entries(i)){if(!(o in r.defaults)){Ke(`${a}: Unknown option "${o}"`);continue}if(s.includes(o)){Ke(`${a}: Option "${o}" cannot be updated`);continue}o in r.parsers&&(n=r.parsers[o](n,{rawConfig:e,defValue:r.defaults[o]})),this.config[o]=n}}};jm.readonlyOptions=[];function ka(i){if(i){for(const[,e]of[["_",i],...Object.entries(i)])if(e.prototype instanceof Xl)return Oa(e.id,e.VERSION,"5.5.2"),e}return null}var cr={panorama:null,overlay:null,overlayOpacity:1,container:null,adapter:[Nr,null],plugins:[],caption:null,description:null,downloadUrl:null,downloadName:null,loadingImg:null,loadingTxt:"Loading...",size:null,fisheye:0,minFov:30,maxFov:90,defaultZoomLvl:50,defaultYaw:0,defaultPitch:0,sphereCorrection:null,moveSpeed:1,zoomSpeed:1,moveInertia:!0,mousewheel:!0,mousemove:!0,mousewheelCtrlKey:!1,touchmoveTwoFingers:!1,useXmpData:null,panoData:null,requestHeaders:null,canvasBackground:null,rendererParameters:{alpha:!0,antialias:!0},withCredentials:!1,navbar:["zoom","move","download","description","caption","fullscreen"],lang:{zoom:"Zoom",zoomOut:"Zoom out",zoomIn:"Zoom in",moveUp:"Move up",moveDown:"Move down",moveLeft:"Move left",moveRight:"Move right",download:"Download",fullscreen:"Fullscreen",menu:"Menu",close:"Close",twoFingers:"Use two fingers to navigate",ctrlZoom:"Use ctrl + scroll to zoom the image",loadError:"The panorama can't be loaded"},keyboard:"fullscreen",keyboardActions:{[lt.ArrowUp]:"ROTATE_UP",[lt.ArrowDown]:"ROTATE_DOWN",[lt.ArrowRight]:"ROTATE_RIGHT",[lt.ArrowLeft]:"ROTATE_LEFT",[lt.PageUp]:"ZOOM_IN",[lt.PageDown]:"ZOOM_OUT",[lt.Plus]:"ZOOM_IN",[lt.Minus]:"ZOOM_OUT"}},jl={panorama:"Use setPanorama method to change the panorama",panoData:"Use setPanorama method to change the panorama",overlay:"Use setOverlay method to changer the overlay",overlayOpacity:"Use setOverlay method to changer the overlay",container:"Cannot change viewer container",adapter:"Cannot change adapter",plugins:"Cannot change plugins"},Va={container:i=>{if(!i)throw new Be("No value given for container.");return i},adapter:(i,{defValue:e})=>{if(i?Array.isArray(i)?i=[Nl(i[0]),i[1]]:i=[Nl(i),null]:i=e,!i[0])throw new Be("An undefined value was given for adapter.");if(!i[0].id)throw new Be("Adapter has no id.");return i},overlayOpacity:i=>it.clamp(i,0,1),defaultYaw:i=>Mi(i),defaultPitch:i=>Mi(i,!0),defaultZoomLvl:i=>it.clamp(i,0,100),minFov:(i,{rawConfig:e})=>(e.maxFov<i&&(Ke("maxFov cannot be lower than minFov"),i=e.maxFov),it.clamp(i,1,179)),maxFov:(i,{rawConfig:e})=>(i<e.minFov&&(i=e.minFov),it.clamp(i,1,179)),lang:i=>(Array.isArray(i.twoFingers)&&(Ke("lang.twoFingers must not be an array"),i.twoFingers=i.twoFingers[0]),Ct(Ct({},cr.lang),i)),keyboard:i=>i?typeof i=="object"?(Ke("Use keyboardActions to configure the keyboard actions, keyboard option must be either true, false, 'fullscreen' or 'always'"),"fullscreen"):i==="always"?"always":"fullscreen":!1,keyboardActions:(i,{rawConfig:e})=>e.keyboard&&typeof e.keyboard=="object"?e.keyboard:i,fisheye:i=>i===!0?1:i===!1?0:i,requestHeaders:i=>i&&typeof i=="object"?()=>i:typeof i=="function"?i:null,rendererParameters:(i,{defValue:e})=>Ct(Ct({},i),e),plugins:i=>i.map((e,t)=>{if(Array.isArray(e)?e=[ka(e[0]),e[1]]:e=[ka(e),null],!e[0])throw new Be(`An undefined value was given for plugin ${t}.`);if(!e[0].id)throw new Be(`Plugin ${t} has no id.`);return e}),navbar:i=>i===!1?null:i===!0?Ar(cr.navbar):typeof i=="string"?i.split(/[ ,]/):i,useXmpData:i=>(i!==null&&Ke("Global useXmpData is deprecated, it is now configured on the adapter."),i),canvasBackground:i=>(i!==null&&Ke("Global canvasBackground is deprecated, it is now configured on the adapter."),i),overlay:i=>(i!==null&&Ke('"overlay" option is deprecated, use "@photo-sphere-viewer/overlay-plugin" instead.'),i)},Ym=As(cr,Va),hr=class extends It{constructor(i){super(i,{className:"psv-caption",hoverScale:!1,collapsable:!1,tabbable:!0}),this.contentWidth=0,this.state.width=0,this.contentElt=document.createElement("div"),this.contentElt.className="psv-caption-content",this.container.appendChild(this.contentElt),this.setCaption(this.viewer.config.caption)}hide(){this.contentElt.style.display="none",this.state.visible=!1}show(){this.contentElt.style.display="",this.state.visible=!0}onClick(){}setCaption(i){this.show(),this.contentElt.innerHTML=i!=null?i:"",this.contentElt.innerHTML?this.contentWidth=this.contentElt.offsetWidth:this.contentWidth=0,this.autoSize()}autoSize(){this.toggle(this.container.offsetWidth>=this.contentWidth),this.__refreshButton()}__refreshButton(){var i;(i=this.viewer.navbar.getButton(Fr.id,!1))==null||i.autoSize(!0)}};hr.id="caption";var Ga={},Ds={};function qm(i,e){if(!i.id)throw new Be("Button id is required");if(Ga[i.id]=i,i.groupId&&(Ds[i.groupId]=Ds[i.groupId]||[]).push(i),e){const t=cr.navbar;switch(e){case"start":t.unshift(i.id);break;case"end":t.push(i.id);break;default:{const[r,s]=e.split(":"),a=t.indexOf(r);if(!r||!s||a===-1)throw new Be(`Invalid defaultPosition ${e}`);t.splice(a+(s==="right"?1:0),0,i.id)}}}}[Wl,Ba,Gl,Fr,hr,Fl,zl,Bl,kl,Vl,Hl].forEach(i=>qm(i));var Zm=class extends Oi{constructor(i){super(i,{className:`psv-navbar ${Sr}`}),this.collapsed=[],this.state.visible=!1}show(){this.viewer.container.classList.add("psv--has-navbar"),this.container.classList.add("psv-navbar--open"),this.state.visible=!0}hide(){this.viewer.container.classList.remove("psv--has-navbar"),this.container.classList.remove("psv-navbar--open"),this.state.visible=!1}setButtons(i){this.children.slice().forEach(e=>e.destroy()),this.children.length=0,i.indexOf(hr.id)!==-1&&i.indexOf(Fr.id)===-1&&i.splice(i.indexOf(hr.id),0,Fr.id),i.forEach(e=>{typeof e=="object"?new Vm(this,e):Ga[e]?new Ga[e](this):Ds[e]?Ds[e].forEach(t=>{new t(this)}):Ke(`Unknown button ${e}`)}),new Us(this),this.children.forEach(e=>{e instanceof It&&e.checkSupported()}),this.autoSize()}setCaption(i){this.children.some(e=>e instanceof hr?(e.setCaption(i),!0):!1)}getButton(i,e=!0){const t=this.children.find(r=>r instanceof It&&r.id===i);return!t&&e&&Ke(`button "${i}" not found in the navbar`),t}autoSize(){var r;this.children.forEach(s=>{s instanceof It&&s.autoSize()});const i=this.container.offsetWidth;let e=0;const t=[];this.children.forEach(s=>{s.isVisible()&&s instanceof It&&(e+=s.width,s.collapsable&&t.push(s))}),e!==0&&(i<e&&t.length>0?(t.forEach(s=>s.collapse()),this.collapsed=t,this.getButton(Us.id).show(!1)):i>=e&&this.collapsed.length>0&&(this.collapsed.forEach(s=>s.uncollapse()),this.collapsed=[],this.getButton(Us.id).hide(!1)),(r=this.getButton(hr.id,!1))==null||r.autoSize())}},Km=class extends Oi{constructor(i){super(i,{className:"psv-loader-container"}),this.loader=document.createElement("div"),this.loader.className="psv-loader",this.container.appendChild(this.loader),this.size=this.loader.offsetWidth,this.canvas=document.createElementNS("http://www.w3.org/2000/svg","svg"),this.canvas.setAttribute("class","psv-loader-canvas"),this.canvas.setAttribute("viewBox",`0 0 ${this.size} ${this.size}`),this.loader.appendChild(this.canvas),this.textColor=ci(this.loader,"color"),this.color=ci(this.canvas,"color"),this.border=parseInt(ci(this.loader,"--psv-loader-border"),10),this.thickness=parseInt(ci(this.loader,"--psv-loader-tickness"),10),this.viewer.addEventListener(Rt.type,this),this.__updateContent(),this.hide()}destroy(){this.viewer.removeEventListener(Rt.type,this),super.destroy()}handleEvent(i){i instanceof Rt&&i.containsOptions("loadingImg","loadingTxt")&&this.__updateContent()}setProgress(i){const e=Math.min(i,99.999)/100*Math.PI*2,t=this.size/2,r=t,s=this.thickness/2+this.border,a=(this.size-this.thickness)/2-this.border,o=Math.sin(e)*a+t,n=-Math.cos(e)*a+t,l=i>50?"1":"0";this.canvas.innerHTML=`
            <circle cx="${t}" cy="${t}" r="${t}" fill="${this.color}"/>
            <path d="M ${r} ${s} A ${a} ${a} 0 ${l} 1 ${o} ${n}" 
                  fill="none" stroke="${this.textColor}" stroke-width="${this.thickness}" stroke-linecap="round"/>
        `,this.viewer.dispatchEvent(new dl(Math.round(i)))}__updateContent(){const i=this.loader.querySelector(".psv-loader-image, .psv-loader-text");i&&this.loader.removeChild(i);let e;if(this.viewer.config.loadingImg?(e=document.createElement("img"),e.className="psv-loader-image",e.src=this.viewer.config.loadingImg):this.viewer.config.loadingTxt&&(e=document.createElement("div"),e.className="psv-loader-text",e.innerHTML=this.viewer.config.loadingTxt),e){const t=Math.round(Math.sqrt(2*Math.pow(this.size/2-this.thickness/2-this.border,2)));e.style.maxWidth=t+"px",e.style.maxHeight=t+"px",this.loader.appendChild(e)}}},$m=class extends Oi{constructor(i){super(i,{className:"psv-notification"}),this.state={visible:!1,contentId:null,timeout:null},this.content=document.createElement("div"),this.content.className="psv-notification-content",this.container.appendChild(this.content),this.content.addEventListener("click",()=>this.hide())}isVisible(i){return this.state.visible&&(!i||!this.state.contentId||this.state.contentId===i)}toggle(){throw new Be("Notification cannot be toggled")}show(i){this.state.timeout&&(clearTimeout(this.state.timeout),this.state.timeout=null),typeof i=="string"&&(i={content:i}),this.state.contentId=i.id||null,this.content.innerHTML=i.content,this.container.classList.add("psv-notification--visible"),this.state.visible=!0,this.viewer.dispatchEvent(new Dr(i.id)),i.timeout&&(this.state.timeout=setTimeout(()=>this.hide(this.state.contentId),i.timeout))}hide(i){if(this.isVisible(i)){const e=this.state.contentId;this.container.classList.remove("psv-notification--visible"),this.state.visible=!1,this.state.contentId=null,this.viewer.dispatchEvent(new Lr(e))}}},Jm=class extends Oi{constructor(i){super(i,{className:`psv-overlay ${Sr}`}),this.state={visible:!1,contentId:null,dissmisable:!0},this.image=document.createElement("div"),this.image.className="psv-overlay-image",this.container.appendChild(this.image),this.title=document.createElement("div"),this.title.className="psv-overlay-title",this.container.appendChild(this.title),this.text=document.createElement("div"),this.text.className="psv-overlay-text",this.container.appendChild(this.text),this.container.addEventListener("click",this),this.viewer.addEventListener(Ti.type,this),super.hide()}destroy(){this.viewer.removeEventListener(Ti.type,this),super.destroy()}handleEvent(i){i.type==="click"?this.isVisible()&&this.state.dissmisable&&(this.hide(),i.stopPropagation()):i instanceof Ti&&this.isVisible()&&this.state.dissmisable&&i.key===lt.Escape&&(this.hide(),i.preventDefault())}isVisible(i){return this.state.visible&&(!i||!this.state.contentId||this.state.contentId===i)}toggle(){throw new Be("Overlay cannot be toggled")}show(i){typeof i=="string"&&(i={title:i}),this.state.contentId=i.id||null,this.state.dissmisable=i.dissmisable!==!1,this.image.innerHTML=i.image||"",this.title.innerHTML=i.title||"",this.text.innerHTML=i.text||"",super.show(),this.viewer.dispatchEvent(new bl(i.id))}hide(i){if(this.isVisible(i)){const e=this.state.contentId;super.hide(),this.state.contentId=null,this.viewer.dispatchEvent(new al(e))}}},Qm=200,Wa="psv-panel-content--no-interaction",eg=class extends Oi{constructor(i){super(i,{className:`psv-panel ${Sr}`}),this.state={visible:!1,contentId:null,mouseX:0,mouseY:0,mousedown:!1,clickHandler:null,keyHandler:null,width:{}};const e=document.createElement("div");e.className="psv-panel-resizer",this.container.appendChild(e);const t=document.createElement("div");t.className="psv-panel-close-button",t.innerHTML=Yt.close,t.title=i.config.lang.close,this.container.appendChild(t),this.content=document.createElement("div"),this.content.className="psv-panel-content",this.container.appendChild(this.content),this.container.addEventListener("wheel",r=>r.stopPropagation()),t.addEventListener("click",()=>this.hide()),e.addEventListener("mousedown",this),e.addEventListener("touchstart",this),this.viewer.container.addEventListener("mouseup",this),this.viewer.container.addEventListener("touchend",this),this.viewer.container.addEventListener("mousemove",this),this.viewer.container.addEventListener("touchmove",this),this.viewer.addEventListener(Ti.type,this)}destroy(){this.viewer.removeEventListener(Ti.type,this),this.viewer.container.removeEventListener("mousemove",this),this.viewer.container.removeEventListener("touchmove",this),this.viewer.container.removeEventListener("mouseup",this),this.viewer.container.removeEventListener("touchend",this),super.destroy()}handleEvent(i){switch(i.type){case"mousedown":this.__onMouseDown(i);break;case"touchstart":this.__onTouchStart(i);break;case"mousemove":this.__onMouseMove(i);break;case"touchmove":this.__onTouchMove(i);break;case"mouseup":this.__onMouseUp(i);break;case"touchend":this.__onTouchEnd(i);break;case Ti.type:this.__onKeyPress(i);break}}isVisible(i){return this.state.visible&&(!i||!this.state.contentId||this.state.contentId===i)}toggle(){throw new Be("Panel cannot be toggled")}show(i){typeof i=="string"&&(i={content:i});const e=this.isVisible(i.id);this.state.contentId=i.id||null,this.state.visible=!0,this.state.clickHandler&&(this.content.removeEventListener("click",this.state.clickHandler),this.content.removeEventListener("keydown",this.state.keyHandler),this.state.clickHandler=null,this.state.keyHandler=null),i.id&&this.state.width[i.id]?this.container.style.width=this.state.width[i.id]:i.width?this.container.style.width=i.width:this.container.style.width=null,this.content.innerHTML=i.content,this.content.scrollTop=0,this.container.classList.add("psv-panel--open"),Ms(this.content,"psv-panel-content--no-margin",i.noMargin===!0),i.clickHandler&&(this.state.clickHandler=t=>{i.clickHandler(t.target)},this.state.keyHandler=t=>{t.key===lt.Enter&&i.clickHandler(t.target)},this.content.addEventListener("click",this.state.clickHandler),this.content.addEventListener("keydown",this.state.keyHandler),e||setTimeout(()=>{var t;(t=this.content.querySelector("a,button,[tabindex]"))==null||t.focus()},300)),this.viewer.dispatchEvent(new Si(i.id))}hide(i){if(this.isVisible(i)){const e=this.state.contentId;this.state.visible=!1,this.state.contentId=null,this.content.innerHTML=null,this.container.classList.remove("psv-panel--open"),this.state.clickHandler&&(this.content.removeEventListener("click",this.state.clickHandler),this.state.clickHandler=null),this.viewer.dispatchEvent(new bi(e))}}__onMouseDown(i){i.stopPropagation(),this.__startResize(i.clientX,i.clientY)}__onTouchStart(i){if(i.stopPropagation(),i.touches.length===1){const e=i.touches[0];this.__startResize(e.clientX,e.clientY)}}__onMouseUp(i){this.state.mousedown&&(i.stopPropagation(),this.state.mousedown=!1,this.content.classList.remove(Wa))}__onTouchEnd(i){this.state.mousedown&&(i.stopPropagation(),i.touches.length===0&&(this.state.mousedown=!1,this.content.classList.remove(Wa)))}__onMouseMove(i){this.state.mousedown&&(i.stopPropagation(),this.__resize(i.clientX,i.clientY))}__onTouchMove(i){if(this.state.mousedown){const e=i.touches[0];this.__resize(e.clientX,e.clientY)}}__onKeyPress(i){this.isVisible()&&i.key===lt.Escape&&(this.hide(),i.preventDefault())}__startResize(i,e){this.state.mouseX=i,this.state.mouseY=e,this.state.mousedown=!0,this.content.classList.add(Wa)}__resize(i,e){const t=i,r=e,s=Math.max(Qm,this.container.offsetWidth-(t-this.state.mouseX))+"px";this.state.contentId&&(this.state.width[this.state.contentId]=s),this.container.style.width=s,this.state.mouseX=t,this.state.mouseY=r}},tg=class extends Oi{constructor(i,e){super(i,{className:"psv-tooltip"}),this.state={visible:!0,arrow:0,border:0,state:0,width:0,height:0,pos:"",config:null,data:null},this.content=document.createElement("div"),this.content.className="psv-tooltip-content",this.container.appendChild(this.content),this.arrow=document.createElement("div"),this.arrow.className="psv-tooltip-arrow",this.container.appendChild(this.arrow),this.container.addEventListener("transitionend",this),this.container.addEventListener("touchdown",t=>t.stopPropagation()),this.container.addEventListener("mousedown",t=>t.stopPropagation()),this.container.style.top="-1000px",this.container.style.left="-1000px",this.show(e)}handleEvent(i){i.type==="transitionend"&&this.__onTransitionEnd(i)}destroy(){delete this.state.data,super.destroy()}toggle(){throw new Be("Tooltip cannot be toggled")}show(i){if(this.state.state!==0)throw new Be("Initialized tooltip cannot be re-initialized");i.className&&Ta(this.container,i.className),i.style&&Object.assign(this.container.style,i.style),this.state.state=3,this.update(i.content,i),this.state.data=i.data,this.state.state=1,this.viewer.dispatchEvent(new wl(this,this.state.data)),this.__waitImages()}update(i,e){this.content.innerHTML=i;const t=this.container.getBoundingClientRect();this.state.width=t.right-t.left,this.state.height=t.bottom-t.top,this.state.arrow=parseInt(ci(this.arrow,"border-top-width"),10),this.state.border=parseInt(ci(this.container,"border-top-left-radius"),10),this.move(e!=null?e:this.state.config)}move(i){var n,l,c;if(this.state.state!==1&&this.state.state!==3)throw new Be("Uninitialized tooltip cannot be moved");i.box=(c=(l=i.box)!=null?l:(n=this.state.config)==null?void 0:n.box)!=null?c:{width:0,height:0},this.state.config=i;const e=this.container,t=this.arrow,r={posClass:zo(i.position,{allowCenter:!1,cssOrder:!1})||["top","center"],width:this.state.width,height:this.state.height,top:0,left:0,arrowTop:0,arrowLeft:0};this.__computeTooltipPosition(r,i);let s=null,a=null;if(r.top<0?s="bottom":r.top+r.height>this.viewer.state.size.height&&(s="top"),r.left<0?a="right":r.left+r.width>this.viewer.state.size.width&&(a="left"),a||s){const h=Pa(r.posClass);s&&(r.posClass[h?0:1]=s),a&&(r.posClass[h?1:0]=a),this.__computeTooltipPosition(r,i)}e.style.top=r.top+"px",e.style.left=r.left+"px",t.style.top=r.arrowTop+"px",t.style.left=r.arrowLeft+"px";const o=r.posClass.join("-");o!==this.state.pos&&(e.classList.remove(`psv-tooltip--${this.state.pos}`),this.state.pos=o,e.classList.add(`psv-tooltip--${this.state.pos}`))}hide(){this.container.classList.remove("psv-tooltip--visible"),this.state.state=2,this.viewer.dispatchEvent(new ll(this.state.data))}__onTransitionEnd(i){if(i.propertyName==="transform")switch(this.state.state){case 1:this.container.classList.add("psv-tooltip--visible"),this.state.state=3;break;case 2:this.state.state=0,this.destroy();break}}__computeTooltipPosition(i,e){const t=this.state.arrow,r=e.top,s=i.height,a=e.left,o=i.width,n=t+this.state.border,l=e.box.width/2+t*2,c=e.box.height/2+t*2;switch(i.posClass.join("-")){case"top-left":i.top=r-c-s,i.left=a+n-o,i.arrowTop=s,i.arrowLeft=o-n-t;break;case"top-center":i.top=r-c-s,i.left=a-o/2,i.arrowTop=s,i.arrowLeft=o/2-t;break;case"top-right":i.top=r-c-s,i.left=a-n,i.arrowTop=s,i.arrowLeft=t;break;case"bottom-left":i.top=r+c,i.left=a+n-o,i.arrowTop=-t*2,i.arrowLeft=o-n-t;break;case"bottom-center":i.top=r+c,i.left=a-o/2,i.arrowTop=-t*2,i.arrowLeft=o/2-t;break;case"bottom-right":i.top=r+c,i.left=a-n,i.arrowTop=-t*2,i.arrowLeft=t;break;case"left-top":i.top=r+n-s,i.left=a-l-o,i.arrowTop=s-n-t,i.arrowLeft=o;break;case"center-left":i.top=r-s/2,i.left=a-l-o,i.arrowTop=s/2-t,i.arrowLeft=o;break;case"left-bottom":i.top=r-n,i.left=a-l-o,i.arrowTop=t,i.arrowLeft=o;break;case"right-top":i.top=r+n-s,i.left=a+l,i.arrowTop=s-n-t,i.arrowLeft=-t*2;break;case"center-right":i.top=r-s/2,i.left=a+l,i.arrowTop=s/2-t,i.arrowLeft=-t*2;break;case"right-bottom":i.top=r-n,i.left=a+l,i.arrowTop=t,i.arrowLeft=-t*2;break}}__waitImages(){const i=this.content.querySelectorAll("img");if(i.length>0){const e=[];i.forEach(t=>{e.push(new Promise(r=>{t.onload=r,t.onerror=r}))}),Promise.all(e).then(()=>{if(this.state.state===1||this.state.state===3){const t=this.container.getBoundingClientRect();this.state.width=t.right-t.left,this.state.height=t.bottom-t.top,this.move(this.state.config)}})}}},dr={enabled:!0,maxItems:10,ttl:10*60,items:{},purgeInterval:null,init(){Ii.enabled&&(Ke("ThreeJS cache should be disabled"),Ii.enabled=!1),!this.purgeInterval&&this.enabled&&(this.purgeInterval=setInterval(()=>this.purge(),60*1e3))},add(i,e,t){var r;this.enabled&&e&&(this.items[e]=(r=this.items[e])!=null?r:{files:{},lastAccess:null},this.items[e].files[i]=t,this.items[e].lastAccess=Date.now())},get(i,e){if(this.enabled&&e&&this.items[e])return this.items[e].lastAccess=Date.now(),this.items[e].files[i]},remove(i,e){this.enabled&&e&&this.items[e]&&(delete this.items[e].files[i],Object.keys(this.items[e].files).length===0&&delete this.items[e])},purge(){Object.entries(this.items).sort(([,i],[,e])=>e.lastAccess-i.lastAccess).forEach(([i,{lastAccess:e}],t)=>{t>0&&(Date.now()-e>=this.ttl*1e3||t>=this.maxItems)&&delete this.items[i]})}},ig=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="15 15 70 70"><path fill="currentColor" d="M50,16.2c-18.6,0-33.8,15.1-33.8,33.8S31.4,83.7,50,83.7S83.8,68.6,83.8,50S68.6,16.2,50,16.2z M50,80.2c-16.7,0-30.2-13.6-30.2-30.2S33.3,19.7,50,19.7S80.3,33.3,80.3,50S66.7,80.2,50,80.2z"/><rect fill="currentColor" x="48" y="31.7" width="4" height="28"/><rect fill="currentColor" x="48" y="63.2" width="4" height="5"/><!--Created by Shastry from the Noun Project--></svg>
`,Hr=class{constructor(i){this.viewer=i,this.config=i.config,this.state=i.state}destroy(){}},qt=new U,Is=new xr(0,0,0,"ZXY"),rg=class extends Hr{constructor(i){super(i)}fovToZoomLevel(i){const e=Math.round((i-this.config.minFov)/(this.config.maxFov-this.config.minFov)*100);return e-2*(e-50)}zoomLevelToFov(i){return this.config.maxFov+i/100*(this.config.minFov-this.config.maxFov)}vFovToHFov(i){return it.radToDeg(2*Math.atan(Math.tan(it.degToRad(i)/2)*this.state.aspect))}getAnimationProperties(i,e,t){const r=!Dt(e),s=!Dt(t),a={};let o=null;if(r){const n=this.viewer.getPosition(),l=bo(n.yaw,e.yaw);a.yaw={start:n.yaw,end:n.yaw+l},a.pitch={start:n.pitch,end:e.pitch},o=Ua(i,To(n,e))}if(s){const n=this.viewer.getZoomLevel(),l=Math.abs(t-n);a.zoom={start:n,end:t},o===null&&(o=Ua(i,Math.PI/4*l/100))}return o===null?typeof i=="number"?o=i:o=Ea:o=Math.max(Ea,o),{duration:o,properties:a}}textureCoordsToSphericalCoords(i){var t;if(!((t=this.state.textureData)!=null&&t.panoData))throw new Be("Current adapter does not support texture coordinates or no texture has been loaded");const e=this.viewer.adapter.textureCoordsToSphericalCoords(i,this.state.textureData.panoData);return!Is.equals(this.viewer.renderer.panoramaPose)||!Is.equals(this.viewer.renderer.sphereCorrection)?(this.sphericalCoordsToVector3(e,qt),qt.applyEuler(this.viewer.renderer.panoramaPose),qt.applyEuler(this.viewer.renderer.sphereCorrection),this.vector3ToSphericalCoords(qt)):e}sphericalCoordsToTextureCoords(i){var e;if(!((e=this.state.textureData)!=null&&e.panoData))throw new Be("Current adapter does not support texture coordinates or no texture has been loaded");return(!Is.equals(this.viewer.renderer.panoramaPose)||!Is.equals(this.viewer.renderer.sphereCorrection))&&(this.sphericalCoordsToVector3(i,qt),Ia(qt,this.viewer.renderer.sphereCorrection),Ia(qt,this.viewer.renderer.panoramaPose),i=this.vector3ToSphericalCoords(qt)),this.viewer.adapter.sphericalCoordsToTextureCoords(i,this.state.textureData.panoData)}sphericalCoordsToVector3(i,e,t=Tr){return e||(e=new U),e.x=t*-Math.cos(i.pitch)*Math.sin(i.yaw),e.y=t*Math.sin(i.pitch),e.z=t*Math.cos(i.pitch)*Math.cos(i.yaw),e}vector3ToSphericalCoords(i){const e=Math.acos(i.y/Math.sqrt(i.x*i.x+i.y*i.y+i.z*i.z)),t=Math.atan2(i.x,i.z);return{yaw:t<0?-t:Math.PI*2-t,pitch:Math.PI/2-e}}viewerCoordsToVector3(i){const e=this.viewer.renderer.getIntersections(i).filter(t=>t.object.userData[Ei]);return e.length?e[0].point:null}viewerCoordsToSphericalCoords(i){const e=this.viewerCoordsToVector3(i);return e?this.vector3ToSphericalCoords(e):null}vector3ToViewerCoords(i){const e=i.clone();return e.project(this.viewer.renderer.camera),{x:Math.round((e.x+1)/2*this.state.size.width),y:Math.round((1-e.y)/2*this.state.size.height)}}sphericalCoordsToViewerCoords(i){return this.sphericalCoordsToVector3(i,qt),this.vector3ToViewerCoords(qt)}isPointVisible(i){let e,t;if(i instanceof U)e=i,t=this.vector3ToViewerCoords(i);else if(Ts(i))e=this.sphericalCoordsToVector3(i,qt),t=this.vector3ToViewerCoords(e);else return!1;return e.dot(this.viewer.state.direction)>0&&t.x>=0&&t.x<=this.viewer.state.size.width&&t.y>=0&&t.y<=this.viewer.state.size.height}cleanPosition(i){return"yaw"in i&&"pitch"in i?{yaw:Mi(i.yaw),pitch:Mi(i.pitch,!this.state.littlePlanet)}:this.textureCoordsToSphericalCoords(i)}cleanSphereCorrection(i){return{pan:Mi((i==null?void 0:i.pan)||0),tilt:Mi((i==null?void 0:i.tilt)||0,!0),roll:Mi((i==null?void 0:i.roll)||0,!0,!1)}}cleanPanoramaPose(i){return{pan:it.degToRad((i==null?void 0:i.poseHeading)||0),tilt:it.degToRad((i==null?void 0:i.posePitch)||0),roll:it.degToRad((i==null?void 0:i.poseRoll)||0)}}},sg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" d="M33.38 33.2a1.96 1.96 0 0 0 1.5-3.23 10.61 10.61 0 0 1 7.18-17.51c.7-.06 1.31-.49 1.61-1.12a13.02 13.02 0 0 1 11.74-7.43c7.14 0 12.96 5.8 12.96 12.9 0 3.07-1.1 6.05-3.1 8.38-.7.82-.61 2.05.21 2.76.83.7 2.07.6 2.78-.22a16.77 16.77 0 0 0 4.04-10.91C72.3 7.54 64.72 0 55.4 0a16.98 16.98 0 0 0-14.79 8.7 14.6 14.6 0 0 0-12.23 14.36c0 3.46 1.25 6.82 3.5 9.45.4.45.94.69 1.5.69m45.74 43.55a22.13 22.13 0 0 1-5.23 12.4c-4 4.55-9.53 6.86-16.42 6.86-12.6 0-20.1-10.8-20.17-10.91a1.82 1.82 0 0 0-.08-.1c-5.3-6.83-14.55-23.82-17.27-28.87-.05-.1 0-.21.02-.23a6.3 6.3 0 0 1 8.24 1.85l9.38 12.59a1.97 1.97 0 0 0 3.54-1.17V25.34a4 4 0 0 1 1.19-2.87 3.32 3.32 0 0 1 2.4-.95c1.88.05 3.4 1.82 3.4 3.94v24.32a1.96 1.96 0 0 0 3.93 0v-33.1a3.5 3.5 0 0 1 7 0v35.39a1.96 1.96 0 0 0 3.93 0v-.44c.05-2.05 1.6-3.7 3.49-3.7 1.93 0 3.5 1.7 3.5 3.82v5.63c0 .24.04.48.13.71l.1.26a1.97 1.97 0 0 0 3.76-.37c.33-1.78 1.77-3.07 3.43-3.07 1.9 0 3.45 1.67 3.5 3.74l-1.77 18.1zM77.39 51c-1.25 0-2.45.32-3.5.9v-.15c0-4.27-3.33-7.74-7.42-7.74-1.26 0-2.45.33-3.5.9V16.69a7.42 7.42 0 0 0-14.85 0v1.86a7 7 0 0 0-3.28-.94 7.21 7.21 0 0 0-5.26 2.07 7.92 7.92 0 0 0-2.38 5.67v37.9l-5.83-7.82a10.2 10.2 0 0 0-13.35-2.92 4.1 4.1 0 0 0-1.53 5.48C20 64.52 28.74 80.45 34.07 87.34c.72 1.04 9.02 12.59 23.4 12.59 7.96 0 14.66-2.84 19.38-8.2a26.06 26.06 0 0 0 6.18-14.6l1.78-18.2v-.2c0-4.26-3.32-7.73-7.42-7.73z"/><!--Created by AomAm from the Noun Project--></svg>
`,ag=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="10 17 79 79"><path fill="currentColor" d="M38.1 29.27c-.24 0-.44.2-.44.45v10.7a.45.45 0 00.9 0v-10.7c0-.25-.2-.45-.45-.45zm10.2 26.66a11.54 11.54 0 01-8.48-6.14.45.45 0 10-.8.41 12.45 12.45 0 009.22 6.62.45.45 0 00.07-.9zm24.55-13.08a23.04 23.04 0 00-22.56-23v7.07l-.01.05a2.83 2.83 0 012.39 2.78v14.03l.09-.02h8.84v-9.22a.45.45 0 11.9 0v9.22h10.35v-.9zm0 27.33V44.66H62.5c-.02 2.01-.52 4-1.47 5.76a.45.45 0 01-.61.18.45.45 0 01-.19-.61 11.54 11.54 0 001.36-5.33h-8.83l-.1-.01a2.83 2.83 0 01-2.83 2.84h-.04-.04a2.83 2.83 0 01-2.83-2.83v-14.9a2.82 2.82 0 012.47-2.8v-7.11a23.04 23.04 0 00-22.57 23v.91h14.72V29.88a8.2 8.2 0 015.02-7.57c.22-.1.5.01.59.24.1.23-.01.5-.24.6a7.3 7.3 0 00-4.47 6.73v13.88h3.9a.45.45 0 110 .9h-3.9v.15a7.32 7.32 0 0011.23 6.17.45.45 0 01.49.76 8.22 8.22 0 01-12.62-6.93v-.15H26.82v25.52a23.04 23.04 0 0023.01 23.01 23.04 23.04 0 0023.02-23.01zm1.8-27.33v27.33A24.85 24.85 0 0149.84 95a24.85 24.85 0 01-24.82-24.82V42.85a24.85 24.85 0 0124.82-24.82 24.85 24.85 0 0124.83 24.82zM57.98 29.88v9.36a.45.45 0 11-.9 0v-9.36a7.28 7.28 0 00-3.4-6.17.45.45 0 01.49-.76 8.18 8.18 0 013.8 6.93z"/><!-- Created by Icon Island from the Noun Project --></svg>
`,Br=class zc{constructor(){this.$=zc.IDLE}is(...e){return e.some(t=>this.$&t)}set(e){this.$=e}add(e){this.$|=e}remove(e){this.$&=~e}};Br.IDLE=0,Br.CLICK=1,Br.MOVING=2,Br.INERTIA=4;var $e=Br,ng=class extends Hr{constructor(i){super(i),this.data={startMouseX:0,startMouseY:0,mouseX:0,mouseY:0,mouseHistory:[],pinchDist:0,ctrlKeyDown:!1,dblclickData:null,dblclickTimeout:null,longtouchTimeout:null,twofingersTimeout:null,ctrlZoomTimeout:null},this.step=new $e,this.keyHandler=new Cs,this.resizeObserver=new ResizeObserver(Aa(()=>this.viewer.autoSize(),50)),this.moveThreshold=go*pt.pixelRatio}init(){window.addEventListener("keydown",this,{passive:!1}),window.addEventListener("keyup",this),this.viewer.container.addEventListener("mousedown",this),window.addEventListener("mousemove",this,{passive:!1}),window.addEventListener("mouseup",this),this.viewer.container.addEventListener("touchstart",this,{passive:!1}),window.addEventListener("touchmove",this,{passive:!1}),window.addEventListener("touchend",this,{passive:!1}),this.viewer.container.addEventListener("wheel",this,{passive:!1}),document.addEventListener(pt.fullscreenEvent,this),this.resizeObserver.observe(this.viewer.container)}destroy(){window.removeEventListener("keydown",this),window.removeEventListener("keyup",this),this.viewer.container.removeEventListener("mousedown",this),window.removeEventListener("mousemove",this),window.removeEventListener("mouseup",this),this.viewer.container.removeEventListener("touchstart",this),window.removeEventListener("touchmove",this),window.removeEventListener("touchend",this),this.viewer.container.removeEventListener("wheel",this),document.removeEventListener(pt.fullscreenEvent,this),this.resizeObserver.disconnect(),clearTimeout(this.data.dblclickTimeout),clearTimeout(this.data.longtouchTimeout),clearTimeout(this.data.twofingersTimeout),clearTimeout(this.data.ctrlZoomTimeout),super.destroy()}handleEvent(i){switch(i.type){case"keydown":this.__onKeyDown(i);break;case"keyup":this.__onKeyUp();break;case"mousemove":this.__onMouseMove(i);break;case"mouseup":this.__onMouseUp(i);break;case"touchmove":this.__onTouchMove(i);break;case"touchend":this.__onTouchEnd(i);break;case pt.fullscreenEvent:this.__onFullscreenChange();break}if(!Sa(i.target,"."+Sr))switch(i.type){case"mousedown":this.__onMouseDown(i);break;case"touchstart":this.__onTouchStart(i);break;case"wheel":this.__onMouseWheel(i);break}}__onKeyDown(i){var t;if(this.config.mousewheelCtrlKey&&(this.data.ctrlKeyDown=i.key===lt.Control,this.data.ctrlKeyDown&&(clearTimeout(this.data.ctrlZoomTimeout),this.viewer.overlay.hide(ut.CTRL_ZOOM))),!this.viewer.dispatchEvent(new Ti(i.key))||!this.state.keyboardEnabled)return;const e=(t=this.config.keyboardActions)==null?void 0:t[i.key];if(typeof e=="function")e(this.viewer),i.preventDefault();else if(e&&!this.keyHandler.pending){switch(e!=="ZOOM_IN"&&e!=="ZOOM_OUT"&&this.viewer.stopAll(),e){case"ROTATE_UP":this.viewer.dynamics.position.roll({pitch:!1});break;case"ROTATE_DOWN":this.viewer.dynamics.position.roll({pitch:!0});break;case"ROTATE_RIGHT":this.viewer.dynamics.position.roll({yaw:!1});break;case"ROTATE_LEFT":this.viewer.dynamics.position.roll({yaw:!0});break;case"ZOOM_IN":this.viewer.dynamics.zoom.roll(!1);break;case"ZOOM_OUT":this.viewer.dynamics.zoom.roll(!0);break}this.keyHandler.down(),i.preventDefault()}}__onKeyUp(){this.data.ctrlKeyDown=!1,this.state.keyboardEnabled&&this.keyHandler.up(()=>{this.viewer.dynamics.position.stop(),this.viewer.dynamics.zoom.stop(),this.viewer.resetIdleTimer()})}__onMouseDown(i){this.step.add($e.CLICK),this.data.startMouseX=i.clientX,this.data.startMouseY=i.clientY}__onMouseUp(i){this.step.is($e.CLICK,$e.MOVING)&&this.__stopMove(i.clientX,i.clientY,i.target,i.button===2)}__onMouseMove(i){this.config.mousemove&&this.step.is($e.CLICK,$e.MOVING)&&(i.preventDefault(),this.__doMove(i.clientX,i.clientY)),this.__handleObjectsEvents(i)}__onTouchStart(i){i.touches.length===1?(this.step.add($e.CLICK),this.data.startMouseX=i.touches[0].clientX,this.data.startMouseY=i.touches[0].clientY,this.data.longtouchTimeout||(this.data.longtouchTimeout=setTimeout(()=>{const e=i.touches[0];this.__stopMove(e.clientX,e.clientY,e.target,!0),this.data.longtouchTimeout=null},_o))):i.touches.length===2&&(this.step.set($e.IDLE),this.__cancelLongTouch(),this.config.mousemove&&(this.__cancelTwoFingersOverlay(),this.__startMoveZoom(i),i.preventDefault()))}__onTouchEnd(i){if(this.__cancelLongTouch(),this.step.is($e.CLICK,$e.MOVING)){if(i.preventDefault(),this.__cancelTwoFingersOverlay(),i.touches.length===1)this.__stopMove(this.data.mouseX,this.data.mouseY);else if(i.touches.length===0){const e=i.changedTouches[0];this.__stopMove(e.clientX,e.clientY,e.target)}}}__onTouchMove(i){if(this.__cancelLongTouch(),!!this.config.mousemove)if(i.touches.length===1){if(this.config.touchmoveTwoFingers)this.step.is($e.CLICK)&&!this.data.twofingersTimeout&&(this.data.twofingersTimeout=setTimeout(()=>{this.viewer.overlay.show({id:ut.TWO_FINGERS,image:sg,title:this.config.lang.twoFingers})},xo));else if(this.step.is($e.CLICK,$e.MOVING)){i.preventDefault();const e=i.touches[0];this.__doMove(e.clientX,e.clientY)}}else this.__doMoveZoom(i),this.__cancelTwoFingersOverlay()}__cancelLongTouch(){this.data.longtouchTimeout&&(clearTimeout(this.data.longtouchTimeout),this.data.longtouchTimeout=null)}__cancelTwoFingersOverlay(){this.config.touchmoveTwoFingers&&(this.data.twofingersTimeout&&(clearTimeout(this.data.twofingersTimeout),this.data.twofingersTimeout=null),this.viewer.overlay.hide(ut.TWO_FINGERS))}__onMouseWheel(i){if(!this.config.mousewheel||!i.deltaY)return;if(this.config.mousewheelCtrlKey&&!this.data.ctrlKeyDown){this.viewer.overlay.show({id:ut.CTRL_ZOOM,image:ag,title:this.config.lang.ctrlZoom}),clearTimeout(this.data.ctrlZoomTimeout),this.data.ctrlZoomTimeout=setTimeout(()=>this.viewer.overlay.hide(ut.CTRL_ZOOM),yo);return}i.preventDefault(),i.stopPropagation();const e=i.deltaY/Math.abs(i.deltaY)*5*this.config.zoomSpeed;e!==0&&this.viewer.dynamics.zoom.step(-e,5)}__onFullscreenChange(){const i=this.viewer.isFullscreenEnabled();this.config.keyboard==="fullscreen"&&(i?this.viewer.startKeyboardControl():this.viewer.stopKeyboardControl()),this.viewer.dispatchEvent(new Cr(i))}__resetMove(){this.step.set($e.IDLE),this.data.mouseX=0,this.data.mouseY=0,this.data.startMouseX=0,this.data.startMouseY=0,this.data.mouseHistory.length=0}__startMoveZoom(i){this.viewer.stopAll(),this.__resetMove();const e=wa(i);this.step.set($e.MOVING),{distance:this.data.pinchDist,center:{x:this.data.mouseX,y:this.data.mouseY}}=e,this.__logMouseMove(this.data.mouseX,this.data.mouseY)}__stopMove(i,e,t,r=!1){this.step.is($e.MOVING)?this.config.moveInertia?(this.__logMouseMove(i,e),this.__stopMoveInertia(i,e)):(this.__resetMove(),this.viewer.resetIdleTimer()):(this.step.is($e.CLICK)&&!this.__moveThresholdReached(i,e)&&this.__doClick(i,e,t,r),this.step.remove($e.CLICK),this.step.is($e.INERTIA)||(this.__resetMove(),this.viewer.resetIdleTimer()))}__stopMoveInertia(i,e){const t=new om(this.data.mouseHistory.map(([,o,n])=>new He(o,n))).getTangent(1),r=this.data.mouseHistory.reduce(({total:o,prev:n},l)=>({total:n?o+ba({x:n[1],y:n[2]},{x:l[1],y:l[2]})/(l[0]-n[0]):0,prev:l}),{total:0,prev:null}).total/this.data.mouseHistory.length;if(!r){this.__resetMove(),this.viewer.resetIdleTimer();return}this.step.set($e.INERTIA);let s=i,a=e;this.state.animation=new Rr({properties:{speed:{start:r,end:0}},duration:1e3,easing:"outQuad",onTick:o=>{s+=o.speed*t.x*3*pt.pixelRatio,a+=o.speed*t.y*3*pt.pixelRatio,this.__applyMove(s,a)}}),this.state.animation.then(o=>{this.state.animation=null,o&&(this.__resetMove(),this.viewer.resetIdleTimer())})}__doClick(i,e,t,r=!1){const s=this.viewer.container.getBoundingClientRect(),a=i-s.left,o=e-s.top,n=this.viewer.renderer.getIntersections({x:a,y:o}),l=n.find(c=>c.object.userData[Ei]);if(l){const c=this.viewer.dataHelper.vector3ToSphericalCoords(l.point),h={rightclick:r,target:t,clientX:i,clientY:e,viewerX:a,viewerY:o,yaw:c.yaw,pitch:c.pitch,objects:n.map(p=>p.object).filter(p=>!p.userData[Ei])};try{const p=this.viewer.dataHelper.sphericalCoordsToTextureCoords(h);Object.assign(h,p)}catch(p){}this.data.dblclickTimeout?(Math.abs(this.data.dblclickData.clientX-h.clientX)<this.moveThreshold&&Math.abs(this.data.dblclickData.clientY-h.clientY)<this.moveThreshold&&this.viewer.dispatchEvent(new tl(this.data.dblclickData)),clearTimeout(this.data.dblclickTimeout),this.data.dblclickTimeout=null,this.data.dblclickData=null):(this.viewer.dispatchEvent(new Jo(h)),this.data.dblclickData=Ar(h),this.data.dblclickTimeout=setTimeout(()=>{this.data.dblclickTimeout=null,this.data.dblclickData=null},vo))}}__handleObjectsEvents(i){if(!Uo(this.state.objectsObservers)&&wo(i.target,this.viewer.container)){const e=Ao(this.viewer.container),t={x:i.clientX-e.x,y:i.clientY-e.y},r=this.viewer.renderer.getIntersections(t),s=(a,o,n)=>{this.viewer.dispatchEvent(new n(i,a,t,o))};for(const[a,o]of Object.entries(this.state.objectsObservers)){const n=r.find(l=>l.object.userData[a]);n?(o&&n.object!==o&&(s(o,a,za),this.state.objectsObservers[a]=null),o?s(n.object,a,Ol):(this.state.objectsObservers[a]=n.object,s(n.object,a,Ul))):o&&(s(o,a,za),this.state.objectsObservers[a]=null)}}}__doMove(i,e){this.step.is($e.CLICK)&&this.__moveThresholdReached(i,e)?(this.viewer.stopAll(),this.__resetMove(),this.step.set($e.MOVING),this.data.mouseX=i,this.data.mouseY=e,this.__logMouseMove(i,e)):this.step.is($e.MOVING)&&(this.__applyMove(i,e),this.__logMouseMove(i,e))}__moveThresholdReached(i,e){return Math.abs(i-this.data.startMouseX)>=this.moveThreshold||Math.abs(e-this.data.startMouseY)>=this.moveThreshold}__applyMove(i,e){const t={yaw:this.config.moveSpeed*((i-this.data.mouseX)/this.state.size.width)*it.degToRad(this.state.littlePlanet?90:this.state.hFov),pitch:this.config.moveSpeed*((e-this.data.mouseY)/this.state.size.height)*it.degToRad(this.state.littlePlanet?90:this.state.vFov)},r=this.viewer.getPosition();this.viewer.rotate({yaw:r.yaw-t.yaw,pitch:r.pitch+t.pitch}),this.data.mouseX=i,this.data.mouseY=e}__doMoveZoom(i){if(this.step.is($e.MOVING)){i.preventDefault();const e=wa(i),t=(e.distance-this.data.pinchDist)/pt.pixelRatio*this.config.zoomSpeed;this.viewer.zoom(this.viewer.getZoomLevel()+t),this.__doMove(e.center.x,e.center.y),this.data.pinchDist=e.distance}}__logMouseMove(i,e){const t=Date.now(),r=this.data.mouseHistory.length?this.data.mouseHistory[this.data.mouseHistory.length-1]:[0,-1,-1];r[1]===i&&r[2]===e?r[0]=t:t===r[0]?(r[1]=i,r[2]=e):this.data.mouseHistory.push([t,i,e]);let s=null;for(let a=0;a<this.data.mouseHistory.length;)this.data.mouseHistory[a][0]<t-Ma?this.data.mouseHistory.splice(a,1):s&&this.data.mouseHistory[a][0]-s>Ma/10?(this.data.mouseHistory.splice(0,a),a=0,s=this.data.mouseHistory[a][0]):(s=this.data.mouseHistory[a][0],a++)}},Os=new He,Yl=new rt,ql=new Wi,og=class extends Hr{constructor(i){super(i),this.frustumNeedsUpdate=!0,this.renderer=new ho(this.config.rendererParameters),this.renderer.setPixelRatio(pt.pixelRatio),this.renderer.outputColorSpace=Zt,this.renderer.domElement.className="psv-canvas",this.scene=new uo,this.camera=new zt(50,16/9,.1,2*Tr),this.camera.matrixWorldAutoUpdate=!1,this.mesh=this.viewer.adapter.createMesh(),this.mesh.userData={[Ei]:!0},this.meshContainer=new lr,this.meshContainer.add(this.mesh),this.scene.add(this.meshContainer),this.raycaster=new pm,this.frustum=new oa,this.container=document.createElement("div"),this.container.className="psv-canvas-container",this.container.appendChild(this.renderer.domElement),this.viewer.container.appendChild(this.container),this.viewer.addEventListener(Ir.type,this),this.viewer.addEventListener(hi.type,this),this.viewer.addEventListener(Pr.type,this),this.viewer.addEventListener(Rt.type,this),this.hide()}get panoramaPose(){return this.mesh.rotation}get sphereCorrection(){return this.meshContainer.rotation}init(){this.show(),this.renderer.setAnimationLoop(i=>this.__renderLoop(i))}destroy(){this.renderer.setAnimationLoop(null),this.cleanScene(this.scene),this.viewer.container.removeChild(this.container),this.viewer.removeEventListener(Ir.type,this),this.viewer.removeEventListener(hi.type,this),this.viewer.removeEventListener(Pr.type,this),this.viewer.removeEventListener(Rt.type,this),super.destroy()}handleEvent(i){switch(i.type){case Ir.type:this.__onSizeUpdated();break;case hi.type:this.__onZoomUpdated();break;case Pr.type:this.__onPositionUpdated();break;case Rt.type:i.containsOptions("fisheye")&&this.__onPositionUpdated(),i.containsOptions("canvasBackground")&&(this.container.style.background=this.config.canvasBackground);break}}hide(){this.container.style.opacity="0"}show(){this.container.style.opacity="1"}setCustomRenderer(i){i?this.customRenderer=i(this.renderer):this.customRenderer=null,this.viewer.needsUpdate()}__onSizeUpdated(){this.renderer.setSize(this.state.size.width,this.state.size.height),this.camera.aspect=this.state.aspect,this.camera.updateProjectionMatrix(),this.viewer.needsUpdate(),this.frustumNeedsUpdate=!0}__onZoomUpdated(){this.camera.fov=this.state.vFov,this.camera.updateProjectionMatrix(),this.viewer.needsUpdate(),this.frustumNeedsUpdate=!0}__onPositionUpdated(){this.camera.position.set(0,0,0),this.camera.lookAt(this.state.direction),this.config.fisheye&&this.camera.position.copy(this.state.direction).multiplyScalar(this.config.fisheye/2).negate(),this.camera.updateMatrixWorld(),this.viewer.needsUpdate(),this.frustumNeedsUpdate=!0}__renderLoop(i){const e=this.timestamp?i-this.timestamp:0;this.timestamp=i,this.viewer.dispatchEvent(new qo(i,e)),this.viewer.dynamics.update(e),(this.state.needsUpdate||this.state.continuousUpdateCount>0)&&((this.customRenderer||this.renderer).render(this.scene,this.camera),this.viewer.dispatchEvent(new yl),this.state.needsUpdate=!1)}setTexture(i){this.viewer.adapter.constructor.supportsOverlay&&this.setOverlay(null,0),this.state.textureData&&this.viewer.adapter.disposeTexture(this.state.textureData),this.state.textureData=i,this.viewer.adapter.setTexture(this.mesh,i),this.viewer.needsUpdate()}setOverlay(i,e){this.state.overlayData&&this.viewer.adapter.disposeTexture(this.state.overlayData),this.state.overlayData=i,this.viewer.adapter.setOverlay(this.mesh,i,e),this.viewer.needsUpdate()}setPanoramaPose(i,e=this.mesh){const t=this.viewer.dataHelper.cleanPanoramaPose(i);e.rotation.set(-t.tilt,-t.pan,-t.roll,"ZXY")}setSphereCorrection(i,e=this.meshContainer){const t=this.viewer.dataHelper.cleanSphereCorrection(i);e.rotation.set(t.tilt,t.pan,t.roll,"ZXY")}transition(i,e){const t=!Dt(e.position),r=!Dt(e.zoom),s=new Na(t?this.viewer.dataHelper.cleanPosition(e.position):void 0,e.zoom);this.viewer.dispatchEvent(s);const a=new lr,o=this.viewer.adapter.createMesh(.5);if(this.viewer.adapter.setTexture(o,i,!0),this.viewer.adapter.setTextureOpacity(o,0),this.setPanoramaPose(i.panoData,o),this.setSphereCorrection(e.sphereCorrection,a),t&&e.transition==="fade-only"){const h=this.viewer.getPosition(),p=new U(0,1,0);a.rotateOnWorldAxis(p,s.position.yaw-h.yaw);const u=new U(0,1,0).cross(this.camera.getWorldDirection(new U)).normalize();a.rotateOnWorldAxis(u,s.position.pitch-h.pitch)}a.add(o),this.scene.add(a),this.renderer.setRenderTarget(new pi),this.renderer.render(this.scene,this.camera),this.renderer.setRenderTarget(null);const{duration:n,properties:l}=this.viewer.dataHelper.getAnimationProperties(e.speed,e.transition===!0?s.position:null,s.zoomLevel),c=new Rr({properties:$a(Ct({},l),{opacity:{start:0,end:1}}),duration:n,easing:"inOutCubic",onTick:h=>{this.viewer.adapter.setTextureOpacity(o,h.opacity),t&&e.transition===!0&&this.viewer.dynamics.position.setValue({yaw:h.yaw,pitch:h.pitch}),r&&this.viewer.dynamics.zoom.setValue(h.zoom),this.viewer.needsUpdate()}});return c.then(h=>{h?(this.setTexture(i),this.viewer.adapter.setTextureOpacity(this.mesh,1),this.setPanoramaPose(i.panoData),this.setSphereCorrection(e.sphereCorrection),t&&e.transition==="fade-only"&&this.viewer.rotate(e.position)):this.viewer.adapter.disposeTexture(i),this.scene.remove(a),o.geometry.dispose(),o.geometry=null}),c}getIntersections(i){var t;Os.x=2*i.x/this.state.size.width-1,Os.y=-2*i.y/this.state.size.height+1,this.raycaster.setFromCamera(Os,this.camera);const e=this.raycaster.intersectObjects(this.scene.children,!0).filter(r=>r.object.isMesh&&!!r.object.userData);return(t=this.customRenderer)!=null&&t.getIntersections&&e.push(...this.customRenderer.getIntersections(this.raycaster,Os)),e}isObjectVisible(i){if(!i)return!1;if(this.frustumNeedsUpdate&&(Yl.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse),this.frustum.setFromProjectionMatrix(Yl),this.frustumNeedsUpdate=!1),i.isVector3)return this.frustum.containsPoint(i);if(i.isMesh&&i.geometry){const e=i;return e.geometry.boundingBox||e.geometry.computeBoundingBox(),ql.copy(e.geometry.boundingBox).applyMatrix4(e.matrixWorld),this.frustum.intersectsBox(ql)}else return i.isObject3D?this.frustum.intersectsObject(i):!1}addObject(i){this.scene.add(i)}removeObject(i){this.scene.remove(i)}cleanScene(i){const e=t=>{var r;(r=t.map)==null||r.dispose(),t.uniforms&&Object.values(t.uniforms).forEach(s=>{var a,o;(o=(a=s.value)==null?void 0:a.dispose)==null||o.call(a)}),t.dispose()};i.traverse(t=>{var r,s;(r=t.geometry)==null||r.dispose(),t.material&&(Array.isArray(t.material)?t.material.forEach(a=>{e(a)}):e(t.material)),t instanceof uo||((s=t.dispose)==null||s.call(t)),t!==i&&this.cleanScene(t)})}},lg=class extends Hr{constructor(i){super(i),this.fileLoader=new dm,this.fileLoader.setResponseType("blob"),this.imageLoader=new um,this.config.withCredentials&&(this.fileLoader.setWithCredentials(!0),this.imageLoader.setCrossOrigin("use-credentials"))}destroy(){this.abortLoading(),super.destroy()}abortLoading(){}loadFile(i,e,t){const r=dr.get(i,t);if(r){if(r instanceof Blob)return e==null||e(100),Promise.resolve(r);dr.remove(i,t)}return this.config.requestHeaders&&this.fileLoader.setRequestHeader(this.config.requestHeaders(i)),new Promise((s,a)=>{let o=0;e==null||e(o),this.fileLoader.load(i,n=>{o=100,e==null||e(o),dr.add(i,t,n),s(n)},n=>{if(n.lengthComputable){const l=n.loaded/n.total*100;l>o&&(o=l,e==null||e(o))}},n=>{a(n)})})}loadImage(i,e,t){const r=dr.get(i,t);return r?(e==null||e(100),r instanceof Blob?this.blobToImage(r):Promise.resolve(r)):!e&&!this.config.requestHeaders?this.imageLoader.loadAsync(i).then(s=>(dr.add(i,t,s),s)):this.loadFile(i,e,t).then(s=>this.blobToImage(s))}blobToImage(i){return new Promise((e,t)=>{const r=document.createElement("img");r.onload=()=>{URL.revokeObjectURL(r.src),e(r)},r.onerror=t,r.src=URL.createObjectURL(i)})}preloadPanorama(i){return this.viewer.adapter.supportsPreload(i)?this.viewer.adapter.loadTexture(i):Promise.reject(new Be("Current adapter does not support preload"))}},cg=class extends Hr{constructor(i){super(i),this.zoom=new Rs(e=>{this.viewer.state.vFov=this.viewer.dataHelper.zoomLevelToFov(e),this.viewer.state.hFov=this.viewer.dataHelper.vFovToHFov(this.viewer.state.vFov),this.viewer.dispatchEvent(new hi(e))},{defaultValue:this.viewer.config.defaultZoomLvl,min:0,max:100,wrap:!1}),this.position=new Vo(e=>{this.viewer.dataHelper.sphericalCoordsToVector3(e,this.viewer.state.direction),this.viewer.dispatchEvent(new Pr(e))},{yaw:new Rs(null,{defaultValue:this.config.defaultYaw,min:0,max:2*Math.PI,wrap:!0}),pitch:new Rs(null,{defaultValue:this.config.defaultPitch,min:this.viewer.state.littlePlanet?0:-Math.PI/2,max:this.viewer.state.littlePlanet?Math.PI*2:Math.PI/2,wrap:this.viewer.state.littlePlanet})}),this.updateSpeeds()}updateSpeeds(){this.zoom.setSpeed(this.config.zoomSpeed*50),this.position.setSpeed(it.degToRad(this.config.moveSpeed*50))}update(i){this.zoom.update(i),this.position.update(i)}},hg=class{constructor(){this.ready=!1,this.needsUpdate=!1,this.continuousUpdateCount=0,this.keyboardEnabled=!1,this.direction=new U(0,0,Tr),this.vFov=60,this.hFov=60,this.aspect=1,this.animation=null,this.transitionAnimation=null,this.loadingPromise=null,this.littlePlanet=!1,this.idleTime=-1,this.objectsObservers={},this.size={width:0,height:0}}get panoData(){var i;return Ke("ViewerState.panoData is deprecated, use ViewerState.textureData.panoData instead"),(i=this.textureData)==null?void 0:i.panoData}},dg=class extends Xo{constructor(i){var e,t,r;super(),this.plugins={},this.children=[],this.onResize=Aa(()=>this.navbar.autoSize(),500),dr.init(),pt.load(),this.state=new hg,this.config=Ym(i),this.parent=So(i.container),this.parent[Ei]=this,this.container=document.createElement("div"),this.container.classList.add("psv-container"),this.parent.appendChild(this.container),ko(this.container,"core"),this.adapter=new this.config.adapter[0](this,this.config.adapter[1]),this.renderer=new og(this),this.textureLoader=new lg(this),this.eventsHandler=new ng(this),this.dataHelper=new rg(this),this.dynamics=new cg(this),(t=(e=this.adapter).init)==null||t.call(e),this.loader=new Km(this),this.navbar=new Zm(this),this.panel=new eg(this),this.notification=new $m(this),this.overlay=new Jm(this),this.resize(this.config.size),this.setCursor(null),Ca(pt.isTouchEnabled,s=>{Ms(this.container,"psv--is-touch",s)}),this.config.plugins.forEach(([s,a])=>{this.plugins[s.id]=new s(this,a)});for(const s of Object.values(this.plugins))(r=s.init)==null||r.call(s);this.config.navbar&&this.navbar.setButtons(this.config.navbar),this.state.loadingPromise||(this.config.panorama?this.setPanorama(this.config.panorama):this.loader.show())}destroy(){this.stopAll(),this.stopKeyboardControl(),this.exitFullscreen();for(const[i,e]of Object.entries(this.plugins))e.destroy(),delete this.plugins[i];this.children.slice().forEach(i=>i.destroy()),this.children.length=0,this.eventsHandler.destroy(),this.renderer.destroy(),this.textureLoader.destroy(),this.dataHelper.destroy(),this.adapter.destroy(),this.dynamics.destroy(),this.parent.removeChild(this.container),delete this.parent[Ei]}init(){this.eventsHandler.init(),this.renderer.init(),this.config.navbar&&this.navbar.show(),this.config.keyboard==="always"&&this.startKeyboardControl(),this.resetIdleTimer(),this.state.ready=!0,this.dispatchEvent(new Ur)}resetIdleTimer(){this.state.idleTime=performance.now()}disableIdleTimer(){this.state.idleTime=-1}getPlugin(i){if(typeof i=="string")return this.plugins[i];{const e=ka(i);return e?this.plugins[e.id]:null}}getPosition(){return this.dataHelper.cleanPosition(this.dynamics.position.current)}getZoomLevel(){return this.dynamics.zoom.current}getSize(){return Ct({},this.state.size)}isFullscreenEnabled(){return Ro(this.parent)}needsUpdate(){this.state.needsUpdate=!0}needsContinuousUpdate(i){i?this.state.continuousUpdateCount++:this.state.continuousUpdateCount>0&&this.state.continuousUpdateCount--}autoSize(){(this.container.clientWidth!==this.state.size.width||this.container.clientHeight!==this.state.size.height)&&(this.state.size.width=Math.round(this.container.clientWidth),this.state.size.height=Math.round(this.container.clientHeight),this.state.aspect=this.state.size.width/this.state.size.height,this.state.hFov=this.dataHelper.vFovToHFov(this.state.vFov),this.dispatchEvent(new Ir(this.getSize())),this.onResize())}setPanorama(i,e={}){var o;this.textureLoader.abortLoading(),(o=this.state.transitionAnimation)==null||o.cancel(),this.state.ready||["sphereCorrection","panoData","overlay","overlayOpacity"].forEach(n=>{n in e||(e[n]=this.config[n])}),Ts(e)&&(Ke("PanoramaOptions.yaw and PanoramaOptions.pitch are deprecated, use PanoramaOptions.position instead"),e.position=this.dataHelper.cleanPosition(e)),typeof e.transition=="number"&&(Ke("Use PanoramaOptions.speed to define the speed/duration of the transition"),e.speed=e.transition,e.transition=!0),e.transition===void 0&&(e.transition=!0),e.speed===void 0&&(e.speed=mo),e.showLoader===void 0&&(e.showLoader=!0),e.caption===void 0&&(e.caption=this.config.caption),e.description===void 0&&(e.description=this.config.description),!e.panoData&&typeof this.config.panoData=="function"&&(e.panoData=this.config.panoData);const t=!Dt(e.position),r=!Dt(e.zoom);(t||r)&&this.stopAll(),this.hideError(),this.resetIdleTimer(),this.config.panorama=i,this.config.caption=e.caption,this.config.description=e.description;const s=n=>{if(this.loader.hide(),this.state.loadingPromise=null,Oo(n))return!1;if(n)throw this.navbar.setCaption(""),this.showError(this.config.lang.loadError),console.error(n),this.dispatchEvent(new gl(i,n)),n;return this.setOverlay(e.overlay,e.overlayOpacity),this.navbar.setCaption(this.config.caption),!0};this.navbar.setCaption(`<em>${this.config.loadingTxt||""}</em>`),(e.showLoader||!this.state.ready)&&this.loader.show(),this.dispatchEvent(new pl(i));const a=this.adapter.loadTexture(this.config.panorama,!0,e.panoData).then(n=>{if(n.panorama!==this.config.panorama)throw this.adapter.disposeTexture(n),La();return n});return!e.transition||!this.state.ready||!this.adapter.supportsTransition(this.config.panorama)?this.state.loadingPromise=a.then(n=>{this.renderer.show(),this.renderer.setTexture(n),this.renderer.setPanoramaPose(n.panoData),this.renderer.setSphereCorrection(e.sphereCorrection),this.state.ready||this.init(),this.dispatchEvent(new Fa(n)),r&&this.zoom(e.zoom),t&&this.rotate(e.position)}).then(()=>s(),n=>s(n)):this.state.loadingPromise=a.then(n=>(this.loader.hide(),this.dispatchEvent(new Fa(n)),this.state.transitionAnimation=this.renderer.transition(n,e),this.state.transitionAnimation)).then(n=>{if(this.state.transitionAnimation=null,!n)throw La()}).then(()=>s(),n=>s(n)),this.state.loadingPromise}setOverlay(i,e=this.config.overlayOpacity){const t=this.adapter.constructor.supportsOverlay;return i?t?this.adapter.loadTexture(i,!1,r=>{if(this.state.textureData.panoData.isEquirectangular){const s=this.state.textureData.panoData,a=r.width/s.croppedWidth;return{isEquirectangular:!0,fullWidth:a*s.fullWidth,fullHeight:a*s.fullHeight,croppedWidth:a*s.croppedWidth,croppedHeight:a*s.croppedHeight,croppedX:a*s.croppedX,croppedY:a*s.croppedY}}},!1).then(r=>{this.renderer.setOverlay(r,e)}):Promise.reject(new Be("Current adapter does not supports overlay")):(t&&this.renderer.setOverlay(null,0),Promise.resolve())}setOptions(i){const e=Ct(Ct({},this.config),i);for(let[t,r]of Object.entries(i)){if(!(t in cr)){Ke(`Unknown option ${t}`);continue}if(t in jl){Ke(jl[t]);continue}switch(t in Va&&(r=Va[t](r,{rawConfig:e,defValue:cr[t]})),this.config[t]=r,t){case"mousemove":this.state.cursorOverride||this.setCursor(null);break;case"caption":this.navbar.setCaption(this.config.caption);break;case"size":this.resize(this.config.size);break;case"sphereCorrection":this.renderer.setSphereCorrection(this.config.sphereCorrection);break;case"navbar":case"lang":this.navbar.setButtons(this.config.navbar);break;case"moveSpeed":case"zoomSpeed":this.dynamics.updateSpeeds();break;case"minFov":case"maxFov":this.dynamics.zoom.setValue(this.dataHelper.fovToZoomLevel(this.state.vFov)),this.dispatchEvent(new hi(this.getZoomLevel()));break;case"keyboard":this.config.keyboard==="always"?this.startKeyboardControl():this.stopKeyboardControl();break}}this.needsUpdate(),this.dispatchEvent(new Rt(Object.keys(i)))}setOption(i,e){this.setOptions({[i]:e})}showError(i){this.overlay.show({id:ut.ERROR,image:ig,title:i,dissmisable:!1})}hideError(){this.overlay.hide(ut.ERROR)}rotate(i){const e=new Ko(this.dataHelper.cleanPosition(i));this.dispatchEvent(e),!e.defaultPrevented&&this.dynamics.position.setValue(e.position)}zoom(i){this.dynamics.zoom.setValue(i)}zoomIn(i=1){this.dynamics.zoom.step(i)}zoomOut(i=1){this.dynamics.zoom.step(-i)}animate(i){const e=Ts(i),t=!Dt(i.zoom),r=new Na(e?this.dataHelper.cleanPosition(i):void 0,i.zoom);if(this.dispatchEvent(r),r.defaultPrevented)return;this.stopAll();const{duration:s,properties:a}=this.dataHelper.getAnimationProperties(i.speed,r.position,r.zoomLevel);return s?(this.state.animation=new Rr({properties:a,duration:s,easing:"inOutSine",onTick:o=>{e&&this.dynamics.position.setValue({yaw:o.yaw,pitch:o.pitch}),t&&this.dynamics.zoom.setValue(o.zoom)}}),this.state.animation.then(()=>{this.state.animation=null,this.resetIdleTimer()}),this.state.animation):(e&&this.rotate(r.position),t&&this.zoom(r.zoomLevel),new Rr(null))}stopAnimation(){return this.state.animation?(this.state.animation.cancel(),this.state.animation):Promise.resolve()}resize(i){const e=i;["width","height"].forEach(t=>{i&&e[t]&&(/^[0-9.]+$/.test(e[t])&&(e[t]+="px"),this.parent.style[t]=e[t])}),this.autoSize()}enterFullscreen(){this.isFullscreenEnabled()||Co(this.parent)}exitFullscreen(){this.isFullscreenEnabled()&&Lo()}toggleFullscreen(){this.isFullscreenEnabled()?this.exitFullscreen():this.enterFullscreen()}startKeyboardControl(){this.state.keyboardEnabled=!0}stopKeyboardControl(){this.state.keyboardEnabled=!1}createTooltip(i){return new tg(this,i)}setCursor(i){this.state.cursorOverride=i,i?this.container.style.cursor=i:this.container.style.cursor=this.config.mousemove?"move":"default"}observeObjects(i){this.state.objectsObservers[i]||(this.state.objectsObservers[i]=null)}unobserveObjects(i){delete this.state.objectsObservers[i]}stopAll(){return this.dispatchEvent(new Cl),this.disableIdleTimer(),this.stopAnimation()}};Ii.enabled=!1,Ve.enabled=!1;const ug=i=>kg.request({url:"/xf-job/job/licenseFree/freeCompanyAttachmentList",method:"get",params:i}),pg=i=>(Hg("data-v-534116ce"),i=i(),Bg(),i),fg={class:"mainBox"},mg=pg(()=>en("div",{id:"viewer",style:{width:"100%",height:"800px"}},null,-1)),gg=["src"],vg=["src"],_g=Cg({__name:"index",setup(i){Lg();const e=Pg(),t=Ug({url:"",showimg:!1,showimgtwo:!0,imgList:[]});let r;Dg(()=>{});const s=l=>{const c=o(l);r.setPanorama(c)};Ig(()=>{n()});function a(l){r=new dg({container:document.querySelector("#viewer"),panorama:l,touchmoveTwoFingers:!0,mousewheelCtrlKey:!0,lang:{zoom:"Zoom",zoomOut:"Zoom out",zoomIn:"Zoom in",moveUp:"\u4E0A\u79FB",moveDown:"\u4E0B\u79FB",moveLeft:"\u5DE6\u79FB",moveRight:"\u53F3\u79FB",fullscreen:"Fullscreen",menu:"Menu",close:"Close",twoFingers:"Use two fingers to navigate",ctrlZoom:"\u4F7F\u7528ctrl+\u6EDA\u52A8\u6765\u7F29\u653E\u56FE\u50CF",loadError:"The panorama can't be loaded"}})}function o(l){return sc+ac+"/"+t.imgList[l].filePath}function n(){let l={pageNo:1,pageSize:9,attachmentType:55,associatePrimaryKey:e.query.companyId,provincialLevel:1};ug(l).then(c=>{c.success&&(t.imgList=c.result.records,t.url=t.imgList?sc+ac+"/"+t.imgList[0].filePath:"",a(t.url))})}return(l,c)=>{const h=Og("a-carousel");return Ja(),Qa("div",fg,[mg,Ng(h,{arrows:"","dots-class":"slick-dots slick-thumb",afterChange:s},{customPaging:rc(p=>[en("img",{src:o(p.i)},null,8,gg)]),default:rc(()=>[(Ja(!0),Qa(Fg,null,zg(t.imgList.length,p=>(Ja(),Qa("div",{key:p},[en("img",{src:o(p-1)},null,8,vg)]))),128))]),_:1})])}}});nc=Vg(_g,[["__scopeId","data-v-534116ce"]])}));export{Wg as __tla,nc as default};
