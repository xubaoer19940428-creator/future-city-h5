<template>
  <main ref="timelineRoot" class="timeline-view" aria-label="未来科学城时光之旅">
    <Swiper
      class="timeline-swiper"
      :initial-slide="initialIndex"
      :speed="1050"
      :allow-touch-move="true"
      @swiper="onSwiperReady"
      @slide-change="onSlideChange"
    >
      <SwiperSlide v-for="item in timeline" :key="item.year">
        <article class="timeline-slide" :aria-label="`${item.year}年：${item.title}`">
          <img class="timeline-slide__background" :src="item.background" alt="" />
          <div class="timeline-slide__wash" aria-hidden="true"></div>

          <header class="year-heading">
            <img class="year-heading__highlight" src="/assets/title-highlight.svg" alt="" />
            <h1>{{ item.year }} · {{ item.title }}</h1>
            <p>{{ item.subtitle }}</p>
          </header>

          <section
            class="events-panel"
            tabindex="0"
            :aria-label="`${item.year}年重要事件`"
          >
            <div class="events-track">
              <div
                v-for="(event, eventIndex) in item.events"
                :key="`${event.month}-${eventIndex}`"
                class="event-block"
              >
                <h2 class="event-month" data-event-part>{{ event.month }}</h2>
                <p
                  v-for="line in event.lines"
                  :key="line"
                  class="event-copy"
                  data-event-part
                >
                  {{ line }}
                </p>
              </div>
            </div>
          </section>

          <div
            class="plan-card-stack"
            :style="{ '--plan-rotation': `${item.planRotation ?? 7}deg` }"
          >
            <div
              class="plan-card"
              :class="{ 'plan-card--placeholder': !item.plan }"
            >
              <img
                v-if="item.plan"
                :class="{ 'plan-card__image--cover': item.planFit === 'cover' }"
                :src="item.plan"
                :alt="`${item.year}年规划图`"
              />
              <div v-else class="plan-placeholder" aria-label="规划图资料待补充">
                <span>{{ item.year }}</span>
                <strong>PLANNING ARCHIVE</strong>
                <small>资料待补充</small>
              </div>
            </div>
          </div>
        </article>
      </SwiperSlide>
    </Swiper>

    <nav class="top-nav" aria-label="页面导航">
      <button class="top-nav__back" type="button" aria-label="返回选择页" @click="goBack">
        <img src="/assets/nav-back.svg" alt="" />
      </button>
      <span class="top-nav__title">我的未来科学城</span>
      <img class="top-nav__share" src="/assets/nav-share.svg" alt="" aria-hidden="true" />
    </nav>

    <nav class="year-nav" aria-label="年份导航">
      <button type="button" :disabled="currentIndex === 0" @click="swiper?.slidePrev()">
        上一年
      </button>
      <button
        class="year-nav__next"
        type="button"
        :disabled="currentIndex === timeline.length - 1"
        @click="swiper?.slideNext()"
      >
        下一年
      </button>
    </nav>

    <button class="result-link" type="button" @click="showResult">
      直接查看结果 <span aria-hidden="true">》</span>
    </button>
  </main>
</template>

<script setup>
import { gsap } from 'gsap';
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';

const FIRST_YEAR = 2009;
const LAST_YEAR = 2026;

