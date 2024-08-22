export default (props, { slots }) => {
	return (
		<>
			<div class="default">{slots.default?.()}</div>
			{/* 传递 msg  */}
			<div class="footer">{slots.footer?.({ msg: "footer 插槽" })}</div>
		</>
	);
};
