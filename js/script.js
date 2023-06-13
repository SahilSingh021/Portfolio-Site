
function scrollToSecondary() {
    const secondarySection = document.getElementById('secondary');
    secondarySection.scrollIntoView({ behavior: 'smooth' });
  }
  
  function openLinkInNewTab(event, url) {
    event.preventDefault();
    window.open(url, '_blank');
  }