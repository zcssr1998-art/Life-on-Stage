window.LIFE = window.LIFE || {};
(() => {
  const L = window.LIFE;
  L.VERSION = 'V3.0';
  L.STORAGE_KEY = 'life_on_stage_v3_save';
  L.DYNASTY_KEY = 'life_on_stage_v3_dynasty';

  L.ATTR = {
    health:{name:'健康',tip:'影响寿命、疾病、体能类选项。≥75可解锁高强度冒险；≤35更容易触发健康危机。'},
    happiness:{name:'幸福',tip:'影响心理恢复、关系类结局和部分隐藏事件。≥80更容易触发“知足常乐”；≤25会出现人生低谷事件。'},
    intelligence:{name:'智力',tip:'影响学习、研究、技术、谈判与复杂决策。≥80会出现高阶学习/技术路线；≥92可触发天才隐藏事件。'},
    social:{name:'社交',tip:'影响恋爱、贵人、谈判、销售与管理。≥70可解锁高级谈判；≥85会出现人脉型隐藏路线。'},
    luck:{name:'运气',tip:'不是纯装饰。它会轻微提高随机好结果权重，并参与稀有事件触发。≥85时部分小概率奇遇会进入事件池。'},
    ambition:{name:'野心',tip:'影响创业、晋升、跨阶层选择。≥70可解锁激进职业路线；≥90会出现“豪赌人生”类选项。'},
    stability:{name:'稳定',tip:'影响抗波动能力、家庭稳定和保守路线。高稳定会减少极端负面结果，但也会锁掉部分孤注一掷选项。'},
    discipline:{name:'自律',tip:'影响长期学习、健身、副业、创业执行和投资纪律。≥75会显著增加长期项目成功结果的权重。'},
    risk:{name:'风险偏好',tip:'影响你能否选择高风险行动。≥70开放重仓/裸辞/激进创业等选择；低风险偏好会开放更稳健的替代方案。'},
    family:{name:'家庭关系',tip:'影响父母、配偶、子女与继承事件。≤35且拥有“家庭裂痕”时，可能触发家庭分崩离析；≥75可触发家族凝聚路线。'}
  };

  L.TAG_DEFS = {
    '少年穷困':{kind:'state',tip:'成长状态：资源稀缺。会提高早期打工/自立类事件出现率，也可能强化野心。'},
    '家庭温暖':{kind:'state',tip:'成长状态：家庭支持较强。家庭关系事件更容易出现正面分支。'},
    '家庭裂痕':{kind:'hidden-tag',tip:'隐藏状态：家庭内部存在长期裂痕。家庭关系≤35时可触发“家宴崩塌”“亲属断联”等隐藏事件；修复到60以上后可能解除。'},
    '高学历':{kind:'state',tip:'教育状态：完成高等教育。解锁专业岗位、研究路线与部分高阶职业。'},
    '技能型':{kind:'state',tip:'职业标签：偏实操技能路线。会提高技术工、创作、自由职业事件权重。'},
    '上班族':{kind:'state',tip:'当前处于受雇职业路线，会进入晋升、跳槽、裁员、管理等事件池。'},
    '管理者':{kind:'state',tip:'职业状态：拥有管理职责。解锁组织政治、带团队、股权激励等事件。'},
    '创业者':{kind:'state',tip:'职业状态：正在或曾经创业。解锁融资、合伙、现金流危机、退出等事件。'},
    '创业成功':{kind:'achievement',tip:'成就：你已经把一次创业从想法跑成了结果。主要用于纪念与结局统计，不直接加属性。'},
    '创业失败':{kind:'state',tip:'经历状态：创业失败过。会解锁“二次创业”“债务重整”“失败复盘”等特殊事件。'},
    '副业跑通':{kind:'achievement',tip:'成就：副业天才。你证明了主业不是唯一现金流。这个标签本身不直接加属性，但会参与部分构筑组合。'},
    '投资者':{kind:'state',tip:'可选玩法状态：你主动进入了投资路线。只有拥有该标签后，市场周期、资产配置等事件才会出现。'},
    '风险纪律':{kind:'state',tip:'投资/决策状态：你形成了止损、仓位或风控习惯。会改善高波动选项的结果权重。'},
    '杠杆使用者':{kind:'state',tip:'高风险状态：你使用过杠杆。收益和损失都更极端，并可能触发追保/爆仓隐藏事件。'},
    '健身习惯':{kind:'state',tip:'生活状态：持续运动。每年提供少量健康恢复，并参与长寿构筑。'},
    '工作狂':{kind:'state',tip:'状态：长期过度投入工作。提高职业收益事件，但健康偏低时会触发反噬。'},
    '恋爱中':{kind:'state',tip:'关系状态：拥有伴侣。解锁同居、婚姻、冲突、共同成长等事件。'},
    '已婚':{kind:'state',tip:'关系状态：已婚。解锁家庭财务、子女、生育、婚姻危机、照护等事件。'},
    '已离婚':{kind:'state',tip:'关系经历：经历过离婚。会改变后续关系事件的权重与结局。'},
    '父母年迈':{kind:'state',tip:'家庭阶段：父母进入需要更多照护的阶段。会触发时间、金钱与家庭关系之间的取舍。'},
    '有房':{kind:'state',tip:'资产状态：拥有住房。解锁房贷、换房、社区、地产周期等事件。'},
    '负债':{kind:'state',tip:'财务状态：存在明显负债。财富为负或高杠杆时可能触发债务危机。'},
    '跨城迁移':{kind:'state',tip:'经历：主动迁移到另一城市。会改变职业、关系和生活方式事件池。'},
    '海外经历':{kind:'state',tip:'经历：有海外学习或工作经验。解锁跨国职业、回流、文化适应等事件。'},
    '内容创作者':{kind:'state',tip:'职业/副业状态：进行内容创作。解锁爆款、平台规则、商业化等事件。'},
    '技术专家':{kind:'state',tip:'职业构筑：技术能力达到高阶。解锁专家路线、技术创业与高薪机会。'},
    '谈判高手':{kind:'achievement',tip:'成就：你多次靠谈判而非运气改变结果。用于构筑与结局统计。'},
    '逆风翻盘':{kind:'achievement',tip:'成就：你曾从明显劣势中翻回正轨。主要用于纪念，并参与少数隐藏结局。'},
    '家族支柱':{kind:'state',tip:'家庭状态：你承担了家族中的主要责任。家庭事件更频繁，但也更容易获得家族凝聚结局。'},
    '财务自由':{kind:'achievement',tip:'成就：资产与现金流已经让你拥有较高选择权。部分职业事件会转为“想不想做”而非“必须做”。'},
    '长寿体质':{kind:'synergy',tip:'构筑：健康≥85 + 稳定≥70 + 健身习惯。每年死亡风险下降，并获得少量健康恢复。'},
    '现金流机器':{kind:'synergy',tip:'天胡构筑：副业跑通 + 自律≥75 + 野心≥70。每年获得额外财富增长，并提高创业类成功结果权重。'},
    '复利发动机':{kind:'synergy',tip:'天胡构筑：投资者 + 风险纪律 + 智力≥80 + 自律≥70。投资结果更偏向正收益，但仍可能亏损。'},
    '社交飞轮':{kind:'synergy',tip:'天胡构筑：社交≥85 + 运气≥70。贵人、合作和谈判事件权重提高。'},
    '家族凝聚':{kind:'synergy',tip:'天胡构筑：家庭关系≥80 + 已婚 + 至少1名子女。家庭类负面事件权重降低，子女继承属性略有提升。'},
    '第二曲线':{kind:'synergy',tip:'天胡构筑：创业失败 + 副业跑通 + 自律≥80。二次创业、转型事件的成功结果明显增强。'}
  };

  L.WORLDS = [
    {id:'normal',name:'🌐 通胀挤压时代',desc:'工资增长慢、生活成本高，稳定现金流更重要。',wealthMul:.96,careerMul:1},
    {id:'boom',name:'🚀 科技繁荣时代',desc:'技术、创业和高成长行业机会更多。',wealthMul:1.05,careerMul:1.08},
    {id:'slow',name:'🧊 长期低增长时代',desc:'晋升更慢，稳定与技能积累更重要。',wealthMul:.98,careerMul:.92},
    {id:'volatile',name:'🌪 高波动时代',desc:'财富和职业结果更极端，风险纪律价值更高。',wealthMul:1,careerMul:1},
    {id:'property',name:'🏙 城市化尾声',desc:'房产、迁移、家庭资产选择更频繁。',wealthMul:1,careerMul:1},
    {id:'ai',name:'🤖 AI重构时代',desc:'部分职业被替代，同时出现大量新职业与副业窗口。',wealthMul:1.03,careerMul:1.04}
  ];

  L.BACKGROUNDS = [
    ['县城普通家庭',38,52,'少年穷困'],['城市工薪家庭',52,62,'家庭温暖'],['小城个体户家庭',58,55,'商业耳濡'],['教师家庭',50,72,'阅读环境'],['医护家庭',55,67,'健康意识'],['工程师家庭',60,70,'技术启蒙'],['单亲家庭',34,42,'家庭裂痕'],['经商家庭',72,58,'商业耳濡'],['富裕专业人士家庭',80,72,'资源充足'],['工厂职工家庭',42,54,'务实'],['农村家庭',30,56,'少年穷困'],['外来务工家庭',32,47,'迁徙童年'],['公务员家庭',56,68,'稳定偏好'],['艺术家庭',48,64,'审美启蒙'],['军人家庭',50,66,'纪律教育'],['家族企业家庭',88,61,'资源充足']
  ];

  L.PERSONALITIES = [
    ['长期主义者',{discipline:12,stability:10,risk:-6}],['冒险家',{risk:16,ambition:10,stability:-8}],['社交发动机',{social:16,happiness:5}],['内向观察者',{intelligence:9,social:-8}],['现实主义者',{stability:12,happiness:-2}],['理想主义者',{happiness:7,ambition:6}],['竞争狂',{ambition:15,happiness:-5}],['松弛派',{happiness:13,discipline:-8}],['控制型人格',{discipline:10,family:-6}],['高敏感',{intelligence:6,happiness:-8}],['行动派',{discipline:8,risk:7}],['照顾型人格',{family:14,social:5}],['独立型',{ambition:8,family:-4}],['机会主义者',{luck:5,risk:10,social:6}]
  ];

  L.TALENTS = [
    ['数学直觉',{intelligence:13}],['语言天赋',{social:7,intelligence:7}],['商业嗅觉',{ambition:9,luck:6}],['运动天赋',{health:14}],['艺术感觉',{happiness:7,intelligence:5}],['镜头感',{social:9,luck:4}],['代码脑',{intelligence:12,discipline:4}],['领导力',{social:8,ambition:8}],['极强记忆',{intelligence:11}],['抗压',{stability:12}],['手工天赋',{discipline:7,intelligence:5}],['销售直觉',{social:12}],['写作天赋',{intelligence:7,social:5}],['审美',{happiness:4,social:5}],['研究癖',{intelligence:10,discipline:7}],['节俭',{stability:7,discipline:5}],['体质强健',{health:11}],['快速学习',{intelligence:8,discipline:6}],['共情力',{family:8,social:7}],['好运体质',{luck:12}]
  ];

  L.FLAWS = [
    ['拖延',{discipline:-14}],['冲动消费',{stability:-8,risk:7}],['情绪化',{happiness:-10,stability:-5}],['社恐',{social:-13}],['玻璃心',{happiness:-8}],['过度自信',{risk:12,stability:-5}],['慢性焦虑',{happiness:-9,health:-4}],['怕失败',{ambition:-9,risk:-7}],['工作成瘾',{health:-5,ambition:10}],['讨好型',{social:5,family:-5}],['三分钟热度',{discipline:-10}],['爱面子',{stability:-5,social:4}],['低欲望',{ambition:-12,happiness:5}],['睡眠差',{health:-9}],['完美主义',{discipline:6,happiness:-7}],['不善理财',{stability:-10}],['嘴硬',{family:-8,social:-4}],['沉迷游戏',{discipline:-8,happiness:4}],['过度谨慎',{risk:-14,stability:6}],['莽撞',{risk:13,health:-4}]
  ];

  L.PROFESSIONS = [
    {id:'none',name:'待业',salary:0,tier:0,tags:[]},
    {id:'clerk',name:'行政/文职',salary:7000,tier:1,tags:['上班族']},
    {id:'sales',name:'销售',salary:9000,tier:1,tags:['上班族']},
    {id:'teacher',name:'教师',salary:8500,tier:1,tags:['上班族']},
    {id:'nurse',name:'医护人员',salary:10000,tier:1,tags:['上班族']},
    {id:'technician',name:'技术工',salary:9500,tier:1,tags:['上班族','技能型']},
    {id:'designer',name:'设计师',salary:11000,tier:1,tags:['上班族','技能型']},
    {id:'developer',name:'软件工程师',salary:16000,tier:2,tags:['上班族']},
    {id:'product',name:'产品经理',salary:15000,tier:2,tags:['上班族']},
    {id:'finance',name:'金融从业者',salary:18000,tier:2,tags:['上班族']},
    {id:'lawyer',name:'律师',salary:17000,tier:2,tags:['上班族']},
    {id:'doctor',name:'医生',salary:19000,tier:2,tags:['上班族']},
    {id:'researcher',name:'研究员',salary:15000,tier:2,tags:['上班族']},
    {id:'creator',name:'内容创作者',salary:12000,tier:2,tags:['内容创作者']},
    {id:'freelancer',name:'自由职业者',salary:13000,tier:2,tags:['技能型']},
    {id:'manager',name:'部门经理',salary:24000,tier:3,tags:['上班族','管理者']},
    {id:'expert',name:'技术专家',salary:28000,tier:3,tags:['上班族','技术专家']},
    {id:'executive',name:'公司高管',salary:48000,tier:4,tags:['上班族','管理者']},
    {id:'founder',name:'创业者',salary:18000,tier:3,tags:['创业者']},
    {id:'owner',name:'企业主',salary:60000,tier:5,tags:['创业者','创业成功']}
  ];

  L.AVATARS = [
    ['曜','M','#6C7CFF','#252A4E'],['岚','F','#FA8BFF','#52285D'],['弥','M','#5CE1E6','#164B59'],['澈','F','#91F2C3','#19513B'],['野','M','#FFB45C','#603C16'],
    ['凛','F','#8DB7FF','#243E70'],['隼','M','#E9A7FF','#593169'],['绫','F','#FF8FA7','#6E2735'],['拓','M','#A8E063','#38541C'],['宁','F','#FFD166','#694D12'],
    ['晟','M','#FF7A7A','#622626'],['遥','F','#72D7FF','#1F5265'],['辰','M','#A88BFF','#3E2F70'],['鸢','F','#FF9AD5','#692A50'],['岳','M','#78E0C2','#205749'],
    ['栖','F','#B5A0FF','#47396D'],['墨','M','#B0BEC5','#37474F'],['禾','F','#E6EE9C','#566222'],['川','M','#80CBC4','#23534E'],['夕','F','#F48FB1','#5E2940'],
    ['朔','M','#90CAF9','#285271'],['茶','F','#CE93D8','#59335E'],['燃','M','#FFAB91','#69362B'],['霁','F','#80DEEA','#24545A'],['砚','M','#B39DDB','#45385F'],
    ['梨','F','#FFF59D','#665D21'],['曜二','M','#9FA8DA','#3B4164'],['桃','F','#F8BBD0','#663A49'],['森','M','#A5D6A7','#38593A'],['蓝','F','#81D4FA','#285B70']
  ].map((x,i)=>({id:i,name:x[0],gender:x[1],c1:x[2],c2:x[3]}));

  L.svgAvatar = function(a){
    const skins=['#FFD7BD','#F2C2A2','#E8AF8E','#D99873','#B97653'], skin=skins[a.id%skins.length];
    const hairs=['#171B24','#3B2A24','#68452E','#241B2F','#101318'], hc=hairs[a.id%hairs.length];
    const long=a.gender==='F'||a.id%4===0;
    const hair=long?`<path d="M17 36c1-18 11-26 23-26 13 0 22 9 23 27l-8-7c-3-8-9-13-16-13-8 0-14 5-17 14z" fill="${hc}"/><path d="M18 34c-3 15-1 27 7 36l6-10-5-25zM62 34c3 15 1 27-7 36l-6-10 5-25z" fill="${hc}"/>`:`<path d="M19 34c1-17 10-25 21-25 12 0 20 8 22 24-7-1-12-8-14-14-7 7-16 11-29 15z" fill="${hc}"/>`;
    const glasses=a.id%5===0?'<path d="M25 39h13m4 0h13" stroke="#222936"/><rect x="24" y="34" width="14" height="10" rx="4" fill="none" stroke="#222936"/><rect x="42" y="34" width="14" height="10" rx="4" fill="none" stroke="#222936"/>':'';
    const smile=a.id%3===0?'M32 49c5 6 11 6 16 0':a.id%3===1?'M33 50c5 2 9 2 14 0':'M33 51c5-2 9-2 14 0';
    const outfit=a.id%2===0?'#18243A':'#332238';
    return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g${a.id}" x1="0" x2="1"><stop stop-color="${a.c1}"/><stop offset="1" stop-color="${a.c2}"/></linearGradient></defs><rect width="80" height="80" rx="22" fill="url(#g${a.id})"/><path d="M18 80c2-15 10-22 22-22s20 7 22 22" fill="${outfit}"/>${hair}<circle cx="40" cy="39" r="21" fill="${skin}"/><circle cx="32" cy="39" r="2" fill="#30272A"/><circle cx="48" cy="39" r="2" fill="#30272A"/>${glasses}<path d="${smile}" stroke="#A95F66" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M22 33c4-14 12-19 19-19 10 0 17 6 19 19-8-1-13-7-16-13-6 7-12 10-22 13z" fill="${hc}"/><text x="40" y="75" text-anchor="middle" font-size="7" fill="white" opacity=".8">${a.name}</text></svg>`;
  };

  L.clamp = (n,min=0,max=100)=>Math.max(min,Math.min(max,n));
  L.pick = arr => arr[Math.floor(Math.random()*arr.length)];
  L.rand = (min,max)=>Math.floor(Math.random()*(max-min+1))+min;
  L.fmtMoney = n => {
    const sign=n<0?'-':''; const v=Math.abs(n);
    if(v>=100000000) return `${sign}¥${(v/100000000).toFixed(2)}亿`;
    if(v>=10000) return `${sign}¥${(v/10000).toFixed(1)}万`;
    return `${sign}¥${Math.round(v).toLocaleString('zh-CN')}`;
  };

  L.SYNERGIES = [
    {tag:'长寿体质',when:p=>p.stats.health>=85&&p.stats.stability>=70&&p.tags.includes('健身习惯')},
    {tag:'现金流机器',when:p=>p.tags.includes('副业跑通')&&p.stats.discipline>=75&&p.stats.ambition>=70},
    {tag:'复利发动机',when:p=>p.tags.includes('投资者')&&p.tags.includes('风险纪律')&&p.stats.intelligence>=80&&p.stats.discipline>=70},
    {tag:'社交飞轮',when:p=>p.stats.social>=85&&p.stats.luck>=70},
    {tag:'家族凝聚',when:p=>p.stats.family>=80&&p.tags.includes('已婚')&&p.children.length>=1},
    {tag:'第二曲线',when:p=>p.tags.includes('创业失败')&&p.tags.includes('副业跑通')&&p.stats.discipline>=80}
  ];
})();
