(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.4';

  // V5.4：把开局词条池从 100 个重构到 200 个。
  // 删除 15 个过于惩罚/重复的低阶词条，再新增 115 个，最终精确 200 个。
  const removed=new Set(['procrastinate','anxious','fear_failure','three_minute','bad_sleep','bad_finance','game_addict','reckless','internet_addict','moonlight','choice_paralysis','late_night_king','tilt','gambler','fragile_body']);
  L.TRAITS=L.TRAITS.filter(t=>!removed.has(t.id));

  // 彩色词条高于神话；weight 同时供后续随机掉落使用。
  L.RARITY.P={name:'彩色',weight:1,rank:6};
  Object.assign(L.RARITY,{
    SSS:{name:'神话',weight:1,rank:5},
    SS:{name:'传说',weight:1.133,rank:4},
    S:{name:'史诗',weight:1.244,rank:3},
    A:{name:'稀有',weight:1.067,rank:2},
    B:{name:'普通',weight:.457,rank:1}
  });

  const T=(id,name,rarity,desc,effects={},sets=[],mods={})=>({id,name,rarity,desc,effects,sets,mods});
  const EXTRA=[
    // P +10
    T('prism_world_editor','世界线编辑器','P','关键随机判定更偏向你，坏路线也更容易被改写。',{luck:16,intelligence:10,stability:10},['fortune','mind'],{success:.28,rare:.28,badGuard:.18}),
    T('prism_compound','无限复利','P','长期积累会越来越离谱，越到后期越强。',{discipline:14,ambition:12,stability:10},['wealth','career'],{income:.22,wealthOutcome:.32}),
    T('prism_reverse','逆因果','P','低谷反而更容易触发翻盘窗口。',{luck:14,stability:16,happiness:6},['fortune','career'],{comeback:.48,badGuard:.22}),
    T('prism_kaleidoscope','天赋万花筒','P','多个方向同时获得高额先手，几乎没有明显短板。',{health:7,happiness:7,intelligence:7,social:7,luck:7,ambition:7,stability:7,discipline:7,family:7},['mind','body','social','career','family'],{success:.14,rare:.12}),
    T('prism_evergreen','不老核心','P','健康与寿命判定获得极强优势。',{health:24,stability:10,happiness:6},['body'],{death:.48,badGuard:.12}),
    T('prism_constellation','众星拱月','P','贵人、伴侣和合作关系都更容易站到你这边。',{social:20,luck:12,family:10},['social','family','fortune'],{spouse:.42,rare:.16,success:.1}),
    T('prism_superlearner','超级学习体','P','复杂知识、技能和职业成长速度大幅提升。',{intelligence:22,discipline:16},['mind','career'],{success:.3}),
    T('prism_alchemist','风险炼金术','P','高波动选择更容易把风险换成超额收益。',{risk:14,luck:12,stability:10,ambition:8},['risk','wealth','fortune'],{wealthOutcome:.42,badGuard:.1}),
    T('prism_protagonist','绝对主角','P','人生关键节点出现高质量机会的频率显著提高。',{ambition:18,social:14,luck:12,happiness:8},['career','social','fortune'],{success:.24,rare:.3}),
    T('prism_second_life','第二条命','P','越接近崩盘越难真正出局。',{health:16,stability:18,luck:8},['body','fortune'],{death:.55,comeback:.38,badGuard:.2}),

    // SSS +15
    T('first_mover','先手优势','SSS','总能比大多数人更早看见机会窗口。',{ambition:15,luck:8,intelligence:7},['career','fortune'],{success:.18,rare:.12}),
    T('deep_work','深度工作者','SSS','长时间高质量专注成为稳定优势。',{discipline:16,intelligence:10,stability:8},['mind','career'],{success:.18}),
    T('bayesian','贝叶斯大脑','SSS','能快速修正错误判断，不和旧观点死磕。',{intelligence:16,stability:10,luck:5},['mind','wealth'],{success:.16,badGuard:.1}),
    T('system_builder','系统构建者','SSS','擅长把一次成功变成可重复的流程。',{discipline:14,intelligence:11,ambition:9},['career','mind'],{income:.1,success:.15}),
    T('antifragile','反脆弱','SSS','坏事越多，恢复与翻盘能力越强。',{stability:18,health:8,ambition:6},['body','career'],{badGuard:.18,comeback:.28}),
    T('health_reserve','生命储备','SSS','身体底盘极厚，高龄阶段优势明显。',{health:20,stability:8},['body'],{death:.62}),
    T('charisma_field','领袖气场','SSS','公开表达、谈判和组织协作天然占优。',{social:18,ambition:10,stability:6},['social','career'],{success:.14}),
    T('family_anchor','家庭锚点','SSS','关系冲击很难把家庭线彻底打散。',{family:18,stability:10,happiness:6},['family'],{spouse:.22,badGuard:.08}),
    T('allocator','资本配置者','SSS','对机会成本和资金效率极度敏感。',{intelligence:12,stability:10,ambition:10},['wealth','mind'],{income:.13,wealthOutcome:.22}),
    T('trend_vision','趋势视野','SSS','更容易踩中时代级增长方向。',{luck:10,intelligence:10,ambition:12},['fortune','career'],{rare:.2,success:.12}),
    T('infinite_patience','无限耐心','SSS','能忍受长期无反馈，复利项目不容易中途退出。',{discipline:18,stability:14},['wealth','mind'],{income:.1,success:.12}),
    T('recovery_engine','恢复引擎','SSS','高压之后恢复速度明显快于常人。',{health:14,happiness:10,stability:12},['body'],{badGuard:.14}),
    T('decision_quality','决策质量','SSS','重大节点更少犯不可逆错误。',{intelligence:13,stability:13,discipline:8},['mind','wealth'],{badGuard:.16,success:.12}),
    T('opportunity_magnet','机会磁场','SSS','高价值机会更愿意主动找上门。',{luck:14,social:10,ambition:8},['fortune','social'],{rare:.22}),
    T('elite_network','顶级人脉','SSS','更容易接触到高质量合作与资源。',{social:16,luck:10,ambition:8},['social','career'],{spouse:.18,rare:.14}),

    // SS +20
    T('flow_state','心流体质','SS','进入状态后效率和学习速度显著提升。',{discipline:13,intelligence:9},['mind','career'],{success:.12}),
    T('memory_palace','记忆宫殿','SS','复杂信息整理与长期记忆能力很强。',{intelligence:15,discipline:6},['mind'],{success:.1}),
    T('calm_under_fire','临危不乱','SS','压力越大越不容易做出失控决策。',{stability:16,discipline:7},['body','career'],{badGuard:.14}),
    T('deal_maker','交易高手','SS','谈判、合作与资源交换更有优势。',{social:13,intelligence:7,ambition:6},['social','wealth'],{success:.11,wealthOutcome:.12}),
    T('platform_sense','平台嗅觉','SS','更早感知新平台和流量迁移。',{luck:8,ambition:11,social:6},['creative','fortune'],{rare:.14}),
    T('product_instinct','产品直觉','SS','更容易判断什么东西真正有人愿意买单。',{intelligence:10,social:8,ambition:7},['career','wealth'],{success:.13}),
    T('compounding_skill','技能复利','SS','技能之间更容易互相叠加形成壁垒。',{intelligence:11,discipline:11},['mind','career'],{success:.11}),
    T('energy_manager','精力管理','SS','长期输出时更少透支健康。',{health:12,discipline:9,stability:6},['body','career'],{badGuard:.08}),
    T('social_gravity','社交引力','SS','圈层连接效率极高，陌生合作启动更快。',{social:15,luck:6},['social'],{rare:.1}),
    T('income_engine','收入引擎','SS','稳定收入增长能力明显更强。',{ambition:10,discipline:9,stability:7},['wealth','career'],{income:.14}),
    T('optionalist','选择权思维','SS','更愿意保留现金、能力和退路。',{stability:13,intelligence:8,risk:-2},['wealth','mind'],{badGuard:.11}),
    T('stress_buffer','压力缓冲层','SS','连续坏事件不容易形成连锁崩盘。',{stability:14,happiness:8},['body','family'],{badGuard:.13}),
    T('creative_director','创意总监脑','SS','能把审美、表达和商业目标整合起来。',{intelligence:8,social:9,ambition:7},['creative','career'],{success:.1,rare:.08}),
    T('market_timing','周期感','SS','对过热、低谷和拐点更敏感。',{stability:11,luck:7,intelligence:7},['wealth','fortune'],{wealthOutcome:.15,badGuard:.08}),
    T('mentor_magnet','名师体质','SS','更容易遇到真正能缩短学习路径的人。',{luck:9,social:9,intelligence:6},['mind','social'],{rare:.12}),
    T('habit_stack','习惯叠加','SS','小习惯更容易形成长期复利。',{discipline:14,health:6,stability:5},['mind','body'],{success:.08}),
    T('family_luck','家运旺盛','SS','伴侣、子女和家庭节点更偏正面。',{family:15,luck:6},['family','fortune'],{spouse:.18}),
    T('downside_control','下行保护','SS','极端坏结果出现时更容易守住底线。',{stability:15,luck:5},['wealth','fortune'],{badGuard:.18}),
    T('career_accelerator','职业加速器','SS','升职、转岗和高曝光项目更容易成功。',{ambition:13,social:7,discipline:6},['career'],{success:.13}),
    T('reputation_asset','信誉资产','SS','长期合作和人际信用会不断累积。',{social:11,family:7,stability:7},['social','family'],{success:.08,spouse:.1}),

    // S +30
    T('fast_learner','快速学习','S','新技能的上手成本明显更低。',{intelligence:10,discipline:5},['mind'],{}),
    T('pattern_recognition','模式识别','S','更容易从杂乱信息里抓住规律。',{intelligence:11,stability:4},['mind','wealth'],{}),
    T('quant_mind','量化思维','S','喜欢用数据而不是感觉做判断。',{intelligence:10,stability:6,social:-1},['mind','wealth'],{}),
    T('maker_instinct','造物本能','S','对动手、原型和实际产出有天然兴趣。',{discipline:7,intelligence:7,happiness:3},['creative','career'],{}),
    T('sales_talent','销售天赋','S','能更快理解别人真正关心什么。',{social:11,ambition:6},['social','career'],{}),
    T('storytelling','叙事能力','S','表达观点和塑造影响力更有优势。',{social:9,intelligence:5,happiness:3},['creative','social'],{}),
    T('audience_sense','受众感','S','更容易判断内容和产品会不会被接受。',{social:8,intelligence:6,luck:3},['creative','career'],{}),
    T('negotiator','议价能力','S','涉及价格、薪资和合作条件时更敢争取。',{social:9,stability:6,ambition:4},['social','wealth'],{}),
    T('long_horizon','长期主义','S','愿意为几年后的结果牺牲即时反馈。',{discipline:10,stability:8,happiness:-1},['wealth','career'],{}),
    T('sleep_discipline','睡眠纪律','S','作息稳定，长期健康波动更小。',{health:10,discipline:6},['body'],{}),
    T('pain_tolerance','耐受力','S','面对训练和压力时更能坚持。',{health:7,stability:9},['body','career'],{}),
    T('recovery_habit','恢复习惯','S','懂得休息，不把透支当努力。',{health:9,happiness:6,discipline:4},['body'],{}),
    T('relationship_skill','关系经营','S','更会处理边界、冲突和长期陪伴。',{family:10,social:7,stability:4},['family','social'],{}),
    T('parenting_sense','养育直觉','S','家庭与子女相关事件更稳。',{family:11,stability:5},['family'],{spouse:.06}),
    T('career_map','职业地图','S','更早理解行业、岗位和能力之间的关系。',{ambition:9,intelligence:6,stability:4},['career','mind'],{}),
    T('portfolio_mind','组合思维','S','不喜欢把所有筹码压在单一路线上。',{stability:9,risk:3,intelligence:5},['wealth','risk'],{}),
    T('cash_buffer','现金缓冲','S','更重视安全垫和现金流。',{stability:10,discipline:5,happiness:-1},['wealth'],{}),
    T('opportunity_cost','机会成本意识','S','更擅长拒绝低价值消耗。',{discipline:8,intelligence:7,social:-1},['mind','wealth'],{}),
    T('feedback_loop','反馈回路','S','做完就复盘，错误不容易重复太多次。',{intelligence:8,discipline:8},['mind','career'],{}),
    T('shipping_bias','交付偏好','S','更愿意先做出来，再逐步优化。',{discipline:9,ambition:6,stability:-1},['career','creative'],{}),
    T('network_builder','圈层搭建','S','能主动建立长期的人际网络。',{social:10,discipline:4},['social'],{}),
    T('public_speaking','公开表达','S','面对人群时更稳定。',{social:10,stability:5},['social','career'],{}),
    T('visual_memory','视觉记忆','S','图像、结构和空间信息更容易留下。',{intelligence:9,happiness:3},['mind','creative'],{}),
    T('hand_eye','手眼协调','S','运动和实操路线更顺。',{health:8,discipline:4,intelligence:3},['body','creative'],{}),
    T('travel_adapt','迁徙适应','S','换城市、换环境时恢复更快。',{stability:8,social:5,luck:3},['fortune','social'],{}),
    T('crisis_plan','预案意识','S','习惯提前为坏情况准备第二方案。',{stability:10,intelligence:5},['wealth','mind'],{badGuard:.06}),
    T('selective_risk','选择性冒险','S','只在赔率合适时提高风险敞口。',{risk:6,stability:7,ambition:5},['risk','wealth'],{}),
    T('early_signal','早期信号','S','对趋势变化和异常信息更敏感。',{luck:6,intelligence:7,ambition:4},['fortune','career'],{rare:.05}),
    T('team_player','团队放大器','S','协作时更容易让整体效率提高。',{social:8,discipline:6,family:3},['social','career'],{}),
    T('self_teaching','自学能力','S','没有老师时也能自己搭建学习路径。',{intelligence:10,discipline:7},['mind'],{}),

    // A +30
    T('note_taker','笔记习惯','A','能把零散信息留下来，减少重复学习。',{intelligence:5,discipline:5},['mind'],{}),
    T('calendar_brain','日程脑','A','时间安排更清楚，但随性空间略低。',{discipline:7,stability:4,happiness:-1},['career'],{}),
    T('clean_desk','整理癖','A','环境整洁会让执行更稳定。',{discipline:6,stability:3},['mind'],{}),
    T('walk_habit','散步习惯','A','低成本提升恢复与情绪。',{health:5,happiness:5},['body'],{}),
    T('cook_habit','会做饭','A','健康和现金流都获得一点小优势。',{health:5,stability:4,happiness:2},['body','wealth'],{}),
    T('reading_habit','阅读习惯','A','长期知识输入更稳定。',{intelligence:6,discipline:4},['mind'],{}),
    T('ask_why','爱问为什么','A','更容易追到问题的底层原因。',{intelligence:7,social:-1},['mind'],{}),
    T('tool_user','工具控','A','喜欢用工具减少重复劳动。',{intelligence:5,discipline:5},['career','mind'],{}),
    T('automation_mind','自动化意识','A','重复工作更愿意交给流程。',{discipline:6,intelligence:5},['career'],{}),
    T('small_talk','会寒暄','A','陌生社交启动更顺。',{social:6,happiness:2},['social'],{}),
    T('boundary_sense','边界感','A','更少被无意义的人际消耗。',{stability:6,social:3,family:2},['social','family'],{}),
    T('emergency_fund','应急金习惯','A','遇到意外支出时不容易慌。',{stability:7,discipline:3},['wealth'],{}),
    T('price_sensitive','价格敏感','A','消费更理性，但享受感略低。',{stability:6,happiness:-1},['wealth'],{}),
    T('deal_hunter','会薅羊毛','A','经常能用更低成本解决同样问题。',{stability:4,luck:3,happiness:2},['wealth','fortune'],{}),
    T('routine_exercise','规律活动','A','不追求极限，但能长期保持。',{health:6,discipline:4},['body'],{}),
    T('sunlight','晒太阳','A','情绪和作息略更稳定。',{health:4,happiness:4},['body'],{}),
    T('hydration','记得喝水','A','很普通，但确实有用。',{health:4,discipline:2},['body'],{}),
    T('early_reply','及时回复','A','关系维护成本更低。',{social:5,family:3},['social','family'],{}),
    T('gift_sense','会送礼','A','关键关系节点更容易留下好印象。',{social:5,family:3,stability:-1},['social'],{}),
    T('documenter','记录者','A','长期项目更少因为信息丢失而返工。',{discipline:5,intelligence:4},['career','mind'],{}),
    T('prototype_first','先做原型','A','更愿意用小成本验证想法。',{ambition:5,discipline:5,risk:2},['creative','career'],{}),
    T('side_project','副业意识','A','会主动测试主业之外的小机会。',{ambition:6,risk:3,discipline:3},['career','wealth'],{}),
    T('resume_ready','简历常备','A','机会突然出现时准备更充分。',{ambition:4,stability:4,social:2},['career'],{}),
    T('mentor_seeker','主动找前辈','A','愿意向更强的人请教。',{social:5,intelligence:4},['social','mind'],{}),
    T('language_practice','语言练习','A','沟通面逐渐变宽。',{social:5,intelligence:4},['social'],{}),
    T('photo_eye','构图感','A','视觉表达更舒服。',{happiness:4,intelligence:3,social:2},['creative'],{}),
    T('music_habit','音乐习惯','A','情绪恢复更快一点。',{happiness:6,stability:2},['creative'],{}),
    T('low_drama','不爱折腾','A','生活波动较小，但爆发机会也略少。',{stability:7,risk:-3,ambition:-1},['family'],{}),
    T('curated_feed','信息筛选','A','更少被垃圾信息占据注意力。',{discipline:5,intelligence:4},['mind'],{}),
    T('one_thing','一次只做一件事','A','多任务更少，完成率更高。',{discipline:7,stability:3},['mind','career'],{}),

    // B +10
    T('late_bloomer','大器晚成','B','前期表现普通，后期更能沉住气。',{ambition:-2,stability:6,discipline:3},['career'],{}),
    T('contrarian','有点逆反','B','不爱随大流，偶尔因此错过共识机会。',{risk:4,intelligence:3,social:-3},['creative','risk'],{}),
    T('comfort_seeker','舒适区偏好','B','幸福感稳定，但扩张欲望偏低。',{happiness:5,ambition:-5,risk:-2},['family'],{}),
    T('hyperfocus','偶发超专注','B','感兴趣时爆发很强，不感兴趣时效率一般。',{discipline:3,intelligence:4,stability:-2},['mind'],{}),
    T('frugal_extreme','极简消费','B','能存钱，但生活体验会打折。',{stability:6,happiness:-4},['wealth'],{}),
    T('debate_love','爱抬杠','B','思辨能力不错，人际摩擦也更多。',{intelligence:4,social:-4,stability:1},['mind','social'],{}),
    T('solo_bias','单干偏好','B','个人效率不错，团队路线受限。',{discipline:4,social:-5,intelligence:2},['mind'],{}),
    T('novelty_chaser','喜新厌旧','B','探索新事物很快，长期坚持较弱。',{luck:3,risk:4,discipline:-5},['fortune','risk'],{}),
    T('status_sensitive','在意排名','B','竞争动力强，幸福感更容易被比较影响。',{ambition:5,happiness:-4,social:2},['career'],{}),
    T('slow_decision','决定偏慢','B','错误率略低，但机会成本更高。',{stability:4,ambition:-3,intelligence:2},['wealth'],{})
  ];
  L.TRAITS.push(...EXTRA);

  // 一次“再 Roll 一次”会同时给 5 个词条。若按每格 5%，整手出现彩色会变成约 22.6%，
  // 会让无限重抽很快失去稀有感。因此这里把“5%”定义为：每整次开局 Roll 约 5% 出现 1 个彩色。
  // 其余 95% 的 Roll 不出彩色；非彩色内部显著抬高 S/SS/SSS，压低 B。
  A.rollTraits=n=>{
    let pool=[...L.TRAITS],out=[];
    const prism=pool.filter(t=>t.rarity==='P');
    if(n>0&&prism.length&&Math.random()<.05){
      const t=L.pick(prism);
      out.push(t);
      pool=pool.filter(x=>x.id!==t.id&&x.rarity!=='P');
    }else{
      pool=pool.filter(x=>x.rarity!=='P');
    }
    while(out.length<n&&pool.length){
      const t=A.weightPick(pool.map(x=>({...x,_w:L.RARITY[x.rarity]?.weight||1})));
      const original=L.TRAITS.find(x=>x.id===t.id);
      if(original)out.push(original);
      pool=pool.filter(x=>x.id!==t.id);
    }
    // 彩色不固定在第一格，避免位置泄露稀有度。
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
    return out;
  };

  L.TRAIT_POOL_SIZE=L.TRAITS.length;
  if(L.TRAIT_POOL_SIZE!==200)console.warn('[Life-on-Stage] V5.4 trait pool expected 200, got',L.TRAIT_POOL_SIZE);
})();
