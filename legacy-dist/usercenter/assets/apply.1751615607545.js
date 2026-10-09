var ve=Object.defineProperty;var re=Object.getOwnPropertySymbols;var ye=Object.prototype.hasOwnProperty,ke=Object.prototype.propertyIsEnumerable;var de=(m,g,o)=>g in m?ve(m,g,{enumerable:!0,configurable:!0,writable:!0,value:o}):m[g]=o,ce=(m,g)=>{for(var o in g||(g={}))ye.call(g,o)&&de(m,o,g[o]);if(re)for(var o of re(g))ke.call(g,o)&&de(m,o,g[o]);return m};var A=(m,g,o)=>new Promise((t,k)=>{var h=r=>{try{y(o.next(r))}catch(c){k(c)}},C=r=>{try{y(o.throw(r))}catch(c){k(c)}},y=r=>r.done?t(r.value):Promise.resolve(r.value).then(h,C);y((o=o.apply(m,g)).next())});import{a as Ce,u as we,g as Ie,c as me,b as ue,d as Te,s as Se,f as $e}from"./index.api.175161560754513.js";import{m as G,I as Oe,M as te,y as Fe,_ as ae,d as fe}from"./index.1751615607545.js";import{g as je}from"./index.api.175161560754514.js";import{d as pe}from"./dictCode.1751615607545.js";import{f as K,r as T,X as n,Y as p,Z as S,_ as l,a,$ as e,I as u,q as U,u as J,a2 as I,a4 as z,o as _e,a3 as ge,F as B,a6 as b,a8 as le,a9 as se,w as oe,a1 as Me,H as Pe}from"./vue.1751615607545.js";import{$ as Ue}from"./print.1751615607545.js";const Ne=[{title:"操作",dataIndex:"id",align:"center",fixed:"left",width:150,slots:{customRender:"action"}},{title:"签约状态",dataIndex:"signFlowStatusText"},{title:"审核状态",dataIndex:"checkStatusText"},{title:"审核意见",dataIndex:"checkOpinion"},{title:"单位名称",slots:{customRender:"company"}},{title:"单位性质",dataIndex:"natureText"},{title:"单位行业",dataIndex:"companyTradeText"},{title:"单位隶属",dataIndex:"companySubjectionText"},{title:"单位地址",dataIndex:"companyAddress"}],Le=[{title:"单位名称",slots:{customRender:"company"}},{title:"解约时间",dataIndex:"applyForObjectTime"},{title:"解约描述",dataIndex:"applyForObjectMessage"},{title:"单位隶属",dataIndex:"companySubjectionText"},{title:"单位性质",dataIndex:"natureText"},{title:"单位行业",dataIndex:"companyTradeText"},{title:"单位地址",dataIndex:"companyAddress"}],Ae={style:{"padding-bottom":"20px","text-align":"center"}},ze=K({__name:"approve",props:{id:String,visible:Boolean,stuInfo:Object},emits:["okclick","cancelClick"],setup(m,{emit:g}){const o=m,t=T({form:{checkOpinion:null}}),k=()=>A(this,null,function*(){if(!t.form.checkOpinion)return;let r=yield Ce({applyForMessage:t.form.checkOpinion,studentId:o.stuInfo.id,wqCompanyExpandId:o.id});r.success&&G.success(r.message),h()}),h=()=>{g("cancelClick",{visible:!1})},C=T({xs:{span:24},sm:{span:7}}),y=T({xs:{span:24},sm:{span:16}});return(r,c)=>{const w=n("a-textarea"),x=n("a-form-item"),N=n("a-col"),j=n("a-row"),P=n("a-form"),M=n("a-button"),q=n("a-modal");return p(),S(q,{visible:o.visible,"onUpdate:visible":c[1]||(c[1]=$=>o.visible=$),closable:!0,title:o.title,"ok-text":o.okText,maskClosable:!1,"cancel-text":o.cancelText,footer:null,width:"700px",onCancel:h},{default:l(()=>[a(P,{ref:"formRef",scrollToFirstError:"",name:"form",autocomplete:"off",model:t.form,"label-col":C,"wrapper-col":y,onFinishFailed:()=>{},onFinish:k,style:{padding:"40px 20px"}},{default:l(()=>[a(j,{class:"setClass"},{default:l(()=>[a(N,{span:16,offset:"3"},{default:l(()=>[a(x,{name:"checkOpinion",label:"申请理由",rules:[{required:!0,message:"请输入申请理由",trigger:"blur"}]},{default:l(()=>[a(w,{value:t.form.checkOpinion,"onUpdate:value":c[0]||(c[0]=$=>t.form.checkOpinion=$),placeholder:"请输入申请理由"},null,8,["value"])]),_:1})]),_:1})]),_:1})]),_:1},8,["model","label-col","wrapper-col"]),e("div",Ae,[a(M,{style:{"margin-right":"30px"},onClick:h},{default:l(()=>[u("取消")]),_:1}),a(M,{style:"",type:"primary",onClick:k},{default:l(()=>[u("确定")]),_:1})])]),_:1},8,["visible","title","ok-text","cancel-text"])}}}),qe={class:"clearfix otherItem"},De={key:0},Re=e("div",{style:{"margin-top":"8px"}},"点击上传图片",-1),Be=["src"],Ee={style:{"padding-bottom":"20px","text-align":"center"}},Ve=K({__name:"unapply",props:{id:Object,visible:Boolean,stuInfo:Object},emits:["okclick","cancelClick"],setup(m,{emit:g}){const o=m,t=T({form:{cancelFileUrl:"",personalPhotoPath:"",checkOpinion:null}}),k=()=>A(this,null,function*(){if(!t.form.checkOpinion)return;let _=yield we({applyForObjectId:o.stuInfo.id,applyForObjectMessage:t.form.checkOpinion,applyForObjectType:0,applyForObjectTypeText:"学生",cancelFileUrl:t.form.cancelFileUrl,studResultId:o.id.collegeWqStudResultId,byObjectId:o.id.jobCompanyId});_.success&&G.success(_.message),h()}),h=()=>{g("cancelClick",{visible:!1})},C=Fe,y=U(!1);U(null);const r=U(""),c=U(""),w=U([]),x=U({"X-Access-Token":localStorage.getItem("token")});function N({file:_,fileList:i,event:s}){t.form.img=t.form.img?t.form.img:{},t.form.img.fileName=_.name,t.form.personalPhotoName=_.name,w.value=i,console.log("fileList免冠照片",w),_.status==="error"&&G.error(`${_.name} 上传失败.`);let f=[];_.status!="uploading"&&(i.forEach(O=>{O.status==="done"&&f.push(O.response.message)}),_.status==="removed"&&j(_,"img")),f.length>0&&(t.form.img.filePath=f[0],t.form.cancelFileUrl=f[0]),console.log("fileUrls",f,w.value)}function j(_,i){console.log("如有需要新增 删除逻辑",t.user,_,i),i=="img"?(t.form.img.filePath="",t.form.img.fileName="",t.form.personalPhotoName="",t.form.personalPhotoPath=""):i=="doc"&&(t.form.doc.filePath="",t.form.doc.fileName="",t.form.fileName="",t.form.filePath="")}const P=_=>A(this,null,function*(){!_.url&&!_.preview&&(_.preview=yield M(_.originFileObj)),r.value=_.url||_.preview,y.value=!0,c.value=_.name||_.url.substring(_.url.lastIndexOf("/")+1)});function M(_){return new Promise((i,s)=>{const f=new FileReader;f.readAsDataURL(_),f.onload=()=>i(f.result),f.onerror=O=>s(O)})}const q=()=>{y.value=!1,c.value=""},$=T({xs:{span:24},sm:{span:7}}),Z=T({xs:{span:24},sm:{span:16}});return(_,i)=>{const s=n("plus-outlined"),f=n("a-upload"),O=n("a-form-item"),D=n("a-col"),F=n("a-row"),H=n("a-textarea"),Q=n("a-form"),Y=n("a-button"),ee=n("a-modal");return p(),S(ee,{visible:o.visible,"onUpdate:visible":i[2]||(i[2]=R=>o.visible=R),closable:!0,title:o.title,"ok-text":o.okText,maskClosable:!1,"cancel-text":o.cancelText,footer:null,width:"700px",onCancel:h},{default:l(()=>[a(Q,{ref:"formRef",scrollToFirstError:"",name:"form",autocomplete:"off",model:t.form,"label-col":$,"wrapper-col":Z,onFinishFailed:()=>{},onFinish:k,style:{padding:"40px 20px"}},{default:l(()=>[a(F,{class:"setClass"},{default:l(()=>[a(D,{span:16,offset:"3"},{default:l(()=>[a(O,{name:"cancelFileUrl",label:"材料上传",rules:[{required:!0,message:"请上传材料"}]},{default:l(()=>[e("div",qe,[a(f,{class:"whupload","file-list":w.value,"onUpdate:fileList":i[0]||(i[0]=R=>w.value=R),action:J(C),headers:x.value,data:{biz:"sign/"+J(Oe)(new Date)},accept:".png, .jpeg, .jpg, .PNG, .JPEG, .JPG",multiple:!1,"max-count":1,"list-type":"picture-card",onPreview:P,onChange:N},{default:l(()=>[w.value.length<1?(p(),I("div",De,[a(s),Re])):z("",!0)]),_:1},8,["file-list","action","headers","data"]),a(J(te),{visible:y.value,title:c.value,footer:null,onCancel:q},{default:l(()=>[e("img",{alt:"example",style:{width:"100%"},src:r.value},null,8,Be)]),_:1},8,["visible","title"])])]),_:1})]),_:1})]),_:1}),a(F,{class:"setClass"},{default:l(()=>[a(D,{span:16,offset:"3"},{default:l(()=>[a(O,{name:"checkOpinion",label:"解约原因说明",rules:[{required:!0,message:"请输入解约原因说明",trigger:"blur"}]},{default:l(()=>[a(H,{value:t.form.checkOpinion,"onUpdate:value":i[1]||(i[1]=R=>t.form.checkOpinion=R),placeholder:"请输入解约原因说明"},null,8,["value"])]),_:1})]),_:1})]),_:1})]),_:1},8,["model","label-col","wrapper-col"]),e("div",Ee,[a(Y,{style:{"margin-right":"30px"},onClick:h},{default:l(()=>[u("取消")]),_:1}),a(Y,{style:"",type:"primary",onClick:k},{default:l(()=>[u("确定")]),_:1})])]),_:1},8,["visible","title","ok-text","cancel-text"])}}}),We=m=>(le("data-v-5ffb5602"),m=m(),se(),m),Je={class:"centre"},Ge=We(()=>e("div",{class:"ant-divider ant-divider-horizontal ant-divider-plain ant-divider-with-text ant-divider-with-text-left",role:"separator"},[e("span",{class:"ant-divider-inner-text"},"基本信息")],-1)),Ke={class:"labeldiv"},Xe={class:"condiv"},He=K({__name:"cpyInfo",props:{id:String,visible:Boolean},emits:["okclick","cancelClick"],setup(m,{emit:g}){const o=m,t=T({单位名称:"jobCompanyName",工作职位类别:"workJobTypeText",邮政编码:"postalCode",单位性质:"natureText",就业类别:"jobTypeText",就业状况:"jobStateText",单位行业:"companyTradeText",单位隶属:"companySubjectionText",单位签约所在地:"companyPlaceContractText",单位联系人:"companyLinkPeople",单位联系方式:"companyLinkPhone",单位邮箱:"companyEmail",签约单位地址:"companyAddress",单位证件类型:"certificateTypeText",单位证件号码:"certificateNumber"}),k=U({});_e(()=>A(this,null,function*(){if(o.id){let C=yield Ie({companyId:o.id});k.value=C.result}}));const h=()=>{g("cancelClick",{visible:!1})};return(C,y)=>{const r=n("a-col"),c=n("a-row"),w=n("a-button"),x=n("a-form-item"),N=n("a-modal");return p(),S(N,{visible:o.visible,"onUpdate:visible":y[0]||(y[0]=j=>o.visible=j),title:"详情",width:"1200px",closable:!0,maskClosable:!1,onCancel:h,footer:null,zIndex:11006},{default:l(()=>[e("div",Je,[Ge,a(c,{class:"setClass"},{default:l(()=>[(p(!0),I(B,null,ge(t,(j,P)=>(p(),S(r,{class:"flex",span:8,key:P},{default:l(()=>[e("div",Ke,b(P)+"：",1),e("div",Xe,b(k.value[j]||"--"),1)]),_:2},1024))),128))]),_:1})]),a(c,{class:"setClassbtn"},{default:l(()=>[a(r,{span:4,offset:"9"},{default:l(()=>[a(x,{style:{"text-align":"center","padding-top":"40px"}},{default:l(()=>[a(w,{type:"primary",onClick:h},{default:l(()=>[u("关闭")]),_:1})]),_:1})]),_:1})]),_:1})]),_:1},8,["visible"])}}});const Ye=ae(He,[["__scopeId","data-v-5ffb5602"]]),Ze={style:{"padding-bottom":"20px","text-align":"center"}},Qe=K({__name:"refuse",props:{id:String,visible:Boolean,stuInfo:Object},emits:["okclick","cancelClick"],setup(m,{emit:g}){const o=m,t=T({form:{checkOpinion:null}}),k=()=>A(this,null,function*(){if(!t.form.checkOpinion)return;let r=yield me({id:o.id,type:0,checkOpinion:t.form.checkOpinion});r.success&&G.success(r.message),h()}),h=()=>{g("cancelClick",{visible:!1})},C=T({xs:{span:24},sm:{span:7}}),y=T({xs:{span:24},sm:{span:16}});return(r,c)=>{const w=n("a-textarea"),x=n("a-form-item"),N=n("a-col"),j=n("a-row"),P=n("a-form"),M=n("a-button"),q=n("a-modal");return p(),S(q,{visible:o.visible,"onUpdate:visible":c[1]||(c[1]=$=>o.visible=$),closable:!0,title:o.title,"ok-text":o.okText,maskClosable:!1,"cancel-text":o.cancelText,footer:null,width:"700px",onCancel:h},{default:l(()=>[a(P,{ref:"formRef",scrollToFirstError:"",name:"form",autocomplete:"off",model:t.form,"label-col":C,"wrapper-col":y,onFinishFailed:()=>{},onFinish:k,style:{padding:"40px 20px"}},{default:l(()=>[a(j,{class:"setClass"},{default:l(()=>[a(N,{span:16,offset:"3"},{default:l(()=>[a(x,{name:"checkOpinion",label:"拒绝理由",rules:[{required:!0,message:"请输入拒绝理由",trigger:"blur"}]},{default:l(()=>[a(w,{value:t.form.checkOpinion,"onUpdate:value":c[0]||(c[0]=$=>t.form.checkOpinion=$),placeholder:"请输入拒绝理由"},null,8,["value"])]),_:1})]),_:1})]),_:1})]),_:1},8,["model","label-col","wrapper-col"]),e("div",Ze,[a(M,{style:{"margin-right":"30px"},onClick:h},{default:l(()=>[u("取消")]),_:1}),a(M,{style:"",type:"primary",onClick:k},{default:l(()=>[u("确定")]),_:1})])]),_:1},8,["visible","title","ok-text","cancel-text"])}}}),et={style:{"padding-bottom":"20px","text-align":"center"}},tt=K({__name:"refuse2",props:{id:String,visible:Boolean,stuInfo:Object},emits:["okclick","cancelClick"],setup(m,{emit:g}){const o=m,t=T({form:{checkOpinion:null}}),k=()=>A(this,null,function*(){if(!t.form.checkOpinion)return;let r=yield ue({id:o.id,type:20,checkOpinion:t.form.checkOpinion});r.success&&G.success(r.message),h()}),h=()=>{g("cancelClick",{visible:!1})},C=T({xs:{span:24},sm:{span:7}}),y=T({xs:{span:24},sm:{span:16}});return(r,c)=>{const w=n("a-textarea"),x=n("a-form-item"),N=n("a-col"),j=n("a-row"),P=n("a-form"),M=n("a-button"),q=n("a-modal");return p(),S(q,{visible:o.visible,"onUpdate:visible":c[1]||(c[1]=$=>o.visible=$),closable:!0,title:o.title,"ok-text":o.okText,maskClosable:!1,"cancel-text":o.cancelText,footer:null,width:"700px",onCancel:h},{default:l(()=>[a(P,{ref:"formRef",scrollToFirstError:"",name:"form",autocomplete:"off",model:t.form,"label-col":C,"wrapper-col":y,onFinishFailed:()=>{},onFinish:k,style:{padding:"40px 20px"}},{default:l(()=>[a(j,{class:"setClass"},{default:l(()=>[a(N,{span:16,offset:"3"},{default:l(()=>[a(x,{name:"checkOpinion",label:"拒绝理由",rules:[{required:!0,message:"请输入拒绝理由",trigger:"blur"}]},{default:l(()=>[a(w,{value:t.form.checkOpinion,"onUpdate:value":c[0]||(c[0]=$=>t.form.checkOpinion=$),placeholder:"请输入拒绝理由"},null,8,["value"])]),_:1})]),_:1})]),_:1})]),_:1},8,["model","label-col","wrapper-col"]),e("div",et,[a(M,{style:{"margin-right":"30px"},onClick:h},{default:l(()=>[u("取消")]),_:1}),a(M,{style:"",type:"primary",onClick:k},{default:l(()=>[u("确定")]),_:1})])]),_:1},8,["visible","title","ok-text","cancel-text"])}}}),v=m=>(le("data-v-60225454"),m=m(),se(),m),ot={ref:"globalModal"},at={class:"print"},lt={id:"print-container",class:"marL20 marT20",style:{width:"698px",margin:"auto","margin-left":"30px"}},st=v(()=>e("p",{class:"textCenter font-16 bold"},"就业协议合同",-1)),nt={class:"marB5"},it={class:"top"},rt={class:"t-one flex font-16"},dt=v(()=>e("div",{class:"lines font-16 border-top border-left textCenter"},"毕业生信息",-1)),ct={class:"right flex-1"},pt={class:"line1 flex"},mt=v(()=>e("div",{class:"item border-top border-right"},"姓名",-1)),ut={class:"item14 border-top border-right"},ft=v(()=>e("div",{class:"item10 border-top border-right"},"学院",-1)),_t={class:"item14 border-top border-right"},gt=v(()=>e("div",{class:"item border-top border-right"},"政治面貌",-1)),bt={class:"item14 border-top border-right"},ht=v(()=>e("div",{class:"item10 border-top border-right"},"民族",-1)),xt={class:"item10 border-top border-right"},vt={class:"line1 flex"},yt=v(()=>e("div",{class:"item border-top border-right"},"性别",-1)),kt={class:"item14 border-top border-right"},Ct=v(()=>e("div",{class:"item10 border-top border-right"},"专业",-1)),wt={class:"item14 border-top border-right"},It=v(()=>e("div",{class:"item border-top border-right"},"联系电话",-1)),Tt={class:"item14 border-top border-right"},St=v(()=>e("div",{class:"item10 border-top border-right"},"学制",-1)),$t={class:"item10 border-top border-right"},Ot={class:"line3 flex"},Ft=v(()=>e("div",{class:"item border-top border-right"},"毕业时间",-1)),jt={class:"item14 border-top border-right"},Mt=v(()=>e("div",{class:"item10 border-top border-right"},"学历",-1)),Pt={class:"item14 border-top border-right"},Ut=v(()=>e("div",{class:"item border-top border-right"},"电子邮件",-1)),Nt={class:"item border-top border-right item3"},Lt={class:"line4 flex"},At=v(()=>e("div",{class:"item border-top border-right"},"家庭住址",-1)),zt={class:"border-top border-right item7"},qt={class:"t-tow flex font-16"},Dt=v(()=>e("div",{class:"lines font-16 border-top border-left textCenter"},"用人单位信息",-1)),Rt={class:"right flex-1"},Bt={class:"line1 flex font-16"},Et=v(()=>e("div",{class:"item15 border-top border-right"},"单位名称",-1)),Vt={class:"item35 border-top border-right"},Wt=v(()=>e("div",{class:"item15 border-top border-right"},"单位性质",-1)),Jt={class:"item35 border-top border-right"},Gt={class:"line2 flex"},Kt=v(()=>e("div",{class:"item15 border-top border-right"},"单位隶属",-1)),Xt={class:"item35 border-top border-right"},Ht=v(()=>e("div",{class:"item15 border-top border-right"},"联系人",-1)),Yt={class:"item35 border-top border-right"},Zt={class:"line3 flex"},Qt=v(()=>e("div",{class:"item15 border-top border-right"},"通讯地址",-1)),eo={class:"item35 border-top border-right"},to=v(()=>e("div",{class:"item15 border-top border-right"},"联系电话",-1)),oo={class:"item35 border-top border-right"},ao={class:"line4 flex",style:{height:"50px"}},lo=v(()=>e("div",{class:"item15 border-top border-right"},[u(" 档案接收 "),e("br"),u("单位 ")],-1)),so={class:"item35 border-top border-right"},no=v(()=>e("div",{class:"item15 border-top border-right"},[u(" 档案转寄 "),e("br"),u("详细地址 ")],-1)),io={class:"item35 border-top border-right"},ro=v(()=>e("div",{class:"t-three flex font-16"},[e("div",{class:"item30 border-top border-right border-left border-btm"},[e("div",{class:"padL5",style:{height:"50px"}},[e("p",null,"用人单位意见：")]),e("div",{class:"content padL5"}),e("div",{class:"sign padL10"},[e("p",null,"签章:")]),e("p")]),e("div",{class:"item34 border-top border-right border-btm"},[e("div",{class:"padL5",style:{height:"50px"}},[e("p",null,"用人单位上级主管意见："),e("p",{style:{"font-size":"12px",transform:"scale(0.8)","margin-left":"-10%"}},"(有用人自主权的单位此栏可忽略)")]),e("div",{class:"content padL5"}),e("div",{class:"sign padL10"},[e("p",null,"签章:")]),e("p")]),e("div",{class:"border-top border-btm",style:{width:"1px"}}),e("div",{class:"item34 border-top border-right border-btm"},[e("div",{class:"padL5",style:{height:"50px"}},[e("p",null,"学校毕业生就业管理部门意见：")]),e("div",{class:"content padL5"}),e("div",{class:"sign padL10"},[e("p",null,"签章:")]),e("p")])],-1)),co=v(()=>e("div",null,[e("div",{class:"others"},[e("div",{class:"line mt10"},[e("span",null,"甲方："),e("span")]),e("div",{class:"line mt10"},[e("span",null,"乙方："),e("span")]),e("div",{class:"line mt10"},[e("span",null,"丙方："),e("span")]),e("p",{class:"mt10"},"根据《中华人民共和国劳动法》、《中华人民共和国高等教育法》等相关法律法规，以及甲方、乙方、丙方三方共同协商，达成如下就业协议："),e("p",{class:"mt10"},"一、协议期限"),e("p",{class:"mt10"},[u("本协议自"),e("span",{style:{color:"#fff",width:"60px",display:"inline-block"}}),u("起至"),e("span",{style:{color:"#fff",width:"60px",display:"inline-block"}}),u("止。")]),e("p",{class:"mt10"},"二、实习与就业安排"),e("p",{class:"mt10"},"甲方根据乙方的专业特点和丙方的需求，推荐乙方到丙方进行实习或就业。"),e("p",null,"乙方同意在丙方实习或就业，并承诺遵守丙方的各项规章制度和劳动纪律"),e("p",null,"丙方同意接收乙方进行实习或就业，并为乙方提供相应的实习或工作岗位。"),e("p",{class:"mt10"},"三、三方的权利和义务"),e("p",{class:"mt10"},"甲方："),e("p",{class:"mt10"}," 负责对乙方进行就业指导，协助乙方与丙方建立实习或就业关系； 协助乙方处理与丙方在实习或就业过程中出现的问题； 监督丙方对乙方的实习或工作安排是否符合法律法规和学校规定 "),e("p",{class:"mt10"},"乙方："),e("p",{class:"mt10"}," 按时参加丙方提供的实习或工作，并按时完成工作任务； 遵守丙方的规章制度和劳动纪律，保守丙方的商业秘密； 如因个人原因需提前终止实习或工作，应提前向丙方提出书面申请。 "),e("p",{class:"mt10"},"丙方："),e("p",{class:"mt10"}," 为乙方提供符合法律法规和学校规定的实习或工作岗位； 按时向乙方支付劳动报酬，并保障乙方在实习或工作期间的人身安全； 尊重乙方的合法权益，不得强迫乙方从事违法或违背道德的活动。 "),e("p",{class:"mt10"},"四、违约责任"),e("p",{class:"mt10"}," 如任何一方违反本协议的约定，应承担相应的违约责任。 "),e("p",{class:"mt10"},"五、其他"),e("p",{class:"mt10"}," 本协议未尽事宜，由三方协商解决； 本协议一式三份，甲、乙、丙三方各执一份； 本协议自三方签字（或盖章）之日起生效。 "),e("p",{class:"mt10"},"甲方（学校）："),e("p",{class:"mt10"},"乙方（学生）："),e("p",{class:"mt10"},"丙方（用人单位）："),e("p",{class:"mt10"},"签订日期：")])],-1)),po=K({__name:"protocol",props:{arr:void 0,visible:String,name:String,okText:String,cancelText:String,contentTitle:String,title:String,type:String,data:{type:Object,default:{}}},emits:["okclicks","cancelClicks"],setup(m,{emit:g}){const o=m;fe(localStorage.getItem("corpInfo"),"corpInfo"),JSON.parse(localStorage.getItem("userInfo")),oe(()=>o.visible,C=>{}),oe(()=>o.data,C=>{},{deep:!0}),U(null),T({value1:""}),_e(()=>{});const t=()=>{g("cancelClicks")},k=()=>`
  .mt10 {
    margin-top: 10px;
  }
  .padL5 {
    padding-left:5px;
  }
  .padL10 {
    padding-left:10px;
  }
  .textCenter {
    text-align: center;
  }
  .bold {
    font-weight: bold;
    text-align: center;
  }
  .flex {
    display: flex;
  }
  .centre {
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .colorred {
    color: red;
  }
  .flex-1 {
    flex: 1;
  }
  .lines {
    writing-mode: vertical-lr;
    width: 30px;
    letter-spacing: 1.5px;
    border-right: 1px solid #333;
  }
  .item12 {
    width: 12%;
  }
  .itemcom1 {
    height: 40px;
    text-align: center;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
  }
  .item {
    height: 40px;
    text-align: center;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
    width: 12%;
  }
  .item3 {
    height: 40px;
    text-align: center;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
    width: 34%;
  }
  .item7 {
    width: 84%;
    height: 40px;
    text-align: center;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
  }
  .item10 {
    height: 40px;
    text-align: center;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
    width: 8%;
  }
  .item14 {
    height: 40px;
    text-align: center;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
    width: 16%;
  }
  .item-com {
    text-align: center;
    padding: 0 10px;
    line-height: 16px;
    min-height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .item15 {
    text-align: center;
    padding: 0 10px;
    line-height: 16px;
    min-height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 14%;
  }
  .item35 {
    text-align: center;
    padding: 0 10px;
    line-height: 16px;
    min-height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 34%;
  }
  .item20 {
    width: 20%;
  }
  .item30{
    text-align: left;
    width: 28%;
    padding-left:10px;
  }
  .item34 {
    text-align: left;
    width: 34%;
    padding-left:10px;
    
  }
  .pad1 {
    padding-left: 1px;
  }

  .border-top {
    border-top: 1px solid #333;
  }
  .border-right {
    border-right: 1px solid #333;
  }
  .border-left {
    border-left: 1px solid #333;
  }
  .border-btm {
    border-bottom: 1px solid #333;
  }

  .content {
    height: 200px;
  }
  .sign {
    height: 80px;
  }
  `,h=()=>{Ue({printable:"print-container",type:"html",scanStyles:!1,style:k()})};return(C,y)=>{const r=n("a-button"),c=n("a-modal");return p(),I("div",ot,[a(c,{visible:o.visible,"onUpdate:visible":y[0]||(y[0]=w=>o.visible=w),closable:C.closable,style:{top:"40px"},title:o.title,"ok-text":o.okText,width:"800px","cancel-text":o.cancelText,onCancel:t,getContainer:()=>C.$refs.globalModal,footer:null},{default:l(()=>[e("div",at,[a(r,{class:"defaultBtn hoverBgBlue",type:"primary",size:"large","html-type":"submit",onClick:h},{default:l(()=>[u("打印就业协议合同")]),_:1})]),e("div",lt,[st,e("p",nt,"学号："+b(o.data.studentNumber),1),e("div",it,[e("div",rt,[dt,e("div",ct,[e("div",pt,[mt,e("div",ut,b(o.data.realName),1),ft,e("div",_t,b(o.data.campusName),1),gt,e("div",bt,b(o.data.politicalOrientationText),1),ht,e("div",xt,b(o.data.nationText),1)]),e("div",vt,[yt,e("div",kt,b(o.data.sexText),1),Ct,e("div",wt,b(o.data.majorName),1),It,e("div",Tt,b(o.data.phone),1),St,e("div",$t,b(o.data.lengthOfSchooling),1)]),e("div",Ot,[Ft,e("div",jt,b(o.data.timeOfGraduation),1),Mt,e("div",Pt,b(o.data.collegeEducationText),1),Ut,e("div",Nt,b(o.data.email),1)]),e("div",Lt,[At,e("div",zt,b(o.data.nativePlaceDetailedAddress),1)])])]),e("div",qt,[Dt,e("div",Rt,[e("div",Bt,[Et,e("div",Vt,b(o.data.companyName),1),Wt,e("div",Jt,b(o.data.natureText),1)]),e("div",Gt,[Kt,e("div",Xt,b(o.data.companySubjectionText),1),Ht,e("div",Yt,b(o.data.companyLinkPeople),1)]),e("div",Zt,[Qt,e("div",eo,b(o.data.candidateNumber),1),to,e("div",oo,b(o.data.candidateNumber),1)]),e("div",ao,[lo,e("div",so,b(o.data.archiveReceiveCompany),1),no,e("div",io,b(o.data.archiveSendAddress),1)])])]),ro]),co])]),_:1},8,["visible","closable","title","ok-text","cancel-text","getContainer"])],512)}}});const mo=ae(po,[["__scopeId","data-v-60225454"]]),ne=m=>(le("data-v-9662b120"),m=m(),se(),m),uo={class:"contenttable fontsize14"},fo={class:"flex flexalignitems flex_center"},_o={key:0,style:{opacity:"0.6"}},go={key:1,style:{opacity:"0.6"}},bo={key:0,style:{opacity:"0.6"}},ho={key:1},xo=["onClick"],vo={key:0,class:"centre"},yo=ne(()=>e("div",{class:"ant-divider ant-divider-horizontal ant-divider-plain ant-divider-with-text ant-divider-with-text-left",role:"separator"},[e("span",{class:"ant-divider-inner-text"},"基本信息")],-1)),ko={class:"labeldiv"},Co={class:"condiv"},wo={key:1,class:"centre",style:{height:"500px","padding-top":"100px","text-align":"center"}},Io={key:0},To={style:{"font-size":"20px"}},So=ne(()=>e("p",{style:{margin:"20px"}},"快去完善签约信息，才能签约企业哦～",-1)),$o={style:{"text-align":"center","margin-top":"40px"}},Oo={key:1},Fo={style:{"font-size":"20px"}},jo=ne(()=>e("p",{style:{margin:"20px"}},"您已进行非就业填写，无法进行就业填写",-1)),Mo={style:{"text-align":"center","margin-top":"40px"}},Po=K({__name:"apply",setup(m){const g=Me(),o=U("1"),t=T({approveId:"",approveModal:!1,unapplyId:"",unapplyModal:!1,detId:"",detModal:!1,refuseId:null,refuseModal:!1,refuseId2:null,refuseModal2:!1,applyAlertData:null,applyAlertModal:!1,showTips:!1,stuInfo:null,form:{}}),k=(i,s,f=!0)=>{t.form[s]=i.value,f&&(t.form[s+"Text"]=i.label)};let h=fe(localStorage.getItem("xfSysUserId"),"xfSysUserId");const C=()=>A(this,null,function*(){var s,f;let i=yield Se({xfSysUserId:h==null?void 0:h.id});t.stuInfo=i.result,(((s=t.stuInfo)==null?void 0:s.izPerfect)==0||((f=t.stuInfo)==null?void 0:f.studResultType)==10)&&(t.showTips=!0)});Pe(()=>A(this,null,function*(){yield C(),yield c()})),oe(o,i=>{i==1&&c(),i==3&&$()});const y=U([]),r=T({total:0,page:1,size:10}),c=()=>A(this,null,function*(){let i=yield Te(ce({pageNo:r.page,pageSize:r.size,collegeStudentId:t.stuInfo.id},t.form));y.value=i.result.records,r.total=i.result.total,x.value=y.value[0]}),w=i=>{t.approveId=i.id,t.approveModal=!0},x=U({}),N=T({单位名称:"jobCompanyName",工作职位类别:"workJobTypeText",邮政编码:"postalCode",单位性质:"natureText",就业类别:"jobTypeText",就业状况:"jobStateText",单位行业:"companyTradeText",单位隶属:"companySubjectionText",单位签约所在地:"companyPlaceContractText",单位联系人:"companyLinkPeople",单位联系方式:"companyLinkPhone",单位邮箱:"companyEmail",签约单位地址:"companyAddress",单位证件类型:"certificateTypeText",单位证件号码:"certificateNumber"}),j=(i,s)=>{s==1?te.confirm({title:"确认签约",content:"是否确认签约",okText:"确认",cancelText:"取消",onOk:()=>{me({id:i.collegeWqSignDetailId,type:s}).then(f=>{f.success&&(G.success(f.message),c())})}}):(t.refuseId=i.collegeWqSignDetailId,t.refuseModal=!0)},P=()=>{t.unapplyId=x.value,t.unapplyModal=!0},M=i=>{var s;i==1?te.confirm({title:"确认解约",content:"是否确认解约?",okText:"确认",cancelText:"取消",onOk:()=>{var f;ue({id:(f=x.value)==null?void 0:f.collegeWqCancelDetailId,type:70}).then(O=>{O.success&&(G.success(O.message),c())})}}):(t.refuseId2=(s=x.value)==null?void 0:s.collegeWqCancelDetailId,t.refuseModal2=!0)},q=U([]),$=()=>A(this,null,function*(){let i=yield $e({studentId:t.stuInfo.id,pageNo:1,pageSize:10});q.value=i.result.records}),Z=i=>{t.detId=i,t.detModal=!0},_=i=>{var s;je({id:(s=x.value)==null?void 0:s.collegeWqStudResultId}).then(f=>{f.success&&(t.applyAlertData=f.result?f.result:{},t.applyAlertModal=!0)})};return(i,s)=>{const f=n("a-input"),O=n("a-form-item"),D=n("a-col"),F=n("a-button"),H=n("a-row"),Q=n("a-form"),Y=n("a-table"),ee=n("a-pagination"),R=n("a-tab-pane"),be=n("a-empty"),he=n("a-tabs"),ie=n("ExclamationCircleOutlined"),xe=n("a-modal");return p(),I(B,null,[e("div",uo,[a(he,{activeKey:o.value,"onUpdate:activeKey":s[10]||(s[10]=d=>o.value=d)},{default:l(()=>[a(R,{key:"1",tab:"申请签约企业",style:{"padding-top":"20px"}},{default:l(()=>[a(Q,{ref:"formRef",model:t,"label-col":{style:{width:"100px"}},"wrapper-col":i.wrapperCol,style:{"margin-bottom":"20px"}},{default:l(()=>[a(H,{class:"setClass"},{default:l(()=>[a(D,{class:"flex",span:6},{default:l(()=>[a(O,{name:"collegeTrainingMode",label:"单位名称"},{default:l(()=>[a(f,{value:t.form.jobCompanyName,"onUpdate:value":s[0]||(s[0]=d=>t.form.jobCompanyName=d),placeholder:"请输入单位名称"},null,8,["value"])]),_:1})]),_:1}),a(D,{class:"flex",span:6},{default:l(()=>[a(O,{name:"collegeTrainingMode",label:"联系人"},{default:l(()=>[a(f,{value:t.form.companyLinkPeople,"onUpdate:value":s[1]||(s[1]=d=>t.form.companyLinkPeople=d),placeholder:"请输入联系人"},null,8,["value"])]),_:1})]),_:1}),a(D,{class:"flex",span:6},{default:l(()=>[a(O,{name:"collegeTrainingMode",label:"单位性质"},{default:l(()=>[a(pe,{dictCode:"college_wq_nature",placeholder:"请选择单位性质",paramdata:t.form.natureText,onCheckedisForm:s[2]||(s[2]=d=>k(d,"nature"))},null,8,["paramdata"])]),_:1})]),_:1}),a(D,{class:"flex",span:6},{default:l(()=>[a(O,{name:"collegeTrainingMode",label:"单位行业"},{default:l(()=>[a(pe,{dictCode:"trade",placeholder:"请选择单位行业",paramdata:t.form.companyTradeText,onCheckedisForm:s[3]||(s[3]=d=>k(d,"companyTrade"))},null,8,["paramdata"])]),_:1})]),_:1}),a(D,{lg:6},{default:l(()=>[a(F,{type:"primary",onClick:c},{default:l(()=>[u("查询")]),_:1}),a(F,{style:{"margin-left":"10px"},onClick:s[4]||(s[4]=()=>{t.form={},c()})},{default:l(()=>[u("重置")]),_:1})]),_:1})]),_:1})]),_:1},8,["model","wrapper-col"]),a(Y,{dataSource:y.value,columns:J(Ne),pagination:!1,size:"middle"},{action:l(({record:d})=>{var L,V,W,E;return[e("div",fo,[((L=x.value)==null?void 0:L.signFlowStatus)==20||((V=x.value)==null?void 0:V.signFlowStatus)==30||((W=x.value)==null?void 0:W.signFlowStatus)==31||((E=x.value)==null?void 0:E.signFlowStatus)==32?(p(),I(B,{key:0},[u(" -- ")],64)):d.signFlowStatus==0?(p(),S(F,{key:1,class:"xf-editbtn",onClick:X=>w(d)},{default:l(()=>[u("申请")]),_:2},1032,["onClick"])):d.signFlowStatus==1?(p(),S(F,{key:2,class:"xf-editbtn disabled",onClick:X=>w(d)},{default:l(()=>[u("申请")]),_:2},1032,["onClick"])):d.signFlowStatus==10?(p(),I(B,{key:3},[d.izCompanyConsentText=="拒绝"?(p(),I("span",_o,"单位已拒绝")):d.izStudentConsentText=="拒绝"?(p(),I("span",go,"已拒绝")):(p(),I(B,{key:2},[a(F,{class:"xf-editbtn",style:{color:"red","margin-right":"10px"},onClick:X=>j(d,0)},{default:l(()=>[u("拒绝")]),_:2},1032,["onClick"]),a(F,{class:"xf-editbtn",onClick:X=>j(d,1)},{default:l(()=>[u("确认")]),_:2},1032,["onClick"])],64))],64)):d.signFlowStatus==20?(p(),I(B,{key:4},[d.checkStatusText=="审核未通过"?(p(),I("span",bo,"校方未通过")):(p(),I("span",ho,"--"))],64)):(p(),I(B,{key:5},[u(" -- ")],64))])]}),company:l(({record:d})=>[e("span",{onClick:L=>Z(d.jobCompanyId),style:{color:"#4381ff",cursor:"pointer"}},b(d.jobCompanyName),9,xo)]),_:1},8,["dataSource","columns"]),a(ee,{current:r.page,"onUpdate:current":s[5]||(s[5]=d=>r.page=d),onShowSizeChange:s[6]||(s[6]=(d,L)=>{r.size=L}),onChange:i.changePage,"show-size-changer":"","show-quick-jumper":"","show-less-items":"",size:"small","show-total":d=>`共 ${r.total} 条数据`,total:r.total,style:{margin:"20px 0px 10px 0px",float:"right"}},null,8,["current","onChange","show-total","total"])]),_:1}),a(R,{key:"2",tab:"我签约的企业",style:{"padding-top":"20px"}},{default:l(()=>{var d,L,V;return[((d=x.value)==null?void 0:d.signFlowStatus)==30||((L=x.value)==null?void 0:L.signFlowStatus)==31||((V=x.value)==null?void 0:V.signFlowStatus)==32?(p(),I("div",vo,[yo,a(H,{class:"setClass"},{default:l(()=>[(p(!0),I(B,null,ge(N,(W,E)=>(p(),S(D,{class:"flex",span:8,key:E,style:{margin:"16px 0"}},{default:l(()=>[e("div",ko,b(E)+"：",1),e("div",Co,b(x.value[W]||"--"),1)]),_:2},1024))),128))]),_:1}),a(H,{class:"setClass",style:{"margin-top":"40px"}},{default:l(()=>[a(D,{class:"flex",span:8,offset:"8"},{default:l(()=>{var W,E;return[a(F,{type:"primary",style:{"margin-right":"10px"},onClick:s[7]||(s[7]=X=>_())},{default:l(()=>[u("打印就业协议合同")]),_:1}),((W=x.value)==null?void 0:W.signFlowStatus)==30?(p(),S(F,{key:0,type:"danger",onClick:P},{default:l(()=>[u("申请解约")]),_:1})):z("",!0),((E=x.value)==null?void 0:E.signFlowStatus)==31&&x.value.signFlowStatusText=="已申请解约待学生确认"?(p(),I(B,{key:1},[a(F,{type:"danger",style:{"margin-left":"10px"},onClick:s[8]||(s[8]=X=>M(0))},{default:l(()=>[u("拒绝解约")]),_:1}),a(F,{type:"primary",style:{"margin-left":"10px"},onClick:s[9]||(s[9]=X=>M(1))},{default:l(()=>[u("确认解约")]),_:1})],64)):z("",!0)]}),_:1})]),_:1})])):(p(),I("div",wo,[a(be)]))]}),_:1}),a(R,{key:"3",tab:"我解约的企业",style:{"padding-top":"20px"}},{default:l(()=>[a(Y,{dataSource:q.value,columns:J(Le),pagination:!1,size:"middle"},{company:l(({record:d})=>[e("span",null,b(d.companyName),1)]),_:1},8,["dataSource","columns"])]),_:1})]),_:1},8,["activeKey"])]),t.approveModal?(p(),S(ze,{key:0,id:t.approveId,visible:t.approveModal,stuInfo:t.stuInfo,onCancelClick:s[11]||(s[11]=()=>{t.approveModal=!1,c()})},null,8,["id","visible","stuInfo"])):z("",!0),t.refuseModal?(p(),S(Qe,{key:1,visible:t.refuseModal,id:t.refuseId,onCancelClick:s[12]||(s[12]=()=>{t.refuseModal=!1,c()})},null,8,["visible","id"])):z("",!0),t.unapplyModal?(p(),S(Ve,{key:2,id:t.unapplyId,stuInfo:t.stuInfo,visible:t.unapplyModal,onCancelClick:s[13]||(s[13]=()=>{t.unapplyModal=!1,c()})},null,8,["id","stuInfo","visible"])):z("",!0),t.refuseModal2?(p(),S(tt,{key:3,visible:t.refuseModal2,id:t.refuseId2,onCancelClick:s[14]||(s[14]=()=>{t.refuseModal2=!1,c()})},null,8,["visible","id"])):z("",!0),t.applyAlertModal?(p(),S(mo,{key:4,onOkclicks:s[15]||(s[15]=()=>{t.applyAlertModal=!1}),onCancelClicks:s[16]||(s[16]=()=>{t.applyAlertModal=!1}),visible:t.applyAlertModal,data:t.applyAlertData,title:"就业协议合同"},null,8,["visible","data"])):z("",!0),t.detModal?(p(),S(Ye,{key:5,visible:t.detModal,id:t.detId,onCancelClick:s[17]||(s[17]=d=>t.detModal=!1)},null,8,["visible","id"])):z("",!0),a(xe,{visible:t.showTips,"onUpdate:visible":s[20]||(s[20]=d=>t.showTips=d),closable:!1,maskClosable:!1,footer:null,width:"500px",onCancel:i.handleCancel},{default:l(()=>{var d,L;return[((d=t.stuInfo)==null?void 0:d.izPerfect)==0?(p(),I("div",Io,[e("h4",To,[a(ie,{style:{color:"#ffe58f"}}),u(" 未完善签约信息")]),So,e("div",$o,[a(F,{type:"primary",onClick:s[18]||(s[18]=V=>J(g).push("/collage/studentInfo"))},{default:l(()=>[u("去完善")]),_:1})])])):z("",!0),((L=t.stuInfo)==null?void 0:L.studResultType)==10?(p(),I("div",Oo,[e("h4",Fo,[a(ie,{style:{color:"#ffe58f"}}),u(" 已有非就业签约")]),jo,e("div",Mo,[a(F,{type:"primary",onClick:s[19]||(s[19]=V=>J(g).push("/collage/nojob"))},{default:l(()=>[u("确定")]),_:1})])])):z("",!0)]}),_:1},8,["visible","onCancel"])],64)}}});const Ro=ae(Po,[["__scopeId","data-v-9662b120"]]);export{Ro as default};
