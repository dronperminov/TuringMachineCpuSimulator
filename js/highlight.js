function SyntaxHighlighter(editableId, highlightId) {
    this.editableBox = document.getElementById(editableId)
    this.highlightBox = document.getElementById(highlightId)
    this.editableBox.addEventListener('input', () => this.Highlight())
    this.editableBox.addEventListener('cnahge', () => this.Highlight())
    this.editableBox.addEventListener('keydown', (e) => this.DisableBrInsert(e))

    this.highlightRules = [
        {regex: /;.*/gi, name: "comment-code"},
        {regex: /\b(\d+d?|[01]+b|0b[01]+|0o[0-7]+|0x[\da-fA-F]+)\b/g, name: "number-code"},
        {regex: /^ *[.a-zA-Z]\w*:/gi, name: "label-code"},
        {regex: new RegExp(`\\b(${REGISTER_NAMES.join('|')})\\b`, "g"), name: "register-code"},
        {regex: new RegExp(`\\b(${JUMP_COMMANDS.join('|')})\\b`, "g"), name: "jump-code"},
        {regex: new RegExp(`\\b(${MAIN_COMMANDS.join('|')})\\b`, "g"), name: "command-code"}
    ]

    this.Highlight()
}

SyntaxHighlighter.prototype.DisableBrInsert = function(e) {
    if (e.key === 'Enter') {
        document.execCommand('insertLineBreak')
        e.preventDefault()
    }
}

SyntaxHighlighter.prototype.SpanLine = function(line, rules) {
    let intervals = []

    for (let rule of rules) {
        for (let match of line.matchAll(rule.regex)) {
            let start = match.index
            let end = start + match[0].length
            intervals.push({start: start, end: end, len: end - start, name: rule.name})
        }
    }

    intervals.sort((a, b) => a.start - b.start)

    let prev = null
    let filtered = []

    for (let interval of intervals) {
        if (prev && interval.start < prev.end)
            continue

        filtered.push(interval)
        prev = interval
    }

    filtered.sort((a, b) => b.start - a.start)

    for (let interval of filtered) {
        let before = line.substr(0, interval.start)
        let inside = line.substr(interval.start, interval.len)
        let after = line.substr(interval.end)
        line = `${before}<span class="${interval.name}">${inside}</span>${after}`
    }

    return line
}

SyntaxHighlighter.prototype.IsWhiteSpace = function(line) {
    return line.match(/^\s*$/gi) != null
}

SyntaxHighlighter.prototype.Highlight = function() {
    let lines = this.GetTextLines()
    this.highlightBox.innerHTML = ''

    for (let i = 0; i < lines.length; i++) {
        let line = this.SpanLine(lines[i], this.highlightRules)

        let div = document.createElement('div')
        div.className = 'code-line'
        div.id = `code-line-${i}`
        div.innerHTML = this.IsWhiteSpace(lines[i]) ? '<br>' : line

        this.highlightBox.appendChild(div)
    }
}

SyntaxHighlighter.prototype.GetTextLines = function() {
    return this.editableBox.value.split('\n')
}

SyntaxHighlighter.prototype.SetText = function(text) {
    this.editableBox.value = text
    this.Highlight()
}