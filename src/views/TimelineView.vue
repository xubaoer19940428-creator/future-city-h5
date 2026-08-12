<template>
	<main ref="timelineRoot" class="timeline-view" aria-label="未来科学城时光之旅">
		<Swiper
			class="timeline-swiper"
			:initial-slide="initialIndex"
			:speed="1050"
			:allow-touch-move="true"
			@swiper="onSwiperReady"
			@slide-change="onSlideChange"
			@slide-change-transition-start="onSlideChangeTransitionStart"
			@slide-change-transition-end="onSlideChangeTransitionEnd"
		>
			<SwiperSlide v-for="(item, itemIndex) in timelineContent" :key="item.year">
				<article class="timeline-slide" :aria-label="`${item.year}年：${item.title}`">
					<header class="year-heading">
						<h1>
							<span>{{ item.year }} ·</span>
							<span class="year-heading__title">
								<img src="/assets/title-highlight.svg" alt="" />
								<span>{{ item.title }}</span>
							</span>
						</h1>
						<p>{{ item.subtitle }}</p>
					</header>

					<section
						class="timeline-events"
						tabindex="0"
						:aria-label="`${item.year}年重要事件`"
						@scroll.passive="onEventsScroll"
						@pointerdown="stopAutoScroll"
						@touchstart.passive="stopAutoScroll"
						@wheel.passive="stopAutoScroll"
						@keydown="stopAutoScroll"
					>
						<div class="timeline-track">
							<span class="timeline-line" aria-hidden="true"></span>
							<span class="timeline-line-head" aria-hidden="true"></span>
							<article v-for="event in item.events" :key="event.label" class="event-group">
								<span class="event-dot" aria-hidden="true"></span>
								<span class="event-dot-pulse" aria-hidden="true"></span>
								<div class="event-content">
									<h2>{{ event.label }}</h2>
									<div class="event-card">
										<div v-for="(content, contentIndex) in event.items" :key="`${event.label}-${contentIndex}`" class="event-card__item">
											<p>{{ content.description }}</p>
											<img v-if="itemIndex === currentIndex && content.image" :src="content.image" alt="" />
										</div>
									</div>
								</div>
							</article>
						</div>
					</section>
				</article>
			</SwiperSlide>
		</Swiper>

		<nav class="top-nav" aria-label="页面导航">
			<button class="top-nav__back" type="button" aria-label="返回选择页" @click="goBack">
				<img src="/assets/nav-back.svg" alt="" />
			</button>
			<span class="top-nav__title">我的未来科学城</span>
			<!-- <img class="top-nav__share" src="/assets/nav-share.svg" alt="" aria-hidden="true" /> -->
		</nav>

		<footer class="timeline-footer">
			<nav class="year-nav" aria-label="年份导航">
				<button type="button" :disabled="currentIndex === 0" @click="swiper?.slidePrev()">上一年</button>
				<button
					class="year-nav__next"
					:class="{ 'year-nav__next--result': currentIndex === timelineContent.length - 1 }"
					type="button"
					@click="goNext"
				>
					{{ currentIndex === timelineContent.length - 1 ? '查看我的基因图谱' : '下一年' }}
				</button>
			</nav>
			<button class="result-link" type="button" @click="showResult">直接查看结果 <span aria-hidden="true">》</span></button>
		</footer>
	</main>
</template>

<script setup>
import { gsap } from 'gsap'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { createRandomResultIndex } from '../data/resultProfiles'
import { FIRST_TIMELINE_YEAR, timelineContent } from '../data/timelineContent'
import 'swiper/css'

const route = useRoute()
const router = useRouter()
const timelineRoot = ref(null)
const swiper = ref(null)
const currentIndex = ref(0)
let revealContext = null
let revealRequest = 0
let reduceMotionQuery = null
let preparedReveal = null
let revealedEvents = new WeakSet()
let scrollRevealFrame = 0
let lineProgress = 0
let autoScrollFrame = 0
let autoScrollDelayTimer = 0
let autoScrollPanel = null
let autoScrollTrack = null
let autoScrollPosition = 0
let autoScrollLastTime = 0
let autoScrollCancelled = false

