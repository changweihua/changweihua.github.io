import preset from 'conventional-changelog-gitmoji-config'

// conventional-changelog v8 的 preset loader 要求 preset 导出函数；
// 这个 gitmoji preset 仍导出对象，包一层即可继续用原来的 gitmoji 格式。
export default () => preset
