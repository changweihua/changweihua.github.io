const modules: Record<
  string,
  {
    [key: string]: any;
  }
> = import.meta.glob("../components/*/*.vue");
export default {
  install(app) {
    Object.keys(modules).forEach((componentPath) => {
      // 获取遍历的当前组件实例对象
      let curComponent = modules[componentPath].default;
      app.component(curComponent.__name, curComponent);
    });
  },
};
