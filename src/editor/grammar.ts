export type GrammarLanguage = 'en' | 'ru'

export interface GrammarIssue {
  start: number
  end: number
  message: string
  language: GrammarLanguage | 'both'
}

type Rule = {
  language: GrammarIssue['language']
  pattern: RegExp
  message: string
  /** Capture group to underline. Defaults to the whole match. */
  group?: number
}

const UNIVERSAL_RULES: Rule[] = [
  {
    language: 'both',
    pattern: /(?<![\p{L}\p{N}_])([\p{L}]+)(\s+)\1(?![\p{L}\p{N}_])/giu,
    message: 'Повтор слова',
  },
  {
    language: 'both',
    pattern: /\s+([,;!?])/gu,
    group: 0,
    message: 'Лишний пробел перед знаком препинания',
  },
  {
    language: 'both',
    pattern: /([,;!?])([\p{L}Ёё])/gu,
    group: 0,
    message: 'После знака препинания нужен пробел',
  },
]

const ENGLISH_RULES: Rule[] = [
  {
    language: 'en',
    pattern: /\bi\b/g,
    message: 'Местоимение “I” пишется с заглавной буквы',
  },
  {
    language: 'en',
    pattern: /\b(he|she|it)\s+(don't|are|have)\b/gi,
    message: 'Проверьте согласование подлежащего и сказуемого',
  },
  {
    language: 'en',
    pattern: /\b(I)\s+(is|has)\b/g,
    message: 'Проверьте согласование подлежащего и сказуемого',
  },
  {
    language: 'en',
    pattern: /\b(you|we|they)\s+(is|has)\b/gi,
    message: 'Проверьте согласование подлежащего и сказуемого',
  },
  {
    language: 'en',
    pattern: /\b(could|should|would|must)\s+of\b/gi,
    message: 'После модального глагола обычно используется “have”, а не “of”',
  },
  {
    language: 'en',
    pattern: /\byour\s+welcome\b/gi,
    message: 'В этом выражении обычно пишется “you’re welcome”',
  },
]

const RUSSIAN_RULES: Rule[] = [
  {
    language: 'ru',
    pattern: /(?<![\p{L}\p{N}_])из\s+за(?![\p{L}\p{N}_])/giu,
    message: 'Предлог “из-за” пишется через дефис',
  },
  {
    language: 'ru',
    pattern: /(?<![\p{L}\p{N}_])по\s+тому\s+что(?![\p{L}\p{N}_])/giu,
    message: 'Союз “потому что” пишется слитно',
  },
  {
    language: 'ru',
    pattern: /(?<![\p{L}\p{N}_])в\s+течении\s+(?:дня|ночи|часа|часов|минуты|минут|недели|месяца|года)(?![\p{L}\p{N}_])/giu,
    message: 'При обозначении времени: “в течение”',
  },
  {
    language: 'ru',
    pattern: /(?:^|[.!?]\s+)(однако|конечно|возможно|вероятно|кажется)(\s+)(?![,—-])/gimu,
    group: 1,
    message: 'После вводного слова обычно ставится запятая',
  },
  {
    language: 'ru',
    pattern: /[\p{L}Ёё](\s+)(но|а)(\s+)[\p{L}Ёё]/giu,
    group: 2,
    message: 'Перед союзом обычно ставится запятая',
  },
]

function issueFromMatch(match: RegExpExecArray, rule: Rule): GrammarIssue | null {
  const whole = match[0]
  if (!whole || match.index < 0) return null

  let start = match.index
  let value = whole
  if (rule.group !== undefined) {
    value = match[rule.group] ?? ''
    const offset = whole.indexOf(value)
    if (!value || offset < 0) return null
    start += offset
  } else if (rule === UNIVERSAL_RULES[0]) {
    // For a repeated word, underline only the second occurrence.
    const first = match[1] ?? ''
    const separator = match[2] ?? ''
    start += first.length + separator.length
    value = first
  }

  return {
    start,
    end: start + value.length,
    message: rule.message,
    language: rule.language,
  }
}

function runRules(text: string, rules: Rule[]): GrammarIssue[] {
  const issues: GrammarIssue[] = []
  for (const rule of rules) {
    rule.pattern.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = rule.pattern.exec(text))) {
      const issue = issueFromMatch(match, rule)
      if (issue) issues.push(issue)
      if (match[0].length === 0) rule.pattern.lastIndex++
    }
  }
  return issues
}

/**
 * Lightweight, private grammar hints for common mistakes. The browser's own
 * spellchecker remains enabled alongside these rules for broader coverage.
 */
export function findGrammarIssues(text: string): GrammarIssue[] {
  const issues = [
    ...runRules(text, UNIVERSAL_RULES),
    ...runRules(text, ENGLISH_RULES),
    ...runRules(text, RUSSIAN_RULES),
  ]

  return issues
    .sort((a, b) => a.start - b.start || a.end - b.end)
    .filter(
      (issue, index, all) =>
        !all.slice(0, index).some(
          (seen) => seen.start === issue.start && seen.end === issue.end,
        ),
    )
}

export function detectTextLanguage(text: string): GrammarLanguage {
  const cyrillic = text.match(/[А-ЯЁа-яё]/g)?.length ?? 0
  const latin = text.match(/[A-Za-z]/g)?.length ?? 0
  return cyrillic > latin ? 'ru' : 'en'
}
