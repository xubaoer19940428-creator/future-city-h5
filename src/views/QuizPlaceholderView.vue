<template>
  <main
    ref="quizRoot"
    class="quiz-flow"
    aria-label="我的未来科学城"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <nav class="top-nav" aria-label="页面导航">
      <button class="top-nav__back" type="button" aria-label="返回" @click="goBack">
        <img src="/assets/nav-back.svg" alt="" />
      </button>
      <span class="top-nav__title">我的未来科学城</span>
      <div class="top-nav__actions">
        <img src="/assets/nav-share.svg" alt="" aria-hidden="true" />
      </div>
    </nav>

    <div class="quiz-track" :class="{ 'quiz-track--form': currentStep === 1 }">
      <section
        class="quiz-slide quiz-slide--intro"
        aria-labelledby="intro-title"
        :aria-hidden="currentStep !== 0"
        :inert="currentStep !== 0"
      >
        <div class="scene-window" aria-hidden="true">
          <img class="scene-image" src="/assets/bg-2.webp" alt="" />
        </div>

        <div class="intro-content">
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
        </div>
      </section>

      <section
        class="quiz-slide quiz-slide--form"
        aria-labelledby="form-title"
        :aria-hidden="currentStep !== 1"
        :inert="currentStep !== 1"
      >
        <div class="scene-window" aria-hidden="true">
          <img class="scene-image" src="/assets/bg-2.webp" alt="" />
        </div>
        <div class="form-tint" aria-hidden="true"></div>

        <div class="form-content">
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

            <button class="journey-button" type="submit" :disabled="!identity || !year">
              开启时光之旅
            </button>
          </form>
        </div>
      </section>
    </div>

  </main>
</template>

<script setup>
import { gsap } from 'gsap';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import QuizSelect from '../components/QuizSelect.vue';
import { RESULT_IDENTITIES } from '../data/resultProfiles';

const route = useRoute();
const router = useRouter();
const quizRoot = ref(null);
const introCopy = ref(null);
const formCopy = ref(null);
const currentStep = ref(route.query.step === 'profile' ? 1 : 0);
const touchStartX = ref(0);
const touchStartY = ref(0);
const queryIdentity = typeof route.query.identity === 'string' ? route.query.identity : '';
const identity = ref(RESULT_IDENTITIES.includes(queryIdentity) ? queryIdentity : '');
const queryYear = Number(route.query.year);
const year = ref(
  Number.isInteger(queryYear) && queryYear >= 2009 && queryYear <= 2026 ? queryYear : ''
);

let animationContext;
let sceneTimeline;
let reduceMotionQuery;
let prefersReducedMotion = false;

const identityOptions = RESULT_IDENTITIES;
const yearOptions = computed(() => Array.from({ length: 18 }, (_, index) => 2026 - index));

const startJourney = () => {
  if (!RESULT_IDENTITIES.includes(identity.value) || !year.value) return;

  router.replace({
    name: 'Timeline',
    query: {
      year: String(year.value),
      ...(identity.value ? { identity: identity.value } : {})
    }
  });
};

const resetSceneStyles = () => {
  if (!quizRoot.value) return;

  gsap.set(
    quizRoot.value.querySelectorAll(
      '.scene-image, .intro-title, .intro-copy p, .swipe-hint, .form-heading > *, .form-copy p, .profile-form > *'
    ),
    { clearProps: 'all' }
  );
};

