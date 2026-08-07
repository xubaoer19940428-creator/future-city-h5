<template>
  <div class="w-full h-full min-h-dvh flex justify-center items-center bg-[#4cb5f7]">
    <div class="app-shell w-full h-full relative overflow-hidden bg-[#4cb5f7] flex flex-col">
      <router-view v-slot="{ Component, route }">
        <Transition name="deck" mode="out-in" appear>
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

const backgroundAudio = ref(null);
const isAudioPlaying = ref(false);
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
  transform-origin: center center;
}

.deck-enter-active {
  transition:
    clip-path 760ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 600ms ease-out,
    transform 760ms cubic-bezier(0.22, 1, 0.36, 1);
}

.deck-leave-active {
  transition:
    opacity 260ms ease-out,
    transform 320ms cubic-bezier(0.4, 0, 1, 1);
}

.deck-enter-from {
  clip-path: inset(0 0 0 9%);
  opacity: 0;
  transform: translate3d(7%, 0, -36px) rotateY(-2deg) scale(0.985);
}

.deck-leave-to {
  opacity: 0;
  transform: translate3d(-4%, 0, -44px) rotateY(1.5deg) scale(0.985);
}

.global-audio-control {
  position: absolute;
  top: 14px;
  right: 48px;
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
    clip-path: none;
    opacity: 0;
    transform: none;
  }
}
</style>