const requestedYear = Number(route.query.year)
const initialIndex = computed(() => {
	if (!Number.isInteger(requestedYear)) return 0
	return Math.min(Math.max(requestedYear - FIRST_TIMELINE_YEAR, 0), timelineContent.length - 1)
})

const currentYear = computed(() => FIRST_TIMELINE_YEAR + currentIndex.value)

const cancelAutoScroll = (cancelForCurrentYear = false) => {
	if (autoScrollDelayTimer) window.clearTimeout(autoScrollDelayTimer)
	if (autoScrollFrame) cancelAnimationFrame(autoScrollFrame)
	if (autoScrollPanel && autoScrollTrack) {
		const maxScroll = Math.max(autoScrollPanel.scrollHeight - autoScrollPanel.clientHeight, 0)
		autoScrollPanel.scrollTop = Math.min(autoScrollPosition, maxScroll)
		gsap.set(autoScrollTrack, { clearProps: 'transform' })
	}
	if (autoScrollPanel) {
		const lineHead = autoScrollPanel.querySelector('.timeline-line-head')
		if (lineHead) gsap.set(lineHead, { clearProps: 'opacity,visibility,transform' })
	}
	autoScrollDelayTimer = 0
	autoScrollFrame = 0
	autoScrollPanel = null
	autoScrollTrack = null
	autoScrollLastTime = 0
	if (cancelForCurrentYear) autoScrollCancelled = true
}

const stopAutoScroll = () => {
	cancelAutoScroll(true)
}

const runAutoScroll = (time) => {
	const eventsPanel = autoScrollPanel
	const track = autoScrollTrack
	if (!eventsPanel || !track || autoScrollCancelled || !timelineRoot.value?.contains(eventsPanel)) {
		cancelAutoScroll()
		return
	}

	const maxScroll = Math.max(eventsPanel.scrollHeight - eventsPanel.clientHeight, 0)
	if (maxScroll <= 0 || autoScrollPosition >= maxScroll - 0.5) {
		autoScrollPosition = maxScroll
		cancelAutoScroll()
		return
	}

	if (!autoScrollLastTime) autoScrollLastTime = time
	const elapsedSeconds = Math.min((time - autoScrollLastTime) / 1000, 0.1)
	autoScrollLastTime = time
	autoScrollPosition = Math.min(autoScrollPosition + elapsedSeconds * 30, maxScroll)
	gsap.set(track, { y: -autoScrollPosition, force3D: true })
	revealScrolledEvents(eventsPanel)
	autoScrollFrame = requestAnimationFrame(runAutoScroll)
}

const scheduleAutoScroll = (eventsPanel) => {
	if (reduceMotionQuery?.matches || autoScrollCancelled) return
	const maxScroll = Math.max(eventsPanel.scrollHeight - eventsPanel.clientHeight, 0)
	if (maxScroll <= 0) return
	const track = eventsPanel.querySelector('.timeline-track')
	if (!track) return

	cancelAutoScroll()
	autoScrollPanel = eventsPanel
	autoScrollTrack = track
	autoScrollPosition = eventsPanel.scrollTop
	eventsPanel.scrollTop = 0
	gsap.set(track, { y: -autoScrollPosition, force3D: true })
	autoScrollDelayTimer = window.setTimeout(() => {
		autoScrollDelayTimer = 0
		autoScrollFrame = requestAnimationFrame(runAutoScroll)
	}, 600)
}

const resetActiveEventsScroll = async () => {
	await nextTick()
	const activeEvents = timelineRoot.value?.querySelector('.swiper-slide-active .timeline-events')
	if (activeEvents) activeEvents.scrollTop = 0
}

const clearActiveReveal = () => {
	revealRequest += 1
	cancelAutoScroll()
	if (scrollRevealFrame) cancelAnimationFrame(scrollRevealFrame)
	scrollRevealFrame = 0
	revealContext?.revert()
	revealContext = null
	preparedReveal = null
	revealedEvents = new WeakSet()
	lineProgress = 0
	autoScrollCancelled = false
}

