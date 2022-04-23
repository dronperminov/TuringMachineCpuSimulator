const HALT = "!"
const TAPE_CELL_SIZE = 40
const LAMBDA_CELL = 'λ'
const LEFT_CELL = '‹'
const RIGHT_CELL = '›'

function TuringMachine(boxId, header) {
    this.tape = new Tape()
    this.states = {}
    this.machineBox = document.getElementById(boxId)
    this.header = header
    this.alphabet = new Set()
    this.offset = 0
    this.center = null

    window.addEventListener('resize', () => this.Resize())
}

TuringMachine.prototype.AddState = function(stateName, state) {
    this.states[stateName] = state

    for (let char of Object.keys(state))
        this.alphabet.add(char)
}

TuringMachine.prototype.SetWord = function(word) {
    this.tape.SetWord(word)
}

TuringMachine.prototype.GetWord = function(endChar = LAMBDA) {
    return this.tape.GetWord(endChar)
}

TuringMachine.prototype.WriteWord = function(word, dir = 1) {
    this.tape.WriteWord(word, dir)
}

TuringMachine.prototype.Clear = function() {
    this.tape.Clear()
    this.state = ''
    this.runCommand = ''
}

TuringMachine.prototype.InitProgram = function(word, state) {
    if (word.length > 0)
        this.SetWord(word)

    this.state = state
    this.runCommand = state
    this.offset = 0
    this.center = null
}

TuringMachine.prototype.ParseCommand = function(state, currChar) {
    let command = this.states[state][currChar]
    let args = command.split(',')
    let nextChar = currChar
    let move = MOVE_NONE
    let nextState = state

    if (args.length == 3) {
        nextChar = args[0]
        move = args[1]
        nextState = args[2] == '' ? state : args[2]
    }
    else if (args.length == 2) {
        nextChar = args[0]
        move = args[1]
    }
    else if (args[0] == HALT) {
        nextState = HALT
    }
    else {
        move = args[0]
    }

    return {nextChar, move, nextState}
}

TuringMachine.prototype.OptimizeCommand = function(state, char, nextChar, move, nextState) {
    if (state == nextState && char == nextChar)
        return move

    if (state == nextState)
        return `${nextChar},${move}`

    return `${nextChar},${move},${nextState}`
}

TuringMachine.prototype.Step = function() {
    let currChar = this.tape.GetChar()
    let command = this.ParseCommand(this.state, currChar)

    this.tape.SetChar(command.nextChar)
    this.tape.Move(command.move)
    this.state = command.nextState

    return this.state != HALT
}

TuringMachine.prototype.Run = function(state) {
    let steps = 0

    this.state = state
    while (this.Step())
        steps++

    return this.GetWord()
}

TuringMachine.prototype.RunFromWord = function(word, state) {
    this.SetWord(word)
    return this.Run(state)
}

TuringMachine.prototype.MoveTape = function(step) {
    this.offset -= step
    this.ToHTML()
}

TuringMachine.prototype.MakeTape = function() {
    let tape = document.createElement('div')
    tape.className = 'turing-tape'

    let width = this.machineBox.clientWidth
    let cells = Math.floor(width / TAPE_CELL_SIZE) - 2
    let borders = this.tape.GetBorders()

    if (this.center == null) {
        this.center = Math.floor((cells - (borders.right + borders.left)) / 2)
    }

    if (this.tape.index + this.center >= cells) {
        this.center = cells - 1 - this.tape.index
    }

    if (this.tape.index + this.center < 0) {
        this.center = -this.tape.index
    }

    for (let i = 0; i < cells + 2; i++) {
        let cell = document.createElement('div')
        cell.className = 'turing-tape-cell'
        cell.style.width = `${TAPE_CELL_SIZE}px`
        cell.style.height = `${TAPE_CELL_SIZE}px`

        if (i == 0) {
            cell.innerHTML = LEFT_CELL
            cell.addEventListener('click', () => this.MoveTape(-1))
            cell.classList.add('turing-tape-move-cell')
        }
        else if (i == cells + 1) {
            cell.innerHTML = RIGHT_CELL
            cell.addEventListener('click', () => this.MoveTape(1))
            cell.classList.add('turing-tape-move-cell')
        }
        else {
            let index = i - 1 - this.center + this.offset
            let char = this.tape.GetCharAt(index)

            if (this.tape.index == index) {
                cell.classList.add('turing-tape-current-cell')
            }
            else if (char == LAMBDA) {
                cell.classList.add('turing-tape-lambda-cell')
            }

            cell.innerHTML = (char == LAMBDA ? LAMBDA_CELL : char)
        }

        tape.appendChild(cell)
    }

    this.machineBox.appendChild(tape)
}

