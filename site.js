const dialog = document.querySelector('#reel-dialog');
const player = document.querySelector('#reel-player');
const title = document.querySelector('#reel-title');
const original = document.querySelector('#reel-original');

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const slides = [...document.querySelectorAll('#abertura-projetos img')];
const slideControls = document.querySelector('.slide-controls');
const slideButtons = [...slideControls.querySelectorAll('[data-slide]')];
const slideToggle = document.querySelector('#slide-toggle');
const slideLink = document.querySelector('#abertura-projeto');
let slideIndex = 0;
let slideshowPaused = motionPreference.matches;
let slideshowTimer;

function showSlide(index) {
  slideIndex = index;
  for (const [position, slide] of slides.entries()) {
    const active = position === index;
    slide.classList.toggle('is-current', active);
    slide.setAttribute('aria-hidden', String(!active));
    slideButtons[position].setAttribute('aria-pressed', String(active));
  }
  slideLink.href = slides[index].dataset.source;
  slideLink.textContent = slides[index].dataset.caption + ' ↗';
}

function updateSlideshow() {
  window.clearInterval(slideshowTimer);
  slideToggle.textContent = slideshowPaused ? 'Retomar' : 'Pausar';
  if (slideshowPaused || document.hidden) return;
  slideshowTimer = window.setInterval(() => {
    if (document.activeElement === slideLink) return;
    showSlide((slideIndex + 1) % slides.length);
  }, 5000);
}

slideControls.hidden = false;
slideControls.addEventListener('click', (event) => {
  const button = event.target.closest('[data-slide]');
  if (button) {
    slideshowPaused = true;
    showSlide(Number(button.dataset.slide));
  } else if (event.target === slideToggle) {
    slideshowPaused = !slideshowPaused;
  }
  updateSlideshow();
});
document.addEventListener('visibilitychange', updateSlideshow);
motionPreference.addEventListener('change', (event) => {
  slideshowPaused = event.matches;
  updateSlideshow();
});
updateSlideshow();

if (typeof dialog.showModal === 'function') {
  for (const link of document.querySelectorAll('[data-reel]')) {
    link.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      title.textContent = link.dataset.title;
      original.href = link.href;
      const frame = document.createElement('iframe');
      frame.title = 'Reel do Instagram — ' + link.dataset.title;
      frame.src = 'https://www.instagram.com/reel/' + link.dataset.reel + '/embed/';
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.allowFullscreen = true;
      player.replaceChildren(frame);
      dialog.showModal();
    });
  }

  dialog.addEventListener('close', () => player.replaceChildren());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.06 });
  document.documentElement.classList.add('motion');
  for (const section of document.querySelectorAll('.reveal')) observer.observe(section);
}