const getActiveRevealTargets = () => {
	const activeSlide = timelineRoot.value.querySelector('.swiper-slide-active')
	const eventsPanel = activeSlide?.querySelector('.timeline-events')
	const track = activeSlide?.querySelector('.timeline-track')
	const line = activeSlide?.querySelector('.timeline-line')
	const lineHead = activeSlide?.querySelector('.timeline-line-head')
	if (!activeSlide || !eventsPanel || !track || !line || !lineHead) return null

	const panelRect = eventsPanel.getBoundingClientRect()
	const allEvents = Array.from(activeSlide.querySelectorAll('.event-group'))
	const visibleEvents = allEvents.filter((event) => {
		const eventRect = event.getBoundingClientRect()
		return eventRect.top < panelRect.bottom && eventRect.bottom > panelRect.top
	})

	return { eventsPanel, track, line, lineHead, allEvents, visibleEvents }
}

const getEventRevealParts = (event) => {
	const dot = event.querySelector('.event-dot')
	const pulse = event.querySelector('.event-dot-pulse')
	const date = event.querySelector('h2')
	const card = event.querySelector('.event-card')
	const items = Array.from(event.querySelectorAll('.event-card__item'))
	const images = Array.from(event.querySelectorAll('.event-card__item img'))
	if (!dot || !pulse || !date || !card) return null
	return { dot, pulse, date, card, items, images }
}

const setEventRevealState = (event) => {
	const parts = getEventRevealParts(event)
	if (!parts) return

	gsap.set(parts.dot, { autoAlpha: 0, scale: 0.55 })
	gsap.set(parts.pulse, { autoAlpha: 0, scale: 0.55 })
	gsap.set(parts.date, { autoAlpha: 0, x: -16 })
	gsap.set(parts.card, { autoAlpha: 0, x: 18, y: 8, scale: 0.985 })
	gsap.set(parts.items, { autoAlpha: 0, y: 10 })
	gsap.set(parts.images, { y: 8, scale: 0.97 })
}

const addEventReveal = (timeline, event, position) => {
	const parts = getEventRevealParts(event)
	if (!parts) return

	timeline
		.fromTo(
			parts.dot,
			{ autoAlpha: 0, scale: 0.55 },
			{ autoAlpha: 1, scale: 1, duration: 0.34, ease: 'back.out(1.8)', clearProps: 'opacity,visibility,transform' },
			position,
		)
		.fromTo(
			parts.pulse,
			{ autoAlpha: 0.7, scale: 0.55 },
			{ autoAlpha: 0, scale: 2.35, duration: 0.58, ease: 'power2.out', clearProps: 'opacity,visibility,transform' },
			position + 0.03,
		)
		.fromTo(
			parts.date,
			{ autoAlpha: 0, x: -16 },
			{ autoAlpha: 1, x: 0, duration: 0.4, clearProps: 'opacity,visibility,transform' },
			position + 0.06,
		)
		.fromTo(
			parts.card,
			{ autoAlpha: 0, x: 18, y: 8, scale: 0.985 },
			{ autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 0.58, clearProps: 'opacity,visibility,transform' },
			position + 0.14,
		)

	if (parts.items.length) {
		timeline.fromTo(
			parts.items,
			{ autoAlpha: 0, y: 10 },
			{ autoAlpha: 1, y: 0, duration: 0.44, stagger: 0.1, clearProps: 'opacity,visibility,transform' },
			position + 0.24,
		)
	}

	if (parts.images.length) {
		timeline.fromTo(
			parts.images,
			{ y: 8, scale: 0.97 },
			{ y: 0, scale: 1, duration: 0.52, stagger: 0.1, clearProps: 'transform' },
			position + 0.34,
		)
	}
}

