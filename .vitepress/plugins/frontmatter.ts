module.exports = (options, context) => ({
  extendPageData($page) {
    const { pages } = context;

    // 获取除首页外的其他所有页面的 frontmatter 数据
    const frontmatters = pages
      .filter((page) => page.path !== "/")
      .map((page) => page.frontmatter);

    // 将 frontmatter 数组传递给首页的 frontmatter
    $page.frontmatter.homepageFrontmatters = frontmatters;
  },
});
