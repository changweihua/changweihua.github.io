import { defineFakeRoute } from 'vite-plugin-fake-server/client'
import user from './user'

// @ts-ignore
export default defineFakeRoute([...user])
