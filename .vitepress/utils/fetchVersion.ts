/*
  远程读取 github 仓库中 package.json 文件中的 version 版本号
  方式一：
  读取规则：https://api.github.com/repos/<username>/<repo>/contents/<file>?ref=<branch 可选，默认master>
  return fetch('https://api.github.com/repos/themusecatcher/front-end-notes/contents/package.json?ref=master', {
    headers: {
      // See https://docs.github.com/en/rest/overview/media-types
      Accept: 'application/vnd.github.v3.raw',
      // See https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication
      // Authorization: 'token ${GITHUB_TOKEN}',
    }
  })
  方式二：
  读取规则：https://raw.githubusercontent.com/<username>/<repo>/<branch>/<file>
  return fetch('https://raw.githubusercontent.com/themusecatcher/front-end-notes/master/package.json')
*/
export function fetchVersion() {
  return fetch(
    "https://api.github.com/repos/changweihua/changweihua.github.io/contents/package.json?ref=master",
    {
      headers: {
        // See https://docs.github.com/en/rest/overview/media-types
        Accept: "application/vnd.github.v3.raw",
        // See https://docs.github.com/en/rest/guides/getting-started-with-the-rest-api#authentication
        // Authorization: 'token ${GITHUB_TOKEN}',
      },
    }
  )
    .then((res) => res.json())
    .then((json) => json.version ?? "")
    .then((version) => {
      if (!version) {
        version = "N/A";
      }
      return Promise.resolve(version)
      // const tagLineParagragh = document.querySelector(
      //   "footer.VPFooter > .container"
      // );
      // const docsVersionSpan = document.createElement("p");
      // docsVersionSpan.classList.add("version-tag");
      // // docsVersionSpan.classList.add("hidden");
      // // docsVersionSpan.classList.add("md:visible");
      // docsVersionSpan.innerText = version;
      // tagLineParagragh?.appendChild(docsVersionSpan);
    });
}
