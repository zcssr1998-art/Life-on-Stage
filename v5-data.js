window.LIFE = window.LIFE || {};
(() => {
  const L = window.LIFE;
  L.VERSION = 'V5.0';
  L.STORAGE_KEY = 'life_on_stage_v5_save';
  L.DYNASTY_KEY = 'life_on_stage_v5_dynasty';
  L.COLLECTION_KEY = 'life_on_stage_v5_collection';

  L.RARITY = {
    SSS:{name:'神话',weight:.6,rank:5},
    SS:{name:'传说',weight:1.2,rank:4},
    S:{name:'史诗',weight:2,rank:3},
    A:{name:'稀有',weight:4,rank:2},
    B:{name:'普通',weight:4,rank:1}
  };

  const T=(id,name,rarity,desc,effects={},sets=[],mods={})=>({id,name,rarity,desc,effects,sets,mods});
  L.TRAITS=[
    T('fate_child','天命之子','SSS','好运会渗进几乎所有随机判定；没有负面代价。',{luck:18,happiness:6},['fortune'],{success:.28,rare:.45}),
    T('hexagon','六边形战士','SSS','没有明显短板，所有基础属性同时抬升。',{health:8,happiness:8,intelligence:8,social:8,luck:8,ambition:8,stability:8,discipline:8,family:8},['mind','body','social','career']),
    T('phoenix','不死鸟','SSS','恢复能力极强，坏事更难把你直接打穿。',{health:18,stability:12},['body'],{death:.55,recovery:.3}),
    T('golden_rule','黄金律','SSS','自律、判断与稳定形成正循环，长期项目极强。',{intelligence:10,discipline:14,stability:12},['mind','career','wealth'],{success:.22,income:.12}),
    T('magnet','万人迷磁场','SSS','人际关系天然顺滑，贵人与伴侣事件显著偏正面。',{social:18,luck:10,happiness:6},['social','family','fortune'],{spouse:.35,success:.12}),

    T('capital_boost','资本加速器','SS','赚钱能力和资产扩张效率显著提高。',{ambition:12,stability:7},['wealth','career'],{income:.18,wealthOutcome:.25}),
    T('absolute_focus','绝对专注','SS','长线学习、工作和创业几乎不会轻易半途而废。',{discipline:18,intelligence:6},['mind','career'],{success:.18}),
    T('eidetic','过目不忘','SS','学习与复杂知识路线拥有巨大先手。',{intelligence:18},['mind'],{success:.12}),
    T('born_leader','天生领袖','SS','管理、谈判、组织事件更容易给出高质量结果。',{social:13,ambition:12,stability:5},['social','career'],{success:.14}),
    T('crisis_smell','危机嗅觉','SS','更容易避开极端亏损和关系灾难。',{stability:13,luck:7},['fortune','wealth'],{badGuard:.25}),
    T('longevity_gene','长寿基因','SS','健康上限和寿命判定明显占优。',{health:16},['body'],{death:.68}),
    T('patron_radar','贵人雷达','SS','贵人、朋友、合作机会更容易出现。',{social:11,luck:12},['social','fortune'],{rare:.25}),
    T('compound_instinct','复利本能','SS','长期积累的收益更容易滚起来。',{discipline:10,intelligence:7},['wealth','mind'],{income:.12,wealthOutcome:.18}),
    T('steel_will','钢铁意志','SS','大失败之后恢复更快，负面属性冲击被部分吸收。',{stability:18,discipline:8},['body','career'],{badGuard:.2}),
    T('spouse_blessing','伴侣旺运','SS','伴侣这名配角更容易在关键节点拉你一把。',{family:12,luck:8},['family','fortune'],{spouse:.3}),

    T('engineering_brain','工程脑','S','技术、工程、拆解复杂问题的能力突出。',{intelligence:12,discipline:6},['mind','career']),
    T('aesthetic','审美天赋','S','创作、设计、内容与表达路线更顺。',{intelligence:5,social:6,happiness:5},['creative','mind']),
    T('language_gift','语言天赋','S','表达、谈判和跨圈层沟通更强。',{social:12,intelligence:4},['social','creative']),
    T('sports_gift','运动天赋','S','体能、恢复和年轻期抗意外能力更强。',{health:13,stability:4},['body']),
    T('startup_instinct','创业直觉','S','创业时更容易抓到需求，但仍可能失败。',{ambition:12,risk:6},['career','wealth','risk']),
    T('negotiation','谈判本能','S','涉及薪资、合作、关系边界时更占优势。',{social:11,stability:5},['social','career']),
    T('risk_radar','风险雷达','S','敢下注，但知道什么时候不该下注。',{risk:5,stability:10},['wealth','risk']),
    T('deep_sleep','深度睡眠','S','长期健康恢复能力更好。',{health:11,happiness:5},['body']),
    T('social_antenna','社交天线','S','更快识别谁值得靠近，谁需要保持距离。',{social:11,luck:5},['social']),
    T('emotional_resilience','情绪韧性','S','坏消息更难造成连续崩盘。',{happiness:9,stability:9},['body','family']),
    T('learning_machine','学习机器','S','越学越快，学历和技能路线都受益。',{intelligence:11,discipline:8},['mind']),
    T('track_hunter','赛道猎手','S','更容易碰到新行业、新平台和增长窗口。',{ambition:10,luck:6},['career','fortune']),
    T('cashflow_eye','现金流意识','S','对收入、负债和持续现金流异常敏感。',{stability:9,discipline:7},['wealth']),
    T('comeback_body','逆风翻盘体质','S','处于低谷时，好结果权重会额外提高。',{stability:10,ambition:7},['career','fortune'],{comeback:.3}),
    T('family_core','家族核心','S','家庭关系更稳，伴侣和子女负面事件略少。',{family:13,stability:4},['family'],{spouse:.12}),

    T('diligent','勤能补拙','A','天赋普通，但靠持续投入把差距磨平。',{discipline:8,intelligence:3},['mind','career']),
    T('curious','好奇心','A','更愿意尝试陌生路线，但注意力偶尔发散。',{intelligence:6,risk:3,discipline:-2},['mind','creative']),
    T('early_bird','早起型','A','规律作息提升执行与体能。',{discipline:6,health:4},['body','career']),
    T('night_owl','夜猫子','A','夜间思维活跃，但长期身体吃亏。',{intelligence:5,health:-4},['mind']),
    T('sturdy','体力不错','A','普通但可靠的体能优势。',{health:7},['body']),
    T('empathy','共情力','A','更容易维护关系，但会多承担一点情绪成本。',{social:6,family:5,happiness:-2},['social','family']),
    T('speak_up','敢开口','A','机会来了更敢争取。',{social:6,ambition:4,stability:-1},['social','career']),
    T('budgeter','预算习惯','A','消费更克制，稳定性更强。',{stability:7,happiness:-1},['wealth']),
    T('saver','存钱习惯','A','财富积累更稳，但偶尔显得过于保守。',{discipline:5,stability:6,risk:-2},['wealth']),
    T('mild_risk','轻度冒险','A','敢试新东西，也更容易踩小坑。',{risk:6,ambition:4,stability:-3},['risk','career']),
    T('conservative','稳健派','A','抗波动较强，但错过爆发机会的概率更高。',{stability:8,risk:-6},['wealth']),
    T('many_friends','朋友很多','A','信息和帮助来源多，但时间被关系分走。',{social:8,discipline:-2},['social']),
    T('solo_master','独处高手','A','独立学习更强，但陌生社交稍弱。',{intelligence:5,discipline:4,social:-3},['mind']),
    T('executor','执行力','A','把想法变成行动的速度更快。',{discipline:8,ambition:3},['career']),
    T('review_habit','复盘习惯','A','失败更容易转化成经验。',{intelligence:5,stability:5},['mind','career']),
    T('craftsman','手艺人','A','实操能力强，学历依赖降低。',{discipline:6,intelligence:3,social:-1},['career','creative']),
    T('code_instinct','代码直觉','A','技术与自动化路线更顺，但社交略少。',{intelligence:7,social:-2},['mind','career']),
    T('camera_face','镜头感','A','公开表达和内容路线更容易获得正反馈。',{social:6,happiness:3},['creative','social']),
    T('expression','表达欲','A','更愿意输出观点，但也可能说得太多。',{social:7,stability:-2},['creative','social']),
    T('spatial','空间想象','A','工程、设计和动手路线受益。',{intelligence:6},['mind','creative']),
    T('music_ear','音乐耳朵','A','创作和情绪恢复更好，但职业收益不稳定。',{happiness:5,intelligence:3,stability:-2},['creative']),
    T('exercise_habit','运动习惯','A','长期健康受益，需要持续投入时间。',{health:7,discipline:3},['body']),
    T('pressure_resist','抗压','A','高压事件的负面冲击略小。',{stability:7,happiness:2},['body','career']),
    T('humor','幽默感','A','关系更轻松，但严肃场合偶尔不合时宜。',{social:6,happiness:4,stability:-1},['social']),
    T('goal_oriented','目标感','A','事业推进更快，松弛感稍差。',{ambition:7,discipline:4,happiness:-2},['career']),
    T('competitive','好胜心','A','更愿意冲排名和升职，幸福感略受影响。',{ambition:7,happiness:-3},['career','risk']),
    T('careful','谨慎','A','减少粗心损失，但行动速度更慢。',{stability:6,risk:-4,ambition:-1},['wealth']),
    T('optimist','乐观','A','坏事后的恢复更快，但偶尔低估风险。',{happiness:7,stability:3,risk:2},['fortune']),
    T('realist','现实主义','A','判断更稳，但浪漫和冒险感略低。',{stability:7,happiness:-2,risk:-2},['wealth','career']),
    T('family_duty','家庭责任感','A','家人更信任你，但资源更容易被家庭占用。',{family:8,stability:3,ambition:-2},['family']),

    T('procrastinate','拖延症','B','启动困难，但最后期限有时会逼出爆发。',{discipline:-9,stability:-2,intelligence:2},['mind']),
    T('impulse_buy','冲动消费','B','即时快乐高，长期现金流更差。',{happiness:4,stability:-9,risk:4},['risk']),
    T('social_anxiety','社恐','B','独处思考更强，但社交路线明显受限。',{social:-10,intelligence:3},['mind']),
    T('fragile_ego','玻璃心','B','反馈更敏感，创作感受更细，但负面更伤。',{happiness:-8,intelligence:2},['creative']),
    T('overconfident','过度自信','B','敢冲，但更容易把小胜当能力。',{ambition:5,risk:9,stability:-6},['risk','career']),
    T('anxious','慢性焦虑','B','风险意识强，但健康和幸福长期付费。',{stability:3,happiness:-8,health:-4},['body']),
    T('fear_failure','怕失败','B','少踩坑，也更少抓住大机会。',{risk:-7,ambition:-7,stability:4},['wealth']),
    T('workaholic','工作成瘾','B','事业推进快，身体和关系会被透支。',{ambition:9,discipline:5,health:-7,family:-3},['career']),
    T('people_pleaser','讨好型','B','更容易建立关系，却不擅长守边界。',{social:6,family:-5,stability:-3},['social']),
    T('three_minute','三分钟热度','B','开局冲得快，长期执行差。',{ambition:4,discipline:-10},['career']),
    T('face','爱面子','B','社交表现更积极，财务和情绪成本更高。',{social:4,stability:-5,happiness:-2},['social']),
    T('low_desire','低欲望','B','更容易知足，但事业与财富扩张变慢。',{happiness:6,ambition:-10},['family']),
    T('bad_sleep','睡眠差','B','每天都像少了一格电。',{health:-9,happiness:-3},['body']),
    T('perfectionist','完美主义','B','质量高，但效率和幸福感受损。',{discipline:5,intelligence:3,happiness:-7},['mind','career']),
    T('bad_finance','不善理财','B','钱容易从缝里漏掉。',{stability:-10,luck:-2},['risk']),
    T('stubborn_mouth','嘴硬','B','不轻易低头，但家庭与社交成本高。',{stability:3,family:-7,social:-4},['family']),
    T('game_addict','沉迷游戏','B','快乐来得快，时间也消失得快。',{happiness:6,discipline:-9,health:-2},['creative']),
    T('too_careful','过度谨慎','B','极少做大错，也极少押中大机会。',{stability:7,risk:-11,ambition:-3},['wealth']),
    T('reckless','莽撞','B','行动速度快，代价也更随机。',{risk:10,ambition:4,health:-5,stability:-4},['risk']),
    T('carsick','晕车体质','B','远行体验差一点，身体略脆。',{health:-4,happiness:-2},['body']),
    T('lost','路痴','B','探索欲不低，但效率经常被方向感拖累。',{luck:2,discipline:-3},['fortune']),
    T('foodie','吃货','B','幸福感高一点，健康管理更难。',{happiness:6,health:-4},['body']),
    T('internet_addict','网瘾','B','信息很多，专注力更少。',{intelligence:3,discipline:-7,happiness:2},['mind']),
    T('love_brain','恋爱脑','B','关系投入很深，事业与稳定更容易被牵动。',{family:5,happiness:3,ambition:-5,stability:-4},['family']),
    T('moonlight','月光族','B','当下体验不错，财富积累困难。',{happiness:5,stability:-9},['wealth']),
    T('choice_paralysis','选择困难','B','考虑更周全，但机会窗口可能过去。',{intelligence:2,ambition:-4,discipline:-4},['mind']),
    T('hardheaded','犟种','B','认定目标后不回头，错了也不回头。',{discipline:5,stability:2,social:-5},['career']),
    T('slow_warm','慢热','B','长期关系较稳，前期社交吃亏。',{stability:4,social:-5,family:2},['family']),
    T('suspicious','多疑','B','不容易被骗，也不容易完全信人。',{stability:4,social:-6,family:-4},['wealth']),
    T('talkative','话痨','B','社交启动快，但容易把话说过头。',{social:6,stability:-3},['social']),
    T('never_yield','不服输','B','逆风时还能往前冲，也可能死磕错误方向。',{ambition:6,stability:3,risk:3,happiness:-3},['career']),
    T('late_night_king','熬夜冠军','B','夜间产出高，健康持续掉血。',{discipline:3,intelligence:2,health:-8},['body']),
    T('avoid_social','懒得社交','B','省时间，但贵人与关系事件减少。',{discipline:3,social:-8},['mind']),
    T('tilt','容易上头','B','爆发力强，坏结果也更极端。',{risk:9,ambition:4,stability:-7},['risk']),
    T('gambler','赌徒心态','B','更容易押大注；上限高，下限也低。',{risk:13,luck:2,stability:-10},['risk']),
    T('rule_hater','讨厌规则','B','创造性更高，稳定职业适配更差。',{ambition:4,stability:-6,discipline:-3},['creative','risk']),
    T('scattered','散漫','B','心态轻松，但执行力明显不足。',{happiness:4,discipline:-8},['creative']),
    T('stingy','小气','B','钱更难花出去，关系体验更差。',{stability:6,family:-5,social:-3},['wealth']),
    T('rumination','情绪内耗','B','思考很多，行动和幸福都被吃掉。',{intelligence:3,happiness:-9,discipline:-3},['mind']),
    T('fragile_body','身体脆皮','B','更容易生病和受伤。',{health:-12,stability:-2},['body'])
  ];

  L.SYNERGY_SETS={
    wealth:{name:'钱脉',icon:'💰',tiers:[2,4,6],desc:['收入+5%','收入+12%，财富好结果增强','收入+22%，财富好结果大幅增强']},
    mind:{name:'智核',icon:'🧠',tiers:[2,4,6],desc:['学习/判断成功率+5%','成功率+12%','成功率+20%']},
    social:{name:'人脉',icon:'🤝',tiers:[2,4,6],desc:['关系好结果+8%','贵人概率提升','关系与贵人强力增益']},
    body:{name:'强体',icon:'🫀',tiers:[2,4,6],desc:['死亡风险-10%','死亡风险-25%','死亡风险-40%']},
    career:{name:'事业',icon:'🚀',tiers:[2,4,6],desc:['工资+5%','工资+10%','工资+18%']},
    family:{name:'家运',icon:'🏠',tiers:[2,4,6],desc:['伴侣坏事略少','家庭正面事件增加','家族事件显著偏正面']},
    risk:{name:'狂徒',icon:'🎲',tiers:[2,4,6],desc:['极端结果更多','上限与下限同时放大','真正的高波动人生']},
    creative:{name:'灵感',icon:'✨',tiers:[2,4,6],desc:['创作机会增加','稀有事件略增','稀有事件显著增多']},
    fortune:{name:'天运',icon:'🍀',tiers:[2,4,6],desc:['幸运事件+','幸运事件++','好运更容易连续发生']}
  };

  L.ZHOU_CHOICES=[
    ['书卷','📚',['过目不忘','学习机器','工程脑'],{intelligence:6,discipline:3}],
    ['钱币','🪙',['资本加速器','复利本能','现金流意识'],{ambition:6,stability:3}],
    ['工具','🛠️',['工程脑','绝对专注','风险雷达'],{intelligence:5,discipline:5}],
    ['麦克风','🎤',['天生领袖','语言天赋','社交天线'],{social:7,happiness:3}],
    ['小球','⚽',['长寿基因','运动天赋','深度睡眠'],{health:7,stability:3}],
    ['画笔','🎨',['审美天赋','语言天赋','学习机器'],{happiness:5,intelligence:4}],
    ['积木','🧱',['工程脑','绝对专注','学习机器'],{intelligence:6,discipline:4}],
    ['地图','🗺️',['赛道猎手','贵人雷达','危机嗅觉'],{luck:5,risk:3}],
    ['听诊器','🩺',['长寿基因','深度睡眠','情绪韧性'],{health:6,intelligence:3}],
    ['警徽','🛡️',['钢铁意志','谈判本能','情绪韧性'],{stability:6,discipline:4}],
    ['键盘','⌨️',['工程脑','过目不忘','绝对专注'],{intelligence:7,discipline:3}],
    ['相机','📷',['审美天赋','社交天线','贵人雷达'],{social:5,happiness:4}],
    ['乐器','🎸',['审美天赋','语言天赋','情绪韧性'],{happiness:6,social:3}],
    ['棋子','♟️',['危机嗅觉','风险雷达','复利本能'],{intelligence:5,stability:4}],
    ['幸运符','🍀',['贵人雷达','伴侣旺运','危机嗅觉'],{luck:8,happiness:2}]
  ];

  L.LUCK_EVENTS=[
    ['错过一班车反而躲过麻烦',{luck:2,stability:2},0],['旧朋友突然带来机会',{social:4,luck:2},8000],
    ['随手投的简历被关键人物看见',{ambition:3,luck:3},15000],['一次小抽奖居然中了',{happiness:5,luck:1},6000],
    ['遗失的东西被陌生人完整归还',{happiness:4,social:2},0],['临时改计划反而撞上好机会',{luck:4,ambition:2},12000],
    ['一个前辈主动点拨你',{intelligence:4,social:3},0],['市场低迷时你刚好没有重仓',{stability:5,luck:2},10000],
    ['家里旧物意外升值',{happiness:2},18000],['你随手帮的人后来回报了你',{social:4,family:2},10000],
    ['体检意外提前发现小问题',{health:4,luck:2},-3000],['一次旅行认识了重要朋友',{social:5,luck:2},-5000],
    ['老板临时把高曝光项目交给你',{ambition:4,social:2},12000],['房东多年没涨租',{stability:3,happiness:2},8000],
    ['你买到一张极低价的票',{happiness:4,luck:2},3000],['合作方主动给了更好的条件',{social:3,stability:3},16000],
    ['你避开了一场明显的骗局',{stability:5,luck:3},0],['某个作品被意外转发',{social:5,ambition:3},9000],
    ['亲戚突然还了拖欠很久的钱',{family:2,happiness:3},15000],['一场坏天气让你临时在家休息',{health:3,happiness:3},0]
  ];

  L.ENDING_DEFS=[
    ['myth_wealth','神话资本家','SSR',p=>p.wealthPeak>=30000000,'财富峰值跨过三千万。'],
    ['dynasty','家族王朝','SSR',p=>p.generation>=3 || (p.children?.length>=2&&p.wealthPeak>=8000000&&p.stats.family>=80),'财富、关系与传承同时成立。'],
    ['fate_fav','命运宠儿','SSR',p=>p.stats.luck>=95&&p.history.filter(x=>x.kind==='lucky').length>=5,'好运不是一次，而是一整条轨迹。'],
    ['young_genius','天才早逝','SR',p=>p.age<=35&&p.stats.intelligence>=90&&p.score>=850,'人生很短，但密度很高。'],
    ['club27','27俱乐部','SR',p=>p.age===27&&p.score>=650,'你在27岁停下，却留下了足够鲜明的轨迹。'],
    ['comeback','逆风翻盘','SR',p=>p.minWealth<=-100000&&p.wealthPeak>=3000000,'你真的从负数爬回了高位。'],
    ['career_peak','职业顶峰','S',p=>p.careerTierPeak>=5,'职业阶梯走到了顶端。'],
    ['family_full','家运昌盛','S',p=>p.stats.family>=90&&p.spouse&&p.children?.length>=1,'家庭线几乎打出了满分。'],
    ['free_spirit','自由人生','S',p=>p.stats.happiness>=88&&p.wealthPeak>=1000000,'钱够用，选择权也够大。'],
    ['lonely_winner','孤独赢家','A',p=>p.wealthPeak>=5000000&&!p.spouse&&p.stats.family<45,'事业赢得漂亮，关系线却很薄。'],
    ['ordinary_good','平凡而丰盛','A',p=>p.age>=70&&p.stats.happiness>=70&&p.stats.family>=65,'没有神话，但这局活得很完整。'],
    ['survivor','硬核幸存者','A',p=>p.age>=80&&p.history.filter(x=>x.tone==='bad').length>=12,'坏事不少，但你一直没退场。']
  ];
})();