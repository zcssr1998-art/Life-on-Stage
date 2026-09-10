window.LIFE = window.LIFE || {};
(() => {
  const L = window.LIFE;
  L.VERSION = 'V4.0';
  L.STORAGE_KEY = 'life_on_stage_v4_save';
  L.DYNASTY_KEY = 'life_on_stage_v4_dynasty';

  Object.assign(L.ATTR, {
    health:{name:'健康',tip:'直接影响受伤、疾病与死亡率。≥75可解锁高强度路线；≤35会大幅提高疾病和意外死亡概率。'},
    happiness:{name:'幸福',tip:'影响心理低谷、关系稳定和结局评价。过低会解锁崩溃事件，过高则更容易得到知足型稀有结局。'},
    intelligence:{name:'智力',tip:'决定大学专业、研究/技术工作和复杂决策门槛。≥80解锁高阶学习与专家路线；≥92可能触发天才事件。'},
    social:{name:'社交',tip:'影响恋爱、贵人、销售、管理、谈判。≥70解锁高级关系/谈判路线；≥85可组成社交飞轮。'},
    luck:{name:'运气',tip:'改变同一选择的结果权重，但永远不保证成功。高运气更容易抽到稀有好结果，低运气也可能突然翻盘。'},
    ambition:{name:'野心',tip:'决定创业、晋升、跨阶层路线能否出现。≥70开放激进事业路线；≥90开放豪赌式行动。'},
    stability:{name:'稳定',tip:'代表抗波动和风险承受后的恢复能力。高稳定会降低极端坏结果权重；低稳定更容易因一次冲击连锁崩盘。'},
    discipline:{name:'自律',tip:'影响学习、健身、副业、升职和创业执行。长期项目里，自律越高越容易把普通结果滚成复利。'},
    risk:{name:'风险偏好',tip:'控制高风险选项是否出现。≥70可见裸辞、重仓、激进创业等路线；高风险同时会增加意外和破产概率。'},
    family:{name:'家庭关系',tip:'影响父母、配偶、孩子和继承。≤35且有“家庭裂痕”可能触发家庭分崩离析；≥80可组成家族凝聚。'}
  });

  Object.assign(L.TAG_DEFS, {
    '抓周·书卷气':{kind:'state',tip:'童年 Buff：更容易出现阅读、竞赛、学术路线；智力类结果略占优。'},
    '抓周·钱串子':{kind:'state',tip:'童年 Buff：商业、副业和财富类事件更容易进入候选池。'},
    '抓周·工具控':{kind:'state',tip:'童年 Buff：技能、工程、动手和技术职业路线更容易出现。'},
    '抓周·舞台感':{kind:'state',tip:'童年 Buff：社交、表达、内容创作和公众路线更容易出现。'},
    '抓周·运动魂':{kind:'state',tip:'童年 Buff：健康与运动路线更容易出现，年轻时意外受伤概率略降。'},
    '初中辍学':{kind:'state',tip:'教育路线：提前离开学校。会失去部分学历岗位，但解锁更早的打工、学徒、江湖与创业事件。'},
    '普高路线':{kind:'state',tip:'教育路线：继续普通高中。18岁可进入大学专业选择。'},
    '职校路线':{kind:'state',tip:'教育路线：职业教育。技能工作和提前就业事件权重更高。'},
    '医学专业':{kind:'state',tip:'大学专业：医学。学制更长，医生/医药/研究路线更容易出现。'},
    '警校路线':{kind:'state',tip:'大学专业：警务/公共安全。要求健康与稳定，毕业后可进入警务和公共部门路线。'},
    '数理工科':{kind:'state',tip:'大学专业：数学、计算机、工程等。技术、研究、AI和创业路线权重提高。'},
    '商科人文':{kind:'state',tip:'大学专业：商科、人文、法律等。销售、金融、管理、媒体路线权重提高。'},
    '艺术传媒':{kind:'state',tip:'大学专业：艺术/传媒。内容、设计、创作和自由职业路线权重提高。'},
    '不婚主义':{kind:'state',tip:'人生选择：主动不进入婚姻。婚姻事件不再强制出现，但恋爱与个人生活事件仍可能出现。'},
    '丁克':{kind:'state',tip:'婚姻选择：不主动生育。会减少子女事件，增加夫妻共同生活和自由支配资源。'},
    '想要孩子':{kind:'state',tip:'婚姻选择：愿意生育。适龄阶段可能自然触发孩子出生，不需要每年操作。'},
    '大学在读':{kind:'state',tip:'教育状态：正在读大学。到毕业年龄会触发毕业择业节点。'},
    '已毕业':{kind:'state',tip:'教育状态：完成当前学历阶段。专业背景会影响第一份工作和后续职业池。'},
    '职业上升期':{kind:'state',tip:'职业状态：连续表现不错。升职事件更容易出现，但压力与健康代价也会上升。'},
    '27俱乐部':{kind:'achievement',tip:'极稀有结局标签：你在27岁结束人生，并留下足够鲜明的故事。'},
    '天才早逝':{kind:'achievement',tip:'稀有结局标签：高智力/高成就但英年早逝。'},
    '白手起家':{kind:'achievement',tip:'稀有成就：低资源开局却把财富滚到高位。'},
    '伴侣逆袭':{kind:'achievement',tip:'家庭事件成就：伴侣在低谷后突然翻盘，并显著改变了家庭资产。'},
    '被伴侣背刺':{kind:'state',tip:'关系经历：伴侣做出了严重伤害共同利益的行为，会影响后续关系与结局。'}
  });

  const addProf = p => { if(!L.PROFESSIONS.some(x=>x.id===p.id)) L.PROFESSIONS.push(p); };
  [
    {id:'police',name:'警务人员',salary:10500,tier:1,tags:['上班族']},
    {id:'engineer',name:'工程师',salary:15000,tier:2,tags:['上班族','技能型']},
    {id:'artist',name:'设计/艺术从业者',salary:12000,tier:2,tags:['技能型']},
    {id:'medtech',name:'医药/医疗技术',salary:14000,tier:2,tags:['上班族']},
    {id:'civil',name:'公共部门职员',salary:9500,tier:1,tags:['上班族']},
    {id:'scientist',name:'科研专家',salary:26000,tier:3,tags:['上班族','技术专家']},
    {id:'captain',name:'警务管理岗',salary:23000,tier:3,tags:['上班族','管理者']},
    {id:'partner',name:'合伙人/业务负责人',salary:38000,tier:4,tags:['上班族','管理者']}
  ].forEach(addProf);

  const themes = [
    ['宇航员','🧑‍🚀','#15213a','#67d8ff','✦'],['赛博黑客','🧑‍💻','#171329','#ff4fd8','⌁'],['急诊医生','🧑‍⚕️','#e9f4ff','#2f6ea7','✚'],['侦探','🕵️','#2d241e','#d1a66a','⌕'],['摇滚主唱','🧑‍🎤','#1a0e18','#ff4d6d','♫'],['僧人','🧘','#f4d7a1','#a35a22','☸'],['骑士','🛡️','#182235','#b6c5e0','⚔'],['女巫','🧙','#211437','#a98bff','☾'],['投行精英','🧑‍💼','#0e1a2b','#f0c36e','◆'],['机械工程师','👷','#1b2328','#ffb84d','⚙'],
    ['画家','🧑‍🎨','#fff0e5','#e9627d','✎'],['拳击手','🥊','#241314','#ff6b4a','★'],['主厨','🧑‍🍳','#f8f8f4','#c83e4d','♨'],['飞行员','🧑‍✈️','#0e2743','#77b9ff','✈'],['电竞选手','🎮','#11162b','#77ffcc','▣'],['农场主','🧑‍🌾','#24351c','#a7d66d','❀'],['舞者','💃','#2f1025','#ff87c8','♪'],['武士','🥷','#161616','#d33d3d','刃'],['牛仔','🤠','#47301c','#e6ba77','✹'],['学者','🧑‍🏫','#2b2131','#d8c7ff','文'],
    ['消防员','🧑‍🚒','#301a18','#ff735c','🔥'],['冲浪者','🏄','#06314b','#62d5f4','≈'],['贵族','🤴','#2b173d','#efcf77','♛'],['街头潮人','🧢','#111827','#93c5fd','⚡'],['实验室科学家','🧑‍🔬','#e8f7f3','#228d82','⚗'],['赛车手','🏎️','#1e1e24','#ffcf33','🏁'],['旅行家','🧳','#21382c','#8bd3a8','⌖'],['机器人','🤖','#161d2a','#7ee7ff','01'],['复古歌姬','👩‍🎤','#3b1830','#f3b3c8','✦'],['荒野探险家','🧭','#30291f','#d6b15f','△']
  ];
  L.AVATARS = themes.map((x,i)=>({id:i,name:x[0],icon:x[1],bg:x[2],accent:x[3],mark:x[4]}));
  L.svgAvatar = a => `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-label="${a.name}"><rect width="96" height="96" rx="24" fill="${a.bg}"/><circle cx="74" cy="22" r="13" fill="${a.accent}" opacity=".18"/><circle cx="20" cy="77" r="18" fill="${a.accent}" opacity=".12"/><text x="48" y="59" text-anchor="middle" font-size="43">${a.icon}</text><text x="78" y="83" text-anchor="middle" font-size="15" font-weight="800" fill="${a.accent}">${a.mark}</text></svg>`;

  const action = (id,category,title,desc,opts={}) => ({id,category,title,desc,weight:opts.weight||1,requires:opts.requires||{},outcomes:opts.outcomes||[],special:opts.special||{},effects:opts.effects||{},addTags:opts.addTags||[],fixed:!!opts.fixed,rare:!!opts.rare});
  L.action = action;

  L.MILESTONES = {
    1: p => [
      action('zhou_book','童年节点','抓到一本书','书页比玩具更吸引你。',{fixed:true,effects:{intelligence:8,discipline:3},addTags:['抓周·书卷气']}),
      action('zhou_money','童年节点','抓到一串钱币','你死死攥住那个会发光的小东西。',{fixed:true,effects:{ambition:7,luck:3},addTags:['抓周·钱串子']}),
      action('zhou_tool','童年节点','抓到一把小工具','你更想知道东西为什么能动。',{fixed:true,effects:{intelligence:5,discipline:5},addTags:['抓周·工具控']}),
      action('zhou_stage','童年节点','抓到一只麦克风','所有人笑的时候，你反而更兴奋。',{fixed:true,effects:{social:8,happiness:4},addTags:['抓周·舞台感']}),
      action('zhou_ball','童年节点','抓到一个小球','你抱着球满屋乱爬。',{fixed:true,effects:{health:8,risk:3},addTags:['抓周·运动魂']})
    ],
    12: p => [
      action('junior_study','教育节点','把学习当主线','你决定至少先把考试这条路打通。',{outcomes:[
        {weight:60,text:'你稳稳跟上了进度，学习开始形成正反馈。',effects:{intelligence:7,discipline:6},addTags:['普高路线']},
        {weight:25,text:'成绩没起飞，但你练出了坐得住的能力。',effects:{discipline:8,stability:3},addTags:['普高路线']},
        {weight:15,text:'你卷过头了，成绩上来一点，心情却被榨干。',effects:{intelligence:5,happiness:-7,health:-2},addTags:['普高路线']}
      ]}),
      action('junior_skill','教育节点','提前学一门手艺','你不想把所有筹码都压在卷面分数。',{outcomes:[
        {weight:55,text:'你对实操上了瘾，很早就有了可换钱的技能。',effects:{discipline:6,intelligence:3},addTags:['职校路线','技能型']},
        {weight:25,text:'你换了好几门技能，最后只留下“什么都摸过”。',effects:{intelligence:4,happiness:3},addTags:['职校路线']},
        {weight:20,text:'培训班很水，钱和时间都花了，收获有限。',effects:{happiness:-4,stability:2},special:{wealth:-3000},addTags:['职校路线']}
      ]}),
      action('junior_sport','教育节点','押注体育特长','你开始把身体当成另一套成长系统。',{requires:{stats:{health:55}},outcomes:[
        {weight:45,text:'你成了校队主力，身体和朋友一起涨。',effects:{health:10,social:7,happiness:5},addTags:['抓周·运动魂']},
        {weight:35,text:'没练成专业，但运动习惯留下来了。',effects:{health:7,discipline:5},addTags:['健身习惯']},
        {weight:20,text:'一次伤病让你提前认清竞技体育的残酷。',effects:{health:-12,stability:5,happiness:-5}}
      ]}),
      action('junior_social','教育节点','把同学关系经营起来','你很早就发现，人也是一种长期资产。',{outcomes:[
        {weight:55,text:'你成了班里消息最灵通的人之一。',effects:{social:9,luck:3}},
        {weight:25,text:'你认识很多人，但学习明显被挤占。',effects:{social:10,intelligence:-4,discipline:-3}},
        {weight:20,text:'你卷进一场小团体冲突，第一次尝到人情反噬。',effects:{social:-5,happiness:-7,stability:3}}
      ]}),
      action('junior_drop','教育节点','初中辍学，直接进社会','高风险路线：更早挣钱，也更早承受现实。',{outcomes:[
        {weight:30,text:'你遇到肯教你的师傅，提前拿到一门手艺。',effects:{discipline:8,social:5,ambition:5},addTags:['初中辍学','技能型'],special:{wealth:8000}},
        {weight:40,text:'你只是提前进入低薪劳动，钱没攒下多少。',effects:{stability:4,health:-4,ambition:4},addTags:['初中辍学'],special:{wealth:3000}},
        {weight:20,text:'你被现实狠狠教育了一次，吃亏后变得更谨慎。',effects:{happiness:-8,stability:7,social:3},addTags:['初中辍学'],special:{wealth:-3000}},
        {weight:10,text:'你混进一个极强的小圈子，年纪轻轻就摸到生意门道。',effects:{social:10,ambition:12,risk:8},addTags:['初中辍学','副业跑通'],special:{wealth:25000}}
      ]})
    ],
    18: p => {
      if(p.tags.includes('初中辍学')) return [
        action('adult_apprentice','成年节点','进厂做技术学徒','先靠手艺站住脚。',{outcomes:[{weight:60,text:'你成了靠谱的技术工，工资不高但很稳。',effects:{discipline:7,stability:8},special:{career:'technician'}},{weight:25,text:'工厂太累，你干了一阵就换方向。',effects:{health:-7,stability:3},special:{wealth:12000}},{weight:15,text:'老师傅愿意带你，你很快成了小组里的骨干。',effects:{intelligence:5,discipline:8},special:{career:'engineer'}}]}),
        action('adult_sales','成年节点','去做销售','学历门槛低，但人和结果都很残酷。',{outcomes:[{weight:45,text:'你找到了自己的成交节奏。',effects:{social:9,ambition:6},special:{career:'sales'}},{weight:35,text:'你勉强混着，学会了看人脸色。',effects:{social:5,happiness:-3},special:{career:'sales'}},{weight:20,text:'连续碰壁把自信打掉不少。',effects:{happiness:-9,stability:4},special:{career:'clerk'}}]}),
        action('adult_business','成年节点','摆摊 / 小生意','用极小本金直接碰市场。',{outcomes:L.STARTUP_OUTCOMES}),
        action('adult_exam','成年节点','重新参加成人教育','把学历这扇门重新推开。',{requires:{stats:{discipline:48}},outcomes:[{weight:65,text:'你一边工作一边补课，重新拿到升学资格。',effects:{intelligence:7,discipline:8},addTags:['普高路线']},{weight:35,text:'工作和学习一起压过来，你中途停了。',effects:{happiness:-6,stability:4}}]}),
        action('adult_free','成年节点','做自由职业','靠接单和零工活下去。',{outcomes:[{weight:50,text:'你勉强把自由变成了现金流。',effects:{discipline:5,social:4},special:{career:'freelancer'}},{weight:30,text:'订单忽多忽少，你开始理解现金流焦虑。',effects:{stability:-5,risk:4},special:{career:'freelancer'}},{weight:20,text:'一次大单让你认识了关键客户。',effects:{social:9,luck:5},special:{career:'freelancer',wealth:30000}}]})
      ];
      return [
        action('uni_med','大学节点','读医学','长学制、高门槛，但职业路径明确。',{requires:{stats:{intelligence:68,discipline:55}},effects:{intelligence:6,discipline:5,health:-2},addTags:['大学在读','医学专业'],special:{education:'医学本科',graduationAge:24}}),
        action('uni_police','大学节点','读警校','纪律、体能和公共安全路线。',{requires:{stats:{health:62,stability:55}},effects:{health:5,discipline:8,stability:5},addTags:['大学在读','警校路线'],special:{education:'警校',graduationAge:22}}),
        action('uni_stem','大学节点','读数理工科','计算机、工程、数学与研究路线。',{requires:{stats:{intelligence:58}},effects:{intelligence:8,discipline:4},addTags:['大学在读','数理工科'],special:{education:'数理工本科',graduationAge:22}}),
        action('uni_business','大学节点','读商科 / 人文','商业、法律、管理与传播路线。',{effects:{social:6,intelligence:4},addTags:['大学在读','商科人文'],special:{education:'商科人文本科',graduationAge:22}}),
        action('uni_art','大学节点','读艺术 / 传媒','把审美、表达和作品当成职业筹码。',{effects:{social:5,happiness:6,ambition:4},addTags:['大学在读','艺术传媒'],special:{education:'艺术传媒本科',graduationAge:22}})
      ];
    },
    28: p => {
      if(p.tags.includes('不婚主义')) return null;
      if(!p.spouse) return [
        action('love_serious','关系节点','认真找一个长期伴侣','你把恋爱从“碰运气”变成主动项目。',{outcomes:[{weight:55,text:'你遇到一个愿意一起生活的人。',effects:{happiness:8,family:5},special:{createSpouse:true}},{weight:25,text:'约会了不少人，但没有谁真正留下。',effects:{social:5,happiness:-2}},{weight:20,text:'一段关系来得快去得也快，你更清楚自己要什么。',effects:{stability:5,happiness:-5}}]}),
        action('love_blind','关系节点','接受相亲安排','把筛选条件摆上桌。',{outcomes:[{weight:50,text:'意外合拍，你们开始稳定交往。',effects:{family:7,stability:5},special:{createSpouse:true}},{weight:30,text:'礼貌吃完一顿饭，各自回家。',effects:{social:2}},{weight:20,text:'条件很合适，情绪却完全不来电。',effects:{happiness:-3,stability:2}}]}),
        action('love_career','关系节点','先把事业冲上去','感情先放一边。',{effects:{ambition:8,discipline:4,happiness:-2},addTags:['职业上升期']}),
        action('love_free','关系节点','保持单身，享受自由','你不急着给人生加另一位主角。',{effects:{happiness:7,stability:4}}),
        action('love_never','关系节点','明确选择不婚','以后婚姻不再是必答题。',{effects:{stability:7,happiness:4},addTags:['不婚主义']})
      ];
      if(!p.tags.includes('已婚')) return [
        action('marry_child','婚姻节点','结婚，并计划要孩子','把家庭扩展成下一阶段主线。',{effects:{family:10,happiness:6,stability:4},addTags:['已婚','想要孩子'],special:{marry:true,maritalPlan:'children'}}),
        action('marry_dink','婚姻节点','结婚，但选择丁克','把资源和自由留给两个人。',{effects:{family:8,happiness:7,stability:5},addTags:['已婚','丁克'],special:{marry:true,maritalPlan:'dink'}}),
        action('marry_delay','婚姻节点','继续恋爱，不急着结婚','你们决定先观察彼此能不能过日子。',{effects:{happiness:4,stability:2}}),
        action('marry_break','婚姻节点','分手，重新开始','比拖着更干净。',{effects:{happiness:-8,stability:6},special:{clearSpouse:true}}),
        action('marry_never','婚姻节点','和伴侣谈清楚：不结婚','关系可以继续，但不签那张纸。',{effects:{social:4,stability:5},addTags:['不婚主义']})
      ];
      return null;
    }
  };

  L.STARTUP_OUTCOMES = [
    {weight:7,good:true,text:'你撞上需求爆发，业务像开闸一样冲起来。',effects:{ambition:10,social:6,happiness:10},special:{wealth:500000,career:'owner'},addTags:['创业成功']},
    {weight:18,good:true,text:'项目活下来了，没有暴富，但你第一次真正拥有自己的现金流。',effects:{discipline:8,ambition:6},special:{wealth:90000,career:'founder'},addTags:['创业者']},
    {weight:25,text:'钱没赚多少，但你认识了一个非常关键的新朋友。',effects:{social:12,luck:3},special:{wealth:-12000},addTags:['创业者']},
    {weight:22,text:'项目失败了，好消息是你学会了如何把一个想法做完。',effects:{intelligence:6,discipline:6,happiness:-4},special:{wealth:-35000},addTags:['创业失败']},
    {weight:18,text:'你忙了一整年，最后基本白干。',effects:{health:-5,happiness:-7,stability:3},special:{wealth:-12000},addTags:['创业失败']},
    {weight:10,text:'现金流断裂，你背上了一笔真正影响生活的债。',effects:{happiness:-12,stability:-8,risk:-3},special:{wealth:-180000},addTags:['创业失败','负债']}
  ];

  L.SPOUSE_STORIES = [
    {id:'sp_raise',text:s=>`${s.name} 在工作上突然晋升，家庭现金流宽松了一截。`,weight:15,effects:{happiness:3,family:4},wealth:[30000,120000]},
    {id:'sp_layoff',text:s=>`${s.name} 遇到裁员，短时间明显陷入低谷。`,weight:13,effects:{happiness:-4,family:-2},wealth:[-60000,-15000]},
    {id:'sp_boom',text:s=>`${s.name} 做的项目意外爆了，一下把家里的资产台阶抬高。`,weight:4,effects:{happiness:7,family:5},wealth:[180000,800000],tag:'伴侣逆袭'},
    {id:'sp_fail',text:s=>`${s.name} 投入的一件事失败，家里替这次试错买了单。`,weight:10,effects:{happiness:-5,family:-3},wealth:[-140000,-25000]},
    {id:'sp_support',text:s=>`你处在事业低谷时，${s.name} 没说太多，直接替你扛住了家里的杂事。`,weight:12,effects:{happiness:8,family:8,stability:5},wealth:[-8000,8000]},
    {id:'sp_inherit',text:s=>`${s.name} 家里处理了一笔旧资产，你们意外得到一笔钱。`,weight:5,effects:{family:3},wealth:[80000,450000]},
    {id:'sp_burn',text:s=>`${s.name} 悄悄把一大笔钱投进自己没弄懂的东西，等你发现时已经亏掉了。`,weight:5,effects:{happiness:-12,family:-12,stability:-6},wealth:[-500000,-70000]},
    {id:'sp_affair',text:s=>`${s.name} 的婚外关系彻底暴露，分开时还带走了大量共同资产。`,weight:2,effects:{happiness:-25,family:-28,stability:-10},fraction:-.38,divorce:true,tag:'被伴侣背刺'},
    {id:'sp_friend',text:s=>`${s.name} 把你介绍进一个完全不同的圈子，你认识了几位后来很有用的人。`,weight:10,effects:{social:8,luck:3,family:3}},
    {id:'sp_sick',text:s=>`${s.name} 身体出了一次状况，你花了不少时间和钱陪着处理。`,weight:8,effects:{happiness:-5,family:7},wealth:[-80000,-10000]},
    {id:'sp_quit',text:s=>`${s.name} 突然辞掉了稳定工作，决定重新开始。`,weight:8,effects:{family:-3,ambition:3},wealth:[-50000,5000]},
    {id:'sp_scam',text:s=>`${s.name} 被熟人卷进一场骗局，你们为了填坑损失了一大笔钱。`,weight:3,effects:{happiness:-10,family:-5},fraction:-.24}
  ];

  L.CHILD_STORIES = [
    {id:'kid_award',text:c=>`${c.name} 拿到了一个很不错的成绩，家里难得因为一件小事开心了很久。`,weight:14,effects:{happiness:5,family:4}},
    {id:'kid_trouble',text:c=>`${c.name} 闯了个不小的祸，你最后用钱把问题处理掉。`,weight:10,effects:{happiness:-4,family:-3},wealth:[-50000,-5000]},
    {id:'kid_job',text:c=>`${c.name} 工作后第一次认真给你包了过节费。`,weight:8,minParentAge:48,effects:{happiness:6,family:5},wealth:[2000,20000]},
    {id:'kid_business',text:c=>`${c.name} 想创业，来找你借第一笔钱。你没来得及表态，家里另一边已经先垫了。`,weight:5,minParentAge:45,effects:{family:-1},wealth:[-100000,-15000]},
    {id:'kid_success',text:c=>`${c.name} 的事业突然走顺，反过来帮家里解决了一笔大开支。`,weight:4,minParentAge:52,effects:{happiness:8,family:7},wealth:[30000,180000]},
    {id:'kid_sick',text:c=>`${c.name} 生了一场病，没到生死关头，但整个家都被折腾得够呛。`,weight:8,effects:{happiness:-6,family:5},wealth:[-40000,-5000]},
    {id:'kid_leave',text:c=>`${c.name} 去了很远的城市，联系变少，但你知道这也是他/她的人生。`,weight:7,minParentAge:45,effects:{happiness:-2,family:-2,stability:3}},
    {id:'kid_peace',text:c=>`${c.name} 没有特别传奇，只是平平稳稳地过自己的日子。`,weight:12,effects:{happiness:3,family:3}}
  ];

  L.STAGE = age => age<=2?'婴幼儿':age<=6?'童年':age<=12?'小学阶段':age<=17?'少年':age<=24?'求学 / 初入社会':age<=34?'青年':age<=44?'壮年':age<=59?'中年':age<=74?'晚年':'高龄';
})();
