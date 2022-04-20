const MOVE_LEFT = "L"
const MOVE_NONE = "N"
const MOVE_RIGHT = "R"
const LAMBDA = ''

function Tape() {
    this.negative = []
    this.positive = [LAMBDA]
    this.index = 0
}

Tape.prototype.SetChar = function(c) {
    if (this.index >= 0) {
        this.positive[this.index] = c
    }
    else {
        this.negative[1 - this.index] = c
    }
}

Tape.prototype.Move = function(direction) {
    if (direction == MOVE_LEFT) {
        this.index--
    }
    else if (direction == MOVE_RIGHT) {
        this.index++
    }
    else if (direction != MOVE_NONE) {
        throw `Invalid move direction ${direction}`
    }
}

Tape.prototype.GetChar = function() {
    return this.GetCharAt(this.index)
}

Tape.prototype.GetCharAt = function(index) {
    if (index >= 0)
        return index < this.positive.length ? this.positive[index] : LAMBDA

    return 1 - index < this.negative.length ? this.negative[1 - index] : LAMBDA
}

Tape.prototype.SetWord = function(word) {
    this.negative = []
    this.positive = []
    this.index = 0

    for (let i = 0; i < word.length; i++)
        this.positive.push(word[i])

    this.positive.push(LAMBDA)
}

Tape.prototype.GetWord = function() {
    let index = this.index
    let word = []

    for (let c = this.GetChar(); c != LAMBDA; c = this.GetChar()) {
        word.push(c)
        this.Move(MOVE_RIGHT)
    }

    this.index = index
    return word.join('')
}

Tape.prototype.Clear = function() {
    this.negative = []
    this.positive = [LAMBDA]
    this.index = 0
}

Tape.prototype.GetBorders = function() {
    let left = this.positive.length
    let right = 1 - this.negative.length

    for (let i = -this.negative.length; i < this.positive.length; i++) {
        if (this.GetCharAt(i) != LAMBDA) {
            left = Math.min(left, i)
            right = Math.max(right, i)
        }
    }

    return {left, right}
}
