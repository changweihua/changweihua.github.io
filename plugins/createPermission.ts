import * as fs from 'fs'
import indexJSON from '../index.json'

export interface PermissionOptions {
  label: string
  value: string
}

export interface Permissions {
  title: string
  name: string
  permissions: PermissionOptions[]
}

const getOldPermissionCount = (filePath: string): number => {
  const oldFileStr = fs.readFileSync(filePath, 'utf8')
  return oldFileStr.split('=').length - 1
}

export function permissionBuilder (path: string) {
  return {
    name: 'permissionsEnum',
    buildStart () {
      const strArr: string[] = []
      let newPermissionCount = 0

      // @ts-ignore
      indexJSON.forEach((item: Permissions) => {
        item.permissions.forEach(({ label, value }) => {
          strArr.push(`\t${value.toUpperCase()} = '${value}', // ${item.title} - ${label}`)
          newPermissionCount++
        })
      })

      const content = `/* eslint-disable @typescript-eslint/indent */\nexport enum PermissionEnum {
${strArr.join('\n')}
}\n`

      const filePath = path + 'permission-enum.ts'
      const oldPermissionCount = getOldPermissionCount(filePath)

      if (newPermissionCount !== oldPermissionCount) {
        fs.writeFileSync(filePath, content)
      }
    }
  }
}

