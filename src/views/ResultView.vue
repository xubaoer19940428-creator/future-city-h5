<template>
  <main ref="resultRoot" class="result-view" aria-labelledby="result-title" data-poster-page>
    <img
      class="wechat-share-thumbnail"
      src="/assets/title-graphic.webp"
      alt=""
      aria-hidden="true"
    />

    <div class="result-scene" aria-hidden="true">
      <img class="result-scene__cloud" src="/assets/result-cloud.webp" alt="" />
      <div class="result-scene__city-window">
        <img class="result-scene__city" src="/assets/result-city.webp" alt="" />
      </div>
    </div>

    <nav class="top-nav" aria-label="页面导航">
      <button class="top-nav__back" type="button" aria-label="返回时光之旅" @click="goBack">
        <img src="/assets/nav-back.svg" alt="" />
      </button>
      <span class="top-nav__title">我的未来科学城</span>
      <!-- <button class="top-nav__share" type="button" aria-label="分享结果" @click="sharePoster">
        <img src="/assets/nav-share.svg" alt="" />
      </button> -->
    </nav>

    <div class="result-content">
      <div class="result-stage">
        <div class="result-stage__canvas">
          <div class="result-card-canvas">
            <article
              class="result-card"
              :class="{ 'result-card--hidden': Boolean(posterSnapshot) }"
            >
              <img class="result-card__accent" src="/assets/result-card-accent.svg" alt="" />
              <img class="result-card__corner" src="/assets/result-card-corner.svg" alt="" />

              <p class="result-card__eyebrow">您的未来科学城MBTI是：</p>

              <div class="result-card__title-wrap">
                <img src="/assets/result-title-burst.svg" alt="" />
                <h1 id="result-title">{{ result.title }}</h1>
              </div>

              <div class="result-character" aria-hidden="true">
                <img :src="result.image" alt="" />
              </div>

              <p class="result-card__lead">{{ result.lead }}</p>
              <p class="result-card__tag">{{ result.tag }}</p>
              <span class="result-card__tag-line" aria-hidden="true"></span>

              <div class="result-card__traits">
                <p>{{ result.trait }}</p>
              </div>

              <span class="result-card__quote result-card__quote--open" aria-hidden="true">“</span>
              <blockquote>{{ result.description }}</blockquote>
              <span class="result-card__quote result-card__quote--close" aria-hidden="true">”</span>

              <div class="result-card__footer">
                <img class="result-card__qr" src="/assets/result-qr.png" alt="未来科学城二维码" />
                <p>扫一扫解锁<br />你的基因图谱</p>
                <img
                  class="result-card__brand"
                  src="/assets/result-brand.png"
                  alt="未来科学城集团"
                />
              </div>
            </article>
          </div>

          <img
            class="result-mascot result-mascot--speaker"
            src="/assets/result-mascot-speaker.webp"
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>

      <div class="result-controls">
        <div class="result-actions">
          <button
            class="result-button result-button--light"
            type="button"
            :disabled="isPosterRendering"
            @click="generatePoster"
          >
            {{
              isPosterRendering
                ? '正在生成基因海报…'
                : posterSnapshot
                  ? '长按页面图片保存'
                  : '生成我的基因海报'
            }}
          </button>
          <button class="result-button result-button--primary" type="button" @click="sharePoster">
            分享给朋友
          </button>
        </div>

        <button class="retry-button" type="button" @click="retryQuiz">
          <img src="/assets/result-retry.svg" alt="" />
          <span>再测一次</span>
        </button>

        <img
          class="result-mascot result-mascot--star"
          src="/assets/result-mascot-star.webp"
          alt=""
          aria-hidden="true"
        />
      </div>

      <img
        v-if="posterSnapshot"
        class="result-page-snapshot"
        :src="posterSnapshot"
        :alt="`${result.title}未来科学城整页基因海报，长按图片保存`"
        draggable="false"
      />
    </div>

    <p class="sr-only" role="status" aria-live="polite">{{ actionStatus }}</p>

    <Transition name="share-guide">
      <div
        v-if="shareGuideVisible"
        class="share-guide"
        role="dialog"
        aria-modal="true"
        aria-label="分享指引"
        @click="shareGuideVisible = false"
      >
        <div class="share-guide__content">
          <img
            class="share-guide__arrow"
            src="/assets/share-guide-arrow.png"
            alt=""
            aria-hidden="true"
          />
          <p class="share-guide__text">请点击此处进行分享～</p>
        </div>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { gsap } from 'gsap';
