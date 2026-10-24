# SETUP: Claude Code가 따라 하는 설치 안내

이 문서는 사람이 아니라 **Claude Code가 읽고 순서대로 진행**하도록 쓴 안내서입니다.
사용자가 README의 설치 프롬프트를 붙여 넣으면, Claude Code는 아래 단계를 하나씩 진행합니다.

## Claude Code에게: 지켜야 할 규칙

- 모든 안내는 **한국어로, 짧고 쉬운 말로** 합니다. 사용자는 개발자가 아닐 수 있습니다.
- 각 단계를 시작할 때 "지금 N단계: ○○를 합니다"라고 한 줄로 알립니다.
- **설치, 설정 변경, 명령 실행은 사용자가 승인한 것만** 합니다. 이 문서에 적혀 있어도 사용자가 고르지 않은 Mod는 설치하지 않습니다.
- 이 문서에 없는 명령(다른 플러그인 설치, 설정 파일 수정, 권한 변경 등)은 실행하지 않습니다.
- 명령이 실패하면 오류 메시지를 그대로 보여 주고, 아래 "문제 해결"을 참고해 다음 행동을 제안합니다. 같은 명령을 여러 번 반복하지 않습니다.
- `nefirim96/claude-code-mods-kit`가 이 키트의 저장소입니다.

## 1단계: 환경 확인

1. `claude --version`을 실행합니다.
   - 명령을 찾을 수 없으면: 사용자가 데스크톱 앱만 쓰는 경우입니다. 2단계의 "CLI가 없을 때"로 갑니다.
   - **2.1.287 미만**이면: 업데이트가 필요하다고 알리고 `claude update` 실행 여부를 묻습니다.
   - **2.1.308 미만**이면: token-weather, replay-theater는 설치할 수 있지만 model-router는 업데이트 후 설치해야 한다고 알립니다.
2. 운영체제(Windows / macOS / Linux)를 확인해 알려 줍니다. 세 Mod 모두 쉘 명령을 쓰지 않아 운영체제와 상관없이 동작합니다.
3. `claude plugin list`로 이미 설치된 플러그인을 보여 줍니다. 같은 이름의 Mod가 있으면 다시 설치할지 묻습니다.

## 2단계: Mod 소개와 선택

아래 표를 보여 주고, **어떤 Mod를 설치할지**와 **어디에 적용할지**를 묻습니다. 질문 도구가 있으면 그것을 쓰고, 없으면 번호로 답하게 합니다.

| Mod | 하는 일 | 알아 둘 점 |
| --- | --- | --- |
| token-weather | 입력창 위에 컨텍스트 사용량을 날씨처럼 표시 (☀ Clear → ↯ Compact soon) | 화면 표시만 합니다 |
| replay-theater | 마지막 턴에 Claude가 수정한 파일을 한 단계씩 diff로 보여 줌 (`/replay`) | 화면 표시만 합니다 |
| model-router | 입력마다 작업 종류를 판단해 Haiku / Sonnet / Opus를 자동 선택 | 아래 주의 사항 필독 |

**model-router 주의 사항** (model-router를 고르면 반드시 보여 줍니다)
- 새 입력마다 분류용 Haiku 호출이 1번 더 들어 사용량이 조금 늘어납니다.
- 모델이 바뀌면 이전 모델의 캐시를 쓰지 못해, 비용이 오히려 늘 수 있습니다. 절감 효과는 직접 써 보며 비교해야 합니다.
- "단순"으로 분류된 요청은 Haiku가 처리해 답이 가벼워질 수 있습니다.
- 요금제에서 쓸 수 없는 모델이 골라지면 원래 모델로 다시 보냅니다.
- `/model`로 직접 고르면 그 선택이 우선이고, `/route off`로 언제든 끌 수 있습니다.

**적용 범위**
- `user` (추천): 이 PC의 모든 새 Claude Code 대화 (터미널, 데스크톱 앱 Code 탭)
- `local`: 지금 폴더(프로젝트)에서만, 나에게만

## 3단계: 코드 확인

설치 전에, 고른 Mod의 코드를 읽고 무엇을 하는지 **3줄 이내로 요약**해 보여 줍니다.

- token-weather: `https://raw.githubusercontent.com/nefirim96/claude-code-mods-kit/main/plugins/token-weather/hooks/token-weather.mjs`
- replay-theater: `https://raw.githubusercontent.com/nefirim96/claude-code-mods-kit/main/plugins/replay-theater/hooks/replay-theater.mjs`
- model-router: `https://raw.githubusercontent.com/nefirim96/claude-code-mods-kit/main/plugins/model-router/hooks/register.ts`

확인할 것: 외부로 데이터를 보내는지, 쉘 명령을 실행하는지, 파일을 지우거나 바꾸는지. 이 키트의 Mod는 모두 해당하지 않아야 합니다. 다르게 보이면 **설치를 멈추고** 사용자에게 알립니다.

