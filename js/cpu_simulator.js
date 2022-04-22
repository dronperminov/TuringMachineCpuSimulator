function CpuSimulator(commandMachine, stackMachine, n_bits = 8) {
    this.commandMachine = commandMachine
    this.stackMachine = stackMachine
    this.highlighter = new SyntaxHighlighter('code-box', 'code-highlight-box')
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
    return line.match(/^ *;.*/gi) != null
}

CpuSimulator.prototype.ClearText = function(text) {
    text = text.replace(/<(div|span).*?>/gi, "")
    text = text.replace(/<\/div>/gi, "\n")
    text = text.replace(/<\/span>/gi, "")
    text = text.replace(/<br\/?>/gi, "")
    text = text.replace(/\s+$/gi, "")

    return text
}

CpuSimulator.prototype.RemoveComments = function(line) {
    line = line.replace(/;.*/gi, "")
    line = line.replace(/^ +/gi, "")
    line = line.replace(/ +$/gi, "")
    return line
}

CpuSimulator.prototype.CompileProgram = function() {
    let lines = this.highlighter.GetTextLines()

    this.highlighter.Highlight()
    this.programIndex = 0
    this.program = []
    this.htmlLines = []
    this.labels = {}

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]

        if (this.IsComment(line) || this.IsWhiteSpace(line))
            continue

        line = this.RemoveComments(line)

        if (line.endsWith(':')) {
            this.labels[line.substr(0, line.length - 1)] = this.program.length
        }
        else {
            this.program.push({ line: line, block: document.getElementById(`code-line-${i}`) })
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
    else if (jmp == JZ_CMD || jmp == JE_CMD) {
        if (this.flags[ZERO_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else if (jmp == JNZ_CMD || jmp == JNE_CMD) {
        if (!this.flags[ZERO_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else if (jmp == JC_CMD || jmp == JB_CMD || jmp == JNAE_CMD) {
        if (this.flags[CARRY_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else if (jmp == JNC_CMD || jmp == JAE_CMD || jmp == JNB_CMD) {
        if (!this.flags[CARRY_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else if (jmp == JA_CMD || jmp == JNBE_CMD) {
        if (!this.flags[ZERO_FLAG].GetValue() && !this.flags[CARRY_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else if (jmp == JBE_CMD || jmp == JNA_CMD) {
        if (this.flags[ZERO_FLAG].GetValue() || this.flags[CARRY_FLAG].GetValue())
            this.programIndex = this.labels[label]
    }
    else {
        throw `jump "${jmp}" not implemented`
    }
}

CpuSimulator.prototype.ConstantToBits = function(value) {
    if (value.startsWith('0b')) {
        value = Number.parseInt(value.substr(2), 2)
    }
    else if (value.endsWith('b')) {
        value = Number.parseInt(value.substr(0, value.length - 1), 2)
    }
    else if (value.startsWith('0o')) {
        value = Number.parseInt(value.substr(2), 8)
    }
    else if (value.startsWith('0x')) {
        value = Number.parseInt(value.substr(2), 16)
    }
    else if (value.endsWith('d')) {
        value = Number.parseInt(value.substr(0, value.length - 1))
    }
    else {
        value = Number.parseInt(value)
    }

    let bits = []

    for (; bits.length != this.n_bits; value >>= 1)
        bits.push(value & 1)

    return bits.reverse().join('')
}

CpuSimulator.prototype.GetArgumentValue = function(arg) {
    if (this.IsRegister(arg))
        return this.registers[arg].GetValue()

    return this.ConstantToBits(arg)
}

CpuSimulator.prototype.ProcessMov = function(arg1, arg2) {
    let value = this.GetArgumentValue(arg2)
    this.registers[arg1].SetValue(value)
}

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
        this.resultOperand = this.registers[args[1]]
        this.machine = this.commandMachine
    }
    else if ([ADD_CMD, SUB_CMD, SUB_CMD, AND_CMD, OR_CMD, XOR_CMD, SHL_CMD, SHR_CMD].indexOf(cmd) > -1) {
        let arg1 = this.registers[args[1]].GetValue()
        let arg2 = this.GetArgumentValue(args[2])
        this.commandMachine.InitProgram(`${arg1}#${arg2}`, cmd)
        this.isTuringRun = true
        this.resultOperand = this.registers[args[1]]
        this.machine = this.commandMachine
    }
    else if (cmd == CMP_CMD) {
        let arg1 = this.registers[args[1]].GetValue()
        let arg2 = this.GetArgumentValue(args[2])
        this.commandMachine.InitProgram(`${arg1}#${arg2}`, SUB_CMD)
        this.isTuringRun = true
        this.resultOperand = null
        this.machine = this.commandMachine
    }
    else if (cmd == NOT_CMD) {
        let arg = this.registers[args[1]].GetValue()
        this.commandMachine.InitProgram(arg, cmd)
        this.isTuringRun = true
        this.resultOperand = this.registers[args[1]]
        this.machine = this.commandMachine
    }
    else if (cmd == MOV_CMD) {
        this.ProcessMov(args[1], args[2])
    }
    else if (cmd == PUSH_CMD) {
        let arg = this.GetArgumentValue(args[1])
        this.stackMachine.InitProgram('', cmd)
        this.isTuringRun = true
        this.resultOperand = arg
        this.machine = this.stackMachine
    }
    else if (cmd == POP_CMD) {
        this.popResult = this.stackMachine.GetWord()
        this.stackMachine.InitProgram('', cmd)
        this.isTuringRun = true
        this.resultOperand = this.registers[args[1]]
        this.machine = this.stackMachine
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

CpuSimulator.prototype.UpdateTuringMachines = function() {
    this.commandMachine.ToHTML()
    this.stackMachine.ToHTML()
}

CpuSimulator.prototype.Reset = function() {
    this.Stop()

    for (let register of Object.values(this.registers))
        register.Reset()

    for (let flag of Object.values(this.flags))
        flag.Reset()

    this.DisableRunButtons(false)
    this.HideAllLines()

    this.programIndex = 0
    this.isTuringRun = false
    this.resultOperand = null
    this.commandMachine.Clear()
    this.stackMachine.Clear()
    this.UpdateTuringMachines()
}

CpuSimulator.prototype.IsZero = function(value) {
    for (let i = 0; i < this.n_bits; i++)
        if (value[i] != '0')
            return false

    return true
}

CpuSimulator.prototype.IsCarry = function(value) {
    return value.length > this.n_bits
}

CpuSimulator.prototype.DisableRunButtons = function(disable = true) {
    if (disable) {
        this.stepBtn.setAttribute('disabled', '')
        this.stepOperationBtn.setAttribute('disabled', '')
        this.startStopBtn.setAttribute('disabled', '')
    }
    else {
        this.stepBtn.removeAttribute('disabled')
        this.stepOperationBtn.removeAttribute('disabled')
        this.startStopBtn.removeAttribute('disabled')
    }
}

CpuSimulator.prototype.HaltByError = function(error) {
    alert(error)
    this.HideAllLines()
    this.programIndex = this.program.length
    this.DisableRunButtons(true)
}

CpuSimulator.prototype.EndTuring = function() {
    this.isTuringRun = false

    let result = this.machine.GetWord()

    if (this.machine == this.stackMachine) {
        if (this.machine.runCommand == PUSH_CMD) {
            this.machine.WriteWord(this.resultOperand)
            return
        }

        result = this.popResult
        this.machine.state = ''

        if (result == '') {
            this.HaltByError('Stack underflow!')
            return
        }
    }

    this.flags[ZERO_FLAG].SetValue(this.IsZero(result))
    this.flags[CARRY_FLAG].SetValue(this.IsCarry(result))

    if (this.resultOperand == null)
        return

    this.resultOperand.SetValue(result)

    if (this.IsCarry(result))
        this.resultOperand.FixCarry()
}

CpuSimulator.prototype.SkipTuringRun = function() {
    if (!this.isTuringRun)
        return

    while (this.machine.Step())
        ;

    this.EndTuring()
}

CpuSimulator.prototype.Step = function(skipTuring = false) {
    if (this.programIndex >= this.program.length && !this.isTuringRun) {
        this.Stop()
        this.DisableRunButtons()
        this.program[this.programIndex - 1].block.classList.remove('active-line')
        return
    }

    if (!this.isTuringRun) {
        this.ProcessCommand(this.program[this.programIndex++], skipTuring)
    }
    else if (!this.machine.Step()) {
        this.EndTuring()
    }

    if (skipTuring) {
        this.SkipTuringRun()
    }

    this.UpdateTuringMachines()
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