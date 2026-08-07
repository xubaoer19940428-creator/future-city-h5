<template>
  <div
    ref="root"
    class="quiz-select"
    :class="[
      `quiz-select--${placement}`,
      { 'quiz-select--open': isOpen, 'quiz-select--selected': selectedIndex >= 0 }
    ]"
    @touchstart.stop
    @touchend.stop
  >
    <button
      ref="trigger"
      class="quiz-select__trigger"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-label="`${label}：${selectedLabel || placeholder}`"
      :aria-controls="listboxId"
      :aria-expanded="isOpen"
      :aria-activedescendant="isOpen ? optionId(activeIndex) : undefined"
      @click="toggleList"
      @keydown="onTriggerKeydown"
    >
      <span>{{ selectedLabel || placeholder }}</span>
      <span class="quiz-select__divider" aria-hidden="true"></span>
      <img
        class="quiz-select__chevron"
        src="/assets/select-chevron.svg"
        alt=""
        aria-hidden="true"
      />
    </button>

    <Transition name="select-pop">
      <ul
        v-if="isOpen"
        :id="listboxId"
        class="quiz-select__options"
        role="listbox"
        :aria-label="label"
      >
        <li
          v-for="(option, index) in options"
          :id="optionId(index)"
          :key="option"
          class="quiz-select__option"
          :class="{
            'quiz-select__option--active': index === activeIndex,
            'quiz-select__option--selected': option === modelValue
          }"
          role="option"
          :aria-selected="option === modelValue"
          @mouseenter="activeIndex = index"
          @mousedown.prevent
          @click="chooseOption(option)"
        >
          <span>{{ formatOption(option) }}</span>
          <span class="quiz-select__check" aria-hidden="true">✓</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  optionSuffix: {
    type: String,
    default: ''
  },
  placement: {
    type: String,
    default: 'bottom',
    validator: (value) => ['top', 'bottom'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);
const instanceId = getCurrentInstance().uid;
const listboxId = `quiz-select-${instanceId}`;
const root = ref(null);
const trigger = ref(null);
const isOpen = ref(false);
const activeIndex = ref(0);

const selectedIndex = computed(() => props.options.findIndex((option) => option === props.modelValue));
const selectedLabel = computed(() => {
  if (selectedIndex.value < 0) return '';
  return formatOption(props.options[selectedIndex.value]);
});

const formatOption = (option) => `${option}${props.optionSuffix}`;
const optionId = (index) => `${listboxId}-option-${index}`;

const scrollActiveIntoView = () => {
  nextTick(() => {
    root.value
      ?.querySelector(`#${optionId(activeIndex.value)}`)
      ?.scrollIntoView({ block: 'nearest' });
  });
};

const openList = (direction = 1) => {
  if (!props.options.length) return;

  isOpen.value = true;
  activeIndex.value = selectedIndex.value >= 0
    ? selectedIndex.value
    : direction > 0 ? 0 : props.options.length - 1;
  scrollActiveIntoView();
};

const closeList = () => {
  isOpen.value = false;
};

const toggleList = () => {
  if (isOpen.value) {
    closeList();
    return;
  }

  openList();
};

const moveActive = (step) => {
  if (!isOpen.value) {
    openList(step);
    return;
  }

  activeIndex.value = (activeIndex.value + step + props.options.length) % props.options.length;
  scrollActiveIntoView();
};

const chooseOption = (option) => {
  emit('update:modelValue', option);
  closeList();
  nextTick(() => trigger.value?.focus());
};

const chooseActiveOption = () => {
  if (!isOpen.value) {
    openList();
    return;
  }

  chooseOption(props.options[activeIndex.value]);
};

const onTriggerKeydown = (event) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActive(1);
      break;
    case 'ArrowUp':
      event.preventDefault();
      moveActive(-1);
      break;
    case 'Home':
      if (!isOpen.value) return;
      event.preventDefault();
      activeIndex.value = 0;
      scrollActiveIntoView();
      break;
    case 'End':
      if (!isOpen.value) return;
      event.preventDefault();
      activeIndex.value = props.options.length - 1;
      scrollActiveIntoView();
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      chooseActiveOption();
      break;
    case 'Escape':
      if (!isOpen.value) return;
      event.preventDefault();
      closeList();
      break;
    case 'Tab':
      closeList();
      break;
  }
};

const onDocumentPointerDown = (event) => {
  if (!root.value?.contains(event.target)) closeList();
};

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown);
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown);
});
</script>