import { domToPng } from 'modern-screenshot';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createRandomResultIndex,
  getResultProfile,
  normalizeResultIdentity,
  normalizeResultYear
} from '../data/resultProfiles';
import { configureWeChatShare, isWeChatBrowser } from '../utils/wechat';

const route = useRoute();
const router = useRouter();
const resultRoot = ref(null);
const posterSnapshot = ref('');
const isPosterRendering = ref(false);
const shareGuideVisible = ref(false);
const actionStatus = ref('');
let animationContext;
let entranceTimeline;
let posterFontCssPromise;

const getPosterFontCss = () => {
  if (!posterFontCssPromise) {
    posterFontCssPromise = fetch('/fonts/ResourceHanRoundedCN-Bold.woff2?v=20260811-2')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load poster font');
        return response.blob();
      })
      .then((blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => resolve(reader.result), { once: true });
        reader.addEventListener('error', () => reject(reader.error), { once: true });
        reader.readAsDataURL(blob);
      }))
      .then((fontDataUrl) => `
        @font-face {
          font-family: 'Resource Han Rounded CN';
          src: url('${fontDataUrl}') format('woff2');
          font-style: normal;
          font-weight: 700;
          font-display: block;
        }
      `);
  }

  return posterFontCssPromise;
};

const getQueryValue = (value) => Array.isArray(value) ? value[0] : value;
const getResultOptionIndex = (value) => {
  const queryValue = getQueryValue(value);
  return typeof queryValue === 'string' && /^[0-2]$/.test(queryValue)
    ? Number(queryValue)
    : createRandomResultIndex();
};

const selectedYear = normalizeResultYear(getQueryValue(route.query.year));
const selectedIdentity = normalizeResultIdentity(getQueryValue(route.query.identity));
const traitIndex = getResultOptionIndex(route.query.trait);
const descriptionIndex = getResultOptionIndex(route.query.description);
const result = getResultProfile({
  year: selectedYear,
  identity: selectedIdentity,
  traitIndex,
  descriptionIndex
});

const stableResultQuery = {
  year: String(result.year),
  identity: result.identity,
  trait: String(traitIndex),
  description: String(descriptionIndex)
};

const timelineQuery = () => ({
  year: String(result.year),
  identity: result.identity
});

const goBack = () => {
  router.replace({ name: 'Timeline', query: timelineQuery() });
};

const waitForPosterAssets = async () => {
  const images = Array.from(resultRoot.value?.querySelectorAll('img') ?? []);
  const posterFontText = [result.title, result.lead, result.tag, result.trait, result.description].join('');
  const imagePromises = images.map((image) => {
    if (image.complete) return Promise.resolve();

    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  });

  await Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    document.fonts?.load?.('700 16px "Resource Han Rounded CN"', posterFontText) ?? Promise.resolve(),
    ...imagePromises
  ]);
};

