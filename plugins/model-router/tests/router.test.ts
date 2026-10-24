import { expect, test } from 'claude-code/testing'

const USAGE = { input_tokens: 1, output_tokens: 1, cache_read_input_tokens: 0, cache_creation_input_tokens: 0 }

// Stands in for the engine: the session runs on `sessionModel`, Haiku labels
// every prompt with `label`, and each model request records the model it named.
type State = { sessionModel: string; label: string; asked: string[]; failModel?: string; silentModel?: string; now?: number; logs?: string[] }

function engine(on: any, state: State) {
  const store = new Map<string, unknown>()
  on('clock.now', () => ({ value: state.now ?? 0 }))
  on('ui.log', (_: unknown, e: any) => (state.logs?.push(e.text), { value: undefined }))
  on('turn.start', (_: unknown, e: any) => ({ turnId: e.turnId }))
  on('turn.complete', (_: unknown, e: any) => ({ text: e.answer, usage: e.usage }))
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
    // An unusable model comes back as an error response: nothing streams and no stop reason.
    if (e.model === state.silentModel) return { turnId: e.turnId, index: e.index, answer: '', toolUses: [], stopReason: null }
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
  expect(state.asked).toEqual(['claude-opus-5-5'])
  expect(r.usage.model).toBe('claude-opus-5-5-id')

  state.label = '{"tier":"simple","reason":"파일명 정리"}'
  await $.prompt.submit({ text: '이 폴더 파일명을 날짜순으로 정리해줘', wait: false })
  await step($)
  expect(state.asked).toEqual(['claude-opus-5-5', 'claude-haiku-5-5'])
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
  expect(state.asked).toEqual(['session-default', 'claude-opus-5-5'])
})

test('/route off stops routing; a failed model falls back to the session model', async ($: any, on: any) => {
  const state = { sessionModel: 'sonnet', label: '{"tier":"complex","reason":"설계"}', asked: [] as string[], failModel: 'claude-opus-5-5' }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  const r = await step($)
  expect(state.asked).toEqual(['claude-opus-5-5', 'session-default'])
  expect(r.answer).toBe('ok')

  const off = await $.command.run({ command: 'route', args: 'off' })
  expect(off.text).toContain('꺼짐')
  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  await step($)
  expect(state.asked).toEqual(['claude-opus-5-5', 'session-default', 'session-default'])
})

test('a model that returns no response is resent on the session model', async ($: any, on: any) => {
  const state: State = { sessionModel: 'sonnet', label: '{"tier":"general","reason":"일반 작업"}', asked: [], silentModel: 'claude-sonnet-5-5' }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.prompt.submit({ text: '이 함수에 주석을 달아줘', wait: false })
  const r = await step($)
  expect(state.asked).toEqual(['claude-sonnet-5-5', 'session-default'])
  expect(r.answer).toBe('ok')
})

const TURN_USAGE = {
  input_tokens: 1000, output_tokens: 2100, cache_read_input_tokens: 41000, cache_creation_input_tokens: 6200, model: 'claude-opus-5-5',
}

test('each answer ends with the pick, the model, the time and the tokens', async ($: any, on: any) => {
  const state: State = { sessionModel: 'sonnet', label: '{"tier":"complex","reason":"여러 파일 설계"}', asked: [], now: 0, logs: [] }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  await step($)
  state.now = 72_000
  await $.turn.complete({ turnId: 't', answer: 'ok', reason: 'answer', usage: TURN_USAGE })

  expect(state.logs).toEqual([
    '🧭 opus · 여러 파일 설계 · 실제: claude-opus-5-5 · 1분 12초 · 입력 48.2k / 출력 2.1k (캐시 읽기 41.0k) · 분류 +2',
  ])
})

test('with routing off the line still shows the time and tokens; subagent turns add none', async ($: any, on: any) => {
  const state: State = { sessionModel: 'sonnet', label: '{"tier":"complex","reason":"설계"}', asked: [], now: 0, logs: [] }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  await $.command.run({ command: 'route', args: 'off' })

  await $.prompt.submit({ text: '인증 모듈 전체 구조를 다시 설계해줘', wait: false })
  await step($)
  await $.turn.complete({ turnId: 's', agentId: 'a1', answer: 'sub', reason: 'answer', usage: TURN_USAGE })
  state.now = 9_000
  await $.turn.complete({ turnId: 't', answer: 'ok', reason: 'answer', usage: { ...TURN_USAGE, model: 'claude-sonnet-5-5' } })

  expect(state.asked).toEqual(['session-default'])
  expect(state.logs).toEqual([
    '🧭 자동 선택 꺼짐 · 실제: claude-sonnet-5-5 · 9초 · 입력 48.2k / 출력 2.1k (캐시 읽기 41.0k)',
  ])
})

test('an interrupted turn with no usage still shows the time', async ($: any, on: any) => {
  const state: State = { sessionModel: 'sonnet', label: '{"tier":"simple","reason":"짧은 질문"}', asked: [], now: 0, logs: [] }
  engine(on, state)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })

  await $.prompt.submit({ text: '이 폴더 파일명을 날짜순으로 정리해줘', wait: false })
  state.now = 3_000
  await $.turn.complete({ turnId: 't', answer: '', reason: 'aborted' })

  expect(state.logs).toEqual(['🧭 haiku · 짧은 질문 · 3초 · 토큰 정보 없음 (aborted) · 분류 +2'])
})