const animateStep = (step, delay = 0) => {
  if (!animationContext || !quizRoot.value) return;

  sceneTimeline?.kill();
  resetSceneStyles();

  if (prefersReducedMotion) {
    return;
  }

  const slide = quizRoot.value.querySelector(
    step === 0 ? '.quiz-slide--intro' : '.quiz-slide--form'
  );
  if (!slide) return;

  animationContext.add(() => {
    sceneTimeline = gsap
      .timeline({ delay, defaults: { ease: 'power3.out' } })
      .timeScale(0.5);
    sceneTimeline.from(slide.querySelector('.scene-image'), {
      scale: 1.06,
      duration: 1.05,
      clearProps: 'transform'
    }, 0);

    if (step === 0) {
      sceneTimeline
        .from(slide.querySelector('.intro-title'), {
          autoAlpha: 0,
          y: -22,
          duration: 0.58,
          clearProps: 'transform,opacity,visibility'
        }, 0.08)
        .fromTo(
          introCopy.value?.querySelectorAll('p'),
          { autoAlpha: 0, y: 18, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.075,
            clearProps: 'transform,visibility,opacity'
          },
          0.26
        )
        .from(slide.querySelector('.swipe-hint'), {
          autoAlpha: 0,
          x: -18,
          duration: 0.42,
          clearProps: 'transform,opacity,visibility'
        }, 0.82);
      return;
    }

    sceneTimeline
      .from(slide.querySelectorAll('.form-heading > *'), {
        autoAlpha: 0,
        x: -22,
        duration: 0.5,
        stagger: 0.07,
        clearProps: 'transform,opacity,visibility'
      }, 0.05)
      .fromTo(
        formCopy.value?.querySelectorAll('p'),
        { autoAlpha: 0, x: 18, y: 8 },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.48,
          stagger: 0.075,
          clearProps: 'transform,visibility,opacity'
        },
        0.28
      )
      .from(slide.querySelectorAll('.select-field'), {
        autoAlpha: 0,
        y: 24,
        scale: 0.985,
        duration: 0.52,
        stagger: 0.1,
        clearProps: 'transform,opacity,visibility'
      }, 0.56)
      .from(slide.querySelector('.journey-button'), {
        autoAlpha: 0,
        duration: 0.44,
        clearProps: 'opacity,visibility'
      }, 0.76);
  });
};

const onMotionPreferenceChange = (event) => {
  prefersReducedMotion = event.matches;

  if (prefersReducedMotion) {
    sceneTimeline?.kill();
    resetSceneStyles();
    return;
  }

  animateStep(currentStep.value);
};

const goBack = () => {
  if (currentStep.value === 1) {
    currentStep.value = 0;
    return;
  }

  router.replace('/');
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
  animateStep(step, step === 1 ? 0.16 : 0.04);
});

onMounted(() => {
  reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = reduceMotionQuery.matches;
  reduceMotionQuery.addEventListener('change', onMotionPreferenceChange);
  animationContext = gsap.context(() => {}, quizRoot.value);
  animateStep(currentStep.value, 0.08);
});

onUnmounted(() => {
  sceneTimeline?.kill();
  animationContext?.revert();
  reduceMotionQuery?.removeEventListener('change', onMotionPreferenceChange);
});
</script>

<style scoped>
.quiz-flow {
  --rounded-display: 'Resource Han Rounded CN', 'Noto Sans SC', 'PingFang SC', sans-serif;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #43aff7;
  color: #fff;
  touch-action: pan-y;
}

.quiz-track {
  display: flex;
  flex: 1 1 auto;
  width: 200%;
  min-height: 0;
  transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.quiz-track--form {
  transform: translateX(-50%);
}

.quiz-slide {
  position: relative;
  display: grid;
  flex: 0 0 50%;
  grid-template: minmax(0, 1fr) / 100%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  background: #43aff7;
}

.quiz-slide--form {
  background: #40acf5;
}

.intro-content {
  z-index: 2;
  display: flex;
  grid-area: 1 / 1;
  flex-direction: column;
  align-items: center;
  padding: 0 20px max(24px, env(safe-area-inset-bottom));
}

.scene-window {
  z-index: 0;
  grid-area: 1 / 1;
  overflow: hidden;
  pointer-events: none;
}

.scene-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}

.form-tint {
  z-index: 1;
  grid-area: 1 / 1;
  background: rgb(53 161 231 / 10%);
  backdrop-filter: blur(0.5px);
  pointer-events: none;
}