<style scoped>
.quiz-select {
  border-radius: 16px;
  isolation: isolate;
  transition: filter 180ms ease, transform 180ms ease;
}

.quiz-select--open {
  z-index: 50;
  filter: drop-shadow(0 8px 14px rgb(0 102 160 / 16%));
  transform: translateY(-2px);
}

.quiz-select__trigger {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 54px 0 18px;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 16px;
  outline: 0;
  background: linear-gradient(135deg, rgb(255 255 255 / 96%) 0%, rgb(236 248 255 / 82%) 55%, rgb(255 255 255 / 68%) 100%);
  box-shadow:
    0 12px 28px rgb(0 67 90 / 16%),
    inset 0 1px 0 #fff,
    inset 0 -1px 0 rgb(0 104 160 / 10%);
  color: rgb(0 67 90 / 52%);
  font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: normal;
  text-align: left;
  cursor: pointer;
  -webkit-backdrop-filter: blur(14px) saturate(1.12);
  backdrop-filter: blur(14px) saturate(1.12);
  transition: border-color 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.quiz-select--selected .quiz-select__trigger {
  color: #00435a;
  font-weight: 600;
}

.quiz-select__trigger:hover {
  border-color: #fff;
  background-color: rgb(247 253 255 / 88%);
}

.quiz-select__trigger:focus-visible {
  border-color: #fff;
  box-shadow:
    0 14px 32px rgb(0 67 90 / 18%),
    inset 0 1px 0 #fff,
    0 0 0 3px rgb(255 255 255 / 42%);
}

.quiz-select__divider {
  position: absolute;
  top: 50%;
  right: 48px;
  width: 1px;
  height: 25px;
  background: linear-gradient(180deg, transparent, rgb(0 67 90 / 18%), transparent);
  transform: translateY(-50%);
}

.quiz-select__chevron {
  position: absolute;
  top: 50%;
  right: 18px;
  width: 15px;
  height: 9px;
  transform: translateY(-50%);
  transition: transform 180ms ease;
}

.quiz-select--open .quiz-select__chevron {
  transform: translateY(-50%) rotate(180deg);
}

.quiz-select__options {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 1;
  max-height: 240px;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  border: 1px solid rgb(255 255 255 / 90%);
  border-radius: 16px;
  background: rgb(242 250 255 / 94%);
  box-shadow: 0 20px 44px rgb(0 55 85 / 24%), inset 0 1px 0 #fff;
  list-style: none;
  overscroll-behavior: contain;
  -webkit-backdrop-filter: blur(18px) saturate(1.16);
  backdrop-filter: blur(18px) saturate(1.16);
  scrollbar-color: rgb(51 161 224 / 55%) transparent;
  scrollbar-width: thin;
}

.quiz-select--bottom .quiz-select__options {
  top: calc(100% + 8px);
  transform-origin: top center;
}

.quiz-select--top .quiz-select__options {
  bottom: calc(100% + 8px);
  transform-origin: bottom center;
}

.quiz-select__options::-webkit-scrollbar {
  width: 5px;
}

.quiz-select__options::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgb(51 161 224 / 55%);
}

.quiz-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 43px;
  padding: 0 12px;
  border-radius: 11px;
  color: #245c70;
  font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 140ms ease, color 140ms ease, transform 140ms ease;
}

.quiz-select__option--active {
  background: rgb(76 181 247 / 14%);
  color: #00435a;
}

.quiz-select__option--selected {
  background: linear-gradient(135deg, #249cf1, #57bdf7);
  box-shadow: 0 6px 14px rgb(29 135 201 / 24%);
  color: #fff;
}

.quiz-select__check {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid rgb(0 67 90 / 15%);
  border-radius: 50%;
  color: transparent;
  font-size: 12px;
  font-weight: 700;
}

.quiz-select__option--selected .quiz-select__check {
  border-color: rgb(255 255 255 / 45%);
  background: rgb(255 255 255 / 18%);
  color: #fff;
}

.select-pop-enter-active,
.select-pop-leave-active {
  transition: opacity 160ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.select-pop-enter-from,
.select-pop-leave-to {
  opacity: 0;
  transform: translateY(-7px) scale(0.98);
}

.quiz-select--top .select-pop-enter-from,
.quiz-select--top .select-pop-leave-to {
  transform: translateY(7px) scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .quiz-select,
  .quiz-select__trigger,
  .quiz-select__chevron,
  .quiz-select__option,
  .select-pop-enter-active,
  .select-pop-leave-active {
    transition: none;
  }
}
</style>
