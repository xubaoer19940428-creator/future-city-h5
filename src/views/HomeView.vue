<template>
  <main ref="homeRoot" class="home-page" data-node-id="68:2773">
    <div class="background" aria-hidden="true">
      <div class="background__layer background__layer--back">
        <img src="/assets/bg-clean.webp" alt="" />
      </div>
      <div class="background__layer background__layer--front">
        <img src="/assets/bg-layer-front.webp" alt="" />
      </div>
    </div>

    <img
      class="brand-logo"
      src="/assets/logo.webp"
      alt="未来科学城集团"
      data-node-id="68:2780"
    />

    <h1 class="sr-only">我的未来科学城 MBTI</h1>
    <div class="title-art" data-node-id="68:2791" aria-hidden="true">
      <img src="/assets/title-graphic.webp" alt="" />
    </div>

    <div class="star star--one" aria-hidden="true" data-node-id="68:2792">
      <img src="/assets/figma-star-1.svg" alt="" />
    </div>
    <div class="star star--two" aria-hidden="true" data-node-id="68:2793">
      <img src="/assets/figma-star-2.svg" alt="" />
    </div>

    <div class="tagline tagline--lead" data-node-id="68:2794">
      <p>测一测</p>
    </div>
    <div class="tagline tagline--question" data-node-id="68:2795">
      <p>你的基因里藏着怎样的未来？</p>
    </div>

    <RouterLink
      class="start-button"
      to="/quiz"
      replace
      data-node-id="68:2788"
      aria-label="开始未来科学城 MBTI 测试"
      @click="playBackgroundAudio"
    >
      <span>点击测试</span>
    </RouterLink>
  </main>
</template>

<script setup>
import { gsap } from 'gsap';
import { inject, onMounted, onUnmounted, ref } from 'vue';

const backgroundAudio = inject('backgroundAudio', null);
const homeRoot = ref(null);
let animationContext;

const playBackgroundAudio = () => {
  backgroundAudio?.play();
};

onMounted(() => {
  animationContext = gsap.context(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } }).timeScale(0.5);

    intro
      .from('.background__layer--back', {
        autoAlpha: 0,
        scale: 1.08,
        duration: 1.2,
        clearProps: 'transform,opacity,visibility'
      }, 0)
      .from('.background__layer--front', {
        autoAlpha: 0,
        scale: 1.12,
        yPercent: 3,
        duration: 1.15,
        clearProps: 'transform,opacity,visibility'
      }, 0.12)
      .from('.brand-logo', {
        autoAlpha: 0,
        y: -20,
        duration: 0.58,
        clearProps: 'transform,opacity,visibility'
      }, 0.18)
      .from('.title-art', {
        autoAlpha: 0,
        y: 24,
        scale: 0.94,
        duration: 0.82,
        clearProps: 'transform,opacity,visibility'
      }, 0.34)
      .from('.star', {
        autoAlpha: 0,
        scale: 0.72,
        rotation: -18,
        duration: 0.5,
        stagger: 0.1,
        clearProps: 'transform,opacity,visibility'
      }, 0.72)
      .from('.tagline', {
        autoAlpha: 0,
        y: 18,
        duration: 0.56,
        stagger: 0.1,
        clearProps: 'transform,opacity,visibility'
      }, 0.84)
      .from('.start-button', {
        autoAlpha: 0,
        duration: 0.48,
        clearProps: 'opacity,visibility'
      }, 1.12);
  }, homeRoot.value);
});

onUnmounted(() => {
  animationContext?.revert();
});
</script>

<style scoped>
.home-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #4cb5f7;
  isolation: isolate;
}

.background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.background__layer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  -webkit-mask-image: url('/assets/bg-mask.svg');
  mask-image: url('/assets/bg-mask.svg');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.background__layer img {
  display: block;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
}

.background__layer--back {
  top: -0.89%;
  width: 121.54%;
  height: 106.71%;
  -webkit-mask-position: center top;
  mask-position: center top;
  -webkit-mask-size: 82.28% 94.54%;
  mask-size: 82.28% 94.54%;
}

.background__layer--front {
  top: -1.14%;
  width: 115.38%;
  height: 101.14%;
  -webkit-mask-position: center bottom;
  mask-position: center bottom;
  -webkit-mask-size: 86.67% 99.75%;
  mask-size: 86.67% 99.75%;
}

.brand-logo {
  position: absolute;
  top: 5.44%;
  left: 50%;
  z-index: 20;
  width: 23.08%;
  height: auto;
  transform: translateX(-50%);
  pointer-events: none;
  will-change: transform, opacity;
}