const knownTimeline = {
  2009: {
    title: '原点',
    subtitle: '未来科学城的故事，从这一年开始',
    background: '/assets/timeline-bg-city.png',
    plan: '/assets/timeline-plan-2009.png',
    events: [
      {
        month: '7月28日',
        lines: [
          '中组部、国务院国资委',
          '北京市政府共同启动中央企业人才创新创业',
          '基地建设',
          '以未来科技城命名，初期规划',
          '占地10平方公里'
        ]
      }
    ]
  },
  2010: {
    title: '奠基',
    subtitle: '蓝图落定，未来可期',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2010.png',
    events: [
      {
        month: '3月',
        lines: [
          '《未来科技城概念性设计》编制完成',
          '确定“创新、开放、低碳、人本、共生”',
          '五大核心理念'
        ]
      },
      {
        month: '5月',
        lines: [
          '《未来科技城控制性详细规划》获批',
          '一期划定用地面积10平方公里'
        ]
      }
    ]
  },
  2011: {
    title: '扎根',
    subtitle: '从规划图纸到土地，落地生根',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2010.png',
    planRotation: 11.49,
    events: [
      {
        month: '7月',
        lines: [
          '土沟村、鲁疃村、北七家村、岭上村',
          '共计2000余宗宅基地完成拆迁工作'
        ]
      },
      {
        month: '9月',
        lines: ['公司首个招拍挂二级项目未来视界拿地成交']
      }
    ]
  },
  2012: {
    title: '安家',
    subtitle: '第一批居民，第一次回家',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2012.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '5月',
        lines: ['未来科学城东路桥启动建设']
      },
      {
        month: '11月',
        lines: ['土沟村定向安置房完成交房']
      },
      {
        month: '12月',
        lines: ['鲁疃、岭上、北七家安置房项目', '主体结构基本完工']
      }
    ]
  },
  2013: {
    title: '生长',
    subtitle: '骨架拉开，脉络初成',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2013.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '7月',
        lines: [
          '《北京未来科技城核心区控制性详细规划》',
          '获批',
          '同月，未来科学城路桥建成通车'
        ]
      }
    ]
  },
  2014: {
    title: '成城',
    subtitle: '这里开始有“城”的样子',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2014.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '1月',
        lines: ['未来中心项目通过招拍挂方式拿地成交']
      },
      {
        month: '3月',
        lines: ['未来科学城综合管廊完工投用']
      },
      {
        month: '9月',
        lines: [
          '北京师范大学实验小学未来科技城学校',
          '北京师范大学二附中未来科技城学校',
          '正式开学'
        ]
      },
      {
        month: '11月',
        lines: [
          '公司与金融街长安（北京）置业有限公司',
          '联合拿地，操盘开发建设未来公元项目'
        ]
      },
      {
        month: '12月',
        lines: ['岭上村、北七家村、鲁疃村', '定向安置房完成交房']
      }
    ]
  },
  2015: {
    title: '集团化',
    subtitle: '从“公司”到“集团”，格局由此打开',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2015.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '6月',
        lines: ['未来科学城东路桥建成通车']
      },
      {
        month: '9月',
        lines: ['公司完成企业集团登记注册', '成立北京未来科技城发展集团有限公司']
      },
      {
        month: '11月',
        lines: [
          '集团与保利、华润联合拿地',
          '合作开发建设保利未来大都汇',
          '华润未来城市项目'
        ]
      }
    ]
  },
  2016: {
    title: '蓄势',
    subtitle: '定位明确，使命清晰',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2010.png',
    planRotation: 11.49,
    events: [
      {
        month: '9月',
        lines: [
          '国务院批复《北京加强全国科技创新中心建设总体方案》，明确未来科技城是北京建设全国科技创新中心主平台之一。',
          '这一年起，集团一级开发、产城空间、产业发展、城市运营、科技金融“五大板块”业务相关公司相继成立'
        ]
      }
    ]
  },
  2017: {
    title: '蝶变',
    subtitle: '区域更名，战略升级',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2017.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '2月',
        lines: [
          '习近平总书记视察北京时强调',
          '要抓好“三城一区”建设',
          '努力打造成北京经济发展新高地'
        ]
      },
      {
        month: '3月',
        lines: ['北京市委、市政府正式将未来科技城', '更名为未来科学城']
      },
      {
        month: '8月',
        lines: [
          '北京未来科技城发展集团有限公司更名',
          '为北京未来科学城发展集团有限公司'
        ]
      },
      {
        month: '10月',
        lines: ['未来科学城滨水公园正式开园']
      }
    ]
  },
  2018: {
    title: '深耕',
    subtitle: '拓荒到精耕，每一步都在铺路',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2018.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '2017年7月—2018年1月',
        lines: ['集团陆续获取未来逸园', '未来砚园、未来慧园项目']
      },
      {
        month: '10月',
        lines: [
          '北京未来科学城正式加入',
          '全球可持续发展标准化城市联盟（ISSCC）'
        ]
      },
      {
        month: '2018年起',
        lines: ['集团拆迁、土地供应、操盘项目数大幅增加']
      }
    ]
  },
  2019: {
    title: '扩容',
    subtitle: '增容16倍，擘画新格局',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2019.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '6月',
        lines: [
          '北京市委市政府正式印发实施',
          '《未来科学城规划（2017年—2035年）》',
          '规划面积扩展至170.6平方公里',
          '构建“两区一心”空间布局和',
          '“两谷一园”创新格局'
        ]
      },
      {
        month: '9月—12月',
        lines: [
          '昌平区小沙河村及周边地块棚户区改造',
          '和环境整治项目宅基地',
          '生命科学园三期及“北四村”棚户区改造',
          '和环境整治项目宅基地',
          '自主腾退签约工作正式启动'
        ]
      },
      {
        month: '2019年6月-2020年9月',
        lines: ['“北四村”棚改项目、小沙河棚改项目']
      },
      {
        month: '12月',
        lines: [
          '能源转型大会首次在未来科学城举行',
          '首次明确未来科学城东区将建设具有',
          '国际影响力的“能源谷”'
        ]
      }
    ]
  },
  2020: {
    title: '跃升',
    subtitle: '“两区”加持，能级提升',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2020.png',
    planRotation: 11.49,
    events: [
      {
        month: '4月',
        lines: [
          '集团以协议出让方式独立获取',
          '中关村生命科学园研究型国际医疗产业转化',
          '平台项目（高博医院）的土地开发使用权'
        ]
      },
      {
        month: '9月',
        lines: [
          '昌平实验室成功挂牌',
          '生命科学园及周边10.26平方公里',
          '纳入北京自由贸易试验区科技创新片区',
          '未来科学城升级为北京国际科技创新中心',
          '主平台之一'
        ]
      }
    ]
  },
  2021: {
    title: '绿意',
    subtitle: '低碳基底，生态样板',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2021.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '4月—11月',
        lines: ['未来中心项目、未来公元项目建成投用']
      },
      {
        month: '8月',
        lines: [
          '集团牵头编制的首个商务区',
          '可持续发展国家标准',
          '《城市可持续发展商务区可持续发展评价指标》'
        ]
      },
      {
        month: '8月',
        lines: ['北京十一未来城学校（小学）正式开学']
      },
      {
        month: '9月',
        lines: ['全市首个碳中和主题公园——', '北京温榆河公园·未来智谷正式开园']
      }
    ]
  },
  2022: {
    title: '精进',
    subtitle: '机构整合，“软实力”在生长',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2022.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '6月',
        lines: [
          '新版未来科学城管委会（生命园管委会）',
          '三定方案获批，设立未来科学城党工委',
          '实现提级升格'
        ]
      },
      {
        month: '10月',
        lines: ['北京温榆河公园昌平段(二期)项目正式开工']
      },
      {
        month: '11月',
        lines: [
          '北京未来科学城智慧城市运行服务中心(IOC)',
          '目完成竣工备案'
        ]
      }
    ]
  },
  2023: {
    title: '突破',
    subtitle: '首创频出，业务版图“破界”',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2023.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '5月',
        lines: [
          '能源谷首个标准厂房项目',
          '未来星科能源谷智造产业园',
          '“拿地即实质开工”',
          '集团成为昌平区首个获取M1工业用地的',
          '园区开发企业'
        ]
      },
      {
        month: '5月',
        lines: ['未来科学城东区首个主题休闲商业街区', '未来中心星际花园正式开街']
      },
      {
        month: '7月',
        lines: ['推动未来科学城山姆会员商店8月正式启动']
      },
      {
        month: '7月',
        lines: ['未来视界项目全面竣备']
      },
      {
        month: '8月',
        lines: ['未来逸园项目实现交付']
      },
      {
        month: '9月',
        lines: ['全国首家国际研究型医院高博医院投入运营']
      },
      {
        month: '10月',
        lines: ['集团首家自持运营酒店', '北京未来科学城万怡酒店正式开业']
      },
      {
        month: '12月',
        lines: ['《未来科学城集团转型升级战略规划》确定']
      }
    ]
  },
  2024: {
    title: '焕新',
    subtitle: '未来所向，城长以新',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2024.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '1月',
        lines: [
          '北京市合成生物制造技术创新中心',
          '中关村合成生物制造产业集聚区正式揭牌'
        ]
      },
      {
        month: '3月',
        lines: [
          '集团取得昌平区首个机器人产业园项目',
          '先期实施地块土地使用权',
          '实现“拿地即实质开工”'
        ]
      },
      {
        month: '4月',
        lines: ['《未来科学城集团企业文化理念及行为指引体系》确定']
      },
      {
        month: '5月',
        lines: ['未来慧园项目实现交付']
      },
      {
        month: '6月',
        lines: ['小沙河棚改项目回迁安置房完成交房']
      },
      {
        month: '7月',
        lines: ['集团首支直投基金', '北京未来星科创业投资基金成立']
      },
      {
        month: '11月',
        lines: [
          '未来科学城首支政府性产业引导基金',
          '北京未来科学城国信先进能源及制造产业股权投资基金（有限合伙）成立'
        ]
      }
    ]
  },
  2025: {
    title: '跨越',
    subtitle: '稳中求进，蓄势新程',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2025.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '3月—4月',
        lines: [
          '未来科学城能源谷首个标准厂房项目',
          '未来星科能源谷智造产业园一期投用',
          '二期1#厂房创全区首个',
          '“多测合一+竣工即交证”项目范例'
        ]
      },
      {
        month: '6月',
        lines: [
          '“北四村”、创新基地2049户村民回迁',
          '7978套安置房“零延误”交付',
          '至此，集团实施的11个村共计213万平方',
          '米安置房全部竣工交房'
        ]
      },
      {
        month: '7月',
        lines: [
          '未来科学城首次规模化应用部署',
          '4亿像素全景智能视频监控系统',
          '引领国内城市治理场景先河'
        ]
      },
      {
        month: '9月',
        lines: ['北京温榆河公园·未来智谷二期开园']
      },
      {
        month: '10月',
        lines: [
          '北京市昌平区合成生物制造产业集群',
          '获评全国首个合成生物制造领域',
          '国家级中小企业特色产业集群'
        ]
      },
      {
        month: '11月',
        lines: ['昌平首家山姆会员店正式开业']
      },
      {
        month: '11月',
        lines: [
          '集团联合开发的北京市首个政府侧区域级',
          '能碳监测管理平台正式上线'
        ]
      },
      {
        month: '12月',
        lines: ['清华南口国重基地成果转化资金支持', '体系发布，共建概念验证中心']
      },
      {
        month: '12月',
        lines: ['未来科学城科技文化交流中心项目正式启动']
      },
      {
        month: '12月',
        lines: [
          '北京市政府办公厅',
          '国务院国资委办公厅联合印发《关于进一步',
          '促进中央企业加快建设未来科学城行动方案',
          '（2026-2028年）》'
        ]
      }
    ]
  },
  2026: {
    title: '此刻',
    subtitle: '你在这里，我们一起向前',
    background: '/assets/timeline-bg-park.png',
    plan: '/assets/timeline-plan-2026.jpg',
    planFit: 'cover',
    planRotation: 11.49,
    events: [
      {
        month: '3月',
        lines: [
          '未来科学城能源谷首座“第四代好房子”',
          '未来城·星寰时代正式亮相并开放样板间'
        ]
      },
      {
        month: '5月',
        lines: ['昌平千帆音乐公园顺利首秀', '服务千帆音乐季·2026微博大眼音乐节']
      },
      {
        month: '7月',
        lines: ['集团自建自营的产业标杆项目', '北京市机器人产业园（昌平）正式开园']
      },
      {
        month: '7月',
        lines: [
          '全国高校合成生物区域技术转移转化中心',
          '（北京）正式获教育部批复建设'
        ]
      },
      {
        month: '7月',
        lines: ['未来溪谷滨河商业休闲街正式对外开放']
      },
      {
        month: '7月28日',
        lines: ['未来科学城17周岁']
      },
      {
        month: '8月21日',
        lines: ['未来科学城集团17周岁', '十七年，是一座城的序章，故事还在继续']
      }
    ]
  }
};

