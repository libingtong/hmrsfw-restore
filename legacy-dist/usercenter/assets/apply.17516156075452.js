var Ie=Object.defineProperty;var ge=Object.getOwnPropertySymbols;var Ne=Object.prototype.hasOwnProperty,De=Object.prototype.propertyIsEnumerable;var he=(d,f,l)=>f in d?Ie(d,f,{enumerable:!0,configurable:!0,writable:!0,value:l}):d[f]=l,ve=(d,f)=>{for(var l in f||(f={}))Ne.call(f,l)&&he(d,l,f[l]);if(ge)for(var l of ge(f))De.call(f,l)&&he(d,l,f[l]);return d};var xe=(d,f,l)=>new Promise((i,r)=>{var a=g=>{try{k(l.next(g))}catch(S){r(S)}},w=g=>{try{k(l.throw(g))}catch(S){r(S)}},k=g=>g.done?i(g.value):Promise.resolve(g.value).then(a,w);k((l=l.apply(d,f)).next())});import{f as X,r as q,H as ye,o as H,X as p,Y as y,Z as B,_ as s,$ as e,z as te,I,a6 as h,E as ae,w as oe,a2 as D,a as t,u as ce,a8 as pe,a9 as me,q as $,a4 as N,a1 as Fe,F as V,a3 as Oe,ab as $e}from"./vue.1751615607545.js";import{_ as Q,M as fe,d as E,m as le,I as je,y as ze}from"./index.1751615607545.js";import{a as Pe,q as Re,b as Le,c as Me,g as Ue,d as qe,n as Be,f as Ke}from"./index.api.175161560754514.js";import{d as Y}from"./dictCode.1751615607545.js";import{$ as Ee}from"./print.1751615607545.js";let c={num:{title:"序号",dataIndex:"id",width:70,customRender:(d,f)=>d.index+1},time:{title:"毕业时间",key:"timeOfGraduation",dataIndex:"timeOfGraduation"},name:{title:"姓名",key:"realName"},sex:{title:"性别",dataIndex:"sexText"},birth:{title:"出生日期",dataIndex:"birthday"},collage:{title:"学院",dataIndex:"facultyName"},major:{title:"专业",dataIndex:"majorName"},edu:{title:"学历",dataIndex:"collegeEducationText"},reasonSch:{title:"校方拒绝原因",dataIndex:"companyNotarizeMessage"},reasonStu:{title:"学生拒绝原因",dataIndex:"studentNotarizeMessage"},signStatus:{title:"签约状态",dataIndex:"signFlowStatusText"},breakStatus:{title:"解约状态",dataIndex:"cancelDetailStatusText"},apply:{title:"申请时间",dataIndex:"applyForTime"},checkStatusText:{title:"审核状态",dataIndex:"checkStatusText"},checkOpinion:{title:"审核意见",dataIndex:"checkOpinion"}};const Ae=[{title:"操作",align:"center",fixed:"left",key:"operation",width:160},c.num,c.name,c.sex,c.birth,c.collage,c.major,c.edu,c.time,c.signStatus,c.checkStatusText,c.checkOpinion,c.apply],Je=[{title:"操作",align:"center",fixed:"left",key:"operation",width:200},c.num,c.name,c.sex,c.birth,c.collage,c.major,c.edu,c.time,c.signStatus,c.apply],Ge=[c.num,c.name,c.sex,c.birth,c.collage,c.major,c.edu,c.time,c.reasonStu,c.breakStatus,c.apply],We=[c.num,c.name,c.sex,c.birth,c.collage,c.major,c.edu,c.time,c.reasonSch,c.reasonStu,c.breakStatus,c.apply],Ve={class:"flex"},Ye={class:"label"},Xe={class:"red marR5"},He={class:"value u-3"},Qe=X({__name:"cols",props:{data:{type:Object,default:{}},col:{type:String,default:"12"},label:{type:String,default:""},value:{type:String,default:""},required:{type:Boolean,default:!1}},setup(d){const f=d;return q({}),ye(()=>{}),H(()=>{console.log("-----")}),(l,i)=>{const r=p("a-col");return y(),B(r,{span:f.span},{default:s(()=>[e("div",Ve,[e("div",Ye,[te(e("span",Xe,"*",512),[[ae]]),I(h(f.label),1)]),e("div",He,h(f.value),1)])]),_:1},8,["span"])}}});const b=Q(Qe,[["__scopeId","data-v-0fb350d3"]]),_e=d=>(pe("data-v-1f90ab18"),d=d(),me(),d),Ze={class:""},et=_e(()=>e("span",{class:"bold"},"学生基本信息",-1)),tt=_e(()=>e("span",{class:"bold"},"就业意向信息",-1)),at={class:"flex"},lt=_e(()=>e("div",{class:"label"},"期望工作地:",-1)),ot={class:"value U-3"},st=X({__name:"DetailModal",props:{data:{type:Object,default:{}},okText:{type:String,default:"确定"},cancelText:{type:String,default:"取消"},title:{type:String,default:"信息确认"},visible:{type:Boolean,default:!1}},emits:["okClick","cancelClick"],setup(d,{emit:f}){const l=d,i=q({formData:{},loading:!1,list:[],paras:{pageNo:1,pageSize:3,applyId:void 0},pagination:{total:"",pageSize:3,current:1,showTotal:k=>`共${k}条`}});oe(()=>l.data,()=>{r()},{deep:!0}),ye(()=>{}),H(()=>{r()});const r=()=>{let k=JSON.parse(JSON.stringify(l.data));i.formData=k},a=()=>{f("okClick",i.formData)},w=()=>{f("cancelClick")};return(k,g)=>{const S=p("a-divider"),j=p("a-row"),_=p("a-col");return y(),D("div",null,[t(ce(fe),{visible:l.visible,"onUpdate:visible":g[0]||(g[0]=M=>l.visible=M),title:l.title,"ok-text":l.okText,maskClosable:!1,"cancel-text":l.cancelText,onOk:a,onCancel:w,class:"modalCls",width:"1000px",footer:null},{default:s(()=>[e("div",Ze,[t(S,{orientation:"left"},{default:s(()=>[et]),_:1}),t(j,{gutter:10,class:"marT20"},{default:s(()=>[t(b,{span:"8",label:"学院：",value:i.formData.campusName},null,8,["value"]),t(b,{span:"8",label:"专业：",value:i.formData.majorName},null,8,["value"]),t(b,{span:"8",label:"学号：",value:i.formData.studentNumber},null,8,["value"]),t(b,{span:"8",label:"姓名：",value:i.formData.realName},null,8,["value"]),t(b,{span:"8",label:"身份证号：",value:i.formData.idCard},null,8,["value"]),t(b,{span:"8",label:"考生号：",value:i.formData.candidateNumber},null,8,["value"]),t(b,{span:"8",label:"性别：",value:i.formData.sexText},null,8,["value"]),t(b,{span:"8",label:"民族：",value:i.formData.nationText},null,8,["value"]),t(b,{span:"8",label:"政治面貌：",value:i.formData.politicalOrientationText},null,8,["value"]),t(b,{span:"8",label:"出生日期：",value:i.formData.birthday},null,8,["value"]),t(b,{span:"8",label:"入学时间：",value:i.formData.timeOfEnrollment},null,8,["value"]),t(b,{span:"8",label:"毕业时间：",value:i.formData.timeOfGraduation},null,8,["value"]),t(b,{span:"8",label:"学历：",value:i.formData.collegeEducationText},null,8,["value"]),t(b,{span:"8",label:"学制：",value:i.formData.lengthOfSchooling},null,8,["value"]),t(b,{span:"8",label:"培养方式：",value:i.formData.collegeTrainingModeText},null,8,["value"]),t(b,{span:"8",label:"定向委培单位：",value:i.formData.orienteeringCorpName},null,8,["value"]),t(b,{span:"8",label:"生源地区：",value:i.formData.studentSourceRegoinText},null,8,["value"]),t(b,{span:"8",label:"城乡生源：",value:i.formData.studentSourceTypeText},null,8,["value"]),t(b,{span:"8",label:"家庭地址：",value:i.formData.nativePlaceDetailedAddress},null,8,["value"]),t(b,{span:"8",label:"家庭电话：",value:i.formData.phone},null,8,["value"]),t(b,{span:"8",label:"邮编：",value:i.formData.familyPostcode},null,8,["value"]),t(b,{span:"8",label:"联系方式：",value:i.formData.kinsfolkPhone},null,8,["value"]),t(b,{span:"8",label:"电子邮件：",value:i.formData.email},null,8,["value"]),t(b,{span:"8",label:"困难类别：",value:i.formData.difficultyStudentTypeText},null,8,["value"]),t(b,{span:"8",label:"师范生类别：",value:i.formData.teacherTrainingTypeText},null,8,["value"])]),_:1}),t(S,{orientation:"left"},{default:s(()=>[tt]),_:1}),t(j,{gutter:10,class:"marT20"},{default:s(()=>[t(b,{span:"8",label:"期望工作性质：",value:i.formData.workNatureText},null,8,["value"]),t(_,{span:8},{default:s(()=>[e("div",at,[lt,e("div",ot,h(i.formData.hopeWorkProviceName)+h(i.formData.hopeWorkCityName)+h(i.formData.hopeWorkAreaName),1)])]),_:1}),t(b,{span:"8",label:"最低月薪资：",value:i.formData.startSalary},null,8,["value"]),t(b,{span:"8",label:"最高薪资：",value:i.formData.startSalary},null,8,["value"]),t(b,{span:"8",label:"求职意向：",value:i.formData.positionTypeText},null,8,["value"]),t(b,{span:"8",label:"工作职位性质：",value:i.formData.workNatureText},null,8,["value"])]),_:1})])]),_:1},8,["visible","title","ok-text","cancel-text"])])}}});const it=Q(st,[["__scopeId","data-v-1f90ab18"]]),nt=d=>(pe("data-v-4b6d9249"),d=d(),me(),d),rt={ref:"globalModal"},ct={class:"clearfix otherItem"},dt={key:0},ut=nt(()=>e("div",{style:{"margin-top":"8px"}},"点击上传图片",-1)),pt=["src"],mt={class:"flex marT40",style:{"justify-content":"center"}},ft=X({__name:"confirms",props:{arr:void 0,visible:String,name:String,okText:String,cancelText:String,contentTitle:String,closable:$(),title:String,type:String,complaintObjectId:String,businessType:{type:String,default:"0"},id:{type:String,default:""}},emits:["okclicks","cancelClicks"],setup(d,{emit:f}){const l=d,i=E(localStorage.getItem("corpInfo"),"corpInfo");E(localStorage.getItem("userCenterInfo"),"userCenterInfo");const r=ze,a=$(!1);$(null);const w=$(""),k=$(""),g=$([]),S=$({"X-Access-Token":localStorage.getItem("token")});oe(()=>l.visible,u=>{});let j=$(null);const _=q({value1:"",formState:{cancelFileUrl:"",personalPhotoPath:""}});H(()=>{_.formState.companyName=i?i.name:"",_.formState.companyId=i?i.id:""});const M=u=>{let C=JSON.parse(JSON.stringify(_.formState));f("okclicks",C)},A=()=>{},K=()=>{f("cancelClicks"),j.value.resetFields()},Z=u=>{console.log("Failed:",u,_.user)},z=u=>xe(this,null,function*(){console.log("图片回显",u),!u.url&&!u.preview&&(u.preview=yield R(u.originFileObj)),w.value=u.url||u.preview,a.value=!0,k.value=u.name||u.url.substring(u.url.lastIndexOf("/")+1)});function R(u){return new Promise((C,G)=>{const F=new FileReader;F.readAsDataURL(u),F.onload=()=>C(F.result),F.onerror=P=>G(P)})}function de({file:u,fileList:C,event:G}){_.formState.img=_.formState.img?_.formState.img:{},_.formState.img.fileName=u.name,_.formState.personalPhotoName=u.name,g.value=C,console.log("fileList免冠照片",g),u.status==="error"&&le.error(`${u.name} 上传失败.`);let F=[];u.status!="uploading"&&(C.forEach(P=>{P.status==="done"&&F.push(P.response.message)}),u.status==="removed"&&J(u,"img")),F.length>0&&(_.formState.img.filePath=F[0],_.formState.cancelFileUrl=F[0]),console.log("fileUrls",F,g.value)}function J(u,C){console.log("如有需要新增 删除逻辑",_.user,u,C),C=="img"?(_.formState.img.filePath="",_.formState.img.fileName="",_.formState.personalPhotoName="",_.formState.personalPhotoPath=""):C=="doc"&&(_.formState.doc.filePath="",_.formState.doc.fileName="",_.formState.fileName="",_.formState.filePath="")}const se=()=>{a.value=!1,k.value=""};return(u,C)=>{const G=p("plus-outlined"),F=p("a-upload"),P=p("a-form-item"),ee=p("a-col"),ue=p("a-textarea"),ie=p("a-row"),ne=p("a-button"),o=p("a-form"),n=p("a-modal");return y(),D("div",rt,[t(n,{visible:l.visible,"onUpdate:visible":C[2]||(C[2]=m=>l.visible=m),closable:d.closable,style:{top:"40px"},title:l.title,"ok-text":l.okText,width:"600px","cancel-text":l.cancelText,onOk:A,onCancel:K,getContainer:()=>u.$refs.globalModal,footer:null},{default:s(()=>[t(o,{ref_key:"formRef",ref:j,model:_.formState,name:"basic",autocomplete:"off","label-col":u.labelCol,"wrapper-col":u.wrapperCol,onFinishFailed:Z,onFinish:M},{default:s(()=>[t(ie,{gutter:20,style:{"margin-right":"55px"}},{default:s(()=>[t(ee,{span:24},{default:s(()=>[t(P,{name:"cancelFileUrl",label:"材料上传",rules:[{required:!0,message:"请上传材料"}]},{default:s(()=>[e("div",ct,[t(F,{class:"whupload","file-list":g.value,"onUpdate:fileList":C[0]||(C[0]=m=>g.value=m),action:ce(r),headers:S.value,data:{biz:"sign/"+ce(je)(new Date)},accept:".png, .jpeg, .jpg, .PNG, .JPEG, .JPG",multiple:!1,"max-count":1,"list-type":"picture-card",onPreview:z,onChange:de},{default:s(()=>[g.value.length<1?(y(),D("div",dt,[t(G),ut])):N("",!0)]),_:1},8,["file-list","action","headers","data"]),t(ce(fe),{visible:a.value,title:k.value,footer:null,onCancel:se},{default:s(()=>[e("img",{alt:"example",style:{width:"100%"},src:w.value},null,8,pt)]),_:1},8,["visible","title"])])]),_:1})]),_:1}),t(ee,{span:24},{default:s(()=>[t(P,{name:"applyForObjectMessage",label:"解约原因说明：",rules:[{required:!0,message:"请输入解约原因说明",trigger:"blur"}]},{default:s(()=>[t(ue,{rows:6,value:_.formState.applyForObjectMessage,"onUpdate:value":C[1]||(C[1]=m=>_.formState.applyForObjectMessage=m),placeholder:"请输入解约原因说明内容，不超过1000字",maxlength:1e3,"show-count":""},null,8,["value"])]),_:1})]),_:1})]),_:1}),t(ie,null,{default:s(()=>[t(ee,{span:24},{default:s(()=>[t(P,null,{default:s(()=>[e("div",mt,[t(ne,{style:{"margin-right":"30px"},class:"primary hoverBlue",size:"large",onClick:K},{default:s(()=>[I("取消")]),_:1}),t(ne,{class:"defaultBtn hoverBgBlue",type:"primary",size:"large","html-type":"submit"},{default:s(()=>[I("提交")]),_:1})])]),_:1})]),_:1})]),_:1})]),_:1},8,["model","label-col","wrapper-col"])]),_:1},8,["visible","closable","title","ok-text","cancel-text","getContainer"])],512)}}});const _t=Q(ft,[["__scopeId","data-v-4b6d9249"]]),bt={ref:"globalModal"},gt={class:"flex",style:{"justify-content":"center"}},ht=X({__name:"confirms2",props:{arr:void 0,visible:String,name:String,okText:String,cancelText:String,contentTitle:String,title:String,type:String,data:{type:Object,default:{}}},emits:["okclicks","cancelClicks"],setup(d,{emit:f}){const l=d;E(localStorage.getItem("corpInfo"),"corpInfo"),E(localStorage.getItem("userCenterInfo"),"userCenterInfo"),oe(()=>l.visible,g=>{});let i=$(null);const r=q({value1:"",formState:{checkOpinion:void 0}});H(()=>{});const a=()=>{},w=()=>{f("cancelClicks"),i.value.resetFields()},k=g=>{JSON.parse(JSON.stringify(r.formState)),f("okclicks",r.formState)};return(g,S)=>{const j=p("a-textarea"),_=p("a-form-item"),M=p("a-col"),A=p("a-row"),K=p("a-button"),Z=p("a-form"),z=p("a-modal");return y(),D("div",bt,[t(z,{visible:l.visible,"onUpdate:visible":S[1]||(S[1]=R=>l.visible=R),closable:g.closable,style:{top:"40px"},title:l.title,"ok-text":l.okText,width:"500px","cancel-text":l.cancelText,onCancel:w,getContainer:()=>g.$refs.globalModal,footer:null},{default:s(()=>[t(Z,{ref_key:"formRef",ref:i,model:r.formState,name:"basic",autocomplete:"off","label-col":g.labelCol,"wrapper-col":g.wrapperCol,onFinishFailed:g.onFinishFailed,onFinish:k},{default:s(()=>[t(A,{gutter:20},{default:s(()=>[t(M,{span:24},{default:s(()=>[t(_,{name:"checkOpinion",label:"原因：",rules:[{required:l.data.type=="0",message:"请输入原因",trigger:"blur"}]},{default:s(()=>[t(j,{rows:4,value:r.formState.checkOpinion,"onUpdate:value":S[0]||(S[0]=R=>r.formState.checkOpinion=R),placeholder:"请输入原因，不超过1000字",maxlength:1e3,"show-count":""},null,8,["value"])]),_:1},8,["rules"])]),_:1})]),_:1}),t(A,null,{default:s(()=>[t(M,{span:24},{default:s(()=>[t(_,null,{default:s(()=>[e("div",gt,[t(K,{style:{"margin-right":"30px"},class:"primary hoverBlue",size:"large",onClick:w},{default:s(()=>[I("取消")]),_:1}),t(K,{class:"defaultBtn hoverBgBlue",type:"primary",size:"large","html-type":"submit",onClick:a},{default:s(()=>[I("提交")]),_:1})])]),_:1})]),_:1})]),_:1})]),_:1},8,["model","label-col","wrapper-col","onFinishFailed"])]),_:1},8,["visible","closable","title","ok-text","cancel-text","getContainer"])],512)}}});const vt=Q(ht,[["__scopeId","data-v-dc56c74f"]]),x=d=>(pe("data-v-537a5c04"),d=d(),me(),d),xt={ref:"globalModal"},yt={class:"print"},kt={id:"print-container",class:"marL20 marT20",style:{width:"698px",margin:"auto","margin-left":"30px"}},St=x(()=>e("p",{class:"textCenter font-16 bold"},"就业协议合同",-1)),wt={class:"marB5"},Ct={class:"top"},Tt={class:"t-one flex font-16"},It=x(()=>e("div",{class:"lines font-16 border-top border-left textCenter"},"毕业生信息",-1)),Nt={class:"right flex-1"},Dt={class:"line1 flex"},Ft=x(()=>e("div",{class:"item border-top border-right"},"姓名",-1)),Ot={class:"item14 border-top border-right"},$t=x(()=>e("div",{class:"item border-top border-right"},"学院",-1)),jt={class:"item14 border-top border-right"},zt=x(()=>e("div",{class:"item border-top border-right"},"政治面貌",-1)),Pt={class:"item16 border-top border-right"},Rt=x(()=>e("div",{class:"item border-top border-right"},"民族",-1)),Lt={class:"item border-top border-right"},Mt={class:"line1 flex"},Ut=x(()=>e("div",{class:"item border-top border-right"},"性别",-1)),qt={class:"item14 border-top border-right"},Bt=x(()=>e("div",{class:"item border-top border-right"},"专业",-1)),Kt={class:"item14 border-top border-right"},Et=x(()=>e("div",{class:"item border-top border-right"},"联系电话",-1)),At={class:"item16 border-top border-right"},Jt=x(()=>e("div",{class:"item border-top border-right"},"学制",-1)),Gt={class:"item border-top border-right"},Wt={class:"line3 flex"},Vt=x(()=>e("div",{class:"line3-t line3-t-com border-top border-right"},"毕业时间",-1)),Yt={class:"line3-t2 line3-t-com border-top border-right"},Xt=x(()=>e("div",{class:"line3-t line3-t-com border-top border-right"},"学历",-1)),Ht={class:"line3-t3 line3-t-com border-top border-right"},Qt=x(()=>e("div",{class:"line3-t4 line3-t-com border-top border-right"},"电子邮件",-1)),Zt={class:"item3 line3-t-com border-top border-right"},ea={class:"line4 flex"},ta=x(()=>e("div",{class:"line3-t line3-t-com border-top border-right"},"家庭住址",-1)),aa={class:"line4-t line3-t-com border-top border-right"},la={class:"t-tow flex font-16"},oa=x(()=>e("div",{class:"lines font-16 border-top border-left textCenter"},"用人单位信息",-1)),sa={class:"right flex-1"},ia={class:"line1 flex font-16"},na=x(()=>e("div",{class:"item15 border-top border-right"},"单位名称",-1)),ra={class:"item35 border-top border-right"},ca=x(()=>e("div",{class:"item17 border-top border-right"},"单位性质",-1)),da={class:"item35 border-top border-right"},ua={class:"line2 flex"},pa=x(()=>e("div",{class:"item15 border-top border-right"},"单位隶属",-1)),ma={class:"item35 border-top border-right"},fa=x(()=>e("div",{class:"item17 border-top border-right"},"联系人",-1)),_a={class:"item35 border-top border-right"},ba={class:"line3 flex"},ga=x(()=>e("div",{class:"item15 border-top border-right"},"通讯地址",-1)),ha={class:"item35 border-top border-right"},va=x(()=>e("div",{class:"item17 border-top border-right"},"联系电话",-1)),xa={class:"item35 border-top border-right"},ya={class:"line4 flex",style:{height:"50px"}},ka=x(()=>e("div",{class:"item15 border-top border-right"},[I(" 档案接收 "),e("br"),I("单位 ")],-1)),Sa={class:"item35 border-top border-right"},wa=x(()=>e("div",{class:"item17 border-top border-right"},[I(" 档案转寄 "),e("br"),I("详细地址 ")],-1)),Ca={class:"item35 border-top border-right"},Ta=x(()=>e("div",{class:"t-three flex font-16"},[e("div",{class:"item30 border-top border-right border-left border-btm"},[e("div",{class:"padL5",style:{height:"50px"}},[e("p",null,"用人单位意见：")]),e("div",{class:"content padL5"}),e("div",{class:"sign padL10"},[e("p",null,"签章:")]),e("p")]),e("div",{class:"item34 border-top border-right border-btm"},[e("div",{class:"padL5",style:{height:"50px"}},[e("p",null,"用人单位上级主管意见："),e("p",{style:{"font-size":"12px",transform:"scale(0.8)","margin-left":"-10%"}},"(有用人自主权的单位此栏可忽略)")]),e("div",{class:"content padL5"}),e("div",{class:"sign padL10"},[e("p",null,"签章:")]),e("p")]),e("div",{class:"border-top border-btm",style:{width:"1px"}}),e("div",{class:"item34 border-top border-right border-btm"},[e("div",{class:"padL5",style:{height:"50px"}},[e("p",null,"学校毕业生就业管理部门意见：")]),e("div",{class:"content padL5"}),e("div",{class:"sign padL10"},[e("p",null,"签章:")]),e("p")])],-1)),Ia=x(()=>e("div",null,[e("div",{class:"others"},[e("div",{class:"line mt10"},[e("span",null,"甲方："),e("span")]),e("div",{class:"line mt10"},[e("span",null,"乙方："),e("span")]),e("div",{class:"line mt10"},[e("span",null,"丙方："),e("span")]),e("p",{class:"mt10"},"根据《中华人民共和国劳动法》、《中华人民共和国高等教育法》等相关法律法规，以及甲方、乙方、丙方三方共同协商，达成如下就业协议："),e("p",{class:"mt10"},"一、协议期限"),e("p",{class:"mt10"},[I("本协议自"),e("span",{style:{color:"#fff",width:"60px",display:"inline-block"}}),I("起至"),e("span",{style:{color:"#fff",width:"60px",display:"inline-block"}}),I("止。")]),e("p",{class:"mt10"},"二、实习与就业安排"),e("p",{class:"mt10"},"甲方根据乙方的专业特点和丙方的需求，推荐乙方到丙方进行实习或就业。"),e("p",null,"乙方同意在丙方实习或就业，并承诺遵守丙方的各项规章制度和劳动纪律"),e("p",null,"丙方同意接收乙方进行实习或就业，并为乙方提供相应的实习或工作岗位。"),e("p",{class:"mt10"},"三、三方的权利和义务"),e("p",{class:"mt10"},"甲方："),e("p",{class:"mt10"}," 负责对乙方进行就业指导，协助乙方与丙方建立实习或就业关系； 协助乙方处理与丙方在实习或就业过程中出现的问题； 监督丙方对乙方的实习或工作安排是否符合法律法规和学校规定 "),e("p",{class:"mt10"},"乙方："),e("p",{class:"mt10"}," 按时参加丙方提供的实习或工作，并按时完成工作任务； 遵守丙方的规章制度和劳动纪律，保守丙方的商业秘密； 如因个人原因需提前终止实习或工作，应提前向丙方提出书面申请。 "),e("p",{class:"mt10"},"丙方："),e("p",{class:"mt10"}," 为乙方提供符合法律法规和学校规定的实习或工作岗位； 按时向乙方支付劳动报酬，并保障乙方在实习或工作期间的人身安全； 尊重乙方的合法权益，不得强迫乙方从事违法或违背道德的活动。 "),e("p",{class:"mt10"},"四、违约责任"),e("p",{class:"mt10"}," 如任何一方违反本协议的约定，应承担相应的违约责任。 "),e("p",{class:"mt10"},"五、其他"),e("p",{class:"mt10"}," 本协议未尽事宜，由三方协商解决； 本协议一式三份，甲、乙、丙三方各执一份； 本协议自三方签字（或盖章）之日起生效。 "),e("p",{class:"mt10"},"甲方（学校）："),e("p",{class:"mt10"},"乙方（学生）："),e("p",{class:"mt10"},"丙方（用人单位）："),e("p",{class:"mt10"},"签订日期：")])],-1)),Na=X({__name:"protocol",props:{arr:void 0,visible:String,name:String,okText:String,cancelText:String,contentTitle:String,title:String,type:String,data:{type:Object,default:{}}},emits:["okclicks","cancelClicks"],setup(d,{emit:f}){const l=d;E(localStorage.getItem("corpInfo"),"corpInfo"),JSON.parse(localStorage.getItem("userInfo")),oe(()=>l.visible,w=>{}),oe(()=>l.data,w=>{},{deep:!0}),$(null),q({value1:""}),H(()=>{});const i=()=>{f("cancelClicks")},r=()=>`
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
    width: 80px;
    box-sizing:border-box
  }
  .line3-t{
    
    width: 80px;
  
  }
    .line3-t2{
    width: 85px;
  }
  .line3-t3{
     width: 85px;
    
  }
  .line3-t4{
    width: 80px;
  }
  .line3-t-com{
  height: 40px;
    text-align: center;

    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
   
    box-sizing:border-box
  }
  .item3 {
    width: 269px;
  }
  .line4-t {
    flex:1
  }
  
  
  
  
  .item14 {
    height: 40px;
    text-align: center;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
    width: 85px;
    box-sizing:border-box
  }
  .item16 {
    height: 40px;
    text-align: center;
    padding: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 16px;
     width: 98px;
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
  
    line-height: 16px;
    min-height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 122px;
    box-sizing:border-box;
  }
  .item17 {
    text-align: center;
    line-height: 16px;
    min-height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 123px;
    box-sizing:border-box;
  }
  .item35 {
    text-align: center;
  
    line-height: 16px;
    min-height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing:border-box;
    width:217px;
  }
 
  
  .item30{
    text-align: left;
    width: 220px;
     box-sizing:border-box;
  }
  .t-three{
    width:702px;
  }
  .item34 {
    text-align: left;
    width: 284px;
    box-sizing:border-box;
    
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
  `,a=()=>{Ee({printable:"print-container",type:"html",scanStyles:!1,style:r()})};return(w,k)=>{const g=p("a-button"),S=p("a-modal");return y(),D("div",xt,[t(S,{visible:l.visible,"onUpdate:visible":k[0]||(k[0]=j=>l.visible=j),closable:w.closable,style:{top:"40px"},title:l.title,"ok-text":l.okText,width:"800px","cancel-text":l.cancelText,onCancel:i,getContainer:()=>w.$refs.globalModal,footer:null},{default:s(()=>[e("div",yt,[t(g,{class:"defaultBtn hoverBgBlue",type:"primary",size:"large","html-type":"submit",onClick:a},{default:s(()=>[I("打印就业协议合同")]),_:1})]),e("div",kt,[St,e("p",wt,"学号："+h(l.data.studentNumber),1),e("div",Ct,[e("div",Tt,[It,e("div",Nt,[e("div",Dt,[Ft,e("div",Ot,h(l.data.realName),1),$t,e("div",jt,h(l.data.campusName),1),zt,e("div",Pt,h(l.data.politicalOrientationText),1),Rt,e("div",Lt,h(l.data.nationText),1)]),e("div",Mt,[Ut,e("div",qt,h(l.data.sexText),1),Bt,e("div",Kt,h(l.data.majorName),1),Et,e("div",At,h(l.data.phone),1),Jt,e("div",Gt,h(l.data.lengthOfSchooling),1)]),e("div",Wt,[Vt,e("div",Yt,h(l.data.timeOfGraduation),1),Xt,e("div",Ht,h(l.data.collegeEducationText),1),Qt,e("div",Zt,h(l.data.email),1)]),e("div",ea,[ta,e("div",aa,h(l.data.nativePlaceDetailedAddress),1)])])]),e("div",la,[oa,e("div",sa,[e("div",ia,[na,e("div",ra,h(l.data.companyName),1),ca,e("div",da,h(l.data.natureText),1)]),e("div",ua,[pa,e("div",ma,h(l.data.companySubjectionText),1),fa,e("div",_a,h(l.data.companyLinkPeople),1)]),e("div",ba,[ga,e("div",ha,h(l.data.candidateNumber),1),va,e("div",xa,h(l.data.candidateNumber),1)]),e("div",ya,[ka,e("div",Sa,h(l.data.archiveReceiveCompany),1),wa,e("div",Ca,h(l.data.archiveSendAddress),1)])])]),Ta]),Ia])]),_:1},8,["visible","closable","title","ok-text","cancel-text","getContainer"])],512)}}});const Da=Q(Na,[["__scopeId","data-v-537a5c04"]]),Fa={class:"contenttable fontsize14"},Oa={class:"table newTable"},$a={slot:"num","slot-scope":"text, record, index"},ja=["onClick"],za=["onClick"],Pa={key:2},Ra=["onClick"],La=["onClick"],Ma=["onClick"],Ua=["onClick"],qa=["onClick"],Ba=X({__name:"apply",setup(d){const f=Fe();E(localStorage.getItem("xfSysUserId"),"xfSysUserId");let l=E(localStorage.getItem("corpInfo"),"corpInfo");const i=q({show:!1,data:{}}),r=q({show:!1,show2:!1,title2:"接受",data:{},data2:{type:0},show3:!1,data3:{},activeIndex:1}),a=q({form:{},activeKey:1,tabList:[{key:1,tab:"申请签约的学生",columu:Ae},{key:2,tab:"签约成功的学生",columu:Je},{key:3,tab:"拒绝签约的学生",columu:Ge},{key:4,tab:"解约的学生",columu:We}],time:void 0,user:{wqCompanyExpandId:void 0,timeOfGraduation:void 0,facultyName:void 0,realName:void 0,collegeTrainingMode:void 0,studentNumber:void 0,pageNo:1,pageSize:10,signFlowStatusText:void 0,majorName:void 0},pageSize:1,pagination:{total:"",pageSize:10,current:1,showTotal:o=>`共${o}条`},loading:!0}),w=$([]),k=$([]),g=$({checkStrictly:!0,selectedRowKeys:w,onChange:(o,n)=>{w.value=o,k.value=n}});H(()=>{Z()});const S=$([]);q({total:0,page:1,size:10});function j(){a.user.pageNo=1,a.pagination.current=1,z()}function _(){M(),z()}const M=()=>{a.user.pageNo=1,a.pagination.current=1,a.user.realName=void 0,a.user.checkStatus=void 0,a.user.checkStatusText=void 0,a.user.timeOfGraduation=void 0,a.user.studentNumber=void 0,a.user.majorName=void 0,a.user.sex=void 0,a.user.sexText=void 0,a.user.collegeEducation=void 0,a.user.collegeEducationText=void 0,a.user.signFlowStatus=void 0,a.user.signFlowStatusText=void 0,a.user.cancelDetailStatus=void 0,a.user.cancelDetailStatusText=void 0},A=o=>{S.value=[],a.activeKey=o,a.user.pageNo=1,a.pagination.current=1,M(),z()};function K(o,n,m){const T=ve({},a.pagination);T.pageNo=o.current,T.current=o.current,a.pagination=T,a.user.pageNo=o.current,a.loading=!1,z()}const Z=()=>{Pe({companyId:l.id}).then(o=>{o.success?(a.user.wqCompanyExpandId=o.result?o.result.id:void 0,z()):fe.confirm({title:"提示",content:"请先完善企业签约信息？",okText:"确定",cancelText:"关闭",onOk:()=>{f.push("/sign/corpInfo")}})})},z=()=>{if(!a.user.wqCompanyExpandId)return;let o=JSON.parse(JSON.stringify(a.user));if(a.activeKey!=4){o.cancelDetailStatusText=void 0,o.cancelDetailStatus=void 0;let n="1,10,20";a.activeKey==2?(n="30,31,32",o.izStudentConsent="1"):a.activeKey==3&&(n="10",o.izStudentConsent="0",o.signFlowStatusText=void 0,o.signFlowStatus=void 0),o.signFlowStatusList=n,Re(o).then(m=>{m.success&&(S.value=m.result.records?m.result.records:[])})}else o.signFlowStatusText=void 0,o.signFlowStatus=void 0,Le(o).then(n=>{n.success&&(S.value=n.result.records?n.result.records:[])})},R=(o,n)=>{if(o)switch(n){case"xb":a.user.sex=o.value,a.user.sexText=o.label;break;case"xl":a.user.collegeEducation=o.value,a.user.collegeEducationText=o.label;break;case"qy":a.user.signFlowStatus=o.value,a.user.signFlowStatusText=o.label;break;case"jy":a.user.cancelDetailStatus=o.value,a.user.cancelDetailStatusText=o.label;break}},de=o=>{i.show=!0;let n=a.activeKey==4?o.studentId:o.collegeStudentId;Me({id:n}).then(m=>{m.success&&(i.data=m.result)})},J=(o,n)=>{let m="";o?m=o.id+"":k.value.forEach(T=>{T.signFlowStatus=="1"&&(m=m+T.id)}),m?(r.activeIndex=1,r.title2=n=="0"?"拒绝原因":"接受原因",P(n,m)):le.error("暂无可批量处理的数据")},se=(o,n)=>{let m="";o?o.collegeWqCancelDetailId&&(m=o.collegeWqCancelDetailId+""):k.value.forEach(T=>{T.signFlowStatus=="31"&&(m=m+T.collegeWqCancelDetailId)}),m?(r.activeIndex=2,r.title2=n=="0"?"拒绝原因":"接受原因",P(n,m)):le.error("暂无可批量处理的数据")},u=()=>{i.show=!1},C=()=>{i.show=!1};function G(o){r.show=!0,r.data=o}const F=o=>{r.show=!1;let n={byObjectId:r.data.collegeStudentId,applyForObjectId:l.id,applyForObjectType:10,applyForObjectTypeText:"单位",applyForObjectMessage:o.applyForObjectMessage,cancelFileUrl:o.cancelFileUrl,studResultId:r.data.studResultId};qe(n).then(T=>{r.show2=!1,T.success&&(le.success(T.message),w.value=[],z())})};function P(o,n){r.show2=!0,r.data2.type=o,r.data2.ids=n}const ee=o=>{let n={ids:r.data2.ids,type:r.data2.type,checkOpinion:o.checkOpinion},m=Be;console.log("-----tiye",r.data2.type),r.activeIndex==2&&(n={id:r.data2.ids,type:r.data2.type=="0"?"20":"70",checkOpinion:o.checkOpinion},m=Ke),m(n).then(T=>{r.show2=!1,T.success&&(le.success(T.message),w.value=[],z())})},ue=()=>{r.show2=!1},ie=o=>{r.show3=!0,r.data3=o,Ue({id:o.studResultId}).then(n=>{n.success&&(r.data3=n.result?n.result:{})})},ne=()=>{r.show3=!1};return(o,n)=>{const m=p("a-tab-pane"),T=p("a-tabs"),be=p("a-input"),U=p("a-form-item"),L=p("a-col"),ke=p("a-date-picker"),re=p("a-button"),Se=p("a-row"),we=p("a-form"),Ce=p("a-table");return y(),D(V,null,[e("div",Fa,[t(T,{activeKey:a.activeKey,"onUpdate:activeKey":n[0]||(n[0]=v=>a.activeKey=v),onChange:A},{default:s(()=>[(y(!0),D(V,null,Oe(a.tabList,(v,Te)=>(y(),B(m,{key:v.key,tab:v.tab},null,8,["tab"]))),128))]),_:1},8,["activeKey"]),t(we,{ref:"formRef",model:a,"label-col":{style:{width:"120px"}},"wrapper-col":o.wrapperCol},{default:s(()=>[t(Se,{class:"setClass"},{default:s(()=>[t(L,{class:"flex",span:8},{default:s(()=>[t(U,{style:{width:"100%"},name:"realName",label:"姓名"},{default:s(()=>[t(be,{value:a.user.realName,"onUpdate:value":n[1]||(n[1]=v=>a.user.realName=v),placeholder:"请输入名称"},null,8,["value"])]),_:1})]),_:1}),t(L,{class:"flex",span:8},{default:s(()=>[t(U,{style:{width:"100%"},name:"studentNumber",label:"学号"},{default:s(()=>[t(be,{value:a.user.studentNumber,"onUpdate:value":n[2]||(n[2]=v=>a.user.studentNumber=v),placeholder:"请输入联系人"},null,8,["value"])]),_:1})]),_:1}),t(L,{class:"flex",span:8},{default:s(()=>[t(U,{style:{width:"100%"},name:"sexText",label:"性别"},{default:s(()=>[t(Y,{dictCode:"sex",ptitle:"请选择性别",showSearch:!1,outputdisabled:a.outputdisabled,onCheckedisForm:n[3]||(n[3]=v=>R(v,"xb")),paramdata:a.user.sexText},null,8,["outputdisabled","paramdata"])]),_:1})]),_:1}),te(t(L,{class:"flex",span:8},{default:s(()=>[t(U,{style:{width:"100%"},name:"facultyName",label:"学院"},{default:s(()=>[t(Y,{dictCode:"sex",ptitle:"请选择学院",showSearch:!1,outputdisabled:a.outputdisabled,onCheckedisForm:o.checkedsexxfSysUser,paramdata:a.user.facultyName},null,8,["outputdisabled","onCheckedisForm","paramdata"])]),_:1})]),_:1},512),[[ae,!1]]),te(t(L,{span:8},{default:s(()=>[t(U,{name:"majorName",label:"专业"},{default:s(()=>[t(Y,{showSearch:!1,ptitle:"请选择专业",outputdisabled:a.outputdisabled,dictCode:"college_education",onCheckedisForm:o.checkedjob,paramdata:a.user.majorName},null,8,["outputdisabled","onCheckedisForm","paramdata"])]),_:1})]),_:1},512),[[ae,!1]]),t(L,{span:8},{default:s(()=>[t(U,{name:"collegeEducationText",label:"学历"},{default:s(()=>[t(Y,{dictCode:"college_education",ptitle:"请选择学历",showSearch:!1,outputdisabled:a.outputdisabled,onCheckedisForm:n[4]||(n[4]=v=>R(v,"xl")),paramdata:a.user.collegeEducationText},null,8,["outputdisabled","paramdata"])]),_:1})]),_:1}),t(L,{span:8,class:$e(a.activeKey=="3"?"marR20":"")},{default:s(()=>[t(U,{name:"timeOfGraduation",style:{width:"100%"},label:"毕业时间"},{default:s(()=>[t(ke,{placeholder:"请选择毕业时间",style:{width:"100%"},value:a.user.timeOfGraduation,"onUpdate:value":n[5]||(n[5]=v=>a.user.timeOfGraduation=v),valueFormat:"YYYYMMDD"},null,8,["value"])]),_:1})]),_:1},8,["class"]),te(t(L,{span:8},{default:s(()=>[t(U,{name:"signFlowStatusText",label:"签约状态"},{default:s(()=>[t(Y,{dictCode:"college_sign_flow_status",ptitle:"请选择签约状态",showSearch:!1,outputdisabled:a.outputdisabled,onCheckedisForm:n[6]||(n[6]=v=>R(v,"qy")),paramdata:a.user.signFlowStatusText},null,8,["outputdisabled","paramdata"])]),_:1})]),_:1},512),[[ae,a.activeKey=="1"||a.activeKey=="2"]]),te(t(L,{span:8},{default:s(()=>[t(U,{name:"cancelDetailStatusText",label:"解约状态"},{default:s(()=>[t(Y,{dictCode:"college_wq_cancellation_state",ptitle:"请选择解约状态",showSearch:!1,outputdisabled:a.outputdisabled,onCheckedisForm:n[7]||(n[7]=v=>R(v,"jy")),paramdata:a.user.cancelDetailStatusText},null,8,["outputdisabled","paramdata"])]),_:1})]),_:1},512),[[ae,a.activeKey=="4"]]),t(L,{lg:6},{default:s(()=>[t(re,{class:"marginleft",type:"primary",preIcon:"ant-design:search-outlined",onClick:j},{default:s(()=>[I("查询")]),_:1}),t(re,{preIcon:"ant-design:reload-outlined",onClick:_,style:{"margin-left":"8px"}},{default:s(()=>[I("重置")]),_:1})]),_:1})]),_:1})]),_:1},8,["model","wrapper-col"]),e("div",Oa,[t(Ce,{bordered:"",class:"marT20",dataSource:S.value,columns:a.tabList[a.activeKey-1].columu,onChange:K,pagination:a.pagination,scroll:{x:"max-content"},size:"middle","row-selection":g.value,"row-key":v=>v.id},{title:s(()=>[a.activeKey==1?(y(),B(re,{key:0,type:"primary",class:"radius5",onClick:n[8]||(n[8]=v=>J(null,1)),style:{margin:"0 10px 0 0"}},{default:s(()=>[I("批量接受")]),_:1})):N("",!0),a.activeKey==1?(y(),B(re,{key:1,type:"primary",class:"radius5",onClick:n[9]||(n[9]=v=>J(null,0)),style:{margin:"0 10px 0 0"}},{default:s(()=>[I("批量拒绝")]),_:1})):N("",!0)]),bodyCell:s(({column:v,text:Te,record:O})=>[v.key==="operation"?(y(),D(V,{key:0},[a.activeKey==1||a.activeKey==4?(y(),D(V,{key:0},[O.signFlowStatus==1?(y(),D("span",{key:0,class:"u-b marR10 pointer",onClick:W=>J(O,1)},"接受",8,ja)):N("",!0),O.signFlowStatus==1?(y(),D("span",{key:1,class:"u-b marR10 pointer",onClick:W=>J(O,0)},"拒绝",8,za)):N("",!0),O.signFlowStatus!=1?(y(),D("span",Pa,"--")):N("",!0)],64)):N("",!0),a.activeKey==2&&O.checkStatus=="10"?(y(),D(V,{key:1},[e("span",{class:"u-b marR10 pointer",onClick:W=>ie(O)},"打印就业协议合同",8,Ra),O.signFlowStatus==30?(y(),D("span",{key:0,class:"u-b marR10 pointer",onClick:W=>G(O)},"解约",8,La)):N("",!0),O.signFlowStatus==31&&O.signFlowStatusText=="已申请解约待单位确认"?(y(),D(V,{key:1},[e("span",{class:"u-b marR10 pointer",onClick:W=>se(O,1)},"接受",8,Ma),e("span",{class:"u-b marR10 pointer",onClick:W=>se(O,0)},"拒绝",8,Ua)],64)):N("",!0)],64)):N("",!0)],64)):N("",!0),v.key==="realName"?(y(),D("span",{key:1,class:"u-b pointer",onClick:W=>de(O)},h(O.realName),9,qa)):N("",!0)]),default:s(()=>[e("span",$a,h((o.Page.current-1)*o.Page.pageSize+parseInt(o.index)+1),1)]),_:1},8,["dataSource","columns","pagination","row-selection","row-key"])])]),i.show?(y(),B(it,{key:0,visible:i.show,title:"查看详情",data:i.data,onOkClick:u,onCancelClick:C},null,8,["visible","data"])):N("",!0),r.show?(y(),B(_t,{key:1,title:"申请",visible:r.show,onOkclicks:F,onCancelClicks:F},null,8,["visible"])):N("",!0),r.show2?(y(),B(vt,{key:2,title:r.title2,visible:r.show2,data:r.data2,onOkclicks:ee,onCancelClicks:ue},null,8,["title","visible","data"])):N("",!0),r.show3?(y(),B(Da,{key:3,onOkclicks:o.okclickApply3,onCancelClicks:ne,visible:r.show3,data:r.data3,title:"就业协议合同"},null,8,["onOkclicks","visible","data"])):N("",!0)],64)}}});const Va=Q(Ba,[["__scopeId","data-v-b3b040d2"]]);export{Va as default};
