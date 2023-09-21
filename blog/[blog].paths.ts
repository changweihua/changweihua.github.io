import fs from 'fs'

export default {
  paths() {
    return fs
      .readdirSync('blog')
      .map((pkg) => {
        return { params: { pkg }}
      })
  }
}
