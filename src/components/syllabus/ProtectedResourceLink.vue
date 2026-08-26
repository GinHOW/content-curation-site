<template>
  <a
    class="protected-resource-link"
    href="https://jwdpvr5kbb674.ok.kimi.link"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="打开教材 2026"
  >
    <span class="protected-resource-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <path d="M6 7.5c3.65-.8 7.1-.25 10 1.6v16.1c-2.9-1.85-6.35-2.4-10-1.6z" />
        <path d="M26 7.5c-3.65-.8-7.1-.25-10 1.6v16.1c2.9-1.85 6.35-2.4 10-1.6z" />
        <path d="M16 9.1v16.1" />
      </svg>
    </span>
    <span class="protected-resource-copy">
      <span class="protected-resource-kicker">Course Material</span>
      <span class="protected-resource-title">教材 2026</span>
    </span>
    <span class="protected-resource-arrow" aria-hidden="true">↗</span>
  </a>
</template>

<style scoped>
.protected-resource-link {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.7rem;
  width: min(100%, 18rem);
  min-height: 44px;
  margin-top: clamp(3rem, 6vw, 5.5rem);
  padding: 0.65rem 0;
  color: var(--syllabus-muted);
  text-decoration: none;
  transition: color 180ms ease, transform 180ms ease;
}

.protected-resource-icon {
  display: grid;
  place-items: center;
  width: 2.45rem;
  height: 2.45rem;
  color: var(--syllabus-ink);
}

.protected-resource-icon svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}

.protected-resource-copy {
  display: grid;
  gap: 0.12rem;
}

.protected-resource-kicker {
  color: var(--syllabus-muted);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
}

.protected-resource-title {
  color: var(--syllabus-ink);
  font-family: var(--font-heavy);
  font-size: clamp(0.95rem, 1.35vw, 1.15rem);
  letter-spacing: 0.02em;
  line-height: 1.2;
}

.protected-resource-arrow {
  align-self: end;
  color: var(--syllabus-muted);
  font-size: 1.15rem;
  line-height: 1;
  transition: color 180ms ease, transform 180ms ease;
}

.protected-resource-link:hover,
.protected-resource-link:focus-visible {
  color: var(--syllabus-orange);
  transform: translateY(-0.08rem);
}

.protected-resource-link:hover .protected-resource-icon,
.protected-resource-link:focus-visible .protected-resource-icon,
.protected-resource-link:hover .protected-resource-kicker,
.protected-resource-link:focus-visible .protected-resource-kicker,
.protected-resource-link:hover .protected-resource-title,
.protected-resource-link:focus-visible .protected-resource-title,
.protected-resource-link:hover .protected-resource-arrow,
.protected-resource-link:focus-visible .protected-resource-arrow {
  color: var(--syllabus-orange);
}

.protected-resource-link:hover .protected-resource-arrow,
.protected-resource-link:focus-visible .protected-resource-arrow {
  transform: translate(0.12rem, -0.12rem);
}

@media (prefers-reduced-motion: reduce) {
  .protected-resource-link,
  .protected-resource-arrow {
    transition: none;
  }
}

@media (max-width: 767px) {
  .protected-resource-link {
    width: 100%;
    margin-top: 2.5rem;
  }
}
</style>
