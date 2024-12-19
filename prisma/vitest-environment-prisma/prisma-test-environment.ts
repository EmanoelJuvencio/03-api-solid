import { Environment } from 'vitest/environments'

export default <Environment>{
  name: 'prisma',
  transformMode: 'ssr',
  async setup() {
    console.log('Antes dos testes')
    return {
      async teardown() {
        console.log('Depois dos testes')
      },
    }
  },
}