const generatePoster = async () => {
  if (posterSnapshot.value) {
    actionStatus.value = '请长按页面图片保存';
    return;
  }
  if (!resultRoot.value || isPosterRendering.value) return;

  isPosterRendering.value = true;
  actionStatus.value = '正在生成基因海报';

  try {
    await nextTick();
    const [posterFontCss] = await Promise.all([
      getPosterFontCss(),
      waitForPosterAssets()
    ]);

    const captureEl = resultRoot.value;
    const captureWidth = captureEl.offsetWidth;
    const captureHeight = captureEl.offsetHeight;
    const currentFontSize = window.getComputedStyle(document.documentElement).fontSize;

    const dataUrl = await domToPng(captureEl, {
      scale: 2,
      width: captureWidth,
      height: captureHeight,
      font: {
        cssText: posterFontCss,
        preferredFormat: 'woff2'
      },
      style: {
        transform: 'none',
        transformStyle: 'flat',
        animation: 'none',
        transition: 'none',
        filter: 'none',
        backdropFilter: 'none',
        webkitBackdropFilter: 'none',
        webkitTextSizeAdjust: '100%',
        textSizeAdjust: '100%'
      },
      onCloneNode: (clonedNode) => {
        if (clonedNode?.ownerDocument?.documentElement) {
          clonedNode.ownerDocument.documentElement.style.fontSize = currentFontSize;
        }

        const clonedPosterButton = clonedNode?.querySelector?.('.result-button--light');
        if (clonedPosterButton) {
          clonedPosterButton.removeAttribute('disabled');
          clonedPosterButton.textContent = '生成我的基因海报';
        }
      }
    });

    if (!resultRoot.value) return;
    posterSnapshot.value = dataUrl;
    actionStatus.value = '整页基因海报已生成，请长按页面图片保存';
  } catch {
    actionStatus.value = '海报生成失败，请点击按钮重试';
  } finally {
    isPosterRendering.value = false;
  }
};

const sharePoster = async () => {
  if (isWeChatBrowser()) {
    shareGuideVisible.value = true;
    actionStatus.value = '请点击微信右上角菜单分享给朋友';
    return;
  }

  const shareData = {
    title: `我的未来科学城基因海报｜${result.title}`,
    text: `我的未来科学城基因是：${result.title}`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
      actionStatus.value = '分享面板已打开';
      return;
    }
  } catch (error) {
    if (error?.name !== 'AbortError') actionStatus.value = '暂时无法分享，请稍后重试';
  }
};

const prepareWeChatShare = async () => {
  if (!isWeChatBrowser()) return;

  try {
    await configureWeChatShare({
      title: `我的未来科学城基因海报｜${result.title}`,
      description: `我的未来科学城基因是：${result.title}`,
      link: window.location.href.split('#')[0],
      imageUrl: new URL('/share.jpg', window.location.origin).href
    });
  } catch (error) {
    console.error('Unable to configure WeChat share', error);
    actionStatus.value = '微信分享卡片配置失败，请刷新页面后重试';
  }
};

const retryQuiz = () => {
  router.replace({ name: 'Quiz', query: { step: 'profile' } });
};

