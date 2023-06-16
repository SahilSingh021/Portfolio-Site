
function scrollToElementId(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }
}

function scrollToElement(element) {
    element.scrollIntoView({ behavior: "smooth" });
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
    rightArrow.style.display = 'block';
    scrollToElementId(`wraped-section-${currentSectionIndex}`);
  }
  if (currentSectionIndex === 1){
    leftArrow.style.display = 'none';
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