const timeline = Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, index) => {
  const year = FIRST_YEAR + index;

  return knownTimeline[year] ?? {
    year,
    title: '待续',
    subtitle: '这一年的故事，等待补充',
    background: '/assets/timeline-bg-park.png',
    plan: '',
    events: [
      {
        month: '资料待补充',
        lines: ['时间轴结构已就绪', '待补充对应年份的事件与规划图']
      }
    ]
  };
}).map((item, index) => ({ year: FIRST_YEAR + index, ...item }));

const route = useRoute();
const router = useRouter();
const timelineRoot = ref(null);
const swiper = ref(null);
const currentIndex = ref(0);

const requestedYear = Number(route.query.year);
const initialIndex = computed(() => {
  if (!Number.isInteger(requestedYear)) return 0;
  return Math.min(Math.max(requestedYear - FIRST_YEAR, 0), timeline.length - 1);
});

let animationContext;
let eventTimeline;
let reduceMotionQuery;
let prefersReducedMotion = false;

const animateActiveEvents = async () => {
  await nextTick();

  const activeSlide = timelineRoot.value?.querySelector('.swiper-slide-active');
  const panel = activeSlide?.querySelector('.events-panel');
  const track = activeSlide?.querySelector('.events-track');
  const parts = activeSlide?.querySelectorAll('[data-event-part]');
  const background = activeSlide?.querySelector('.timeline-slide__background');
  const headingParts = activeSlide?.querySelectorAll('.year-heading > *');
  const planCard = activeSlide?.querySelector('.plan-card-stack');
  if (!panel || !track || !parts?.length || !background || !headingParts?.length || !planCard) return;

  eventTimeline?.kill();
  panel.scrollTop = 0;

  const overflow = Math.max(track.scrollHeight - panel.clientHeight, 0);
  const revealDuration = 0.8;
  const revealStagger = 0.45;
  const revealStart = 0.95;
  const scrollPause = 0.6;
  const scrollPixelsPerSecond = 14;
  const revealSpan = revealDuration + (parts.length - 1) * revealStagger;

  animationContext?.add(() => {
    gsap.set(track, { y: 0 });
    gsap.set(background, { clearProps: 'transform,opacity,visibility' });
    gsap.set(planCard, { clearProps: 'transform,opacity,visibility' });
    gsap.set([...headingParts, ...parts], {
      clearProps: 'transform,filter,opacity,visibility'
    });
    if (prefersReducedMotion) return;

    eventTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    eventTimeline
      .from(background, {
        autoAlpha: 0.72,
        scale: 1.08,
        duration: 2.1,
        clearProps: 'transform,opacity,visibility'
      }, 0)
      .from(headingParts, {
        autoAlpha: 0,
        x: -26,
        duration: 1.05,
        stagger: 0.16,
        clearProps: 'transform,opacity,visibility'
      }, 0.18)
      .from(planCard, {
        autoAlpha: 0,
        x: 64,
        y: 36,
        rotation: '-=8',
        duration: 1.5,
        ease: 'back.out(1.25)',
        clearProps: 'transform,opacity,visibility'
      }, 0.65)
      .fromTo(
        parts,
        { autoAlpha: 0, y: 10, filter: 'blur(4px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: revealDuration,
          stagger: revealStagger,
          clearProps: 'transform,filter,visibility,opacity'
        },
        revealStart
      );

    if (overflow > 0) {
      eventTimeline.to(
        track,
        {
          y: -overflow,
          duration: Math.max(revealSpan, overflow / scrollPixelsPerSecond),
          ease: 'none'
        },
        revealStart + revealSpan + scrollPause
      );
    }
  });
};

