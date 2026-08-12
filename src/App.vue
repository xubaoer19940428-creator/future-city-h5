<template>
  <div class="w-full h-full min-h-dvh flex justify-center items-center bg-[#4cb5f7]">
    <div class="app-shell w-full h-full relative overflow-hidden bg-[#4cb5f7] flex flex-col">
      <router-view v-slot="{ Component, route }">
        <div v-if="isWeChat" :key="route.fullPath" class="route-stage">
          <component :is="Component" />
        </div>
        <Transition v-else name="deck" appear>
          <div :key="route.fullPath" class="route-stage">
            <component :is="Component" />
          </div>
        </Transition>
      </router-view>
      <button
        class="global-audio-control"
        type="button"
        data-audio-control
        :aria-label="isAudioPlaying ? '暂停背景音乐' : '播放背景音乐'"
        :aria-pressed="isAudioPlaying"
        @click="toggleAudio"
      >
        <img src="/assets/nav-music.svg" alt="" />
      </button>
      <audio
        ref="backgroundAudio"
        src="/media/football.mp3"
        preload="auto"
        autoplay
        loop
        playsinline
        hidden
        aria-hidden="true"
        @play="isAudioPlaying = true"
        @pause="isAudioPlaying = false"
      ></audio>
    </div>
  </div>
</template>

<script setup>
import { onMounted, provide, ref } from 'vue';
import { isWeChatBrowser } from './utils/wechat';

const backgroundAudio = ref(null);
const isAudioPlaying = ref(false);
const isWeChat = isWeChatBrowser();
let playAttempt = 0;
let userPaused = false;

const playAudio = async () => {
  if (!backgroundAudio.value || userPaused) return;

  const attempt = ++playAttempt;

  try {
    await backgroundAudio.value.play();

    if (userPaused) {
      backgroundAudio.value.pause();
      return;
    }

    if (attempt !== playAttempt) return;
  } catch {
    // The home CTA retries playback from an explicit user interaction.
  }
};

const toggleAudio = () => {
  if (!backgroundAudio.value) return;

  if (backgroundAudio.value.paused) {
    userPaused = false;
    void playAudio();
    return;
  }

  userPaused = true;
  playAttempt += 1;
  backgroundAudio.value.pause();
};

provide('backgroundAudio', {
  play: playAudio
});

onMounted(() => {
  backgroundAudio.value.volume = 0.45;
  void playAudio();
});
</script>

<style scoped>
.app-shell {
  width: 100%;
  max-width: none;
  perspective: 1200px;
}

.route-stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  backface-visibility: hidden;
  transform-origin: center center;
  will-change: transform, opacity;
}

.deck-enter-active {
  z-index: 2;
  transition:
    opacity 760ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 1100ms cubic-bezier(0.22, 1, 0.36, 1);
}

.deck-leave-active {
  z-index: 1;
  pointer-events: none;
  transition:
    opacity 420ms cubic-bezier(0.4, 0, 1, 1),
    transform 560ms cubic-bezier(0.4, 0, 1, 1);
}

.deck-enter-from {
  opacity: 0;
  transform: translate3d(5.5%, 0, 0) rotateY(-1.2deg) scale(1.018);
}

.deck-leave-to {
  opacity: 0;
  transform: translate3d(-2.5%, 0, 0) rotateY(0.7deg) scale(0.992);
}

.global-audio-control {
  position: absolute;
  top: 14px;
  right: 12px;
  z-index: 100;
  display: grid;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.global-audio-control img {
  display: block;
  width: 24px;
  height: 24px;
}

.global-audio-control[aria-pressed='true'] img {
  filter: drop-shadow(0 0 4px rgb(255 255 255 / 80%));
}

.global-audio-control:focus-visible {
  outline: 3px solid rgb(255 255 255 / 75%);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .deck-enter-active,
  .deck-leave-active {
    transition: opacity 160ms ease-out;
  }

  .deck-enter-from,
  .deck-leave-to {
    opacity: 0;
    transform: none;
  }
}
</style>