TuringMachine.prototype.MakeNamedRow = function(names, classNames = null) {
    let row = document.createElement('div')
    row.className = 'turing-states-row'

    for (let i = 0; i < names.length; i++) {
        let cell = document.createElement('div')
        cell.className = 'turing-states-cell'

        if (classNames != null && classNames[i])
            cell.classList.add(classNames[i])

        cell.innerHTML = names[i]
        row.appendChild(cell)
    }

    return row
}

TuringMachine.prototype.MakeHeaderRow = function(alphabet) {
    let names = ['Состояние']
    let classNames = ['']
    let currChar = this.tape.GetChar()

    for (let char of alphabet) {
        names.push(char == LAMBDA ? LAMBDA_CELL : char)
        classNames.push(char == currChar && this.state != HALT ? 'turing-states-active-char' : '')
    }

    return this.MakeNamedRow(names, classNames)
}

TuringMachine.prototype.MakeStateRow = function(state, alphabet) {
    let names = [`q<sub>${state}</sub>`]
    let classNames = [state == this.state ? 'turing-states-active-state' : '']

    for (let char of alphabet) {
        if (char in this.states[state]) {
            let command = this.ParseCommand(state, char)

            let prevChar = char == LAMBDA ? LAMBDA_CELL : char
            let nextChar = command.nextChar == LAMBDA ? LAMBDA_CELL : command.nextChar

            let prevState = state == HALT ? `q<sub>halt</sub>` : `q<sub>${state}</sub>`
            let nextState = command.nextState == HALT ? `q<sub>halt</sub>` : `q<sub>${command.nextState}</sub>`

            names.push(this.OptimizeCommand(prevState, prevChar, nextChar, command.move, nextState))
        }
        else {
            names.push('')
        }

        if (state == this.state && char == this.tape.GetChar())
            classNames.push('turing-states-active-cell')
        else
            classNames.push('')
    }

    return this.MakeNamedRow(names, classNames)
}

TuringMachine.prototype.GetCommandStates = function(command) {
    let currStates = new Set()
    let currAlphabet = new Set()

    for (let queue = [command]; queue.length > 0;) {
        let state = queue.pop()

        if (currStates.has(state) || state == HALT)
            continue

        for (let char of Object.keys(this.states[state])) {
            let nextState = this.ParseCommand(state, char).nextState
            currAlphabet.add(char)
            queue.push(nextState)
        }

        currStates.add(state)
    }

    return {states: currStates, alphabet: currAlphabet}
}

TuringMachine.prototype.MakeStates = function() {
    let states = document.createElement('div')
    states.className = 'turing-states'

    let curr = this.GetCommandStates(this.runCommand)
    let alphabet = Array.from(curr.alphabet)

    states.appendChild(this.MakeHeaderRow(alphabet))

    for (let state of curr.states) {
        states.appendChild(this.MakeStateRow(state, alphabet))
    }

    this.machineBox.appendChild(states)
}

TuringMachine.prototype.Resize = function() {
    this.center = null
    this.offset = 0
    this.ToHTML()
}

TuringMachine.prototype.ToHTML = function() {
    this.machineBox.innerHTML = `<b>${this.header}</b><br>`
    this.MakeTape()

    if (this.state)
        this.MakeStates()
}