onMounted(() => {
  const resolvedResultRoute = router.resolve({ name: 'Result', query: stableResultQuery });
  if (resolvedResultRoute.fullPath !== route.fullPath) {
    void router
      .replace({ name: 'Result', query: stableResultQuery })
      .then(prepareWeChatShare);
  } else {
    void prepareWeChatShare();
  }
  document.title = `未来科学城 MBTI - ${result.title}`;

  animationContext = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      void generatePoster();
      return;
    }

    entranceTimeline = gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => void generatePoster()
      })
      .timeScale(0.5);
    entranceTimeline
      .from('.result-scene__cloud', {
        autoAlpha: 0,
        scale: 1.06,
        y: -22,
        duration: 1.05,
        clearProps: 'transform,opacity,visibility'
      }, 0)
      .from('.result-scene__city-window', {
        autoAlpha: 0,
        y: 34,
        duration: 0.82,
        clearProps: 'transform,opacity,visibility'
      }, 0.08)
      .from('.top-nav', {
        autoAlpha: 0,
        y: -12,
        duration: 0.4,
        clearProps: 'transform,opacity,visibility'
      }, 0.08)
      .from('.result-card', {
        autoAlpha: 0,
        scale: 0.94,
        rotationY: -4,
        duration: 0.72,
        clearProps: 'transform,opacity,visibility'
      }, 0.22)
      .from('.result-card__accent, .result-card__corner, .result-card__eyebrow', {
        autoAlpha: 0,
        x: -12,
        duration: 0.38,
        stagger: 0.06,
        clearProps: 'transform,opacity,visibility'
      }, 0.56)
      .from('.result-card__title-wrap', {
        autoAlpha: 0,
        x: -24,
        scale: 0.92,
        duration: 0.54,
        clearProps: 'transform,opacity,visibility'
      }, 0.62)
      .from('.result-character', {
        autoAlpha: 0,
        x: 38,
        scale: 0.96,
        duration: 0.64,
        clearProps: 'transform,opacity,visibility'
      }, 0.68)
      .from('.result-card__lead, .result-card__tag, .result-card__tag-line', {
        autoAlpha: 0,
        y: 12,
        duration: 0.42,
        stagger: 0.075,
        clearProps: 'transform,opacity,visibility'
      }, 0.86)
      .from('.result-card__traits p', {
        autoAlpha: 0,
        x: -14,
        duration: 0.4,
        stagger: 0.075,
        clearProps: 'transform,opacity,visibility'
      }, 1.02)
      .from('.result-card__divider, .result-card__quote, .result-card blockquote', {
        autoAlpha: 0,
        y: 10,
        duration: 0.46,
        stagger: 0.07,
        clearProps: 'transform,opacity,visibility'
      }, 1.18)
      .from('.result-actions > *, .retry-button', {
        autoAlpha: 0,
        y: 18,
        duration: 0.46,
        stagger: 0.08,
        clearProps: 'transform,opacity,visibility'
      }, 1.32)
      .from('.result-mascot--speaker', {
        autoAlpha: 0,
        x: -18,
        y: -12,
        duration: 0.48,
        clearProps: 'transform,opacity,visibility'
      }, 1.42)
      .from('.result-mascot--star', {
        autoAlpha: 0,
        y: 20,
        scale: 0.82,
        duration: 0.55,
        ease: 'back.out(1.5)',
        clearProps: 'transform,opacity,visibility'
      }, 1.5);
  }, resultRoot.value);
});

onUnmounted(() => {
  entranceTimeline?.kill();
  animationContext?.revert();
});
</script>

<style scoped>
.result-view {
  --result-scale: 1;
  --result-stage-height: 553px;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #40acf5;
  color: #333;
}

.wechat-share-thumbnail {
  position: fixed;
  left: -9999px;
  width: 300px;
  height: 300px;
  opacity: 0;
  pointer-events: none;
}

.result-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 67px 0 max(24px, env(safe-area-inset-bottom));
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.result-content::-webkit-scrollbar {
  display: none;
}

.result-stage {
  position: relative;
  flex: 0 0 var(--result-stage-height);
  width: 100%;
  height: var(--result-stage-height);
}

.result-stage__canvas {
  position: absolute;
  top: 0;
  left: 50%;
  width: 370px;
  height: 553px;
  margin-left: 10px;
  transform: translateX(-50%) scale(var(--result-scale));
  transform-origin: top center;
}

.result-scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.result-scene__cloud {
  position: absolute;
  top: -83px;
  left: 50%;
  width: 544px;
  height: 967px;
  object-fit: cover;
  opacity: 0.7;
  transform: translateX(-50%);
  -webkit-mask-image: url('/assets/result-cloud-mask.svg');
  -webkit-mask-position: 72px 63px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 390px 797px;
  mask-image: url('/assets/result-cloud-mask.svg');
  mask-position: 72px 63px;
  mask-repeat: no-repeat;
  mask-size: 390px 797px;
}

.result-scene__city-window {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 100%;
  height: 153px;
  overflow: hidden;
  mix-blend-mode: luminosity;
  transform: translateX(-50%);
  -webkit-mask-image: url('/assets/result-city-mask.svg');
  -webkit-mask-position: 0 -644px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: 100% 797px;
  mask-image: url('/assets/result-city-mask.svg');
  mask-position: 0 -644px;
  mask-repeat: no-repeat;
  mask-size: 100% 797px;
}

