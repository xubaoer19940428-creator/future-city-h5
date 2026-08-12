export const FIRST_TIMELINE_YEAR = 2009
export const LAST_TIMELINE_YEAR = 2026
export const TIMELINE_PLACEHOLDER_IMAGE = '/assets/timeline-event-placeholder.webp'

// A month stays as one timeline node. Use createEventItem when its copy blocks
// need different images; the legacy string-array form remains valid.
// createEvent('7月', [
// 	createEventItem('第一段事件描述', '/assets/timeline/2026-07-1.webp'),
// 	createEventItem('第二段事件描述', '/assets/timeline/2026-07-2.webp'),
// ])
const createEventItem = (description, image) => ({ description, image })

const createEvent = (label, entries, image) => ({
	label,
	items: entries.map((entry, index) => (typeof entry === 'string' ? createEventItem(entry, index === 0 ? image : undefined) : entry)),
})

export const timelineContent = [
	{
		year: 2009,
		title: '原点',
		subtitle: '未来科学城的故事，从这一年开始。',
		events: [
			createEvent('7月28日', ['中组部、国务院国资委、北京市政府共同启动中央企业人才创新创业基地建设，以未来科技城命名。'], '/assets/timeline/2009-0728.webp'),
			createEvent('8月21日', ['北京未来科技城开发建设有限公司（未来科学城集团前身）正式成立，注册资本金4亿元，与未来科技城建设现场指挥部合署办公。'], '/assets/timeline/2009-0821.webp'),
			createEvent('10月', ['《未来科技城总体规划及北区街区控制性详细规划》取得批复。'], '/assets/timeline/2009-10.webp'),
			createEvent('11月', ['公司首个拆迁项目土沟村启动拆迁工作。']),
		],
	},
	{
		year: 2010,
		title: '奠基',
		subtitle: '蓝图落定，未来可期。',
		events: [createEvent('3月', ['《未来科技城概念性设计》编制完成，确定“创新、开放、低碳、人本、共生”五大核心理念。']), createEvent('5月', ['《未来科技城控制性详细规划》获批，规划总用地面积10平方公里。'], 'assets/timeline/2010-05.webp'), createEvent('12月', ['未来科学城路桥启动建设。'])],
	},
	{
		year: 2011,
		title: '扎根',
		subtitle: '从规划图纸到土地，落地生根。',
		events: [createEvent('7月', ['土沟村、鲁疃村、北七家村、岭上村共计2000余宗宅基地完成拆迁工作。']), createEvent('9月', ['公司首个招拍挂二级项目未来视界拿地成交。'])],
	},
	{
		year: 2012,
		title: '安家',
		subtitle: '第一批居民，第一次回家。',
		events: [createEvent('5月', ['未来科学城东路桥启动建设。']), createEvent('11月', ['土沟村定向安置房完成交房。'], 'assets/timeline/2012-11.webp'), createEvent('12月', ['鲁疃、岭上、北七家安置房项目主体结构基本完工。'])],
	},
	{
		year: 2013,
		title: '生长',
		subtitle: '骨架拉开，脉络初成。',
		events: [createEvent('7月', [createEventItem('《北京未来科技城核心区控制性详细规划》获批。', '/assets/timeline/2013-07.webp'), createEventItem('同月,未来科学城路桥建成通车。', '/assets/timeline/2013-07-2.webp')])],
	},
	{
		year: 2014,
		title: '成城',
		subtitle: '这里开始有“城”的样子。',
		events: [
			createEvent('1月', ['未来中心项目通过招拍挂方式拿地成交。'], 'assets/timeline/2014-01.webp'),
			createEvent('3月', ['未来科学城综合管廊完工投用。'], 'assets/timeline/2014-03.webp'),
			createEvent('9月', [createEventItem('北京师范大学实验小学未来科技城学校、北京师范大学二附中未来科技城学校正式开学。', 'assets/timeline/2014-09.webp'), createEventItem('', 'assets/timeline/2014-09-2.webp')]),
			createEvent('11月', ['公司与金融街长安（北京）置业有限公司联合拿地，操盘开发建设未来公元项目。'], 'assets/timeline/2014-11.webp'),
			createEvent('12月', ['岭上村、北七家村、鲁疃村定向安置房完成交房。'], 'assets/timeline/2014-12.webp'),
		],
	},
	{
		year: 2015,
		title: '集团化',
		subtitle: '从“公司”到“集团”，格局由此打开。',
		events: [createEvent('6月', ['未来科学城东路桥建成通车。'], 'assets/timeline/2015-06.webp'), createEvent('9月', ['公司完成企业集团登记注册，成立北京未来科技城发展集团有限公司。']), createEvent('11月', [createEventItem('集团与保利、华润联合拿地，合作开发建设保利未来大都汇、华润未来城市项目。', 'assets/timeline/2015-11.webp'), createEventItem('', 'assets/timeline/2015-11-2.webp')])],
	},
	{
		year: 2016,
		title: '蓄势',
		subtitle: '定位明确，使命清晰。',
		events: [createEvent('9月', [createEventItem('国务院批复《北京加强全国科技创新中心建设总体方案》，明确未来科技城是北京建设全国科技创新中心主平台之一。'), createEventItem('这一年起,未来科学城集团一级开发、产城空间、产业发展、城市运营、科技金融“五大板块”业务相关公司相继成立。')])],
	},
	{
		year: 2017,
		title: '蝶变',
		subtitle: '区域更名，战略升级。',
		events: [createEvent('2月', ['习近平总书记视察北京时强调，要抓好“三城一区”建设，努力打造成北京经济发展新高地。']), createEvent('3月', ['北京市委、市政府正式将未来科技城更名为未来科学城。']), createEvent('8月', ['北京未来科技城发展集团有限公司更名为北京未来科学城发展集团有限公司。']), createEvent('10月', ['未来科学城滨水公园正式开园。'], '/assets/timeline/2017-10.webp')],
	},
	{
		year: 2018,
		title: '深耕',
		subtitle: '拓荒到精耕，每一步都在铺路。',
		events: [createEvent('2017年7月—2018年1月', ['未来科学城集团陆续获取未来逸园、未来砚园、未来慧园项目。']), createEvent('10月', ['北京未来科学城正式加入全球可持续发展标准化城市联盟（ISSCC）。']), createEvent('2018年起', ['未来科学城集团拆迁、土地供应、操盘项目数大幅增加。'], '/assets/timeline/2018-end.webp')],
	},
	{
		year: 2019,
		title: '扩容',
		subtitle: '增容16倍，擘画新格局。',
		events: [
			createEvent('6月', ['北京市委市政府正式印发实施《未来科学城规划（2017年—2035年）》，规划面积扩展至170.6平方公里，构建“两区一心”空间布局和“两谷一园”创新格局。'], '/assets/timeline/2019-06.webp'),
			createEvent('9—12月', ['昌平区小沙河村及周边地块棚户区改造和环境整治项目宅基地、生命科学园三期及“北四村”棚户区改造和环境整治项目宅基地自主腾退签约工作正式启动。']),
			createEvent('2019年6月-2020年9月', ['“北四村”棚改项目、小沙河棚改项目回迁安置房相继开工建设。']),
			createEvent('12月', ['能源转型大会首次在未来科学城举行，首次明确未来科学城东区将建设具有国际影响力的“能源谷”。']),
		],
	},
	{
		year: 2020,
		title: '跃升',
		subtitle: '“两区”加持，能级提升。',
		events: [createEvent('4月', ['未来科学城集团独立获取中关村生命科学园研究型国际医疗产业转化平台项目（高博医院）。'], '/assets/timeline/2020-04.webp'), createEvent('9月', ['昌平实验室成功挂牌，生命科学园及周边10.26平方公里纳入北京自由贸易试验区科技创新片区，未来科学城升级为北京国际科技创新中心主平台之一。'])],
	},
	{
		year: 2021,
		title: '绿意',
		subtitle: '低碳基底，生态样板。',
		events: [createEvent('4—11月', ['未来中心项目、未来公元项目建成投用。'], '/assets/timeline/2021-04.webp'), createEvent('8月', [createEventItem('未来科学城集团牵头编制的首个商务区可持续发展国家标准——《城市可持续发展 商务区可持续发展评价指标》正式获国家标准委立项。', '/assets/timeline/2021-08.webp'), createEventItem('北京十一未来城学校（小学）正式开学。')]), createEvent('9月', ['全市首个碳中和主题公园——北京温榆河公园·未来智谷正式开园。'], '/assets/timeline/2021-09.webp')],
	},
	{
		year: 2022,
		title: '精进',
		subtitle: '机构整合，“软实力”在生长。',
		events: [createEvent('6月', ['新版未来科学城管委会（生命园管委会）三定方案获批，设立未来科学城党工委，实现提级升格。']), createEvent('10月', ['北京温榆河公园昌平段（二期）项目正式开工。']), createEvent('11月', ['北京未来科学城智慧城市运行服务中心（IOC）项目完成竣工备案。'], '/assets/timeline/2022-11.webp')],
	},
	{
		year: 2023,
		title: '突破',
		subtitle: '首创频出，业务版图“破界”。',
		events: [
			createEvent('5月', [createEventItem('能源谷首个标准厂房项目——未来星科能源谷智造产业园“拿地即实质开工”，未来科学城集团成为昌平区首个获取M1工业用地的园区开发企业。', '/assets/timeline/2023-05.webp'), createEventItem('未来科学城东区首个主题休闲商业街区——未来中心星际花园正式开街。')]),
			createEvent('7月', [createEventItem('未来科学城集团联合中建智地摘地，推动未来科学城山姆会员商店8月正式启动。', '/assets/timeline/2023-07.webp'), createEventItem('未来视界项目全面竣备。')]),
			createEvent('8月', ['未来逸园项目实现交付。'], '/assets/timeline/2023-08.webp'),
			createEvent('9月', ['全国首家国际研究型医院高博医院投入运营。'], '/assets/timeline/2023-09.webp'),
			createEvent('10月', ['未来科学城集团首家自持运营酒店——北京未来科学城万怡酒店正式开业。'], '/assets/timeline/2023-10.webp'),
			createEvent('12月', ['《未来科学城集团转型升级战略规划》确定。']),
		],
	},
	{
		year: 2024,
		title: '焕新',
		subtitle: '未来所向，城长以新。',
		events: [
			createEvent('1月', ['北京市合成生物制造技术创新中心、中关村合成生物制造产业集聚区正式揭牌。'], '/assets/timeline/2024-01.webp'),
			createEvent('3月', ['未来科学城集团取得昌平区首个机器人产业园项目先期实施地块土地使用权，实现“拿地即实质开工”。'], '/assets/timeline/2024-03.webp'),
			createEvent('4月', ['《未来科学城集团企业文化理念及行为指引体系》确定。']),
			createEvent('5月', ['未来慧园项目实现交付。'], '/assets/timeline/2024-05.webp'),
			createEvent('6月', ['小沙河棚改项目回迁安置房完成交房。'], '/assets/timeline/2024-06.webp'),
			createEvent('7月', ['未来科学城集团首支直投基金——北京未来星科创业投资基金成立。']),
			createEvent('11月', ['未来科学城首支政府性产业引导基金——北京未来科学城国信先进能源及制造产业股权投资基金（有限合伙）成立。']),
		],
	},
	{
		year: 2025,
		title: '跨越',
		subtitle: '稳中求进，蓄势新程。',
		events: [
			createEvent('3—4月', ['未来星科能源谷智造产业园一期投用；二期1#厂房创全区首个“多测合一+竣工即交证”项目范例。'], '/assets/timeline/2025-03.webp'),
			createEvent('6月', ['“北四村”、创新基地2049户村民回迁，7978套安置房“零延误”交付，至此，未来科学城集团实施的11个村共计213万平方米安置房全部竣工交房。']),
			createEvent('7月', ['未来科学城首次规模化应用部署4亿像素全景智能视频监控系统，引领国内城市治理场景先河。']),
			createEvent('9月', ['北京温榆河公园·未来智谷二期开园。'], '/assets/timeline/2025-09.webp'),
			createEvent('10月', ['北京市昌平区合成生物制造产业集群获评全国首个合成生物制造领域国家级中小企业特色产业集群。'], '/assets/timeline/2025-10.webp'),
			createEvent('11月', [createEventItem('昌平首家山姆会员店正式开业。', '/assets/timeline/2025-11.webp'), createEventItem('未来科学城集团联合开发的北京市首个政府侧区域级能碳监测管理平台正式上线。')]),
			createEvent('12月', [createEventItem('清华南口国重基地成果转化资金支持体系发布，共建概念验证中心。未来科学城科技文化交流中心项目正式启动。', '/assets/timeline/2025-12.webp'), createEventItem('北京市政府办公厅、国务院国资委办公厅联合印发《关于进一步促进中央企业加快建设未来科学城行动方案（2026-2028年）》')]),
		],
	},
	{
		year: 2026,
		title: '此刻',
		subtitle: '你在这里，我们一起向前。',
		events: [
			createEvent('3月', ['未来科学城能源谷首座“第四代好房子”——未来城·星寰时代正式亮相并开放样板间。'], '/assets/timeline/2026-03.webp'),
			createEvent('5月', ['昌平千帆音乐公园顺利首秀，服务千帆音乐季·2026微博大眼音乐节。'], '/assets/timeline/2026-05.webp'),
			createEvent('7月', [createEventItem('未来科学城集团自建自营的产业标杆项目——北京市机器人产业园（昌平）正式开园。', '/assets/timeline/2026-07.webp'), createEventItem('全国高校合成生物区域技术转移转化中心（北京）正式获教育部批复建设\n未来溪谷滨河商业休闲街正式对外开放。', '/assets/timeline/2026-07-2.webp')]),
			createEvent('7月28日', ['未来科学城17周岁。']),
			createEvent('8月21日', ['未来科学城集团17周岁。\n\n十七年，是一座城的序章，故事还在继续——']),
		],
	},
]
