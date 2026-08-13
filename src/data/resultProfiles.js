export const RESULT_IDENTITIES = [
  '未来科学城相关政府机构人员',
  '未来科学城集团干部员工',
  '未来科学城入驻企业员工',
  '未来科学城区域居民',
  '未来科学城关心关注者'
];

const resultImagesByYear = Object.fromEntries(
  Array.from({ length: 18 }, (_, index) => {
    const year = 2009 + index;
    return [year, `/assets/timeline-${year}-people.webp`];
  })
);

const yearProfiles = {
  2009: { title: '奠基者', lead: '故事的第一行，你已在场。' },
  2010: { title: '拓疆者', lead: '土地初醒，你已扎根。' },
  2011: { title: '领航者', lead: '蓝图初展，你已就位。' },
  2012: { title: '筑梦者', lead: '居民归家，温暖开篇。' },
  2013: { title: '架构者', lead: '骨架初成，城起于斯。' },
  2014: { title: '开启者', lead: '成城之初，启航新篇。' },
  2015: { title: '拓新者', lead: '格局初开，破浪前行。' },
  2016: { title: '守望者', lead: '蓄势之时，静待风起。' },
  2017: { title: '同行者', lead: '蝶变之年，万物新生。' },
  2018: { title: '精进者', lead: '稳扎稳打，步步为营。' },
  2019: { title: '追光者', lead: '大城扩容，追光而行。' },
  2020: { title: '深耕者', lead: '跃升之年，向下扎根。' },
  2021: { title: '筑造者', lead: '绿意绽放，精筑美好。' },
  2022: { title: '坚守者', lead: '精进之年，坚守初心。' },
  2023: { title: '破风者', lead: '破界之年，推陈出新。' },
  2024: { title: '变革者', lead: '焕新之年，重塑格局。' },
  2025: { title: '见证者', lead: '跨越之年，见证不凡。' },
  2026: { title: '定义者', lead: '此刻向前，未来由你注解。' }
};

const traitOptions = {
  '未来科学城相关政府机构人员': ['大时代的解题人', '“持久战”的定力担当者', '穿越周期的长期主义者'],
  '未来科学城集团干部员工': ['韧性生长的实干派', '把理想写进工位的人', '把蓝图铺进现实的人'],
  '未来科学城入驻企业员工': ['在风口上搬砖的人', '在上升赛道持续深耕的人', '与城共进的合伙人'],
  '未来科学城区域居民': ['最早一批“押注”的人', '用脚步丈量新城的人', '把“家”字写进未来的人'],
  '未来科学城关心关注者': ['“弹幕区”的老朋友', '城市生长“云监工”', '“城”长故事的“追更人”']
};

const crossTags = {
  '未来科学城相关政府机构人员': ['在空白处落笔', '把蓝图铺开', '与时间对弈', '把格局打开', '把棋局看远'],
  '未来科学城集团干部员工': ['从零画地图', '把图纸变实景', '把冷板凳坐热', '把硬骨头啃透', '把答案写进未来'],
  '未来科学城入驻企业员工': ['拼一个未来', '把根扎下去', '与时间做朋友', '把赛道跑宽', '把边界打穿'],
  '未来科学城区域居民': ['从荒芜看到繁华', '把灯火点亮', '等时间给出答案', '与一座城绑定', '把日子过成诗'],
  '未来科学城关心关注者': ['听说它、看见它', '保持观望、保持期待', '成为城市“云股东”', '相信“相信”的力量', '等待下一场精彩']
};

