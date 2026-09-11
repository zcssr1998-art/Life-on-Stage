window.LIFE=window.LIFE||{};
(()=>{
  const L=window.LIFE;
  const pushUnique=(arr,items,key='id')=>{for(const x of items){if(!arr.some(y=>y?.[key]===x?.[key]))arr.push(x)}};
  const pushTupleUnique=(arr,items,index=0)=>{for(const x of items){if(!arr.some(y=>y?.[index]===x?.[index]))arr.push(x)}};

  // Trait rarity and result rarity are intentionally separate systems.
  // Traits stop at SSS/Mythic. "Prismatic/彩色" belongs only to rolled event results.
  L.RARITY={
    B:{name:'普通',weight:4.4,rank:1},
    A:{name:'稀有',weight:4.0,rank:2},
    S:{name:'史诗',weight:2.0,rank:3},
    SS:{name:'传说',weight:1.15,rank:4},
    SSS:{name:'神话',weight:.52,rank:5}
  };
  for(const t of (L.TRAITS||[])){if(t.rarity==='P'||t.rarity==='prismatic'||t.rarity==='彩色')t.rarity='SSS';}

  pushUnique(L.WORLDS,L.WORLDS?[
    {id:'automation',name:'🦾 自动化跃迁时代',desc:'重复劳动快速被机器接管，懂得组织工具的人获得巨大杠杆。',wealthMul:1.02,careerMul:1.03},
    {id:'green',name:'🌱 能源转型时代',desc:'电力、储能、材料与基础设施进入长周期重建。',wealthMul:1.01,careerMul:1.02},
    {id:'aging',name:'🧓 深度老龄化时代',desc:'照护、医疗和养老金成为家庭与社会长期主题。',wealthMul:.99,careerMul:.98},
    {id:'deglobal',name:'🧭 供应链重构时代',desc:'迁移、制造、物流与地缘变化持续改写职业机会。',wealthMul:1,careerMul:1},
    {id:'creator',name:'🎬 个体创作繁荣时代',desc:'个人品牌、内容与小团队产品拥有前所未有的分发能力。',wealthMul:1.01,careerMul:1.01},
    {id:'abundance',name:'⚡ 低成本智能时代',desc:'知识和软件价格持续下行，真正稀缺的是判断、信任与现实执行。',wealthMul:1.04,careerMul:1.04}
  ]:[], 'id');

  pushTupleUnique(L.BACKGROUNDS,[
    ['隔代抚养家庭',44,64,'隔代亲情'],['双职工忙碌家庭',62,55,'独立成长'],['科研院所家庭',66,74,'知识环境'],['餐饮小店家庭',50,57,'生意现场'],
    ['物流司机家庭',40,53,'流动生活'],['建筑从业家庭',47,58,'务实'],['体育家庭',54,65,'运动环境'],['音乐从业家庭',46,63,'艺术耳濡'],
    ['互联网从业家庭',68,61,'数字原住'],['金融从业家庭',76,58,'市场耳濡'],['多子女家庭',39,66,'手足共同体'],['重组家庭',48,43,'关系重建'],
    ['海外回流家庭',79,67,'跨文化'],['社区小店家庭',45,70,'熟人社会'],['农业经营家庭',43,61,'土地经验'],['自由职业家庭',57,59,'非标准人生']
  ]);

  pushTupleUnique(L.PERSONALITIES,[
    ['慢热型',{stability:8,social:-5,discipline:4}],['辩证怀疑者',{intelligence:9,stability:5,happiness:-3}],['探索型',{luck:4,risk:8,intelligence:5}],['秩序维护者',{discipline:9,stability:8,risk:-5}],
    ['关系导向',{social:8,family:10,ambition:-3}],['结果导向',{ambition:10,discipline:7,happiness:-4}],['体验派',{happiness:9,risk:5,stability:-3}],['边界感强',{stability:8,family:-2,social:4}],
    ['高开放度',{intelligence:7,happiness:5,risk:5}],['低调务实',{stability:10,social:-3,discipline:6}],['舞台型',{social:11,ambition:6,stability:-3}],['问题解决型',{intelligence:8,discipline:8,happiness:-2}],
    ['守护者',{family:11,health:4,risk:-4}],['反骨',{ambition:8,risk:9,family:-6}]
  ]);

  pushTupleUnique(L.TALENTS,[
    ['因果推理',{intelligence:10,stability:4}],['空间导航',{intelligence:6,luck:4}],['机械手感',{intelligence:6,discipline:7}],['即兴表达',{social:9,happiness:4}],
    ['长跑耐力',{health:10,discipline:5}],['节奏感',{happiness:6,intelligence:4}],['观察细节',{intelligence:8,stability:4}],['组织协调',{social:7,discipline:7}],
    ['情绪恢复快',{happiness:8,stability:7}],['价格敏感',{stability:8,intelligence:4}],['方向感',{luck:5,intelligence:5}],['临场反应',{risk:4,stability:6,luck:4}],
    ['教学能力',{social:6,intelligence:6,family:3}],['产品直觉',{ambition:7,intelligence:7}],['数据直觉',{intelligence:10,discipline:3}],['照护天赋',{family:9,social:5}],
    ['材料感觉',{intelligence:5,discipline:8}],['模仿学习',{intelligence:7,social:5}],['危机冷静',{stability:10,luck:3}],['审题能力',{intelligence:8,discipline:5}]
  ]);

  pushTupleUnique(L.FLAWS,[
    ['选择困难',{stability:-6,discipline:-5}],['注意力碎片化',{discipline:-9,intelligence:3}],['不敢求助',{social:-7,stability:-3}],['边界模糊',{family:-5,social:4,happiness:-4}],
    ['报复性熬夜',{health:-7,discipline:-6}],['信息焦虑',{happiness:-7,intelligence:3}],['过度规划',{risk:-7,discipline:5,happiness:-4}],['冲突回避',{social:-4,family:-6,stability:3}],
    ['赌徒谬误',{risk:10,stability:-7}],['消费攀比',{stability:-8,social:4}],['不爱运动',{health:-8,happiness:2}],['粗心',{discipline:-6,luck:-3}],
    ['权威依赖',{ambition:-6,stability:5}],['好为人师',{social:-4,intelligence:3}],['情绪憋着',{happiness:-7,family:-4,stability:3}],['开局很猛',{ambition:6,discipline:-8}],
    ['害怕变化',{risk:-9,stability:7,ambition:-4}],['承诺过量',{social:5,discipline:-5,happiness:-5}],['价格锚定',{stability:-4,risk:5}],['不会拒绝',{social:5,family:-5,discipline:-4}]
  ]);

  pushTupleUnique(L.ZHOU_CHOICES,[
    ['画笔','🖌️',['审美天赋','镜头感','表达欲'],{happiness:5,intelligence:4,social:2}],
    ['积木','🧱',['工程脑','空间想象','学习机器'],{intelligence:6,discipline:4}],
    ['听诊器玩具','🩺',['情绪韧性','家族核心','长寿基因'],{health:5,family:4,discipline:2}],
    ['小鼓','🥁',['音乐耳朵','镜头感','语言天赋'],{happiness:6,social:4}],
    ['地图','🗺️',['好奇心','赛道猎手','风险雷达'],{intelligence:4,luck:4,risk:2}],
    ['算盘','🧮',['现金流意识','复利本能','预算习惯'],{stability:5,intelligence:4}],
    ['拼图','🧩',['学习机器','工程脑','复盘习惯'],{intelligence:6,stability:3}],
    ['小铲子','🪴',['运动天赋','家族核心','勤能补拙'],{health:4,discipline:4,family:2}],
    ['相机','📷',['审美天赋','镜头感','社交天线'],{social:4,happiness:4,intelligence:2}],
    ['钥匙串','🔑',['赛道猎手','危机嗅觉','执行力'],{luck:4,ambition:4,stability:2}]
  ]);

  // 20 thematic packs x 10 traits = 200 additional traits.
  const raritySeq=['B','B','A','A','A','S','S','S','SS','SSS'];
  const mag={B:3,A:6,S:9,SS:12,SSS:16};
  const templates=[
    (n,d)=>`${n}让你在${d}时更愿意先看结构再行动；优势不显眼，但会在多年后累积。`,
    (n,d)=>`面对${d}，你有一套和多数人不同的默认反应。${n}偶尔也会让你显得过分认真。`,
    (n,d)=>`${n}不是一次性的好运，它会反复改变你处理${d}的方式。`,
    (n,d)=>`你对${d}中的细微信号格外敏感。${n}会让一些原本普通的选择出现第二层含义。`,
    (n,d)=>`别人靠意志力处理${d}，你更像是在调用一种习惯。${n}因此越到后期越值钱。`,
    (n,d)=>`${n}使你在${d}遇到混乱时更快找到可执行的一步，但并不保证结果一定正确。`,
    (n,d)=>`长期经历把${d}压缩成了直觉。${n}的价值通常只有在关键节点才会突然显现。`,
    (n,d)=>`你愿意为${d}付出别人嫌麻烦的准备成本。${n}提高上限，也提高了自我要求。`,
    (n,d)=>`${n}会把${d}中的偶然变得更可管理。真正的收益来自连续几年不犯同一种错。`,
    (n,d)=>`这是接近规则级的倾向：${n}会持续改写你在${d}上的概率，而不是只加一次属性。`
  ];
  const packs=[
    ['reason','mind','复杂判断','intelligence','stability','success',['因果拆解','反事实推演','约束扫描','证据洁癖','概率脑','二阶思考','系统视角','决策树本能','模型校准','认知压缩']],
    ['learn','mind','学习新东西','intelligence','discipline','success',['学习脚手架','迁移学习','错题猎人','概念编织','间隔记忆','教学相长','难题耐力','知识索引','元认知','自学引擎']],
    ['tech','career','技术与工具','intelligence','discipline','income',['自动化嗅觉','接口直觉','调试猎犬','数据洁癖','原型闪电','工具链思维','架构洁癖','人机协同','算法审美','技术预判']],
    ['craft','creative','手艺与实体世界','discipline','intelligence','success',['手感记忆','尺寸直觉','材料耳朵','维修本能','工艺耐心','精度强迫','现场解题','手作沉浸','器物理解','匠人节奏']],
    ['creative','creative','创作与审美','happiness','intelligence','rare',['画面叙事','风格雷达','灵感收集癖','留白意识','形式破坏者','情绪配色','叙事节奏','观众直觉','跨媒介脑','美学执念']],
    ['talk','social','表达与协商','social','stability','success',['重点提炼','提问术','冲突翻译','公开表达','冷场救援','叙事说服','边界表达','倾听回路','谈判留白','共识建模']],
    ['lead','career','组织与领导','ambition','social','income',['授权本能','决断窗口','组织记忆','责任兜底','人才识别','冲突裁决','目标对齐','节奏管理','危机指挥','组织设计']],
    ['network','social','人际网络','social','luck','spouse',['弱连接经营','圈层穿梭','人情记账','社交电量管理','信任复利','贵人识别','场合感','关系止损','合作体质','社会资本']],
    ['home','family','家庭与亲密关系','family','stability','spouse',['家庭仪式感','照护耐心','代际翻译','情绪收纳','家务公平感','亲密边界','家庭预算共识','冲突修复','共同记忆','家庭长期主义']],
    ['resilience','body','压力和失败','stability','happiness','badGuard',['失败耐受','重启按钮','压力分层','坏消息消化','低谷耐心','现实接受力','挫折免疫','恢复节奏','韧性储备','逆境学习']],
    ['health','body','身体维护','health','discipline','death',['身体信号敏感','作息护城河','饮食节律','体检意识','疼痛边界','恢复优先','预防思维','呼吸节奏','代谢自觉','长线养护']],
    ['sport','body','运动与体能','health','stability','recovery',['平衡感','耐力底盘','爆发控制','动作学习','户外适应','竞技专注','受伤预防','身体协调','训练周期感','运动寿命观']],
    ['finance','wealth','个人财务','stability','discipline','wealthOutcome',['现金缓冲垫','负债厌恶','资产负债表脑','价格敏感','费用猎人','仓位直觉','收益风险对称','复利耐心','现金流分层','资本纪律']],
    ['startup','career','创业和产品','ambition','intelligence','income',['需求嗅觉','小步试错','客户访谈狂','单位经济脑','交付洁癖','现金流警铃','渠道雷达','产品化倾向','商业闭环','创业者耐力']],
    ['risk','risk','不确定性与下注','stability','risk','badGuard',['尾部风险意识','安全边际','概率下注','风险预算','灰犀牛雷达','黑天鹅敬畏','止损肌肉','情景压力测试','不确定性耐受','风险哲学']],
    ['discipline','career','长期执行','discipline','ambition','success',['启动仪式','时间块','任务切片','截止线自觉','深工窗口','无聊耐受','习惯堆叠','反拖延触发器','长周期执行','自我契约']],
    ['fortune','fortune','时机和偶然','luck','stability','rare',['顺风感知','时机直觉','偶遇体质','小概率收藏家','关键一球','机会窗口','命运缝隙','好事连锁','错峰人生','幸运管理学']],
    ['culture','creative','文化与世界观','intelligence','happiness','rare',['阅读地图','博物馆体质','历史纵深感','方言耳朵','文化切换','经典耐心','亚文化雷达','传统手艺亲和','世界观采样','时代语感']],
    ['care','family','照护与同理','family','social','badGuard',['情绪接住力','照护本能','非暴力沟通','体面意识','弱者视角','同理边界','服务意识','陪伴耐力','关系修补针','温柔坚定']],
    ['adapt','fortune','变化与迁移','stability','luck','comeback',['迁徙适应','新规则学习','角色切换','环境扫描','不确定开局','临场编排','资源再组合','身份重构','跨行业迁移','变局生存者']]
  ];
  const existingIds=new Set((L.TRAITS||[]).map(x=>x.id));
  for(const [pid,set,domain,p,q,modKey,names] of packs){
    names.forEach((name,i)=>{
      const id=`v81_${pid}_${String(i+1).padStart(2,'0')}`;if(existingIds.has(id))return;
      const rarity=raritySeq[i],m=mag[rarity],effects={[p]:m,[q]:Math.max(2,Math.round(m*.45))};
      if(i===0||i===3)effects[p]=Math.max(2,m-1);
      if(i===1&&set==='risk')effects.stability=(effects.stability||0)-3;
      const mods={};const rank=L.RARITY[rarity].rank;
      if(rank>=3){const v=rank===3?.04:rank===4?.08:.14;if(modKey==='death')mods.death=1-v;else mods[modKey]=v;}
      const sets=[set];if(pid==='startup')sets.push('wealth');if(pid==='adapt')sets.push('career');if(pid==='culture')sets.push('mind');if(pid==='care')sets.push('social');
      L.TRAITS.push({id,name,rarity,desc:templates[i](name,domain),effects,sets,mods});existingIds.add(id);
    });
  }

  // 50 additional genuinely different career ladders; this doubles the V7 career taxonomy.
  const careerRows=[
    ['ai_safety','🛡️','科技',15000,'AI安全研究助理|AI安全工程师|高级AI安全工程师|AI安全负责人|AI治理合伙人'],
    ['robotics','🤖','工程',13000,'机器人工程助理|机器人工程师|高级机器人工程师|机器人架构师|机器人事业负责人'],
    ['chip_design','🧠','工程',16000,'芯片验证助理|芯片设计工程师|高级芯片设计师|芯片架构师|芯片研发负责人'],
    ['cybersecurity','🔐','科技',14500,'安全运营助理|网络安全工程师|高级安全专家|安全架构师|首席安全负责人'],
    ['data_engineering','🗄️','科技',14500,'数据开发助理|数据工程师|高级数据工程师|数据平台架构师|数据基础设施负责人'],
    ['cloud_platform','☁️','科技',15000,'云平台助理|云平台工程师|高级平台工程师|平台架构师|基础设施负责人'],
    ['battery','🔋','制造',12000,'电池测试员|电池工程师|高级电池工程师|储能技术专家|储能研发负责人'],
    ['renewable','🌞','工程',11500,'新能源项目助理|新能源工程师|高级项目工程师|能源系统专家|能源事业负责人'],
    ['power_grid','⚡','工程',12000,'电力运维助理|电力工程师|高级电力工程师|电网规划专家|电力系统负责人'],
    ['aerospace','🚀','工程',14000,'航天技术助理|航天工程师|高级航天工程师|系统总体专家|航天项目总师'],
    ['marine','⚓','工程',10500,'海洋工程助理|海洋工程师|高级海工工程师|海洋系统专家|海工项目负责人'],
    ['logistics','🚚','交通',9500,'物流调度员|物流规划师|高级供应链规划师|区域物流负责人|供应链网络负责人'],
    ['supply_chain','📦','商业',11500,'供应链专员|供应链经理|高级供应链经理|供应链总监|全球供应链负责人'],
    ['veterinary','🐾','医疗',11000,'兽医助理|执业兽医|高级兽医|专科兽医|动物医院负责人'],
    ['psychology','🧩','医疗',10500,'心理服务助理|心理咨询师|资深咨询师|督导师|心理服务机构负责人'],
    ['physiotherapy','🦵','医疗',9500,'康复治疗助理|康复治疗师|高级康复治疗师|康复主管|康复中心负责人'],
    ['dentistry','🦷','医疗',13000,'口腔助理|口腔医生|高级口腔医生|专科口腔医生|口腔机构负责人'],
    ['clinical_research','🧪','科研',12500,'临床研究助理|临床研究员|高级临床研究员|项目负责人|临床研发负责人'],
    ['biotech','🧬','科研',13000,'生物实验助理|生物技术研究员|高级研究员|研发科学家|生物研发负责人'],
    ['public_health','🏥','公共',10000,'公共卫生专员|公共卫生项目官|高级项目官|公共卫生主管|公共卫生项目负责人'],
    ['product_design','📱','科技',13500,'产品助理|产品设计师|高级产品设计师|产品负责人|产品事业负责人'],
    ['game_design','🎮','游戏',11500,'关卡策划助理|游戏设计师|高级游戏设计师|主设计师|游戏创意总监'],
    ['technical_art','🧙','游戏',13500,'技术美术助理|技术美术|高级技术美术|TA负责人|技术美术总监'],
    ['vfx','💥','创意',11000,'特效助理|视觉特效师|高级特效师|VFX主管|视觉特效总监'],
    ['animation','🎞️','创意',10500,'动画助理|动画师|高级动画师|动画主管|动画导演'],
    ['industrial_design','🪑','创意',10500,'工业设计助理|工业设计师|高级工业设计师|设计主管|工业设计总监'],
    ['architecture','🏛️','工程',10500,'建筑助理|建筑设计师|高级建筑师|项目建筑师|设计院合伙人'],
    ['urban_planning','🏙️','公共',10000,'规划助理|城市规划师|高级规划师|规划项目负责人|城市规划总监'],
    ['compliance','📋','法律',11000,'合规专员|合规经理|高级合规经理|合规总监|首席合规官'],
    ['audit','🔎','金融',10000,'审计助理|审计师|高级审计师|审计经理|审计合伙人'],
    ['asset_management','📈','金融',15000,'投研助理|资产管理经理|高级投资经理|投资总监|资产管理合伙人'],
    ['actuary','🧮','金融',14000,'精算助理|精算师|高级精算师|精算负责人|首席精算师'],
    ['quant','📊','金融',17000,'量化研究助理|量化研究员|高级量化研究员|量化策略负责人|量化投资合伙人'],
    ['ecommerce','🛒','商业',10000,'电商运营助理|电商运营|高级运营|电商负责人|品牌电商总经理'],
    ['hospitality','🏨','商业',8500,'酒店运营助理|酒店运营经理|高级运营经理|酒店总经理|酒店集团区域负责人'],
    ['culinary','👨‍🍳','创意',8000,'厨房学徒|厨师|主厨|行政总厨|餐饮品牌主理人'],
    ['vocational_edu','🛠️','公共',8500,'职教助教|职业教育教师|骨干教师|专业负责人|职业教育院系负责人'],
    ['translation','🌐','传媒',9000,'翻译助理|专业译员|高级译员|语言项目经理|语言服务负责人'],
    ['journalism','📰','传媒',9000,'记者助理|记者|资深记者|编辑部主任|总编辑'],
    ['publishing','📚','传媒',8500,'编辑助理|图书编辑|资深编辑|出版策划负责人|出版品牌主编'],
    ['music_production','🎚️','演艺',9000,'录音助理|音乐制作人|高级制作人|制作总监|音乐厂牌主理人'],
    ['film_directing','🎬','演艺',9000,'片场助理|副导演|导演|资深导演|制片导演合伙人'],
    ['live_production','🎪','演艺',8500,'演出执行|舞台制作经理|高级制作经理|演出制作总监|现场娱乐负责人'],
    ['nonprofit','🤝','公共',8000,'公益项目助理|公益项目官|高级项目官|项目总监|公益机构负责人'],
    ['diplomacy','🕊️','公共',11000,'外事助理|外事官员|高级外事官|事务负责人|国际事务主管'],
    ['emergency_mgmt','🚨','公共',9500,'应急管理专员|应急管理师|高级应急专家|应急指挥负责人|城市应急主管'],
    ['environmental','🌿','科研',10000,'环境监测助理|环境工程师|高级环境工程师|环境项目专家|可持续发展负责人'],
    ['agritech','🌾','科技',10000,'农业技术助理|农业科技工程师|高级农业工程师|农业技术专家|农业科技负责人'],
    ['geology','🪨','科研',10500,'地质助理|地质工程师|高级地质工程师|地质专家|勘探技术负责人'],
    ['meteorology','🌦️','科研',10500,'气象观测员|气象工程师|高级气象工程师|气象专家|气候服务负责人']
  ];
  const careerExtra=careerRows.map(([id,icon,group,base,titles])=>({id,icon,group,titles:String(titles).split('|'),salaries:[1,1.55,2.25,3.2,4.8].map(m=>Math.round(Number(base)*m/500)*500),tags:[group]}));
  pushUnique(L.CAREER_ROUTES,careerExtra,'id');

  L.MICRO_STORIES=L.MICRO_STORIES||[];
  const micros=[
    [2,3,'🧸 你把最喜欢的玩具藏进被子里','大人找了很久，最后发现你只是想确保醒来还能看见它。','neutral',{family:1,happiness:2}],
    [2,3,'🥣 今天你坚决拒绝一种食物','一顿饭变成了小型谈判。你第一次用行动表达“我不要”。','neutral',{stability:1}],
    [2,3,'👣 你摔了一跤又自己站起来','哭声来得快，停得也快。身体开始理解跌倒不是世界末日。','good',{health:2,stability:1}],
    [4,6,'🖍️ 一张画被贴到了冰箱上','画本身很难辨认，但有人认真问你画的是什么。','good',{happiness:2,family:1}],
    [4,6,'🧩 你执着地把同一块拼图试了十几次','最终拼上时没有掌声，你却高兴了很久。','good',{discipline:2,intelligence:1}],
    [4,6,'🛝 你在滑梯前排队时学会了一点规则','不是因为突然懂事，而是插队真的会被所有人盯着。','neutral',{social:1,stability:1}],
    [7,9,'✏️ 一支新铅笔让你莫名认真了一下午','小东西有时候真的会改变做事的心情。','good',{discipline:1,happiness:1}],
    [7,9,'🎒 你第一次忘带作业','尴尬比处罚更有效，你第二天检查了三遍书包。','bad',{discipline:2,happiness:-1}],
    [7,9,'🌧️ 放学的大雨让全班挤在屋檐下','大家平时分成的小圈子暂时失效了十分钟。','neutral',{social:1}],
    [10,12,'🎮 一局游戏拖过了约定的睡觉时间','第二天的困意比任何说教都更具体。','bad',{discipline:-1,health:-1,happiness:1}],
    [10,12,'📚 你偶然读完一本本来没打算看的书','里面一个观点在之后几年里时不时回来。','good',{intelligence:2}],
    [10,12,'🤐 一个同学把秘密告诉了你','你第一次发现“知道”本身也是一种责任。','neutral',{social:1,stability:1}],
    [13,15,'📱 你删掉了一条写了很久的动态','你突然不确定自己是想表达，还是想被看见。','neutral',{intelligence:1,stability:1}],
    [13,15,'🎧 一首歌被你循环了整个星期','多年以后再听到前奏，你仍会瞬间回到这一年。','good',{happiness:2}],
    [13,15,'🏃 体育课上一次意外的好成绩让你改观','你第一次意识到身体也可以通过练习变得可靠。','good',{health:2,ambition:1}],
    [16,18,'📝 你把一个错题重新做对了','真正让人上瘾的不是分数，而是突然看懂之前不会的东西。','good',{intelligence:1,discipline:1}],
    [16,18,'🌙 一次深夜聊天持续到凌晨','第二天很困，但那次谈话后来成了你记得最久的青春片段之一。','neutral',{social:2,health:-1}],
    [16,18,'🚌 你独自坐了一趟很远的公交','城市第一次不只是家和学校之间的几条路。','good',{luck:1,intelligence:1}],
    [19,22,'🍜 宿舍里有人煮了一锅很难吃的东西','所有人一边嫌弃一边吃完，友谊有时就是这么建立的。','good',{social:2,happiness:1}],
    [19,22,'📄 一封拒信比预想中来得更快','你难受了一晚，第二天还是继续投了下一份。','neutral',{stability:2,happiness:-1}],
    [19,22,'💻 你第一次把课堂知识解决了现实问题','那一刻“学这个有什么用”终于有了答案。','good',{intelligence:2,ambition:1}],
    [23,29,'🧾 工资到账后你第一次认真看税后数字','成年人的钱总有一部分在到手前就已经有主人了。','neutral',{stability:1}],
    [23,29,'🚇 通勤路上你突然认出了每天同车的人','你们从没说过话，却已经共享了几个月的早晨。','neutral',{social:1}],
    [23,29,'🛒 你买了一个最终几乎没用的东西','购物车里的“需要”和现实里的“需要”并不总是一回事。','bad',{stability:-1,happiness:1}],
    [30,39,'📅 你发现要见老朋友居然需要提前一个月约','没人真的消失，只是每个人的日历都变厚了。','neutral',{social:-1,family:1}],
    [30,39,'🩺 体检报告第一次出现了需要复查的箭头','它最后不严重，但你开始认真看身体给出的长期数据。','neutral',{health:1,discipline:1}],
    [30,39,'🔧 家里一个小故障被你自己解决','省下的钱不多，掌控感却意外地值钱。','good',{discipline:1,stability:1}],
    [40,49,'📦 你整理旧物时翻出二十年前的票根','当年的大事如今只占一个抽屉的小角落。','neutral',{happiness:1,stability:1}],
    [40,49,'🪑 久坐终于开始收利息','一次普通腰酸提醒你，身体会记录那些你以为可以忽略的习惯。','bad',{health:-1,discipline:1}],
    [40,49,'☎️ 一个多年没联系的人突然打来电话','寒暄很短，但你意识到有些关系只是沉睡，不是消失。','good',{social:1,happiness:1}],
    [50,59,'📷 一张旧合照里有人已经很久没见','你开始主动给几个名字发消息。','neutral',{family:1,social:1}],
    [50,59,'🚶 你发现散步开始比熬夜聚会更舒服','喜好不是衰退，它只是换了成本函数。','good',{health:1,happiness:1}],
    [50,59,'🔐 你认真整理了一次账户和重要文件','年轻时觉得晦气的准备，现在更像一种负责。','neutral',{stability:2}],
    [60,69,'🌅 早晨突然变成了一天里最好用的时间','没有通勤催促以后，你重新认识了熟悉的社区。','good',{happiness:2}],
    [60,69,'📱 你学会了一个年轻人觉得理所当然的新功能','过程有点烦，但学会以后你还是忍不住多试了几次。','good',{intelligence:1,stability:1}],
    [60,69,'🪴 一盆植物活过了整个冬天','你开始理解慢事情的乐趣。','good',{happiness:2,discipline:1}],
    [70,84,'🧑‍🤝‍🧑 公园里固定的几张面孔少了一张','没人正式宣布什么，但大家都知道原因。','bad',{happiness:-1,stability:1}],
    [70,84,'🧠 一个名字在嘴边卡了很久','最后还是想起来了。你笑了一下，也有一点不安。','neutral',{stability:1}],
    [70,84,'📖 晚辈认真听你讲了一次旧事','同一个故事讲给不同年代的人，重点会自然改变。','good',{family:2,happiness:1}],
    [85,120,'🕰️ 一天过得很慢，一年却过得很快','时间的尺度在晚年变成一种奇怪的东西。','neutral',{stability:1}],
    [85,120,'🎂 生日蛋糕上的数字让所有人先拍照','你真正关心的是桌上还有哪些熟悉的声音。','good',{family:2,happiness:1}],
    [85,120,'📜 你补写了一个一直没讲清楚的家庭故事','不是为了伟大，只是不想让它在你这里断掉。','good',{family:2,intelligence:1}]
  ];
  for(const [min,max,title,text,tone,effects] of micros){if(!L.MICRO_STORIES.some(x=>x.title===title))L.MICRO_STORIES.push({min,max,title,text,tone,effects});}
})();