const createRevealTimeline = ({ eventsPanel, track, line, lineHead, visibleEvents }) => {
	const lineDuration = 1.1
	const trackRect = track.getBoundingClientRect()
	const panelHeight = Math.max(eventsPanel.clientHeight, 1)
	const lineHeight = Math.max(line.offsetHeight, 1)
	const visibleLineProgress = Math.min(panelHeight / lineHeight, 1)
	lineProgress = Math.max(lineProgress, visibleLineProgress)
	const lineHeadY = Math.max(lineProgress * lineHeight - 3, 0)
	const revealTimeline = gsap.timeline({
		defaults: { ease: 'power3.out', overwrite: 'auto' },
		onComplete: () => {
			gsap.set(line, { scaleY: 1 })
			scheduleAutoScroll(eventsPanel)
		},
	})

	revealTimeline.to(line, { scaleY: lineProgress, duration: lineDuration, ease: 'power2.inOut' }, 0)
	revealTimeline.fromTo(lineHead, { autoAlpha: 0, y: 0 }, { autoAlpha: 1, y: lineHeadY, duration: lineDuration, ease: 'power2.inOut' }, 0)
	revealTimeline.to(lineHead, { autoAlpha: 0, duration: 0.18, clearProps: 'opacity,visibility,transform' }, lineDuration - 0.02)

	visibleEvents.forEach((event) => {
		revealedEvents.add(event)

		const dotRect = event.querySelector('.event-dot')?.getBoundingClientRect()
		if (!dotRect) return
		const dotPosition = Math.min(Math.max(dotRect.top + dotRect.height / 2 - trackRect.top, 0), panelHeight)
		const revealAt = (dotPosition / panelHeight) * lineDuration
		addEventReveal(revealTimeline, event, revealAt)
	})
}

const revealScrolledEvents = (eventsPanel) => {
	if (reduceMotionQuery?.matches || !revealContext || !timelineRoot.value) return
	const activeSlide = timelineRoot.value.querySelector('.swiper-slide-active')
	if (!activeSlide || !activeSlide.contains(eventsPanel)) return

	const panelRect = eventsPanel.getBoundingClientRect()
	const enteringEvents = []
	activeSlide.querySelectorAll('.event-group').forEach((event) => {
		if (revealedEvents.has(event)) return
		const eventRect = event.getBoundingClientRect()
		if (eventRect.bottom <= panelRect.top) {
			revealedEvents.add(event)
			gsap.set(event.querySelectorAll('.event-dot, .event-dot-pulse, h2, .event-card, .event-card__item, .event-card__item img'), {
				clearProps: 'opacity,visibility,transform',
			})
			return
		}
		if (eventRect.top < panelRect.bottom - 12 && eventRect.bottom > panelRect.top) {
			revealedEvents.add(event)
			enteringEvents.push(event)
		}
	})

	if (!enteringEvents.length) return

	revealContext.add(() => {
		const scrollTimeline = gsap.timeline({ defaults: { overwrite: 'auto' } })
		enteringEvents.forEach((event, index) => {
			addEventReveal(scrollTimeline, event, index * 0.1)
		})
	})
}

const onEventsScroll = (event) => {
	const eventsPanel = event.currentTarget
	if (scrollRevealFrame) cancelAnimationFrame(scrollRevealFrame)
	scrollRevealFrame = requestAnimationFrame(() => {
		scrollRevealFrame = 0
		revealScrolledEvents(eventsPanel)
	})
}

const prepareActiveSlideReveal = async () => {
	clearActiveReveal()
	if (reduceMotionQuery?.matches) return

	const request = ++revealRequest
	await nextTick()
	if (request !== revealRequest || !timelineRoot.value) return

	preparedReveal = getActiveRevealTargets()
	if (!preparedReveal) return

	revealContext = gsap.context(() => {
		gsap.set(preparedReveal.line, { scaleY: 0, transformOrigin: 'top center' })
		gsap.set(preparedReveal.lineHead, { autoAlpha: 0, y: 0 })
		preparedReveal.allEvents.forEach((event) => {
			setEventRevealState(event)
		})
	}, timelineRoot.value)
}

const revealActiveSlide = async () => {
	if (reduceMotionQuery?.matches) {
		clearActiveReveal()
		return
	}

	const request = ++revealRequest
	await nextTick()
	if (request !== revealRequest || !timelineRoot.value) return

	const targets = preparedReveal ?? getActiveRevealTargets()
	if (!targets) return

	preparedReveal = null
	if (revealContext) {
		revealContext.add(() => createRevealTimeline(targets))
	} else {
		revealContext = gsap.context(() => {
			gsap.set(targets.line, { scaleY: 0, transformOrigin: 'top center' })
			gsap.set(targets.lineHead, { autoAlpha: 0, y: 0 })
			targets.allEvents.forEach((event) => {
				setEventRevealState(event)
			})
			createRevealTimeline(targets)
		}, timelineRoot.value)
	}
}