.title-art {
  position: absolute;
  top: 9.11%;
  left: -1.28%;
  z-index: 20;
  width: 102.56%;
  height: auto;
  aspect-ratio: 400 / 270;
  overflow: hidden;
  filter: drop-shadow(0 0 15px #62bcff);
  pointer-events: none;
  will-change: transform, opacity;
}

.title-art img {
  position: absolute;
  top: -10.93%;
  left: 0;
  width: 100%;
  height: 111.11%;
  max-width: none;
}

.star {
  position: absolute;
  z-index: 30;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.star img {
  display: block;
  width: 108.55%;
  height: 108.55%;
  max-width: none;
  will-change: transform, opacity;
}

.star--one {
  top: 12.91%;
  left: 84.1%;
  width: 7.85%;
  aspect-ratio: 1;
}

.star--one img {
  animation: star-glimmer-one 3.8s ease-in-out infinite;
}

.star--two {
  top: 33.68%;
  left: 10.53%;
  width: 6.28%;
  aspect-ratio: 1;
}

.star--two img {
  animation: star-glimmer-two 4.4s ease-in-out 600ms infinite;
}

.tagline {
  position: absolute;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.tagline p {
  margin: 0;
  color: #00435a;
  font-family: 'Resource Han Rounded CN', 'PangMenZhengDao-Cu', 'Ma Shan Zheng', cursive;
  font-weight: 400;
  line-height: normal;
  white-space: nowrap;
  filter: drop-shadow(0 2px 3px rgb(255 255 255 / 48%));
  transform: rotate(-4deg);
  transform-origin: center;
  will-change: transform;
  animation: tagline-breathe 2.8s ease-in-out infinite;
}

.tagline--lead {
  top: 39.87%;
  left: 6.41%;
  width: 28.52%;
  height: 6.8%;
}

.tagline--lead p {
  font-size: 36px;
}

.tagline--question {
  top: 45.06%;
  left: 9.74%;
  width: 87.1%;
  height: 7.05%;
}

.tagline--question p {
  font-size: 26px;
  animation-delay: 180ms;
}

.start-button {
  position: absolute;
  top: 83.54%;
  left: 50%;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76.92%;
  height: 50px;
  padding: 0;
  border: 1px solid #fff;
  border-radius: 30px;
  background: linear-gradient(180deg, #279BFF 0%, #40B6FF 100%);
  box-shadow: inset 0 0 9px #d8efff, 0 9px 22px rgb(0 110 200 / 26%);
  color: #fff;
  cursor: pointer;
  /* transition: filter 150ms ease, transform 150ms ease; */
  transform: translateX(-50%);
  isolation: isolate;
  will-change: transform;
  animation: button-breathe 2.6s ease-in-out infinite;
  -webkit-tap-highlight-color: transparent;
}

.start-button::before {
  position: absolute;
  inset: -7px;
  z-index: -1;
  border: 1px solid rgb(255 255 255 / 55%);
  border-radius: inherit;
  content: '';
  opacity: 0;
  pointer-events: none;
  animation: button-halo 2.6s ease-out infinite;
}

.start-button span {
  font-family: 'Resource Han Rounded CN', 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
}

.start-button:active {
  animation: none;
  filter: brightness(0.96);
  transform: translateX(-50%) scale(0.98);
}

.start-button:focus-visible {
  outline: 3px solid rgb(255 255 255 / 80%);
  outline-offset: 3px;
}

@keyframes tagline-breathe {
  0%,
  100% {
    transform: rotate(-4deg) scale(1);
  }

  50% {
    transform: rotate(-4deg) scale(1.04);
  }
}

@keyframes star-glimmer-one {
  0%,
  100% {
    opacity: 0.72;
    transform: translate3d(0, 2px, 0) rotate(-15deg) scale(0.92);
  }

  50% {
    opacity: 1;
    transform: translate3d(0, -3px, 0) rotate(-7deg) scale(1.08);
  }
}

@keyframes star-glimmer-two {
  0%,
  100% {
    opacity: 0.68;
    transform: translate3d(0, 1px, 0) rotate(15deg) scale(0.94);
  }

  50% {
    opacity: 1;
    transform: translate3d(0, -3px, 0) rotate(23deg) scale(1.06);
  }
}

@keyframes button-breathe {
  0%,
  100% {
    transform: translateX(-50%) scale(1);
  }

  50% {
    transform: translateX(-50%) scale(1.025);
  }
}

@keyframes button-halo {
  0% {
    opacity: 0;
    transform: scale(0.97);
  }

  42% {
    opacity: 0.55;
  }

  100% {
    opacity: 0;
    transform: scale(1.12);
  }
}

@media (max-width: 389px) {
  .tagline--lead p {
    font-size: clamp(32px, 9.23vw, 36px);
  }

  .tagline--question p {
    font-size: clamp(23px, 6.67vw, 26px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tagline,
  .tagline p,
  .star img,
  .start-button,
  .start-button::before {
    animation: none;
  }

  .start-button {
    transition: none;
  }
}
</style>
