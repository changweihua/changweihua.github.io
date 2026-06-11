
import { expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { useLastChange } from '../useLastChange'

it('update lastChange when source changes', async () => {
  const source = ref('')
  const lastChange = useLastChange(source)
  const snapShot01 = lastChange.value
  source.value = 'Ray'
  await nextTick()
  const snapShot02 = lastChange.value

  expect(snapShot01).not.toBe(snapShot02)
})
