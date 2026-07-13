// Segfault — Dynamic Interaction Script

document.addEventListener("DOMContentLoaded", function () {
  // 1. Dynamic Footer Year
  var yearEls = document.querySelectorAll("[data-year]");
  var year = new Date().getFullYear();
  yearEls.forEach(function (el) {
    el.textContent = year;
  });

  // 2. Terminal Text Simulation for Hero Tagline
  const tagline = document.querySelector(".tagline");
  if (tagline) {
    const originalText = tagline.textContent;
    tagline.textContent = "";
    let i = 0;
    
    function typeWriter() {
      if (i < originalText.length) {
        tagline.textContent += originalText.charAt(i);
        i++;
        setTimeout(typeWriter, 40);
      }
    }
    // Start typing effect slightly after page load
    setTimeout(typeWriter, 300);
  }

  // 3. Ambient Interactive Hover effect on Cards
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Inject coordinates dynamically as custom properties for slight gradient shifts
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });
});