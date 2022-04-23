function CpuSimulator(commandMachine, stackMachine, memoryMachine, n_bits = 8, n_memory = 10) {
    this.commandMachine = commandMachine
    this.stackMachine = stackMachine
    this.memoryMachine = memoryMachine
    this.highlighter = new SyntaxHighlighter('code-box', 'code-highlight-box')
    this.n_bits = n_bits
    this.n_memory = n_memory

    this.InitButtons()
    this.InitRegisters()
    this.InitFlags()
    this.CompileProgram()
    this.Reset()

    window.requestAnimationFrame(() => this.Run())
}

CpuSimulator.prototype.LoadProgram = function(program) {
    if (!confirm("Вы уверены, что хотите загрузить пример? Текущая программа будет утеряна"))
        return

    this.Reset()
    this.highlighter.SetText(program)
    this.CompileProgram()
}

CpuSimulator.prototype.ClearLine = function(line) {
    line = line.replace(/;.*/gi, "")
    line = line.replace(/^ +/gi, "")
    line = line.replace(/ +$/gi, "")
    return line
}

CpuSimulator.prototype.CompileError = function(block, error) {
    block.classList.add('error-line')
    throw error
}

CpuSimulator.prototype.ParseLabel = function(line, block) {
    let parts = line.split(':')
    let label = parts[0]

    if (label.match(/^[.a-zA-Z]\w*$/g) == null)
        this.CompileError(block, `Некорректная метка ("${label}")`)

    this.labels[label] = this.program.length
    return parts.length == 1 ? '' : this.ClearLine(parts[1])
}

CpuSimulator.prototype.ValidateCommand = function(command, args, block) {
    if ([INC_CMD, DEC_CMD, NOT_CMD, POP_CMD].indexOf(command) > -1) {
        if (args.length != 1)
            this.CompileError(block, `Команда "${command}" принимает только один аргумент, а получено ${args.length}`)

        if (!this.IsRegister(args[0]))
            this.CompileError(block, `Команда "${command}" выполнима только на регистре, а вызвана от "${args[0]}"`)
    }
    else if ([ADD_CMD, SUB_CMD, CMP_CMD, MUL_CMD, AND_CMD, OR_CMD, XOR_CMD, SHL_CMD, SHR_CMD].indexOf(command) > -1) {
        if (args.length != 2)
            this.CompileError(block, `Команда "${command}" принимает два аргумента, а получено ${args.length}`)

        if (!this.IsRegister(args[0]))
            this.CompileError(block, `Команда "${command}" первый аргументом принимает регистр, а получено "${args[0]}"`)

        if (!this.IsRegisterOrConstant(args[1]))
            this.CompileError(block, `Команда "${command}" вторым аргументом принимает регистр или константу, а получено "${args[1]}"`)
    }
    else if (command == PUSH_CMD) {
        if (args.length != 1)
            this.CompileError(block, `Команда "${command}" принимает только один аргумент, а получено ${args.length}`)

        if (!this.IsRegisterOrConstant(args[0]))
            this.CompileError(block, `Команда "${command}" принимает регистр или константу, а получено "${args[0]}"`)
    }
    else if (command == MOV_CMD) {
        if (args.length != 2)
            this.CompileError(block, `Команда "${command}" принимает два аргумента, а получено ${args.length}`)

        if (!this.IsRegister(args[0]) && !this.IsAddress(args[0]))
            this.CompileError(block, `Команда "${command}" первым аргументом принимает регистр или адрес, а получено "${args[0]}"`)

        if (this.IsRegister(args[0]) && !this.IsRegisterOrConstant(args[1]) && !this.IsAddress(args[1]))
            this.CompileError(block, `Команда "${command} register" вторым аргументом принимает регистр, константу или адрес, а получено "${args[1]}"`)

        if (this.IsAddress(args[0]) && !this.IsRegisterOrConstant(args[1]))
            this.CompileError(block, `Команда "${command} address" вторым аргументом принимает регистр или константу, а получено "${args[1]}"`)
    }
}

CpuSimulator.prototype.ValidateJumps = function() {
    for (let instruction of this.program) {
        let command = instruction.command
        let args = instruction.args
        let block = instruction.block

        if (JUMP_COMMANDS.indexOf(command) == -1)
            continue

        if (args.length != 1)
            this.CompileError(block, `Команда "${command}" принимает только один аргумент, а получено ${args.length}`)

        let label = args[0]

        if (!(label in this.labels))
            this.CompileError(block, `Метка "${label}" не обнаружена`)
    }
}