const onSwiperReady = (instance) => {
	swiper.value = instance
	currentIndex.value = instance.activeIndex
	void resetActiveEventsScroll()
}

const onSlideChange = (instance) => {
	currentIndex.value = instance.activeIndex
	void resetActiveEventsScroll()
}

const onSlideChangeTransitionStart = () => {
	void prepareActiveSlideReveal()
}

const onSlideChangeTransitionEnd = () => {
	void revealActiveSlide()
}

const onMotionPreferenceChange = () => {
	clearActiveReveal()
}

const identityQuery = () => (typeof route.query.identity === 'string' ? { identity: route.query.identity } : {})

const goBack = () => {
	router.replace({
		name: 'Quiz',
		query: {
			step: 'profile',
			year: String(currentYear.value),
			...identityQuery(),
		},
	})
}

const showResult = () => {
	router.replace({
		name: 'Result',
		query: {
			year: String(currentYear.value),
			...identityQuery(),
			trait: String(createRandomResultIndex()),
			description: String(createRandomResultIndex()),
		},
	})
}

const goNext = () => {
	if (currentIndex.value === timelineContent.length - 1) {
		showResult()
		return
	}

	swiper.value?.slideNext()
}

onMounted(() => {
	currentIndex.value = initialIndex.value
	reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
	reduceMotionQuery.addEventListener('change', onMotionPreferenceChange)
	void resetActiveEventsScroll()
	void revealActiveSlide()
})

onUnmounted(() => {
	clearActiveReveal()
	reduceMotionQuery?.removeEventListener('change', onMotionPreferenceChange)
})
</script>

<style scoped>
.timeline-view {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background: #42aff6 url('/assets/34346.jpg') center / 100% 100% no-repeat;
	color: #fff;
}

.timeline-swiper,
.timeline-slide {
	width: 100%;
	height: 100%;
}

.timeline-slide {
	position: relative;
	display: flex;
	flex-direction: column;
	padding: calc(64px + env(safe-area-inset-top)) 0 calc(92px + env(safe-area-inset-bottom));
	overflow: hidden;
}

