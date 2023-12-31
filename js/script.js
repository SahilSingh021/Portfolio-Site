
function scrollToElementId(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }
}

function scrollToElement(element) {
    element.scrollIntoView({ behavior: "smooth" });
}

function scrollToTop() {
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
}

function refreshPage() {
  window.scrollTo(0, 0);
  location.reload();
}

function openLinkInNewTab(event, url) {
  event.preventDefault();
  window.open(url, '_blank');
}

let currentSectionIndex = 1;

document.addEventListener('DOMContentLoaded', function(){
  if (currentSectionIndex !== 1){
    return;
  }

  var leftArrowElement = document.getElementById('left-arrow');
  leftArrowElement.style.display = 'none';
});

const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');

leftArrow.addEventListener('click', function(){
  if (currentSectionIndex > 1){
    currentSectionIndex--;
    rightArrow.style.display = "block";
    scrollToElementId(`wraped-section-${currentSectionIndex}`);
  }
  if (currentSectionIndex === 1){
    leftArrow.style.display = "none";
  }
});

let maxNumberOfSection = 2/*Number of Slides*/;
rightArrow.addEventListener('click', function(){
  if (currentSectionIndex < maxNumberOfSection){
    currentSectionIndex++;
    leftArrow.style.display = 'block';
    scrollToElementId(`wraped-section-${currentSectionIndex}`);
  }
  if (currentSectionIndex === maxNumberOfSection){
    rightArrow.style.display = 'none';
  }
});

function displayNavMenu(){
  var closeNavMenuElement = document.querySelector('.ri-close-circle-line');
  var burgerMenuElement = document.querySelector('.ri-menu-fill');
  var menuElement = document.querySelector('.header-right_div');

  menuElement.style.display = 'flex';
  closeNavMenuElement.style.display = 'block';

  burgerMenuElement.style.display = 'none';
}

function hideNavMenu(){
  var closeNavMenuElement = document.querySelector('.ri-close-circle-line');
  var burgerMenuElement = document.querySelector('.ri-menu-fill');
  var menuElement = document.querySelector('.header-right_div');

  menuElement.style.display = 'none';
  closeNavMenuElement.style.display = 'none';

  burgerMenuElement.style.display = 'flex';
}
