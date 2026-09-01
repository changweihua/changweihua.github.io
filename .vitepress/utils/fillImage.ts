const containerBackground = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30"><circle fill="rgba(255,255,255,0.1)" cx="15" cy="15" r="10" /></svg>`;

function styleImageContainer(container: HTMLElement ) {
  if (container) {
    container.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(containerBackground)}')`;
  }
}

function styleImage(image: HTMLElement) {
  if (image) {
    const svgWidth = image.offsetWidth,
      svgHeight = image.offsetHeight,
      padding = Math.floor(
        Math.min(image.offsetWidth, image.offsetHeight) * 0.2,
      ),
      fill = "#fff",
      patch = 0.2;

    const targetMask = `
  <svg xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
    width="${svgWidth}"
    height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
    <defs>
      <linearGradient id="mask-bottom-to-top" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="transparent" />
        <stop offset="100%" stop-color="${fill}" />
      </linearGradient>
      <linearGradient id="mask-top-to-bottom" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${fill}" />
        <stop offset="100%" stop-color="transparent" />
      </linearGradient>
      <linearGradient id="mask-rigth-to-left" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="transparent" />
        <stop offset="100%" stop-color="${fill}" />
      </linearGradient>
      <linearGradient id="mask-left-to-right" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="${fill}" />
        <stop offset="100%" stop-color="transparent" />
      </linearGradient>
    </defs>
    <path fill="url(#mask-bottom-to-top)" d="M0,0 L${svgWidth},0 L${svgWidth - padding + patch},${padding + patch} L${padding - patch},${padding + patch} Z"></path>
    <path fill="url(#mask-top-to-bottom)" d="M0,${svgHeight} L${padding - patch},${svgHeight - padding - patch} L${svgWidth - padding + patch},${svgHeight - padding - patch} L${svgWidth},${svgHeight} Z"></path>
    <path fill="url(#mask-rigth-to-left)" d="M0,0 L${padding + patch},${padding} L${padding + patch},${svgHeight - padding} L0,${svgHeight} Z"></path>
    <path fill="url(#mask-left-to-right)" d="M${svgWidth},0 L${svgWidth - padding - patch},${padding} L${svgWidth - padding - patch},${svgHeight - padding} L${svgWidth},${svgHeight} Z"></path>
    <rect x="${padding - 1}" y="${padding - 1}" width="${svgWidth - padding * 2 + 1 * 2}" height="${svgHeight - padding * 2 + 1 * 2}" fill="${fill}"></rect>
  </svg>
`;

    image.style.maskImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(targetMask.replace(/\n/g, ""))}')`;
    image.classList.add('filled-svg');
    // svg test
    // target.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(targetMask.replace(/\n/g, ''))}')`;
  }
}

export {
  styleImage,
  styleImageContainer
}