const onSwiperReady = (instance) => {
  swiper.value = instance;
  currentIndex.value = instance.activeIndex;
  void animateActiveEvents();
};

const onSlideChange = (instance) => {
  currentIndex.value = instance.activeIndex;
  void animateActiveEvents();
};

const onMotionPreferenceChange = (event) => {
  prefersReducedMotion = event.matches;
  void animateActiveEvents();
};

const goBack = () => {
  router.push({
    name: 'Quiz',
    query: {
      step: 'profile',
      year: String(FIRST_YEAR + currentIndex.value),
      ...(typeof route.query.identity === 'string' ? { identity: route.query.identity } : {})
    }
  });
};

const showResult = () => {
  router.push({
    name: 'Result',
    query: {
      year: String(FIRST_YEAR + currentIndex.value),
      ...(typeof route.query.identity === 'string' ? { identity: route.query.identity } : {})
    }
  });
};

onMounted(() => {
  currentIndex.value = initialIndex.value;
  reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = reduceMotionQuery.matches;
  reduceMotionQuery.addEventListener('change', onMotionPreferenceChange);
  animationContext = gsap.context(() => {}, timelineRoot.value);
  void animateActiveEvents();
});

onUnmounted(() => {
  eventTimeline?.kill();
  animationContext?.revert();
  reduceMotionQuery?.removeEventListener('change', onMotionPreferenceChange);
});
</script>

