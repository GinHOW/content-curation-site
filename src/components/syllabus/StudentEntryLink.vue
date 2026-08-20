<template>
  <router-link to="/student" class="student-entry-link" aria-label="学生入口 Log in">
    <span class="student-entry-icon" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        <circle cx="12" cy="11" r="3.25" />
        <path d="M6.5 23c.75-3.85 2.8-5.8 5.5-5.8s4.75 1.95 5.5 5.8" />
        <path d="M19.5 16h7m-3.2-3.2 3.2 3.2-3.2 3.2" />
      </svg>
    </span>
    <span class="student-entry-copy">
      <span class="student-entry-kicker">Student Access</span>
      <span class="student-entry-title">学生入口 <span>Log in</span></span>
    </span>
    <span class="student-entry-arrow" aria-hidden="true">↗</span>
  </router-link>
</template>

<style scoped>
.student-entry-link {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  width: max-content;
  margin-bottom: clamp(2.2rem, 4vw, 4.25rem);
  color: var(--syllabus-muted);
  text-decoration: none;
  transition: color 180ms ease, transform 180ms ease;
}
.student-entry-icon {
  display: grid;
  place-items: center;
  width: clamp(2.1rem, 3vw, 2.55rem);
  height: clamp(2.1rem, 3vw, 2.55rem);
  border: 1px solid currentColor;
  border-radius: 50%;
  color: var(--syllabus-ink);
}
.student-entry-icon svg {
  width: 75%;
  height: 75%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}
.student-entry-copy { display: grid; gap: 0.12rem; }
.student-entry-kicker {
  color: var(--syllabus-muted);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  line-height: 1.2;
  text-transform: uppercase;
}
.student-entry-title {
  color: var(--syllabus-ink);
  font-family: var(--font-heavy);
  font-size: clamp(0.95rem, 1.35vw, 1.15rem);
  letter-spacing: 0.02em;
  line-height: 1.2;
}
.student-entry-title span {
  margin-left: 0.3rem;
  color: var(--syllabus-muted);
  font-family: var(--font-body);
  font-size: 0.58em;
  font-weight: 500;
  letter-spacing: 0.1em;
  vertical-align: 0.12em;
}
.student-entry-arrow {
  align-self: end;
  margin-left: 0.2rem;
  color: var(--syllabus-muted);
  font-size: 1.15rem;
  line-height: 1;
  transition: transform 180ms ease, color 180ms ease;
}
.student-entry-link:hover,
.student-entry-link:focus-visible { color: var(--syllabus-orange); transform: translateY(-0.08rem); }
.student-entry-link:hover .student-entry-icon,
.student-entry-link:focus-visible .student-entry-icon,
.student-entry-link:hover .student-entry-title,
.student-entry-link:focus-visible .student-entry-title,
.student-entry-link:hover .student-entry-kicker,
.student-entry-link:focus-visible .student-entry-kicker,
.student-entry-link:hover .student-entry-title span,
.student-entry-link:focus-visible .student-entry-title span { color: var(--syllabus-orange); }
.student-entry-link:hover .student-entry-arrow,
.student-entry-link:focus-visible .student-entry-arrow { color: var(--syllabus-orange); transform: translate(0.12rem, -0.12rem); }
</style>
