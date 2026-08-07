<template>
  <main
    ref="quizRoot"
    class="quiz-flow"
    aria-label="我的未来科学城"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="quiz-track" :class="{ 'quiz-track--form': currentStep === 1 }">
      <section
        class="quiz-slide quiz-slide--intro"
        aria-labelledby="intro-title"
        :aria-hidden="currentStep !== 0"
        :inert="currentStep !== 0"
      >
        <div class="scene-window" aria-hidden="true">
          <img class="scene-image" src="/assets/bg-2.png" alt="" />
        </div>

        <h1 id="intro-title" class="intro-title">科创新都&nbsp; 未来之城</h1>
        <div ref="introCopy" class="intro-copy">
          <p class="intro-copy__year">2009—2026年</p>
          <p>未来科学城从一纸蓝图生长为</p>
          <p>170.6平方公里的科创热土。</p>
          <p>十七年时光</p>
          <p>每一次变革</p>
          <p>每一栋建筑</p>
          <p>每一份突破</p>
          <p>都与你有关</p>
        </div>

        <button class="swipe-hint" type="button" @click="currentStep = 1">
          <span>左滑继续</span>
          <img src="/assets/swipe-chevron.svg" alt="" />
        </button>
      </section>

      <section
        class="quiz-slide quiz-slide--form"
        aria-labelledby="form-title"
        :aria-hidden="currentStep !== 1"
        :inert="currentStep !== 1"
      >
        <div class="scene-window" aria-hidden="true">
          <img class="scene-image" src="/assets/bg-2.png" alt="" />
        </div>
        <div class="form-tint" aria-hidden="true"></div>

        <div class="form-heading">
          <img class="form-heading__highlight" src="/assets/title-highlight.svg" alt="" />
          <h2 id="form-title">你是谁？</h2>
          <p class="form-heading__lead">从哪一年开始</p>
          <p class="form-heading__question">你与未来科学城产生交集？</p>
        </div>

        <div ref="formCopy" class="form-copy">
          <p>选择你与未来科学城初次相遇那一年</p>
          <p>入职、入驻、安家</p>
          <p>或是第一次听说它的名字</p>
          <p>重新发现</p>
          <p>科创新都 未来之城</p>
        </div>

        <form class="profile-form" @submit.prevent="startJourney">
          <QuizSelect
            v-model="identity"
            class="select-field select-field--identity"
            :options="identityOptions"
            label="选择你的身份"
            placeholder="请选择你的身份"
          />

          <QuizSelect
            v-model="year"
            class="select-field select-field--year"
            :options="yearOptions"
            label="选择年份"
            placeholder="请选择年份"
            option-suffix="年"
            placement="top"
          />

          <button class="journey-button" type="submit" :disabled="!year">开启时光之旅</button>
        </form>
      </section>
    </div>

    <nav class="top-nav" aria-label="页面导航">
      <button class="top-nav__back" type="button" aria-label="返回" @click="goBack">
        <img src="/assets/nav-back.svg" alt="" />
      </button>
      <span class="top-nav__title">我的未来科学城</span>
      <div class="top-nav__actions">
        <img src="/assets/nav-share.svg" alt="" aria-hidden="true" />
      </div>
    </nav>
  </main>
</template>

<script setup>
import { gsap } from 'gsap';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import QuizSelect from '../components/QuizSelect.vue';

const route = useRoute();
const router = useRouter();
const quizRoot = ref(null);
const introCopy = ref(null);
const formCopy = ref(null);
const currentStep = ref(route.query.step === 'profile' ? 1 : 0);
const touchStartX = ref(0);
const touchStartY = ref(0);
const identity = ref(typeof route.query.identity === 'string' ? route.query.identity : '');
const queryYear = Number(route.query.year);
const year = ref(
  Number.isInteger(queryYear) && queryYear >= 2009 && queryYear <= 2026 ? queryYear : ''
);

let animationContext;
let copyTimeline;
let reduceMotionQuery;
let prefersReducedMotion = false;

