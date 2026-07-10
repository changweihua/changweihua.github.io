import "./src/demos/jsx.css";
import styles from "./src/demos/jsx.module.css";

export default () => {
	return (
		<>
			<div style="font-size: 30px;">demo</div>
      <div class="blue">blue</div>
      <div class={styles.red}>red</div>
		</>
	);
};
