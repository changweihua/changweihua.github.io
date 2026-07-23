// import { watchEffect, type DirectiveBinding } from 'vue'
// import { usePermissionStore } from '~/stores/use-permission'

// const hasPermission = (value: string) => {
//   const permissionStore = usePermissionStore()
//   return permissionStore.buttonPermission.includes(value)
// }

// const removeEl = (el: Record<string, any>) => {
//   el._parentNode = el.parentNode
//   el._placeholderNode = document.createComment('auth')
//   el.parentNode?.replaceChild(el._placeholderNode, el)
// }

// const addEl = (el: Record<string, any>) => {
//   el._parentNode?.replaceChild(el, el._placeholderNode)
// }

// function mounted(el: Record<string, any>, binding: DirectiveBinding<any>) {
//   const value = binding.value
//   const flag = hasPermission(value)
//   el._oldHasPermission = !value ? true : flag;
//   if (!value) return
//   if (!flag) {
//     removeEl(el)
//   }
// }

// function updated(el: Record<string, any>, binding: DirectiveBinding<any>) {
//   el._binding = binding
//   const update = () => {
//     const oldHasPermission = el._oldHasPermission
//     const newHasPermission = hasPermission(el._binding.value)
//     if (oldHasPermission === newHasPermission) return
//     if (newHasPermission) {
//       addEl(el)
//     } else {
//       removeEl(el)
//     }
//     el._oldHasPermission = newHasPermission
//   }
//   if (el._watchEffect) {
//     update()
//   } else {
//     el._watchEffect = watchEffect(() => {
//       update()
//     })
//   }
// }

// export default {
//   mounted,
//   updated
// }