const descriptionOptions = {
  '未来科学城相关政府机构人员': [
    '你没有亲自建高楼，却夯实了一座城能稳稳站住的底座——你付出的努力，都在这座城的模样里被看见。',
    '用专业、热忱与奉献，参与一座科创之城的崛起生长，是职业生涯最值得骄傲的事。',
    '一座科创之城的崛起，不只是在新闻里，也在你的每一次协调、每一份文件、每一个决策里。'
  ],
  '未来科学城集团干部员工': [
    '你见过它荒芜的样子，也见过它闪亮的转身。你的基因里，刻着这座城每一次拔节生长的声音。',
    '从图纸到现实，从荒芜到繁华，这座城不知道你的名字，但它的一砖一瓦都记得你。',
    '你在这里熬过的夜、扛过的压力、起草过的每一份文件——都变成了这座城的一部分。'
  ],
  '未来科学城入驻企业员工': [
    '选对一片创新热土，事业和新城一起生长。未来科学城的成长速度，刚好配得上你的野心。',
    '选这里，是因为相信；如今，理想正扎根。你不只搬进了一座园区，更参与了一个成长中的未来。',
    '你在这里熬过的每一个项目、加过的每一次班、签下的每一单，都刻入了这座城的成长年轮。'
  ],
  '未来科学城区域居民': [
    '搬来那年，朋友问“怎么选那么远”，现在他们问“怎么才能住过来”。从阡陌村庄到科创新都，你陪伴它成长。',
    '你住在这里，看着它从工地变成花园、从空白变成繁华。最好的关系，就是彼此见证。',
    '孩子在这里长大，老人在这里养老，你在这里打拼。未来科学城是家，是幸福的答案。'
  ],
  '未来科学城关心关注者': [
    '从听说，到看见，如今它已长成170.6平方公里的模样。有些地方，看着它好，就开心。',
    '关注一座城，就像看一个人成长；每一次路过，都比上一次更好。一座科创新都，就这样长成。',
    '来过一次，就一直关注。未来科学城好像有种魔力，让人想看看它到底能长成什么样。'
  ]
};

const identityAliases = {
  '政府工作人员': '未来科学城相关政府机构人员',
  '政府机构人员': '未来科学城相关政府机构人员',
  '集团干部员工': '未来科学城集团干部员工',
  '入驻企业员工': '未来科学城入驻企业员工',
  '区域居民': '未来科学城区域居民',
  '关心关注者': '未来科学城关心关注者'
};

export const normalizeResultIdentity = (identity) => {
  if (RESULT_IDENTITIES.includes(identity)) return identity;
  return identityAliases[identity] ?? RESULT_IDENTITIES[0];
};

export const normalizeResultYear = (year) => {
  const parsedYear = Number(year);
  return Number.isInteger(parsedYear) && yearProfiles[parsedYear] ? parsedYear : 2026;
};

export const createRandomResultIndex = () => {
  if (globalThis.crypto?.getRandomValues) {
    const randomValue = new Uint32Array(1);
    globalThis.crypto.getRandomValues(randomValue);
    return randomValue[0] % 3;
  }

  return Math.floor(Math.random() * 3);
};

const getYearBandIndex = (year) => {
  if (year <= 2011) return 0;
  if (year <= 2015) return 1;
  if (year <= 2018) return 2;
  if (year <= 2022) return 3;
  return 4;
};

const normalizeOptionIndex = (index) => {
  const parsedIndex = Number(index);
  return Number.isInteger(parsedIndex) && parsedIndex >= 0 && parsedIndex <= 2 ? parsedIndex : 0;
};

export const getResultProfile = ({ year, identity, traitIndex, descriptionIndex }) => {
  const normalizedYear = normalizeResultYear(year);
  const normalizedIdentity = normalizeResultIdentity(identity);
  const normalizedTraitIndex = normalizeOptionIndex(traitIndex);
  const normalizedDescriptionIndex = normalizeOptionIndex(descriptionIndex);

  return {
    year: normalizedYear,
    identity: normalizedIdentity,
    ...yearProfiles[normalizedYear],
    trait: traitOptions[normalizedIdentity][normalizedTraitIndex],
    tag: crossTags[normalizedIdentity][getYearBandIndex(normalizedYear)],
    description: descriptionOptions[normalizedIdentity][normalizedDescriptionIndex],
    image: resultImagesByYear[normalizedYear]
  };
};
