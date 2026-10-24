# Claude Code Mods Kit

프롬프트 한 줄이면 Claude Code가 Mod 3개를 **확인을 받아 가며** 설치하고, 동작 확인까지 순서대로 안내해 줍니다.

| Mod | 하는 일 |
| --- | --- |
| ☀ **token-weather** | 입력창 위에 컨텍스트 사용량을 날씨처럼 표시 |
| ▶ **replay-theater** | 마지막 턴에 Claude가 수정한 파일을 한 단계씩 diff로 재생 (`/replay`) |
| 🧭 **model-router** | 입력마다 작업 종류를 판단해 Haiku / Sonnet / Opus 자동 선택 (`/route on`, `/route off`) |

![token-weather](plugins/token-weather/screenshots/token-weather-showers.png)

## 설치: 이 프롬프트를 Claude Code에 붙여 넣으세요

터미널의 `claude`나 데스크톱 앱 Code 탭에서 아래를 그대로 입력합니다.

```
https://github.com/nefirim96/claude-code-mods-kit 의 SETUP.md를 읽고, 그 순서대로 진행해줘. 설치 전에 어떤 Mod를 설치할지 나에게 물어보고, 코드를 확인한 내용을 먼저 보여줘.
```

Claude Code가 하는 일:
1. 버전과 운영체제를 확인합니다.
2. Mod를 소개하고, 설치할 Mod와 적용 범위를 물어봅니다.
3. 고른 Mod의 코드를 읽고 무엇을 하는지 요약해 보여 줍니다.
4. 승인하면 설치하고, 설치 결과를 확인합니다.
5. 새 대화에서 각 Mod가 동작하는지 하나씩 확인하는 방법을 안내합니다.

> 붙여 넣는 프롬프트는 이 저장소의 [SETUP.md](SETUP.md)를 따르게 합니다. 처음이라면 SETUP.md를 먼저 읽어 보세요. 다른 저장소의 설치 프롬프트도 마찬가지로, 무엇을 시키는지 확인한 뒤 쓰는 것이 안전합니다.

## 필요한 것

- Claude Code **2.1.287 이상** (model-router는 **2.1.308 이상**)
- Windows, macOS, Linux 모두 됩니다. 세 Mod 모두 쉘 명령을 쓰지 않습니다.

## 직접 설치하기

```
claude plugin marketplace add nefirim96/claude-code-mods-kit
claude plugin install token-weather@claude-code-mods-kit --scope user
claude plugin install replay-theater@claude-code-mods-kit --scope user
claude plugin install model-router@claude-code-mods-kit --scope user
```

설치 후 **새 대화**를 시작하면 적용됩니다. `--scope user`는 이 PC의 모든 새 Claude Code 대화에 적용되고, `--scope local`은 지금 폴더에서만 적용됩니다.

## model-router를 쓰기 전에

- 새 입력마다 분류용 Haiku 호출이 1번 더 듭니다.
- 모델이 바뀌면 이전 캐시를 쓰지 못해 비용이 오히려 늘 수 있습니다. 절감 효과는 직접 비교해 보세요.
- `/model`로 직접 고른 모델이 항상 우선이고, `/route off`로 끌 수 있습니다.
- 자세한 내용: [plugins/model-router/README.md](plugins/model-router/README.md)

## 끄기와 지우기

```
claude plugin disable model-router@claude-code-mods-kit
claude plugin uninstall model-router@claude-code-mods-kit
claude plugin marketplace remove claude-code-mods-kit
```

## 출처와 라이선스

- token-weather, replay-theater: Anthropic의 claude-code-playground 예제를 수정 없이 담았습니다 (Apache-2.0, Copyright 2026 Anthropic PBC).
- model-router: 이 키트를 위해 만들었습니다 (Apache-2.0).
- 이 키트는 Anthropic이 만들거나 보증한 것이 아니며, 있는 그대로 공유합니다. 자세한 내용은 [NOTICE](NOTICE)와 [LICENSE](LICENSE)를 보세요.