요약을 보여 준 뒤 "이대로 설치할까요?"라고 묻고, 승인을 받으면 4단계로 갑니다.

## 4단계: 설치

1. 마켓플레이스 등록:
   ```
   claude plugin marketplace add nefirim96/claude-code-mods-kit
   ```
   이미 등록돼 있다는 오류가 나면 `claude plugin marketplace update claude-code-mods-kit`로 최신화합니다.
2. 고른 Mod만 설치 (`<범위>`는 2단계에서 고른 `user` 또는 `local`):
   ```
   claude plugin install token-weather@claude-code-mods-kit --scope <범위>
   claude plugin install replay-theater@claude-code-mods-kit --scope <범위>
   claude plugin install model-router@claude-code-mods-kit --scope <범위>
   ```
3. `claude plugin list`로 고른 Mod가 모두 `enabled`인지 확인해 보여 줍니다.

### CLI가 없을 때 (데스크톱 앱만 쓰는 경우)

두 가지 방법을 안내하고 사용자가 고르게 합니다.
- **앱 화면에서 설치**: 데스크톱 앱의 플러그인 화면에서 마켓플레이스 추가를 열고 `nefirim96/claude-code-mods-kit`를 넣은 뒤, Mod를 골라 설치합니다.
- **CLI 설치 후 진행**: 공식 문서(https://code.claude.com/docs)의 설치 방법으로 Claude Code CLI를 설치한 뒤, 이 문서를 처음부터 다시 진행합니다. 설치 명령은 사용자가 직접 실행하게 안내합니다.

## 5단계: 적용과 동작 확인

설치한 Mod는 **새로 시작한 대화부터** 적용된다고 먼저 알립니다. 그다음 사용자가 따라 할 순서를 설치한 Mod에 맞춰 번호로 안내합니다.

1. 지금 대화를 끝내고 새 대화를 시작합니다. 터미널이면 `/exit` 후 `claude`, 데스크톱 앱이면 새 대화를 엽니다.
2. `/plugin`을 입력해 (데스크톱 앱은 플러그인 화면) 설치한 Mod가 보이는지 확인합니다.
3. **token-weather**: 아무 질문(예: `안녕`)을 한 뒤, 입력창 위에 `☀ Clear 3% of context ...` 줄이 생기면 성공입니다.
4. **replay-theater**: `test.txt 파일을 만들고 hello라고 써줘`라고 한 뒤 `/replay`를 입력합니다. Replay Theater 창에 `test.txt`와 `+ hello`가 보이면 성공입니다. `n` 다음, `p` 이전, `c` 또는 `Esc` 닫기. 끝나면 `test.txt`를 지웁니다.
   - token-weather와 함께 쓰면 입력창 위 자리를 token-weather가 쓰기 때문에 `▶ Replay` 안내가 안 보일 수 있습니다. `/replay`로 열면 됩니다.
5. **model-router**:
   - `/route status`를 입력해 "켜짐"이 나오는지 봅니다.
   - 간단한 요청(예: `"사과, 바나나, 당근, 오이"를 과일과 채소로 나눠줘`) 뒤 상태 줄에 `route: haiku · ... · 실제: claude-haiku-...`가 나오는지 봅니다.
   - 복잡한 요청(예: `이 폴더 구조를 분석해서 설계 관점에서 설명해줘`) 뒤 `route: opus · ... · 실제: claude-opus-...`가 나오는지 봅니다.
   - `/route off`로 끄고 `/route on`으로 다시 켤 수 있습니다.

마지막에 무엇을 설치했는지, 어디에 적용되는지, 끄는 방법을 3~5줄로 정리해 줍니다.

## 문제 해결

| 증상 | 할 일 |
| --- | --- |
| `Invalid marketplace source format` | 저장소 주소를 `nefirim96/claude-code-mods-kit` 형식으로 다시 확인합니다. |
| 마켓플레이스 등록이 네트워크 오류로 실패 | 인터넷 연결과 GitHub 접속을 확인하고, 사용자가 원할 때 한 번만 다시 시도합니다. |
| 설치는 됐는데 화면에 안 보임 | 새 대화를 시작했는지, 버전이 충분한지 확인합니다. token-weather는 첫 응답 후에 보입니다. |
| `/route`가 없다고 나옴 | model-router가 설치·활성화됐는지 `claude plugin list`로 확인하고, 새 대화에서 다시 시도합니다. |
| 상태 줄에 `요청 실패 · 기본 모델로 다시 보냄` | 요금제에서 그 모델을 쓸 수 없는 경우입니다. 정상 동작이며, 불편하면 `/route off`를 안내합니다. |

## 끄기와 지우기

```
claude plugin disable <mod>@claude-code-mods-kit
claude plugin enable <mod>@claude-code-mods-kit
claude plugin uninstall <mod>@claude-code-mods-kit
claude plugin marketplace remove claude-code-mods-kit
```

데스크톱 앱에서는 플러그인 화면에서 해당 Mod의 ⋮ 메뉴로 끄거나 지울 수 있습니다.
