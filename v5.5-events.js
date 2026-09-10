(() => {
  const A=window.APP,L=window.LIFE;
  L.VERSION='V5.5';

  // 属性正式扩展到 0-200。100 不再是硬墙，而是“已经很强”的分水岭；
  // 120/150/180 之后越来越难堆，200 只给极端构筑留下理论封顶。
  L.clamp=(n,min=0,max=200)=>Math.max(min,Math.min(max,n));
  A.clampStats=p=>Object.keys(p.stats||{}).forEach(k=>p.stats[k]=L.clamp(Math.round(p.stats[k]),0,200));

  L.ATTR_ICONS={
    health:'❤️',happiness:'☀️',intelligence:'🧠',social:'🗣️',luck:'🍀',
    ambition:'🔥',stability:'🛡️',discipline:'⏱️',risk:'🎲',family:'🏠'
  };
  const scaleTip='属性尺度：100 已经很强，120 属于明显优势，150 是少数人级别，180 接近离谱构筑，200 为理论封顶。';
  Object.values(L.ATTR||{}).forEach(x=>{if(x&&!String(x.tip||'').includes('属性尺度'))x.tip=`${x.tip||''} ${scaleTip}`.trim()});

  A.statLevel=v=>v>=200?'封顶':v>=180?'屌炸了':v>=150?'顶级':v>=120?'很强':v>=100?'厉害':v>=75?'优秀':v>=50?'普通':v>=30?'吃紧':'危险';

  // 主事件库二次年龄审计。原始事件本身已有 minAge/maxAge，这里再加语义护栏，
  // 防止后续新增事件忘填年龄后出现“8岁创业 / 78岁参加班级运动会”之类穿帮。
  const adultWords=/创业|融资|上班|公司|职场|老板|工资|升职|跳槽|裁员|房贷|买房|结婚|离婚|相亲|生育|投资|股票|基金|杠杆|退休|管理层|合伙人/;
  const childWords=/幼儿园|小学|班主任|同桌|校内|作业|家长会|零花钱|玩具|过家家|抓周|少先队|校服/;
  const teenWords=/中考|高考|早恋|社团招新|晚自习|班级|青春期/;
  A.ageCompatible=(e,age=A.p?.age||0)=>{
    if(!e)return false;
    if(Number.isFinite(e.minAge)&&age<e.minAge)return false;
    if(Number.isFinite(e.maxAge)&&age>e.maxAge)return false;
    const text=`${e.category||''} ${e.title||''} ${e.desc||''}`;
    if(age<13&&adultWords.test(text))return false;
    if(age<18&&/(融资|房贷|买房|结婚|离婚|退休|公司高管|管理层|重仓|杠杆)/.test(text))return false;
    if(age>22&&(childWords.test(text)||teenWords.test(text)))return false;
    if(age>=65&&/(校招|实习生|第一份工作|高考|大学在读|班主任|同桌|家长会)/.test(text))return false;
    if(age>=80&&/(裸辞|考研|校园|宿舍|校招)/.test(text))return false;
    return true;
  };
  const eligibleBase=A.eventEligible;
  A.eventEligible=e=>eligibleBase(e)&&A.ageCompatible(e);

  A.ageWeight=e=>{
    const age=A.p?.age||0,c=e.category||'',t=`${e.title||''} ${e.desc||''}`;
    let w=1;
    if(age<7){w=/家庭|生活|成长/.test(c)?1.7:.2;}
    else if(age<13){w=/成长|教育|家庭|社交/.test(c)?1.55:/职业|投资|财富/.test(c)?.08:.75;}
    else if(age<18){w=/教育|成长|社交|家庭/.test(c)?1.55:/投资|创业|职业/.test(c)?.18:.85;}
    else if(age<25){w=/教育|职业|成长|社交|恋爱/.test(c+t)?1.35:/家庭/.test(c)?1.05:1;}
    else if(age<45){w=/职业|家庭|投资|财富|健康|社交/.test(c)?1.22:1;}
    else if(age<65){w=/职业|家庭|健康|财富|投资/.test(c)?1.25:/教育/.test(c)?.35:1;}
    else if(age<80){w=/健康|家庭|生活|社交|财富/.test(c)?1.38:/职业|创业/.test(c)?.42:.9;}
    else {w=/健康|家庭|生活|社交/.test(c)?1.55:/职业|创业|教育/.test(c)?.12:.72;}
    return w;
  };

  // Fallback 也必须服从年龄段，不再拿同一组成人选项覆盖整个人生。
  const F=(id,category,title,desc,effects={},special={})=>({id,category,title,desc,effects,special});
  A.fallbacks=()=>{
    const age=A.p?.age||0;
    if(age<7)return[
      F('fb_kid_story','童年','缠着大人再讲一遍故事','你明明已经会背了，还是坚持听到最后。',{intelligence:3,happiness:4,family:3}),
      F('fb_kid_blocks','童年','把积木拆了又搭','最后作品像一栋违建，但你非常满意。',{intelligence:3,discipline:2,happiness:4}),
      F('fb_kid_run','童年','在楼下疯跑一下午','膝盖蹭破一点皮，晚上倒头就睡。',{health:4,happiness:4}),
      F('fb_kid_draw','童年','拿纸乱画一整天','大人没看懂，你坚称这是“作品”。',{intelligence:2,happiness:5}),
      F('fb_kid_help','家庭','一本正经地帮大人做事','效率很低，但家庭气氛意外不错。',{family:5,discipline:2})
    ];
    if(age<13)return[
      F('fb_school_read','成长','迷上一套课外读物','你开始拥有只属于自己的小世界。',{intelligence:4,happiness:3}),
      F('fb_school_ball','成长','放学后去运动','汗出了一身，回家饭都多吃半碗。',{health:5,social:3}),
      F('fb_school_friend','社交','和朋友混一下午','什么大事都没发生，但童年本来就不全靠大事组成。',{social:5,happiness:4}),
      F('fb_school_hobby','成长','认真折腾一个新爱好','成果一般，兴趣是真的。',{intelligence:3,discipline:3,happiness:3}),
      F('fb_school_home','家庭','帮家里做点事','你第一次发现大人每天也有一堆重复任务。',{family:5,discipline:3})
    ];
    if(age<18)return[
      F('fb_teen_study','教育','把一个薄弱科目补起来','过程不爽，但成绩终于不像开盲盒。',{intelligence:5,discipline:4,happiness:-1}),
      F('fb_teen_sport','健康','坚持运动一阵','体能上来了，自拍角度也突然讲究起来。',{health:5,happiness:3,discipline:2}),
      F('fb_teen_friend','社交','和朋友聊到很晚','很多当时觉得天大的问题，第二天看也就那样。',{social:5,happiness:4}),
      F('fb_teen_skill','成长','学一个学校不教的东西','你第一次感到“我也可以自己点技能树”。',{intelligence:4,discipline:4,ambition:2}),
      F('fb_teen_family','家庭','难得和家里好好说话','没有鸡汤，只是少了一点互相猜。',{family:6,stability:3})
    ];
    if(age<25)return[
      F('fb_young_skill','成长','补一项能直接拿来用的技能','你开始从“知道”变成“能做”。',{intelligence:5,discipline:4}),
      F('fb_young_network','社交','主动认识新圈子','有几场尬聊，也真的认识了两三个有意思的人。',{social:5,luck:2}),
      F('fb_young_work','职业','认真做完一个能写进简历的项目','过程很班味，成果倒是能留下。',{discipline:5,ambition:4,health:-1}),
      F('fb_young_trip','生活','去陌生地方走几天','钱包轻了一点，脑子倒是清空了一些。',{happiness:6,social:2},{wealth:-6000}),
      F('fb_young_save','财富','开始给自己留应急金','没有暴富，但以后遇事不至于先看花呗。',{stability:6,discipline:3},{wealth:8000})
    ];
    if(age<60)return[
      F('fb_adult_rest','生活','给自己放一个真正的假','你暂时把“应该做什么”从脑子里请了出去。',{happiness:6,health:3,ambition:-1}),
      F('fb_adult_skill','成长','继续补一项长期技能','没有立刻变现，但能力树往外长了一截。',{intelligence:4,discipline:3}),
      F('fb_adult_network','社交','主动维护几个重要关系','通讯录没变长，但有效联系人变多了。',{social:5,family:2}),
      F('fb_adult_save','财富','把现金流重新梳理一遍','砍掉几个没必要的支出，钱包终于不再漏风。',{stability:5,happiness:-1},{wealth:10000}),
      F('fb_adult_family','家庭','认真陪家人一段时间','工作不会因为少看一晚群消息就倒闭，家人倒是记住了。',{family:6,happiness:3,ambition:-1}),
      F('fb_adult_sport','健康','重新把运动排进日程','前几次像受刑，后来身体开始给正反馈。',{health:5,discipline:3,happiness:2})
    ];
    if(age<75)return[
      F('fb_mid_walk','健康','把散步变成固定习惯','你开始发现，能稳定走路也是一种长期资产。',{health:4,happiness:3}),
      F('fb_mid_family','家庭','多陪家人吃几顿饭','饭桌上没有宏大叙事，但关系就是这么一点点续上的。',{family:6,happiness:3}),
      F('fb_mid_hobby','生活','捡回一个年轻时喜欢的爱好','技术没当年快，乐趣倒没打折。',{happiness:6,intelligence:2}),
      F('fb_mid_money','财富','把资产和开支重新盘一遍','你开始更在意“不出大错”而不是每年赢麻。',{stability:6,discipline:3}),
      F('fb_mid_mentor','社交','给年轻人讲讲踩过的坑','对方听进去多少不知道，你自己倒是复盘明白了。',{social:4,intelligence:3,happiness:2})
    ];
    return[
      F('fb_old_walk','健康','天气不错，出去慢慢走一圈','速度不重要，能自己决定往哪走就很好。',{health:3,happiness:4}),
      F('fb_old_family','家庭','等家里人来坐一会儿','几句闲话，比很多年轻时追过的东西更耐放。',{family:6,happiness:4}),
      F('fb_old_hobby','生活','继续折腾自己的小爱好','别人看着没用，你玩得很认真。',{happiness:6,stability:3}),
      F('fb_old_story','成长','把旧照片和往事整理出来','你发现自己已经拥有一整套别人没经历过的历史。',{intelligence:2,family:4,happiness:3}),
      F('fb_old_social','社交','和老朋友联系一下','话题从理想聊到血压，再从血压绕回年轻时。',{social:4,happiness:4})
    ];
  };

  const M=(id,minAge,maxAge,title,text,effects={},wealth=null,weight=1,opts={})=>({id,minAge,maxAge,title,text,effects,wealth,weight,...opts});
  L.MICRO_EVENTS=[
    // 童年 3-12
    M('m_kid_mud',3,10,'👟 新鞋第一天就踩进泥坑','你出门前被叮嘱了三遍“别弄脏”，十分钟后两只鞋已经完成了从新品到考古文物的转变。',{happiness:-1,family:-1},[-80,-20],1.1),
    M('m_kid_vase',4,11,'🏺 你打碎了家里的东西','屋里突然安静得像服务器宕机。你决定先研究一下，到底坦白和装死哪个生存率更高。',{stability:2,family:-2},[-300,-50],.9),
    M('m_kid_cat',5,12,'🐈 一只流浪猫跟了你一路','你蹲在路边陪它很久，最后没能带回家，但那天回去以后心情莫名很好。',{happiness:5,family:1},null,1.2),
    M('m_kid_tooth',5,10,'🦷 一颗乳牙突然掉了','你对着镜子研究缺口半天，并认真怀疑自己是不是开始“掉零件”。',{happiness:2,intelligence:1},null,1),
    M('m_kid_wrong_homework',7,12,'📚 作业写得很认真，写错页了','你自信满满交上去，老师翻了两页沉默了。努力是真的，方向也是真的错了。',{discipline:2,happiness:-2},null,.9),
    M('m_kid_prank',7,12,'😂 你成了班里一天的笑点','一个小失误被同学反复玩梗。当天很想钻地缝，过几个月你自己讲得比谁都起劲。',{social:2,happiness:-2,stability:2},null,.75,{chaos:true}),
    M('m_kid_award',7,12,'🏅 莫名其妙拿了个小奖','你原本没抱希望，结果名字真被念到了。回家以后奖状被贴在了一个非常显眼的位置。',{happiness:5,ambition:2,family:2},[50,300],.8),
    M('m_kid_rain',6,12,'🌧️ 放学遇上暴雨','你和几个同学一路踩水回家，袜子彻底报废，但这段路后来居然记了很多年。',{health:-1,happiness:4,social:3},[-100,-20],1),

    // 少年 13-17
    M('m_teen_phone',13,17,'📱 手机被老师暂时收走','你那一刻感觉半个互联网都离你而去。晚上拿回来以后，未读消息其实也没几条。',{discipline:2,happiness:-3},null,.9),
    M('m_teen_confess',13,17,'💌 一条消息发错了人','本来只想发给一个朋友看，结果手一滑发给了当事人。空气凝固了三秒，你的人生喜剧浓度上升了。',{social:2,happiness:-2,stability:2},null,.55,{chaos:true}),
    M('m_teen_group',13,17,'🧑‍🤝‍🧑 小组作业进入经典剧情','四个人建了群，三个人说“收到”，最后你和另一个人把活干完。你第一次理解什么叫组织成本。',{discipline:4,social:-1,intelligence:2},null,1),
    M('m_teen_ankle',13,17,'🏀 运动时把脚崴了','上一秒还在耍帅，下一秒开始单脚蹦。好消息是没大事，坏消息是同学笑得很大声。',{health:-5,happiness:-1,stability:1},[-900,-100],.7,{chaos:true}),
    M('m_teen_rank',13,17,'📈 一次成绩突然冲高','你自己都没想到能到这个位置。短暂的爽感之后，新的问题变成了“下次还能不能守住”。',{intelligence:4,ambition:4,happiness:3},null,.75),
    M('m_teen_meme',13,17,'🫠 你的表情包在同学群流传','某张抓拍被做成了表情包，传播速度比你的任何正式发言都快。你失去了一点形象，获得了一点群众基础。',{social:4,happiness:-1},null,.45,{chaos:true}),
    M('m_teen_bus',13,17,'🚌 坐过站了','你低头看手机，一抬头发现窗外完全不认识。人生第一次小型“世界线偏移”就这么发生了。',{intelligence:1,happiness:-1,stability:2},[-30,-5],.9),
    M('m_teen_parttime',15,17,'💵 临时帮人干了一天活','钱不多，但这是少数完全由你自己换来的收入。拿到手的时候比数字本身更有感觉。',{ambition:3,discipline:2},[100,800],.65),

    // 青年 18-29
    M('m_young_roommate',18,27,'🍲 室友煮火锅把电闸干掉了','锅刚开，整屋黑屏。几个人打着手机灯研究配电箱，场面像一个预算极低的灾难片。',{happiness:3,social:3},[-200,-30],.7,{chaos:true}),
    M('m_young_salary',18,29,'💸 工资刚到，钱包先开始膨胀','到账那一刻你觉得自己经济独立了；几天以后账单提醒你，独立主要体现在“自己负责”。',{happiness:2,stability:-2},[-2500,-300],1),
    M('m_young_delivery',18,35,'📦 快递送错楼栋','你绕了半个小区找包裹，最后发现对方也在找你。两个人见面时都像完成了一次支线任务。',{happiness:-1,social:2},[-50,0],1),
    M('m_young_course',18,32,'🎓 差点被“速成课”收割','广告写着七天逆袭、月入过万，你看到付款页突然恢复了理智。今天没赚到钱，但成功保住了钱。',{intelligence:3,stability:3},null,.65,{chaos:true}),
    M('m_young_bike',18,40,'🚲 路边突然杀出一辆电动车','你们都觉得对方会让，事实证明双方都高估了默契。人没大事，膝盖和钱包各自表达了意见。',{health:-6,stability:-1},[-1800,-200],.65,{chaos:true}),
    M('m_young_car',18,65,'🚗 出门真的被车蹭了','这波属于人在路边走，剧情从天上来。幸好不是大事故，但医院检查、误工和修东西加起来一点都不好笑。',{health:-10,happiness:-3,stability:-2},[-12000,-1200],.34,{chaos:true,severe:true}),
    M('m_young_wrong_chat',18,45,'💬 吐槽老板发进了工作群','消息发出去的一瞬间，你的灵魂完成了短暂离体。撤回成功，但“对方正在输入…”持续了很久。',{social:-3,happiness:-5,stability:3},null,.28,{chaos:true,when:p=>p.tags?.includes('上班族')}),
    M('m_young_ai',18,45,'🤖 你让 AI 帮忙，结果它一本正经地胡说','你差点直接复制提交，最后一眼发现不对。命运给了你一个 404，好在你点了返回。',{intelligence:3,discipline:2,happiness:-1},null,.55,{chaos:true}),
    M('m_young_friend',18,35,'🍜 老朋友突然约你吃夜宵','本来只说坐半小时，最后聊到店家开始收椅子。有些关系不需要高频，但需要偶尔续命。',{social:4,happiness:5},[-600,-80],1.05),
    M('m_young_bonus',20,35,'💰 一笔意外奖金到账','金额没到改变人生的程度，但足够让你当天走路姿势稍微嚣张一点。',{happiness:4,ambition:2},[1000,12000],.6),
    M('m_young_phone_water',18,40,'📱 手机掉进了不该掉的地方','你盯着它沉下去的那一刻，脑子里依次闪过照片、聊天记录、余额和“我为什么没买保险”。',{happiness:-5,stability:-2},[-6500,-800],.4,{chaos:true}),
    M('m_young_interview',18,30,'👔 面试官突然问了个完全没准备的问题','你沉默两秒后硬着头皮往下答。结果未必完美，但你第一次发现临场反应也能练出来。',{social:3,stability:3,intelligence:2},null,.9),

    // 成年 30-49
    M('m_adult_appliance',30,60,'🧯 家电在最忙的时候坏了','它早不坏晚不坏，精准挑在你最没空的时候宣布退休。你开始理解成年人为什么会对保修期有感情。',{happiness:-3,stability:1},[-9000,-800],1),
    M('m_adult_parent_call',30,55,'☎️ 家里一个电话把你叫了回去','事情最后不算严重，但你第一次明显意识到：以前是你出事找家里，现在方向开始反过来了。',{family:4,happiness:-2,stability:2},[-5000,-500],.85),
    M('m_adult_car',30,65,'🚙 停车场发生低速碰撞','速度不快，流程很长。你花了一下午证明成年人最贵的不只是维修费，还有被浪费掉的时间。',{happiness:-3,stability:2},[-10000,-1000],.72,{chaos:true}),
    M('m_adult_meeting',30,60,'🧑‍💼 一个会开了两个小时','最后结论是“下周再同步”。你的身体还在会议室，灵魂已经申请居家办公。',{happiness:-4,discipline:1,stability:1},null,.7,{chaos:true,when:p=>p.tags?.includes('上班族')}),
    M('m_adult_kid_wall',30,50,'🖍️ 家里一面墙遭遇艺术创作','孩子把墙当成了巨型画布。你在“教育一下”和“这构图还行”之间反复横跳。',{family:3,happiness:1,stability:-1},[-1500,-200],.55,{chaos:true,when:p=>(p.children?.length||0)>0}),
    M('m_adult_spouse_order',25,60,'📦 伴侣买的东西陆续到家','你问“这是什么”，对方回答“很便宜”。最终你发现便宜是一种单件商品概念，不是总额概念。',{family:1,happiness:2,stability:-2},[-3500,-300],.45,{chaos:true,when:p=>!!p.spouse}),
    M('m_adult_oldfriend',30,55,'🍵 多年没见的朋友重新联系','开头还有点客气，十分钟后又回到了以前互相损的语气。时间改变很多东西，也留下了一些东西。',{social:5,happiness:4},null,.85),
    M('m_adult_checkup',35,60,'🩺 体检报告多了几个箭头','医生说“先别紧张”，你看到这四个字反而更紧张。最后大多是生活方式问题，但身体已经开始认真记账。',{health:-3,discipline:3,stability:1},[-2500,-300],.8),
    M('m_adult_refund',25,55,'💳 一笔以为拿不回来的退款到账','你已经把它当沉没成本了，结果突然收到退款通知。电子功德到账，今天客服像赛博菩萨。',{happiness:4,luck:2},[300,5000],.45,{chaos:true}),
    M('m_adult_scam',30,65,'📞 接到一通非常专业的诈骗电话','对方知道的信息多得让你发毛，但最后一个细节露了馅。你挂掉电话以后顺手把家里人的反诈意识也更新了一遍。',{intelligence:3,stability:3,family:2},null,.48,{chaos:true}),
    M('m_adult_pet',28,60,'🐕 朋友临时把宠物托给你','你原本只答应照看两天，第二天已经开始给它拍几十张照片。',{happiness:5,family:2},[-500,-80],.65),
    M('m_adult_sidewin',25,50,'🧾 一个不起眼的小机会真的赚到钱了','不是暴富，只是一次很清晰的正反馈：原来除了固定工资，世界上还有别的进账方式。',{ambition:4,stability:2},[1500,18000],.55),

    // 中老年 50-69
    M('m_mid_reunion',50,69,'🍻 同学聚会重新见到一群旧人','有人聊孩子，有人聊工作，有人已经开始比较血脂。你突然发现年轻时的排名早就换了计分板。',{social:4,happiness:2,stability:3},[-2000,-300],.85),
    M('m_mid_glasses',48,70,'👓 手机字体又调大了一档','你嘴上说是软件 UI 做得太小，手指却非常熟练地把字体调到了“大”。',{happiness:-1,stability:2},[-1500,-200],.75,{chaos:true}),
    M('m_mid_back',45,69,'🪑 弯腰捡东西时腰先发表意见','东西是捡起来了，你本人直起来花了更久。身体用最朴素的方式提醒你版本号已经更新。',{health:-4,happiness:-2},[-1800,-200],.7,{chaos:true}),
    M('m_mid_travel',50,69,'🧳 一次临时起意的短途旅行','你没赶景点，也没追效率，只是在陌生地方慢慢晃。年轻时觉得浪费，现在觉得正好。',{happiness:6,health:2,social:2},[-5000,-1000],.8),
    M('m_mid_child_call',50,69,'📞 孩子突然主动打来很久的电话','开头只是问个小事，最后聊了很久。你挂断以后没有立刻做别的，只是坐了一会儿。',{family:7,happiness:5},null,.65,{when:p=>(p.children?.length||0)>0}),
    M('m_mid_market',45,69,'📉 朋友群突然开始集体聊投资','平时不说话的人都出来发表观点。你看着满屏“这次不一样”，突然觉得历史可能真的挺有幽默感。',{intelligence:2,stability:3,risk:-1},null,.4,{chaos:true}),
    M('m_mid_teeth',50,72,'🦷 一颗牙开始反复闹脾气','你终于理解牙医为什么总说“早点来”。晚来的账单比早来的提醒有说服力得多。',{health:-3,happiness:-2},[-9000,-1200],.65),
    M('m_mid_neighbor',50,74,'🧑‍🤝‍🧑 邻居请你帮了个忙','事情不大，来回几次以后反而熟了。中年以后新朋友少，但并不是绝迹。',{social:4,happiness:2},null,.75),

    // 老年 65+
    M('m_old_square',65,90,'🔊 楼下广场舞音响今天火力全开','你本来想安静散步，结果被迫听完三首。最后身体非常诚实地跟着踩了几下拍子。',{happiness:3,health:2,social:2},null,.65,{chaos:true}),
    M('m_old_egg',65,88,'🥚 路边“扫码领鸡蛋”吸引了一群人','你围观五分钟，看完套路后转身走了。鸡蛋没领，个人信息保住了。',{intelligence:2,stability:3},null,.55,{chaos:true}),
    M('m_old_bus',65,85,'🚌 追公交追了二十米','车最后停下等你，你上车后决定装作刚才那段冲刺非常轻松。心肺系统对此持保留意见。',{health:-2,happiness:2,stability:1},null,.5,{chaos:true}),
    M('m_old_grandchild',65,95,'📱 收到晚辈一长串语音','前几条都是废话，最后一句“想你了”把前面的废话全部变得很值。',{family:7,happiness:6},null,.8,{when:p=>(p.children?.length||0)>0}),
    M('m_old_hospital',65,95,'🏥 一次复查虚惊一场','检查前一晚你想了很多，结果医生说问题不大。走出医院那一刻，外面的普通天气都显得不错。',{health:-1,happiness:4,stability:5},[-3500,-500],.75),
    M('m_old_hearing',70,95,'🎧 蓝牙设备突然自己连上了电视','你研究半天终于搞定，并拒绝承认刚才有那么十分钟完全不知道声音去哪了。',{intelligence:2,happiness:2},null,.5,{chaos:true}),
    M('m_old_oldfriend',65,95,'☎️ 和一个认识几十年的老朋友通话','你们说话已经不需要铺垫。聊到最后谁也没说“珍重”，但双方都知道那两个字在。',{social:5,happiness:5,stability:3},null,.85),
    M('m_old_fall',68,95,'🩹 在家里结结实实摔了一跤','没有影视剧里的慢镜头，只有落地以后那句非常现实的“嘶——”。好在检查后没有大伤。',{health:-8,happiness:-3,stability:-1},[-7000,-800],.48,{chaos:true,severe:true}),
    M('m_old_birthday',80,105,'🎂 生日突然来了很多人','你自己没觉得这数字有什么神奇，但大家像完成隐藏成就一样高兴。你只负责吃蛋糕和被拍照。',{family:8,happiness:7,social:3},[0,2000],.85),
    M('m_old_news',75,100,'📰 你看到一个“年轻人正在流行”的新闻','你认真看完，发现所谓新东西自己几十年前好像见过一个低配版。时代在循环，只是 UI 换了。',{intelligence:3,stability:3,happiness:2},null,.55,{chaos:true}),

    // 跨年龄低频荒诞 / 意外
    M('m_any_bird',8,90,'🐦 天上精准掉下来一坨东西','附近那么大一片地，它偏偏选中了你。概率论今天没有站在你这边，路人倒是忍得很辛苦。',{happiness:-4,luck:-1,stability:1},[-100,-10],.22,{chaos:true}),
    M('m_any_lottery',18,85,'🎫 随手买的一张小票居然中了','不是财务自由，只够让你在收银台前多确认两遍。今天运气确实上线了一会儿。',{luck:2,happiness:4},[200,6000],.22,{chaos:true}),
    M('m_any_dog',10,80,'🐕 被一只没拴好的狗追了半条街','你跑出了近期最好成绩。主人道歉得很诚恳，你的心率也很诚恳。',{health:-2,stability:2,happiness:-2},[-300,-30],.3,{chaos:true}),
    M('m_any_elevator',12,85,'🛗 电梯短暂停住了','灯没灭，但那几十秒足够让所有人同时放下手机。恢复以后，大家又默契地继续低头。',{stability:2,happiness:-1,social:1},null,.3,{chaos:true}),
    M('m_any_wallet',15,82,'👛 你捡到一个钱包','里面东西不少。你最后想办法还给了失主，对方反复道谢，你那天心情也跟着亮了一点。',{happiness:4,stability:3,luck:1},[0,300],.38),
    M('m_any_umbrella',8,85,'☔ 出门时天气预报说不下雨','事实证明天气预报只是提出了一个观点。你被浇透以后，决定以后对“降水概率”多一点敬畏。',{health:-1,happiness:-2},[-100,-10],.5,{chaos:true})
  ];

  A.pickMicroEvent=()=>{
    const p=A.p,age=p?.age||0;
    const pool=L.MICRO_EVENTS.filter(e=>age>=e.minAge&&age<=e.maxAge&&(!e.when||e.when(p)));
    if(!pool.length)return null;
    const recent=new Set((p.history||[]).slice(0,18).map(h=>h.microId).filter(Boolean));
    const weighted=pool.map(e=>({...e,_w:(e.weight||1)*(recent.has(e.id)?.18:1)}));
    return A.weightPick(weighted);
  };
})();