const START_LABEL = 'start'

const ZERO_FLAG = 'Z'
const CARRY_FLAG = 'C'

const INC_CMD = 'INC'
const DEC_CMD = 'DEC'

const ADD_CMD = 'ADD'

const AND_CMD = 'AND'
const OR_CMD = 'OR'
const XOR_CMD = 'XOR'
const NOT_CMD = 'NOT'

const MOV_CMD = 'MOV'

const JMP_CMD = 'JMP'
const JZ_CMD = 'JZ'
const JNZ_CMD = 'JNZ'

function CpuSimulator(commandMachine, n_bits = 8) {
    this.commandMachine = commandMachine
    this.n_bits = n_bits

    this.InitButtons()
    this.InitRegisters()
    this.InitFlags()
    this.CompileProgram()
    this.Reset()

    window.requestAnimationFrame(() => this.Run())
}

CpuSimulator.prototype.IsWhiteSpace = function(line) {
    return line.match(/^\s*$/gi) != null
}

CpuSimulator.prototype.IsComment = function(line) {
    return line.match(/^;.*/gi) != null
}

CpuSimulator.prototype.ClearText = function(text) {
    text = text.replace(/<div.*?>/gi, "")
    text = text.replace(/<\/div>/gi, "\n")
    text = text.replace(/<br\/?>/gi, "")

    return text
}

CpuSimulator.prototype.RemoveComments = function(line) {
    line = line.replace(/;.*/gi, "")
    line = line.replace(/^ +/gi, "")
    line = line.replace(/ +$/gi, "")
    return line
}

CpuSimulator.prototype.CompileProgram = function() {
    let codeBox = document.getElementById('code-box')
    let text = this.ClearText(codeBox.innerHTML)
    let lines = text.split('\n')

    this.programIndex = 0
    this.program = []
    this.htmlLines = []
    this.labels = {}

    codeBox.innerHTML = ''

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        let div = document.createElement('div')
        div.className = 'code-line'
        div.innerHTML = this.IsWhiteSpace(line) ? '<br>' : line
        codeBox.appendChild(div)

        if (this.IsComment(line) || this.IsWhiteSpace(line))
            continue

        line = this.RemoveComments(line)

        if (line.endsWith(':')) {
            this.labels[line.substr(0, line.length - 1)] = this.program.length
        }
        else {
            this.program.push({ line: line, block: div })
        }
    }
}

CpuSimulator.prototype.InitButtons = function() {
    this.startStopBtn = document.getElementById('start-stop-btn')
    this.stepBtn = document.getElementById('step-btn')
    this.stepOperationBtn = document.getElementById('step-operation-btn')
    this.resetBtn = document.getElementById('reset-btn')

    this.startStopBtn.addEventListener('click', () => this.StartStop())
    this.stepBtn.addEventListener('click', () => { this.Stop(); this.Step(false) })
    this.stepOperationBtn.addEventListener('click', () => { this.Stop(); this.Step(true) })
    this.resetBtn.addEventListener('click', () => this.Reset())
}

CpuSimulator.prototype.InitRegisters = function() {
    this.registersBox = document.getElementById('registers-box')
    this.registersBox.innerHTML = '<b>Регистры:</b>'
    this.registers = {}

    this.registers['A'] = new Register('A', this.n_bits, this.registersBox)
    this.registers['B'] = new Register('B', this.n_bits, this.registersBox)
    this.registers['C'] = new Register('C', this.n_bits, this.registersBox)
    this.registers['D'] = new Register('D', this.n_bits, this.registersBox)
    this.registers['IP'] = new Register('IP', this.n_bits, this.registersBox)
    this.registers['SP'] = new Register('SP', this.n_bits, this.registersBox)
}

CpuSimulator.prototype.InitFlags = function() {
    this.flagsBox = document.getElementById('flags-box')
    this.flagsBox.innerHTML = '<b>Флаги:</b>'
    this.flags = {}

    this.flags[ZERO_FLAG] = new Flag(ZERO_FLAG, this.flagsBox)
    this.flags[CARRY_FLAG] = new Flag(CARRY_FLAG, this.flagsBox)
}

CpuSimulator.prototype.PrintInfo = function() {
    let registers = []
    for (let name of Object.keys(this.registers))
        registers.push(`${name}: ${this.registers[name].GetValue()}`)

    let flags = []
    for (let name of Object.keys(this.flags))
        flags.push(`${name}: ${this.flags[name].GetValue()}`)

    console.log('Registers:')
    console.log(registers.join('\n'))
    console.log('Flags:')
    console.log(flags.join('\n'))
    console.log('')
}