.result-scene__city {
  position: absolute;
  top: -452.45%;
  left: 0;
  width: 100%;
  height: 552.61%;
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

.top-nav button {
  display: grid;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.top-nav img {
  display: block;
  width: 24px;
  height: 24px;
}

.top-nav__title {
  position: absolute;
  top: 17px;
  left: 50%;
  color: #fff;
  font-size: 15px;
  line-height: 18px;
  opacity: 0.6;
  transform: translateX(-50%);
}

.result-card {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 350px;
  height: 553px;
  border: 2px solid #fff;
  border-radius: 30px 80px 30px 30px;
  background: linear-gradient(180deg, #cef8ff 0%, #fff 49.52%, #fff 100%);
  box-shadow: 0 4px 4px rgb(0 0 0 / 5%);
  backdrop-filter: blur(2px);
  transition: filter 240ms ease, transform 240ms ease;
  transform-style: preserve-3d;
  will-change: transform, opacity;
  box-sizing: border-box;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

.result-card-canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  width: 370px;
  height: 553px;
}

.result-card--hidden {
  opacity: 0 !important;
  pointer-events: none !important;
}

.result-page-snapshot {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: fill;
  -webkit-touch-callout: default;
  user-select: auto;
}

.result-card__accent,
.result-card__corner,
.result-card__title-wrap,
.result-character,
.result-card__lead,
.result-card__tag,
.result-card__tag-line,
.result-card__traits,
.result-card__quote,
.result-card blockquote,
.result-card__footer {
  position: absolute;
}

.result-card__accent {
  top: 22px;
  left: 227px;
  width: 43px;
  height: 10px;
}

.result-card__corner {
  top: 21px;
  left: 277px;
  width: 54px;
  height: 62px;
}

.result-card__eyebrow {
  position: absolute;
  top: 17px;
  left: 18px;
  margin: 0;
  color: #62cef8;
  font-size: 12px;
  line-height: normal;
  text-transform: uppercase;
}

.result-card__title-wrap {
  top: 35px;
  left: 18px;
  width: 136px;
  height: 102px;
}

.result-card__title-wrap img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
}

.result-card__title-wrap h1 {
  position: absolute;
  top: 12px;
  left: 0;
  margin: 0;
  color: #0ca1ff;
  font-family: 'Resource Han Rounded CN', 'zihunbiantaoti', 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 44px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.result-character {
  top: 20px;
  right: -20px;
  width: 196px;
  height: 320px;
  overflow: hidden;
  pointer-events: none;
  will-change: transform, opacity;
  z-index: 11;
}

.result-character img {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.result-card__lead {
  top: 125px;
  left: 18px;
  /* width: 132px; */
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 18px;
  text-wrap: balance;
}

.result-card__tag {
  top: 154px;
  left: 18px;
  max-width: 132px;
  margin: 0;
  padding: 2px;
  background: linear-gradient(90deg, #42dcff 0%, #2993ff 51.44%, #938cfe 100%);
  color: #fff;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
  box-sizing: border-box;
}

.result-card__tag-line {
  top: 190px;
  left: 18px;
  width: 63px;
  height: 4px;
  background: #00476a;
}

.result-card__traits {
  top: 210px;
  left: 18px;
  /* width: 132px; */
  font-family: 'Resource Han Rounded CN', 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  text-wrap: balance;
}

.result-card__traits p {
  margin: 0;
}

.result-card__traits p + p {
  margin-top: 3px;
}

.result-card__quote {
  z-index: 0;
  color: #e5f1fe;
  font-family: Georgia, serif;
  font-size: 100px;
  line-height: 1;
  pointer-events: none;
}

.result-card__quote--open {
  top: 268px;
  left: 18px;
}

.result-card__quote--close {
  top: 418px;
  left: 256px;
}

.result-card blockquote {
  top: 328px;
  left: 18px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 310px;
  height: 90px;
  margin: 0;
  padding: 12px;
  border-radius: 12px;
  background: linear-gradient(108deg, rgb(228 241 254 / 0%) 0%, rgb(228 241 254 / 90%) 49.52%, #e4f1fe 100%);
  color: #057be8;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 22px;
}

.result-card__footer {
  top: 463px;
  left: 18px;
  width: 310px;
  height: 60px;
}

.result-card__qr {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 60px;
  height: 60px;
}

.result-card__footer p {
  position: absolute;
  top: 26px;
  left: 68px;
  margin: 0;
  color: #333;
  font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  white-space: nowrap;
}

.result-card__brand {
  position: absolute;
  top: 17px;
  left: 190px;
  display: block;
  width: 120px;
  height: 35.372px;
}

.result-mascot {
  position: absolute;
  z-index: 7;
  pointer-events: none;
  user-select: none;
}

.result-mascot--speaker {
  top: -53px;
  left: -15px;
  width: 90px;
  height: 104px;
  transform: rotate(180deg) scaleY(-1);
}

.result-mascot--star {
  top: 27px;
  left: 271px;
  width: 118px;
  height: 118px;
}

.result-controls {
  position: relative;
  flex: 0 0 auto;
  width: min(350px, calc(100% - 40px));
  margin-top: 26px;
}

.result-actions {
  position: relative;
  z-index: 6;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.result-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  padding: 0 12px;
  border-radius: 30px;
  box-shadow: inset 0 0 6px #bce1ff;
  font-family: 'Resource Han Rounded CN', 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  cursor: pointer;
  transition: filter 140ms ease-out, transform 140ms ease-out;
}

.result-button--light {
  border: 0;
  background: #fff;
  color: #333;
}

.result-button--primary {
  border: 1px solid #fff;
  background: linear-gradient(180deg, #279bff 0%, #40b6ff 100%);
  color: #fff;
}

.retry-button {
  position: relative;
  z-index: 8;
  display: flex;
  align-items: center;
  gap: 2px;
  width: max-content;
  margin: 16px auto 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #fff;
  font-family: 'Resource Han Rounded CN', 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 14px;
  line-height: normal;
  cursor: pointer;
  transition: opacity 140ms ease-out, transform 140ms ease-out;
}

.retry-button img {
  width: 16px;
  height: 16px;
}

.top-nav button:focus-visible,
.result-button:focus-visible,
.retry-button:focus-visible {
  outline: 3px solid rgb(255 255 255 / 78%);
  outline-offset: 3px;
}

.result-button:active {
  transform: scale(0.98);
}

.result-button:disabled {
  cursor: wait;
  opacity: 0.72;
}

.retry-button:active {
  opacity: 0.78;
  transform: scale(0.97);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.share-guide {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgb(0 0 0 / 50%);
  cursor: pointer;
}

.share-guide__content {
  position: absolute;
  top: max(12px, env(safe-area-inset-top));
  right: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.share-guide__arrow {
  display: block;
  width: 148px;
  height: 85.57px;
}

.share-guide__text {
  margin: 8px 0 0;
  color: #fff;
  font-family: 'Resource Han Rounded CN', 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: normal;
  white-space: nowrap;
  text-align: center;
  text-shadow: 0 1px 4px rgb(0 0 0 / 40%);
}

.share-guide-enter-active,
.share-guide-leave-active {
  transition: opacity 220ms ease-out;
}

.share-guide-enter-from,
.share-guide-leave-to {
  opacity: 0;
}

@media (max-height: 800px) {
  .result-view {
    --result-scale: 0.9;
    --result-stage-height: 498px;
  }

  .result-controls {
    margin-top: 18px;
  }

  .retry-button {
    margin-top: 14px;
  }
}

@media (max-height: 700px) {
  .result-view {
    --result-scale: 0.82;
    --result-stage-height: 454px;
  }

  .result-controls {
    margin-top: 12px;
  }

  .retry-button {
    margin-top: 12px;
  }
}

</style>