CpuSimulator.prototype.ParseLine = function(line, index) {
    line = this.ClearLine(line)

    let block = document.getElementById(`code-line-${index}`)

    if (line.match(/^.*:.*$/gi) != null)
        line = this.ParseLabel(line, block)

    if (line == "")
        return

    let parts = line.split(/ +/g)
    let command = parts[0]

    if (ALL_COMMANDS.indexOf(command) == -1)
        this.CompileError(block, `Неизвестная команда "${command}"`)

    parts.shift()
    let args = parts.join(' ').split(/, */g)

    if (args.length == 1 && args[0] == '')
        args.pop()

    if (args.length == 1 && parts.length > 1)
        this.CompileError(block, "Аргументы должны разделяться запятыми")

    this.ValidateCommand(command, args, block)

    this.program.push({ command: command, args: args, block: block })
}

CpuSimulator.prototype.CompileProgram = function() {
    let lines = this.highlighter.GetTextLines()

    this.highlighter.Highlight()
    this.programIndex = 0
    this.program = []
    this.htmlLines = []
    this.labels = {}

    this.DisableRunButtons(true, true)

    try {
        for (let i = 0; i < lines.length; i++)
            this.ParseLine(lines[i], i)

        this.ValidateJumps()
        this.DisableRunButtons(false, true)
    }
    catch (error) {
        alert(error)
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

    for (let name of REGISTER_NAMES)
        this.registers[name] = new Register(name, this.n_bits, this.registersBox)
}

CpuSimulator.prototype.InitFlags = function() {
    this.flagsBox = document.getElementById('flags-box')
    this.flagsBox.innerHTML = '<b>Флаги:</b>'
    this.flags = {}

    this.flags[ZERO_FLAG] = new Flag(ZERO_FLAG, this.flagsBox)
    this.flags[CARRY_FLAG] = new Flag(CARRY_FLAG, this.flagsBox)
}

CpuSimulator.prototype.ResetMemory = function() {
    let memory = []

    for (let i = 0; i < this.n_memory; i++)
        memory.push('#' + Array(this.n_bits).fill('0').join(''))

    memory = memory.join('')
    this.memoryMachine.Clear()
    this.memoryMachine.SetWord(memory)
}

CpuSimulator.prototype.IsRegister = function(arg) {
    return Object.keys(this.registers).indexOf(arg) > -1
}

CpuSimulator.prototype.IsConstant = function(arg) {
    return arg.match(/^(\d+d?|[01]+b|0b[01]+|0o[0-7]+|0x[\da-fA-F]+)$/g) != null
}

CpuSimulator.prototype.IsRegisterOrConstant = function(arg) {
    return this.IsRegister(arg) || this.IsConstant(arg)
}

CpuSimulator.prototype.IsAddress = function(arg) {
    return arg.startsWith('[') && arg.endsWith(']') && this.IsRegisterOrConstant(arg.substr(1, arg.length - 2))
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

CpuSimulator.prototype.AddressToBits = function(arg) {
    let address = arg.substr(1, arg.length - 2)

    if (this.IsRegister(address))
        return this.registers[address].GetValue()

    return this.ConstantToBits(address)
}

CpuSimulator.prototype.GetArgumentValue = function(arg) {
    if (this.IsRegister(arg))
        return this.registers[arg].GetValue()

    return this.ConstantToBits(arg)
}

CpuSimulator.prototype.ProcessMov = function(arg1, arg2) {
    if (this.IsRegister(arg1) && this.IsRegisterOrConstant(arg2)) {
        let value = this.GetArgumentValue(arg2)
        this.registers[arg1].SetValue(value)
        return
    }

    this.isTuringRun = true
    this.machine = memoryMachine

    if (this.IsRegister(arg1) && this.IsAddress(arg2)) {
        let address = this.AddressToBits(arg2)
        this.memoryMachine.Run("BEGIN")
        this.memoryMachine.WriteWord(address, -1)
        this.memoryMachine.InitProgram('', "MOVE")
        this.resultOperand = this.registers[arg1]
    }
    else if (this.IsAddress(arg1) && this.IsRegisterOrConstant(arg2)) {
        let value = this.GetArgumentValue(arg2)
        let address = this.AddressToBits(arg1)
        this.memoryMachine.Run("BEGIN")
        this.memoryMachine.WriteWord(address, -1)
        this.memoryMachine.InitProgram('', "MOVE")
        this.resultOperand = value
    }
}

CpuSimulator.prototype.ProcessCommand = function(instruction) {
    this.HideAllLines()
    instruction.block.classList.toggle('active-line')

    let args = instruction.args
    let cmd = instruction.command

    if (cmd == INC_CMD || cmd == DEC_CMD || cmd == NOT_CMD) {
        let arg = this.registers[args[0]].GetValue()
        this.commandMachine.InitProgram(arg, cmd)
        this.isTuringRun = true
        this.resultOperand = this.registers[args[0]]
        this.machine = this.commandMachine
    }
    else if ([ADD_CMD, SUB_CMD, MUL_CMD, AND_CMD, OR_CMD, XOR_CMD, SHL_CMD, SHR_CMD].indexOf(cmd) > -1) {
        let arg1 = this.registers[args[0]].GetValue()
        let arg2 = this.GetArgumentValue(args[1])
        this.commandMachine.InitProgram(`${arg1}#${arg2}`, cmd)
        this.isTuringRun = true
        this.resultOperand = this.registers[args[0]]
        this.machine = this.commandMachine
    }
    else if (cmd == CMP_CMD) {
        let arg1 = this.registers[args[0]].GetValue()
        let arg2 = this.GetArgumentValue(args[1])
        this.commandMachine.InitProgram(`${arg1}#${arg2}`, SUB_CMD)
        this.isTuringRun = true
        this.resultOperand = null
        this.machine = this.commandMachine
    }
    else if (cmd == MOV_CMD) {
        this.ProcessMov(args[0], args[1])
    }
    else if (cmd == PUSH_CMD) {
        let arg = this.GetArgumentValue(args[0])
        this.stackMachine.InitProgram('', cmd)
        this.isTuringRun = true
        this.resultOperand = arg
        this.machine = this.stackMachine
    }
    else if (cmd == POP_CMD) {
        this.popResult = this.stackMachine.GetWord()
        this.stackMachine.InitProgram('', cmd)
        this.isTuringRun = true
        this.resultOperand = this.registers[args[0]]
        this.machine = this.stackMachine
    }
    else if (cmd.startsWith('J')) {
        this.ProcessJump(cmd, args[0])
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
    this.memoryMachine.ToHTML()
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
    this.ResetMemory()
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

CpuSimulator.prototype.DisableRunButtons = function(disable = true, disableReset = false) {
    if (disable) {
        this.stepBtn.setAttribute('disabled', '')
        this.stepOperationBtn.setAttribute('disabled', '')
        this.startStopBtn.setAttribute('disabled', '')

        if (disableReset)
            this.resetBtn.setAttribute('disabled', '')
    }
    else {
        this.stepBtn.removeAttribute('disabled')
        this.stepOperationBtn.removeAttribute('disabled')
        this.startStopBtn.removeAttribute('disabled')

        if (disableReset)
            this.resetBtn.removeAttribute('disabled')
    }
}

CpuSimulator.prototype.HaltByError = function(error) {
    alert(error)
    this.HideAllLines()
    this.programIndex = this.program.length
    this.DisableRunButtons(true)
}

CpuSimulator.prototype.EndMemoryTuring = function() {
    if (this.resultOperand instanceof Register) {
        this.resultOperand.SetValue(this.memoryMachine.GetWord('#'))
    }
    else {
        this.memoryMachine.WriteWord(this.resultOperand)
    }
}

CpuSimulator.prototype.EndTuring = function() {
    this.isTuringRun = false
    this.machine.state = ''

    let result = this.machine.GetWord()

    if (this.machine == this.stackMachine) {
        if (this.machine.runCommand == PUSH_CMD) {
            this.machine.WriteWord(this.resultOperand)
            return
        }

        result = this.popResult

        if (result == '') {
            this.HaltByError('Stack underflow!')
            return
        }
    }

    if (this.machine == this.memoryMachine) {
        this.EndMemoryTuring()
        return
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