CpuSimulator.prototype.IsRegister = function(arg) {
    return Object.keys(this.registers).indexOf(arg) > -1
}

CpuSimulator.prototype.ProcessJump = function(jmp, label) {
    if (jmp == JMP_CMD) {
        this.programIndex = this.labels[label]
    }
    else if (jmp == JZ_CMD) {
        if (this.flags[ZERO_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else if (jmp == JNZ_CMD) {
        if (!this.flags[ZERO_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else {
        throw `jump "${jmp}" not implemented`
    }
}

CpuSimulator.prototype.ProcessMov = function(arg1, arg2) {
    if (this.IsRegister(arg2)) {
        this.registers[arg1].SetValue(this.registers[arg2].GetValue())
    }
    else {
        this.registers[arg1].SetValue(arg2)
    }
}

// TODO: flags
CpuSimulator.prototype.ProcessCommand = function(command) {
    this.HideAllLines()
    command.block.classList.toggle('active-line')

    let commandLine = command.line
    let args = commandLine.split(' ')
    let cmd = args[0]

    if (cmd == INC_CMD || cmd == DEC_CMD) {
        let arg = this.registers[args[1]].GetValue()
        this.commandMachine.InitProgram(arg, cmd)
        this.isTuringRun = true
        this.onTuringEnd = () => this.registers[args[1]]
    }
    else if (cmd == ADD_CMD || cmd == AND_CMD || cmd == OR_CMD || cmd == XOR_CMD) {
        let arg1 = this.registers[args[1]].GetValue()
        let arg2 = this.registers[args[2]].GetValue()
        this.commandMachine.InitProgram(`${arg1}#${arg2}`, cmd)
        this.isTuringRun = true
        this.onTuringEnd = () => this.registers[args[1]]
    }
    else if (cmd == NOT_CMD) {
        let arg = this.registers[args[1]].GetValue()
        this.commandMachine.InitProgram(arg, cmd)
        this.isTuringRun = true
        this.onTuringEnd = () => this.registers[args[1]]
    }
    else if (cmd == MOV_CMD) {
        this.ProcessMov(args[1], args[2])
    }
    else if (cmd.startsWith('J')) {
        this.ProcessJump(cmd, args[1])
    }
    else {
        throw `command "${commandLine}" not implemented`
    }
}

CpuSimulator.prototype.HideAllLines = function() {
    for (let line of this.program)
        line.block.classList.remove('active-line')
}

CpuSimulator.prototype.Reset = function() {
    this.Stop()

    for (let register of Object.values(this.registers))
        register.Reset()

    for (let flag of Object.values(this.flags))
        flag.Reset()

    this.HideAllLines()

    this.programIndex = 0
    this.isTuringRun = false
    this.onTuringEnd = null
    this.commandMachine.Clear()
    this.commandMachine.ToHTML()
}

CpuSimulator.prototype.EndTuring = function() {
    this.isTuringRun = false

    let cell = this.onTuringEnd()
    cell.SetValue(this.commandMachine.GetWord())

    this.flags[ZERO_FLAG].SetValue(cell.IsZero())
}

CpuSimulator.prototype.SkipTuringRun = function() {
    if (!this.isTuringRun)
        return

    while (this.commandMachine.Step())
        ;

    this.EndTuring()
}

CpuSimulator.prototype.Step = function(skipTuring = false) {
    if (this.programIndex >= this.program.length && !this.isTuringRun) {
        this.Stop()
        this.program[this.programIndex - 1].block.classList.remove('active-line')
        return
    }

    if (!this.isTuringRun) {
        this.ProcessCommand(this.program[this.programIndex++], skipTuring)
    }
    else if (!this.commandMachine.Step()) {
        this.EndTuring()
    }

    if (skipTuring) {
        this.SkipTuringRun()
    }

    this.commandMachine.ToHTML()
}

CpuSimulator.prototype.StartStop = function() {
    this.isRunning = !this.isRunning
    this.startStopBtn.value = this.isRunning ? 'Остановить' : 'Запустить'
}

CpuSimulator.prototype.Stop = function() {
    if (this.isRunning) {
        this.StartStop()
    }
}

CpuSimulator.prototype.Run = function() {
    if (this.isRunning) {
        this.Step()
    }

    window.requestAnimationFrame(() => this.Run())
}