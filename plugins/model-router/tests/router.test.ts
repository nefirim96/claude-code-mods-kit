import { expect, test } from 'claude-code/testing'

const USAGE = { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }

// Stands in for the engine: the session runs on `sessionModel`, Haiku labels
// every prompt with `label`, and each model request records the model it named.
function engine(on: any, state: { sessionModel: string; label: string; asked: string[]; failModel?: string }) {
  const store = new Map<string, unknown>()
  on('command.register', () => ({ value: { command: 'route' } }))
  on('session.start', (_: unknown, e: any) => ({ cwd: e.cwd }))
  on('session.model', () => ({ value: state.sessionModel }))
  on('store.get', (_: unknown, e: any) => ({ value: store.get(e.key) }))
  on('store.set', (_: unknown, e: any) => (store.set(e.key, e.value), { value: undefined }))
  on('model.complete', () => ({ value: { isAnswered: true, text: state.label, usage: USAGE } }))
  on('prompt.submit', (_: unknown, e: any) => ({ text: e.text }))
  on('ui.status', () => ({ value: undefined }))
  on('turn.step', async function* (_: unknown, e: any) {
    state.asked.push(e.model)
    if (e.model === state.failModel) throw new Error('model not available')
    return { turnId: e.turnId, index: e.index, answer: 'ok', toolUses: [], stopReason: 'end_turn', usage: { ...USAGE, model: `${e.model}-id` } }
  })
}

async function step($: any) {
  const stream = $.turn.step({ turnId: 't', index: 0, model: 'session-default', messageCount: 1 })
  let r = await stream.next()
  while (!r.done) r = await stream.next()
  return r.value
}

test('a complex prompt goes to Opus, a simple one to Haiku', async ($: any, on: any) => {
  const state = { sessionModel: 'sonnet', label: '{"tier":"complex","reason":"여러 파일 설계"}', asked: [] as string[] }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  const r = await step($)
  expect(state.asked).toEqual(['opus'])
  expect(r.usage.model).toBe('opus-id')

  state.label = '{"tier":"simple","reason":"파일명 정리"}'
  await $.prompt.submit({ text: '이 폴더 파일명을 날짜순으로 정리해줘', wait: false })
  await step($)
  expect(state.asked).toEqual(['opus', 'haiku'])
})

test('a manual /model choice wins until /route on', async ($: any, on: any) => {
  const state = { sessionModel: 'sonnet', label: '{"tier":"complex","reason":"설계"}', asked: [] as string[] }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  state.sessionModel = 'haiku' // the person ran /model haiku
  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  await step($)
  expect(state.asked).toEqual(['session-default'])

  const on_ = await $.command.run({ command: 'route', args: 'on' })
  expect(on_.text).toContain('켜짐')
  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  await step($)
  expect(state.asked).toEqual(['session-default', 'opus'])
})

test('/route off stops routing; a failed model falls back to the session model', async ($: any, on: any) => {
  const state = { sessionModel: 'sonnet', label: '{"tier":"complex","reason":"설계"}', asked: [] as string[], failModel: 'opus' }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  const r = await step($)
  expect(state.asked).toEqual(['opus', 'session-default'])
  expect(r.answer).toBe('ok')

  const off = await $.command.run({ command: 'route', args: 'off' })
  expect(off.text).toContain('꺼짐')
  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  await step($)
  expect(state.asked).toEqual(['opus', 'session-default', 'session-default'])
})
