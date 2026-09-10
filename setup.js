const $ = s=>document.querySelector(s);
const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const moneyFmt=n=>{const sign=n<0?'-':'';n=Math.abs(n);return sign+(n>=100000000?'¥'+(n/100000000).toFixed(2)+'亿':n>=10000?'¥'+(n/10000).toFixed(1)+'万':'¥'+Math.round(n))};
function rng(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let r=Math.imul(t^t>>>15,1|t);r^=r+Math.imul(r^r>>>7,61|r);return((r^r>>>14)>>>0)/4294967296}}
let R=Math.random;
const pick=a=>a[Math.floor(R()*a.length)];
const chance=p=>R()<clamp(p,0,1);
const weighted=items=>{let sum=items.reduce((s,x)=>s+x[1],0),r=R()*sum;for(const[v,w]of items){r-=w;if(r<=0)return v}return items[items.length-1][0]};
const origins=['农村务农家庭','县城普通家庭','三线城市工薪家庭','沿海小城个体户家庭','省会中产家庭','一线城市普通家庭','富裕经商家庭','知识分子家庭','单亲家庭','体制内家庭','制造业家庭','小企业主家庭','高知技术家庭','跨城务工家庭','资源型家庭','负债经营家庭'];
const talents=['记忆力强','商业嗅觉','审美出众','情绪稳定','身体协调','语言天赋','技术直觉','社交高手','极强执行力','逆风耐受','数学直觉','空间想象','学习速度快','领导欲强','共情能力','写作天赋','机械直觉','音乐天赋','强专注力','信息敏感'];
const flaws=['冲动','拖延','好胜','敏感','厌恶风险','过度冒险','讨好型','消费欲强','睡眠差','三分钟热度','完美主义','社交回避','容易焦虑','控制欲强','缺乏耐心','容易轻信','固执','懒散','情绪化','工作成瘾'];
const personalities=['现实主义者','野心家','享乐主义者','探索者','稳定派','机会主义者','长期主义者','理想主义者','独行者','家庭主义者','竞争型人格','自由主义者','谨慎规划者','逆向思考者'];
const cities=['赣州','长沙','深圳','无锡','成都','重庆','杭州','武汉','广州','苏州','南昌','上海','北京','南京','厦门','西安','合肥','郑州','青岛','昆明'];
const jobs=['普通职员','设计师','程序员','销售','公务员','教师','个体户','自媒体','产品经理','金融从业者','技工','医生','律师','工程师','运营','供应链','研究员','摄影师','电商从业者','游戏开发者'];
const worlds=[
 {name:'科技跃迁时代',desc:'技术替代快，但新职业和暴富窗口更多。',income:1.06,market:.02,startup:.06,layoff:.05},
 {name:'低增长时代',desc:'机会变少，稳定性变得更值钱。',income:.98,market:-.01,startup:-.03,layoff:.06},
 {name:'资产繁荣时代',desc:'房产和资本市场长期偏强，但泡沫也更大。',income:1.02,market:.04,startup:.02,layoff:0},
 {name:'高波动时代',desc:'危机与机会一起变多，人生分化更极端。',income:1,market:0,startup:.02,layoff:.04},
 {name:'产业升级时代',desc:'技能型与技术型人才上升更快。',income:1.04,market:.01,startup:.03,layoff:.01},
 {name:'通胀挤压时代',desc:'工资追不上生活成本，持有资产的人更占优势。',income:1.01,market:.015,startup:0,layoff:.02}
];

const startEvents=[
 {id:'gifted',title:'你很早就显露出一种天赋',text:'老师和家人开始注意到你和同龄人的不同。',min:6,max:12,apply:s=>{s.int+=8;s.amb+=4;addTag(s,'早慧')}},
 {id:'move',title:'家庭搬家',text:'你被迫离开熟悉的环境，去了一个陌生城市。',min:5,max:17,apply:s=>{s.social-=5;s.luck+=3;addTag(s,'迁徙经历')}},
 {id:'bully',title:'你在学校被排挤了一阵',text:'这段经历没有立刻毁掉什么，但改变了你处理关系的方式。',min:7,max:16,apply:s=>{s.happy-=9;s.social-=5;s.amb+=5;addTag(s,'少年阴影')}},
 {id:'internet',title:'你很早接触到了互联网',text:'你发现世界远比身边的人描述得更大。',min:8,max:15,apply:s=>{s.int+=5;s.amb+=6;addTag(s,'互联网原住民')}},
 {id:'familyDebt',title:'家里突然背上了一笔债',text:'你第一次很具体地意识到钱会改变家庭气氛。',min:8,max:17,apply:s=>{s.family-=10;s.happy-=7;s.amb+=7;s.money-=5000;addTag(s,'少年负债记忆')}},
 {id:'mentor',title:'你遇到了一位很愿意教你的长辈',text:'他没有直接给你答案，但给了你更早看到世界运行方式的机会。',min:10,max:17,apply:s=>{s.int+=5;s.disc+=6;s.exp+=4;addTag(s,'少年导师')}},
 {id:'sports',title:'你长期坚持一项运动',text:'它没有让你成为运动员，却留下了一副更耐用的身体。',min:7,max:17,apply:s=>{s.health+=10;s.disc+=5;addTag(s,'运动习惯')}},
 {id:'parentConflict',title:'家庭关系经历了一段低谷',text:'大人之间的问题也会落到孩子身上。',min:6,max:16,apply:s=>{s.family-=15;s.happy-=8;s.stable-=5;addTag(s,'家庭裂痕')}}
];