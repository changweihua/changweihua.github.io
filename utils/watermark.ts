/**
 * 动态添加水印
 * @author
 */

import _ from "lodash";
import { onBeforeUnmount, onMounted, ref, type Ref } from "vue";

import WaterMark from "l-watermark";

export default function useWatermark(
  containerRef: Ref<HTMLDivElement | undefined>
) {
  onMounted(() => {
    document.querySelectorAll(".vp-doc img").forEach((element) => {
      // console.log(element);
      // if (element.parentElement) {
      //   WaterMark.image({
      //     target: element,
      //     text: "@ GitHub - Changweihua",
      //     color: "rgba(255, 0, 0, 1)",
      //     fontSize: 20,
      //     cSpace: 20,
      //     vSpace: 10,
      //   });
      // }
    });
  });

  onBeforeUnmount(() => {

  });
}
