document.addEventListener("DOMContentLoaded", () => {
  const element = document.querySelector(".border-gradient");

  let angle = 0;
  const rotateGradient = () => {
    angle = (angle + 1) % 360; // Increment angle and keep it within 0-360
    element.style.setProperty("--gradient-angle", `${angle}deg`);
    requestAnimationFrame(rotateGradient); // Smooth animation loop
  };

  rotateGradient(); // Start the animation
});