const identityOptions = ['科研工作者', '企业员工', '创业者', '园区建设者', '居民', '学生', '访客'];
const yearOptions = computed(() => Array.from({ length: 18 }, (_, index) => 2026 - index));

const startJourney = () => {
  if (!year.value) return;

  router.push({
    name: 'Timeline',
    query: {
      year: String(year.value),
      ...(identity.value ? { identity: identity.value } : {})
    }
  });
};

const resetCopyStyles = () => {
  [introCopy.value, formCopy.value].forEach((container) => {
    if (!container) return;
    gsap.set(container.querySelectorAll('p'), { clearProps: 'all' });
  });
};

const animateCopy = (container, delay = 0) => {
  if (!container || !animationContext) return;

  copyTimeline?.kill();

  if (prefersReducedMotion) {
    resetCopyStyles();
    return;
  }

  animationContext.add(() => {
    copyTimeline = gsap.timeline({ delay, defaults: { ease: 'power2.out' } }).fromTo(
      container.querySelectorAll('p'),
      { autoAlpha: 0, y: 12, filter: 'blur(5px)' },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.55,
        stagger: 0.08,
        clearProps: 'transform,filter,visibility,opacity'
      }
    );
  });
};

const onMotionPreferenceChange = (event) => {
  prefersReducedMotion = event.matches;

  if (prefersReducedMotion) {
    copyTimeline?.kill();
    resetCopyStyles();
    return;
  }

  animateCopy(currentStep.value === 0 ? introCopy.value : formCopy.value);
};

const goBack = () => {
  if (currentStep.value === 1) {
    currentStep.value = 0;
    return;
  }

  router.push('/');
};

const onTouchStart = (event) => {
  touchStartX.value = event.changedTouches[0].clientX;
  touchStartY.value = event.changedTouches[0].clientY;
};

const onTouchEnd = (event) => {
  const deltaX = event.changedTouches[0].clientX - touchStartX.value;
  const deltaY = event.changedTouches[0].clientY - touchStartY.value;

  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

  if (deltaX < 0) currentStep.value = 1;
  if (deltaX > 0) currentStep.value = 0;
};

watch(currentStep, async (step) => {
  await nextTick();
  animateCopy(step === 0 ? introCopy.value : formCopy.value, step === 1 ? 0.18 : 0.06);
});

onMounted(() => {
  reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = reduceMotionQuery.matches;
  reduceMotionQuery.addEventListener('change', onMotionPreferenceChange);
  animationContext = gsap.context(() => {}, quizRoot.value);
  animateCopy(introCopy.value, 0.08);
});

onUnmounted(() => {
  copyTimeline?.kill();
  animationContext?.revert();
  reduceMotionQuery?.removeEventListener('change', onMotionPreferenceChange);
});
</script>

<style scoped>
.quiz-flow {
  --rounded-display: 'Resource Han Rounded CN', 'Noto Sans SC', 'PingFang SC', sans-serif;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #43aff7;
  color: #fff;
  touch-action: pan-y;
}

