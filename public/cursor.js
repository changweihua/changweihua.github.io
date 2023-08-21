// (function () {
//   const body = document.querySelector("body");
//   const element = document.getElementById("g-pointer-1");
//   const element2 = document.getElementById("g-pointer-2");
//   const halfAlementWidth = element.offsetWidth / 2;
//   const halfAlementWidth2 = element2.offsetWidth / 2;

//   function setPosition(x, y) {
//     element.style.transform = `translate(${x - halfAlementWidth}px, ${
//       y - halfAlementWidth
//     }px)`;
//     element2.style.transform = `translate(${x - halfAlementWidth2}px, ${
//       y - halfAlementWidth2
//     }px)`;
//   }

//   body.addEventListener("mousemove", (e) => {
//     // setPosition(e.clientX, e.clientY);
//     window.requestAnimationFrame(function () {
//       setPosition(e.clientX, e.clientY);
//     });
//   });
// })();