.form-content {
  position: relative;
  z-index: 2;
  display: flex;
  grid-area: 1 / 1;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 0 20px max(24px, env(safe-area-inset-bottom));
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.form-content::-webkit-scrollbar {
  display: none;
}

.intro-title {
  margin: 0;
  font-family: var(--rounded-display);
  font-size: 38px;
  font-weight: 800;
  line-height: normal;
  text-align: center;
  white-space: pre;
  will-change: transform, opacity;
}

.intro-copy {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(310px, calc(100% - 40px));
  margin-top: 12px;
  font-family: var(--rounded-display);
  font-size: 20px;
  font-weight: 800;
  line-height: 1.45;
  text-align: center;
  text-shadow: 0 0 4px #016cb5;
}

.intro-copy p {
  margin: 0;
}

.intro-copy__year {
  font-size: 28px;
}

.swipe-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  align-self: flex-end;
  gap: 2px;
  margin-top: auto;
  margin-right: 10px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #171717;
  font-family: 'Resource Han Rounded CN', 'PingFang SC', 'Noto Sans SC', sans-serif;
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
  z-index: 20;
  display: grid;
  flex: 0 0 52px;
  grid-template-columns: 24px minmax(0, 1fr) 24px;
  align-items: center;
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
  font-size: 15px;
  font-weight: 400;
  line-height: 18px;
  opacity: 0.6;
  text-align: center;
}

.top-nav__actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 12px;
}

.form-heading {
  position: relative;
  display: grid;
  flex: 0 0 auto;
  grid-template: auto auto auto / 100%;
  width: 100%;
  font-family: var(--rounded-display);
  font-weight: 800;
}

.form-heading h2,
.form-heading p {
  z-index: 1;
  margin: 0;
  line-height: 1.45;
  white-space: nowrap;
}

.form-heading h2 {
  grid-area: 1 / 1;
  margin-left: 4px;
  font-size: 38px;
  line-height: 55px;
}

.form-heading__highlight {
  z-index: 0;
  grid-area: 1 / 1;
  margin-top: 36px;
  margin-left: 32px;
  width: 70px;
  height: 21px;
}

.form-heading .form-heading__lead {
  grid-area: 2 / 1;
  margin-top: 11px;
  font-size: 20px;
}

.form-heading .form-heading__question {
  grid-area: 3 / 1;
  margin-top: 9px;
  font-size: 20px;
}

.form-copy {
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  align-self: flex-end;
  gap: 8px;
  width: 100%;
  margin-top: clamp(16px, 4dvh, 32px);
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
  position: relative;
  z-index: 3;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  margin-top: auto;
  padding-top: clamp(18px, 4dvh, 34px);
}

.select-field {
  position: relative;
  flex: 0 0 auto;
  width: 100%;
  height: 60px;
}

.journey-button {
  position: relative;
  flex: 0 0 auto;
  align-self: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 30px);
  height: 50px;
  margin-top: 20px;
  padding: 0;
  border: 1px solid #fff;
  border-radius: 30px;
  background: linear-gradient(180deg, #279bff 0%, #40b6ff 100%);
  box-shadow: inset 0 0 9px #d8efff, 0 9px 22px rgb(0 110 200 / 26%);
  color: #fff;
  font-family: 'Resource Han Rounded CN', 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  cursor: pointer;
  will-change: transform;
  animation: journey-breathe 2.8s ease-in-out infinite;
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
    transform: scale(1);
  }

  50% {
    box-shadow: inset 0 0 9px #d8efff, 0 0 18px rgb(39 155 255 / 38%);
    transform: scale(1.025);
  }
}

@media (prefers-reduced-motion: reduce) {
  .quiz-track {
    transition: none;
  }

  .swipe-hint img {
    animation: none;
  }

  .journey-button {
    animation: none;
  }
}
</style>