.quiz-track {
  display: flex;
  width: 200%;
  height: 100%;
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.quiz-track--form {
  transform: translateX(-50%);
}

.quiz-slide {
  position: relative;
  flex: 0 0 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  background: #43aff7;
}

.quiz-slide--form {
  background: #40acf5;
}

.scene-window {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.scene-image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-tint {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: rgb(53 161 231 / 10%);
  backdrop-filter: blur(0.5px);
  pointer-events: none;
}

.intro-title,
.intro-copy,
.swipe-hint,
.form-heading,
.form-copy,
.profile-form {
  position: absolute;
  z-index: 2;
}

.intro-title {
  top: 104px;
  left: 50%;
  margin: 0;
  font-family: var(--rounded-display);
  font-size: 38px;
  font-weight: 800;
  line-height: normal;
  text-align: center;
  white-space: pre;
  transform: translateX(-50%);
}

.intro-copy {
  top: 171px;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 310px;
  font-family: var(--rounded-display);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.45;
  text-align: center;
  text-shadow: 0 0 4px #016cb5;
  transform: translateX(-50%);
}

.intro-copy p {
  margin: 0;
}

.intro-copy__year {
  font-size: 28px;
}

.swipe-hint {
  right: 30px;
  bottom: 29px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #171717;
  font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
}

.swipe-hint img {
  width: 16px;
  height: 12px;
  margin-top: 4px;
  animation: nudge-right 1.5s ease-in-out infinite;
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
.top-nav__actions img {
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

.top-nav__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-heading {
  top: 104px;
  left: 20px;
  width: 240px;
  height: 133px;
  font-family: var(--rounded-display);
  font-weight: 800;
}

.form-heading h2,
.form-heading p {
  position: absolute;
  z-index: 1;
  margin: 0;
  line-height: 1.45;
  white-space: nowrap;
}

.form-heading h2 {
  top: 0;
  left: 4px;
  font-size: 38px;
  line-height: 55px;
}

.form-heading__highlight {
  position: absolute;
  top: 36px;
  left: 32px;
  z-index: 0;
  width: 70px;
  height: 21px;
}

.form-heading .form-heading__lead {
  top: 66px;
  left: 0;
  font-size: 20px;
}

.form-heading .form-heading__question {
  top: 104px;
  left: 0;
  font-size: 20px;
}

.form-copy {
  top: 266px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 350px;
  font-family: var(--rounded-display);
  font-size: 18px;
  font-weight: 800;
  line-height: 26px;
  text-align: right;
  text-shadow: 0 0 4px #016cb5;
}

.form-copy p {
  margin: 0;
}

.profile-form {
  inset: 0;
}

.select-field {
  position: absolute;
  left: 20px;
  width: 350px;
  height: 60px;
}

.select-field--identity {
  top: 514px;
}

.select-field--year {
  top: 594px;
}

.journey-button {
  position: absolute;
  top: 714px;
  left: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 320px;
  height: 50px;
  padding: 0;
  border: 1px solid #fff;
  border-radius: 30px;
  background: linear-gradient(180deg, #279bff 0%, #40b6ff 100%);
  box-shadow: inset 0 0 6px #bce1ff;
  color: #fff;
  font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  cursor: pointer;
  isolation: isolate;
  will-change: transform;
  animation: journey-breathe 2.8s ease-in-out infinite;
}

.journey-button::before {
  position: absolute;
  inset: -6px;
  z-index: -1;
  border: 1px solid rgb(255 255 255 / 50%);
  border-radius: inherit;
  box-shadow: 0 0 18px rgb(39 155 255 / 38%);
  content: '';
  opacity: 0;
  pointer-events: none;
  animation: journey-halo 2.8s ease-out infinite;
}

.journey-button:active {
  animation: none;
  filter: brightness(0.96);
  transform: scale(0.98);
}

.journey-button:disabled {
  cursor: not-allowed;
  filter: saturate(0.45);
  opacity: 0.58;
  animation: none;
}

.journey-button:disabled::before {
  animation: none;
}

.journey-button:focus-visible,
.top-nav__back:focus-visible,
.swipe-hint:focus-visible {
  outline: 3px solid rgb(255 255 255 / 75%);
  outline-offset: 3px;
}

@keyframes nudge-right {
  0%,
  100% {
    transform: translateX(-2px);
  }

  50% {
    transform: translateX(3px);
  }
}

@keyframes journey-breathe {
  0%,
  100% {
    box-shadow: inset 0 0 6px #bce1ff, 0 6px 16px rgb(0 110 200 / 16%);
    transform: scale(1);
  }

  50% {
    box-shadow: inset 0 0 10px #e3f4ff, 0 10px 26px rgb(0 110 200 / 34%);
    filter: brightness(1.04);
    transform: scale(1.025);
  }
}

@keyframes journey-halo {
  0% {
    opacity: 0;
    transform: scale(0.97);
  }

  42% {
    opacity: 0.5;
  }

  100% {
    opacity: 0;
    transform: scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .quiz-track {
    transition: none;
  }

  .swipe-hint img {
    animation: none;
  }

  .journey-button,
  .journey-button::before {
    animation: none;
  }
}
</style>