.top-nav {
	position: absolute;
	top: env(safe-area-inset-top);
	left: 0;
	z-index: 20;
	display: grid;
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
.top-nav__share {
	display: block;
	width: 24px;
	height: 24px;
}

.top-nav__title {
	justify-self: center;
	font-size: 15px;
	font-weight: 400;
	line-height: 18px;
	opacity: 0.6;
}

.year-heading {
	flex: 0 0 auto;
	padding: 0 16px;
	font-family: 'Resource Han Rounded CN', 'Noto Sans SC', 'PingFang SC', sans-serif;
	text-shadow: 0 1px 4px rgb(0 111 185 / 45%);
}

.year-heading h1,
.year-heading p,
.event-group h2,
.event-card p {
	margin: 0;
}

.year-heading h1 {
	display: flex;
	align-items: baseline;
	gap: 5px;
	font-size: 30px;
	font-weight: 700;
	line-height: 38px;
	white-space: nowrap;
}

.year-heading__title {
	position: relative;
	display: inline-block;
}

.year-heading__title img {
	position: absolute;
	left: 50%;
	bottom: -2px;
	z-index: 10;
	width: 70px;
	height: 21px;
	transform: translateX(-50%);
}

.year-heading__title span {
	position: relative;
	z-index: 1;
}

.year-heading p {
	margin-top: 4px;
	font-size: 16px;
	font-weight: 700;
	line-height: 24px;
}

.timeline-events {
	position: relative;
	flex: 1 1 auto;
	min-height: 0;
	margin-top: 12px;
	padding: 0 0 28px;
	overflow-x: hidden;
	overflow-y: auto;
	overscroll-behavior: contain;
	scrollbar-width: none;
	touch-action: pan-y;
}

.timeline-events::-webkit-scrollbar {
	display: none;
}

.timeline-events:focus-visible {
	outline: 2px solid rgb(255 255 255 / 76%);
	outline-offset: -2px;
}

.timeline-track {
	position: relative;
	padding: 0 8px 0 57px;
}

.timeline-line {
	position: absolute;
	top: 8px;
	bottom: 0;
	left: 27px;
	z-index: 0;
	width: 2px;
	background: rgb(255 255 255 / 50%);
	pointer-events: none;
	transform-origin: top center;
}

.timeline-line-head {
	position: absolute;
	top: 8px;
	left: 24px;
	z-index: 1;
	display: block;
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: #fff;
	box-shadow: 0 0 10px 3px rgb(255 255 255 / 72%);
	opacity: 0;
	pointer-events: none;
}

.event-group {
	position: relative;
	z-index: 2;
}

.event-group + .event-group {
	margin-top: 14px;
}

.event-dot {
	position: absolute;
	top: 7px;
	left: -35px;
	z-index: 2;
	display: block;
	width: 12px;
	height: 12px;
	border: 1px solid #fff;
	border-radius: 50%;
	background: #14A4FF;
}

.event-dot-pulse {
	position: absolute;
	top: 5px;
	left: -37px;
	z-index: 1;
	display: block;
	width: 16px;
	height: 16px;
	border: 1px solid rgb(255 255 255 / 84%);
	border-radius: 50%;
	opacity: 0;
	pointer-events: none;
}

.event-dot::after {
	position: absolute;
	top: -3px;
	left: 4px;
	width: 2px;
	height: 16px;
	background: linear-gradient(to bottom, #14A4FF 0 2px, transparent 2px 14px, #14A4FF 14px);
	content: '';
	pointer-events: none;
}

.event-group h2 {
	color: #FFEE00;
	font-size: 26px;
	font-weight: 600;
	line-height: 36px;
	text-shadow: 0 1px 2px rgb(0 108 181 / 38%);
}

.event-card {

	margin-top: 7px;
	border-radius: 12px;
	border: 1px solid #FFF;
	background: #FFF;
	padding: 16px;
	color: #124360;
	font-family: "PingFang SC";
}

.event-card p {
	font-size: 15px;
	font-weight: 400;
	line-height: 21px;
	white-space: pre-line;
}

.event-card__item + .event-card__item {
	margin-top: 10px;
	/* padding-top: 18px;
	border-top: 1px solid rgb(18 67 96 / 12%); */
}

.event-card img {
	display: block;
	width: 100%;
	height: auto;
	margin-top: 9px;
	border-radius: 8px;
}

.timeline-footer {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 20;
	height: calc(92px + env(safe-area-inset-bottom));
	padding-bottom: env(safe-area-inset-bottom);
	/* background: linear-gradient(180deg, rgb(228 247 255 / 0%) 0%, rgb(240 250 255 / 82%) 34%, rgb(255 255 255 / 94%) 100%); */
}

.year-nav {
	display: flex;
	justify-content: space-between;
	padding-top: 17px;
	pointer-events: none;
}

.year-nav button {
	width: 110px;
	height: 44px;
	padding: 0;
	border: 1px solid rgb(255 255 255 / 78%);
	border-radius: 0 30px 30px 0;
	background: rgb(255 255 255 / 96%);
	box-shadow: 0 4px 10px rgb(0 82 138 / 12%);
	color: #333;
	font-family: inherit;
	font-size: 16px;
	font-weight: 600;
	cursor: pointer;
	pointer-events: auto;
}

.year-nav .year-nav__next {
    border-right: none;
	border-radius: 30px 0 0 30px;
	background: linear-gradient(180deg, #1f9ff8, #44b9ff);
	color: #fff;
}

.year-nav .year-nav__next--result {
	width: 150px;
}

.year-nav button:disabled {
	cursor: default;
	opacity: 0.48;
}

.result-link {
	display: block;
	margin: 7px auto 0;
	padding: 0;
	border: 0;
	background: transparent;
	color: #274553;
	font-family: inherit;
	font-size: 12px;
	line-height: 18px;
	cursor: pointer;
}

.top-nav__back:focus-visible,
.year-nav button:focus-visible,
.result-link:focus-visible {
	outline: 3px solid rgb(255 255 255 / 76%);
	outline-offset: 3px;
}

.year-nav button:active,
.result-link:active,
.top-nav__back:active {
	transform: scale(0.97);
}

.year-nav button,
.result-link,
.top-nav__back {
	transition: transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
}
</style>
