function scrollToElementId(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
}

function scrollToSectionHorizontally(sectionId) {
  const section = document.getElementById(sectionId);
  const container = document.getElementById('wrap');
  if (!section || !container) return;

  container.scrollTo({
    left: section.offsetLeft,
    behavior: 'smooth'
  });
}

function scrollToElement(element) {
  if (!element) return;
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshPage() {
  window.scrollTo(0, 0);
  location.reload();
}

function openLinkInNewTab(event, url) {
  if (event) event.preventDefault();
  window.open(url, '_blank', 'noopener');
}

let currentSectionIndex = 1;
const maxNumberOfSection = 2; // Number of Slides

// Arrows
const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');

// Hide left arrow initially
if (leftArrow) leftArrow.style.display = 'none';

if (leftArrow) {
  leftArrow.addEventListener('click', function () {
    if (currentSectionIndex > 1) {
      currentSectionIndex--;
      if (rightArrow) rightArrow.style.display = 'block';
      scrollToSectionHorizontally(`wraped-section-${currentSectionIndex}`);
    }
    if (currentSectionIndex === 1) {
      leftArrow.style.display = 'none';
    }
  });
}

if (rightArrow) {
  rightArrow.addEventListener('click', function () {
    if (currentSectionIndex < maxNumberOfSection) {
      currentSectionIndex++;
      if (leftArrow) leftArrow.style.display = 'block';
      scrollToSectionHorizontally(`wraped-section-${currentSectionIndex}`);
    }
    if (currentSectionIndex === maxNumberOfSection && rightArrow) {
      rightArrow.style.display = 'none';
    }
  });
}

// Mobile menu
function displayNavMenu() {
  const closeIcon = document.querySelector('.ri-close-circle-line');
  const burgerIcon = document.querySelector('.ri-menu-fill');
  const menu = document.querySelector('.header-right_div');
  if (!menu || !closeIcon || !burgerIcon) return;

  menu.style.display = 'flex';
  closeIcon.style.display = 'block';
  burgerIcon.style.display = 'none';
}

function hideNavMenu() {
  const closeIcon = document.querySelector('.ri-close-circle-line');
  const burgerIcon = document.querySelector('.ri-menu-fill');
  const menu = document.querySelector('.header-right_div');
  if (!menu || !closeIcon || !burgerIcon) return;

  menu.style.display = 'none';
  closeIcon.style.display = 'none';
  burgerIcon.style.display = 'flex';
}
