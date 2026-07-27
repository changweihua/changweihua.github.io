import { defineComponent, computed } from 'vue';

const DEFAULT_AVATAR = '/logo.png';
const EMPTY_AVATAR = "https://via.placeholder.com/100?text=No+Image";

const nValues = [
  { n: 0.5, label: "菱形 (n=0.5)" },
  { n: 1, label: "菱形 (n=1)" },
  { n: 2, label: "椭圆 (n=2)" },
  { n: 3.5, label: "超椭圆 (n=3.5)" },
  { n: 10, label: "方圆形 (n=10)" },
];

interface SuperellipseAvatarProps {
  /**
   * 大小(宽高相同)
   * @default 48
   */
  size?: number;
  /**
   * 用户头像
   */
  src?: string;
  /**
   * 超椭圆指数，越小越圆
   * @default 3
   */
  n?: number;
  /**
   * 其他 SVG 属性
   */
  [key: string]: any;
}

/**
 * 根据超椭圆公式，生成 SVG Path 数据字符串
 */
function generateSuperellipsePath(a: number, b: number, n: number, steps = 64): string {
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const theta = (Math.PI * 2 * i) / steps;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const x = Math.sign(cos) * Math.pow(Math.abs(cos), 2 / n) * a;
    const y = Math.sign(sin) * Math.pow(Math.abs(sin), 2 / n) * b;
    points.push(`${x + a},${y + b}`);
  }

  return `M${points.join(' L ')} Z`;
}

export const SuperellipseAvatar = defineComponent({
  name: "SuperellipseAvatar",
  props: {
    size: {
      type: Number,
      default: 48,
    },
    src: String,
    n: {
      type: Number,
      default: 3.5,
    },
    backgroundColor: {
      type: String,
      default: "#e0e0e0",
    },
  },
  setup(props: SuperellipseAvatarProps) {
    const clipId = computed(
      () => `clip-${Math.random().toString(36).substring(2, 9)}`
    );

    const pathData = computed(() => {
      const a = props.size! / 2;
      const b = props.size! / 2;
      return generateSuperellipsePath(a, b, props.n!);
    });

    function generateSuperellipsePath(a, b, n, steps = 64) {
      const points: string[] = [];
      for (let i = 0; i <= steps; i++) {
        const theta = (Math.PI * 2 * i) / steps;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);
        const x = Math.sign(cos) * Math.pow(Math.abs(cos), 2 / n) * a;
        const y = Math.sign(sin) * Math.pow(Math.abs(sin), 2 / n) * b;
        points.push(`${x + a},${y + b}`);
      }
      return `M${points.join(" L ")} Z`;
    }

    return () => {
      const { size, src, n, ...restProps } = props;

      return (
        <svg
          fill="red"
          class="VPImage logo"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          {...restProps}
        >
          <defs>
            <clipPath id={clipId.value}>
              <path d={pathData.value} />
            </clipPath>
          </defs>
          {/* 背景矩形 */}
          <rect
            width={props.size}
            height={props.size}
            fill={props.backgroundColor}
            clip-path={`url(#${clipId.value})`}
          />

          {/* 头像图片 */}
          <image
            href={src || DEFAULT_AVATAR}
            width={size}
            height={size}
            preserveAspectRatio="xMidYMid slice"
            clip-path={`url(#${clipId.value})`}
          />
        </svg>
      );
    };
  },
});