<style scoped>
.timeline-view {
  --rounded-display: 'Resource Han Rounded CN', 'Noto Sans SC', 'PingFang SC', sans-serif;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #42aff6;
  color: #fff;
}

.timeline-swiper,
.timeline-slide {
  width: 100%;
  height: 100%;
}

.timeline-slide {
  position: relative;
  overflow: hidden;
}

.timeline-slide__background,
.timeline-slide__wash {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.timeline-slide__background {
  object-fit: cover;
}

.timeline-slide__wash {
  background: linear-gradient(180deg, rgb(52 174 246 / 34%) 0%, transparent 56%);
  pointer-events: none;
}

.year-heading,
.events-panel,
.plan-card-stack {
  position: absolute;
  z-index: 2;
}

.year-heading {
  top: 104px;
  left: 20px;
  right: 16px;
  font-family: var(--rounded-display);
  font-weight: 800;
  text-shadow: 0 0 4px rgb(0 108 181 / 72%);
}

.year-heading__highlight {
  position: absolute;
  top: 36px;
  left: 130px;
  z-index: 0;
  width: 70px;
  height: 21px;
}

.year-heading h1,
.year-heading p,
.event-month,
.event-copy {
  margin: 0;
}

.year-heading h1 {
  position: relative;
  z-index: 1;
  font-size: 38px;
  line-height: 1.25;
}

.year-heading p {
  position: relative;
  z-index: 1;
  margin-top: 12px;
  font-size: 20px;
  line-height: 1.45;
}

.events-panel {
  top: 229px;
  right: 18px;
  left: 18px;
  z-index: 3;
  height: 250px;
  overflow: hidden;
  font-family: var(--rounded-display);
  font-weight: 800;
  text-align: center;
  text-shadow: 0 0 4px #016cb5;
  touch-action: pan-y;
}

.events-track {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.events-panel:focus-visible {
  outline: 2px solid rgb(255 255 255 / 78%);
  outline-offset: 3px;
}

.event-block + .event-block {
  margin-top: 0;
}

.event-month {
  margin-bottom: 10px;
  color: #fff500;
  font-size: 28px;
  line-height: 1.2;
  text-shadow: 0 0 4px rgb(0 108 181 / 55%);
}

.event-copy {
  font-size: 18px;
  line-height: 1.35;
}

.event-copy + .event-copy {
  margin-top: 4px;
}

.plan-card-stack {
  bottom: 50px;
  left: calc(50% - 78px);
  width: 266px;
  height: 285px;
  isolation: isolate;
  transform: rotate(var(--plan-rotation));
  transform-origin: 55% 100%;
}

.plan-card-stack::before {
  position: absolute;
  inset: -7px 0 3px;
  z-index: -1;
  border-radius: 16.26px;
  opacity: 0.5;
  background: #feffff;
  box-shadow: 0 0 8.13px 0 #83d2ef;
  content: '';
  transform: rotate(calc(8deg - var(--plan-rotation)));
  transform-origin: 50% 100%;
}

.plan-card {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  padding: 14px 14px 44px;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 82%);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 28px rgb(0 66 99 / 24%);
}

.swiper-slide-active .timeline-slide__background,
.swiper-slide-active .year-heading > *,
.swiper-slide-active .events-track,
.swiper-slide-active .plan-card-stack {
  will-change: transform, opacity;
}

.plan-card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.plan-card .plan-card__image--cover {
  object-fit: cover;
}

.plan-card--placeholder {
  background: linear-gradient(145deg, #f8fcff, #d9eef8);
}

.plan-placeholder {
  display: grid;
  place-content: center;
  width: 100%;
  height: 100%;
  border: 1px solid rgb(35 150 210 / 24%);
  background:
    linear-gradient(rgb(35 150 210 / 10%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(35 150 210 / 10%) 1px, transparent 1px);
  background-size: 24px 24px;
  color: #267ca9;
  font-family: var(--rounded-display);
  text-align: center;
}

.plan-placeholder span {
  font-size: 54px;
  font-weight: 800;
  line-height: 1;
}

.plan-placeholder strong,
.plan-placeholder small {
  margin-top: 10px;
  letter-spacing: 0.08em;
}

.top-nav {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 52px;
  padding: 0 12px;
}

.top-nav__back {
  display: grid;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.top-nav__back img,
.top-nav__share {
  display: block;
  width: 24px;
  height: 24px;
}

.top-nav__title {
  position: absolute;
  top: 17px;
  left: 50%;
  font-size: 15px;
  font-weight: 400;
  line-height: 18px;
  opacity: 0.6;
  transform: translateX(-50%);
}

.year-nav {
  position: absolute;
  right: 0;
  bottom: 40px;
  left: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.year-nav button {
  width: 110px;
  height: 44px;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 75%);
  border-radius: 0 24px 24px 0;
  background: rgb(255 255 255 / 94%);
  box-shadow: 0 6px 14px rgb(0 82 138 / 16%);
  color: #292929;
  font-size: 16px;
  cursor: pointer;
  pointer-events: auto;
}

.year-nav .year-nav__next {
  border-radius: 24px 0 0 24px;
  background: linear-gradient(180deg, #1f9ff8, #44b9ff);
  color: #fff;
}

.year-nav button:disabled {
  cursor: default;
  opacity: 0.48;
}

.result-link {
  position: absolute;
  bottom: 14px;
  left: 50%;
  z-index: 20;
  padding: 0;
  border: 0;
  background: transparent;
  color: #172c1a;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  opacity: 1;
  transform: translateX(-50%);
}

.top-nav__back:focus-visible,
.year-nav button:focus-visible,
.result-link:focus-visible {
  outline: 3px solid rgb(255 255 255 / 76%);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .events-panel {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .swiper-slide-active .timeline-slide__background,
  .swiper-slide-active .year-heading > *,
  .swiper-slide-active .events-track,
  .swiper-slide-active .plan-card-stack {
    will-change: auto;
  }
}
</style>
