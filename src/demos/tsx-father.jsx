import TsxChildren from "./tsx-children";

export default () => {
	return (
		<div>
			<TsxChildren>
				{{
					default: () => <p>我是默认插槽的内容</p>,
					// 解构 msg 值，使用
					footer: ({ msg }) => <p>我是-{msg}-的内容</p>,
				}}
			</TsxChildren>
		</div>
	);
};
