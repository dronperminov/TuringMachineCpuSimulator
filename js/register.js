function Register(name, n_bits, block) {
    this.n_bits = n_bits
    this.name = name
    this.InitBlock(block)
    this.Reset()
}

Register.prototype.InitBlock = function(block) {
    this.block = document.createElement('div')
    this.block.className = 'register'
    block.appendChild(this.block)
}

Register.prototype.SetValue = function(value) {
    this.value = value
    this.block.innerHTML = `${this.name}: ${this.value} (${Number.parseInt(this.value, 2)})`
}

Register.prototype.GetValue = function() {
    return this.value
}

Register.prototype.Reset = function() {
    let zero = Array(this.n_bits).fill('0').join('')
    this.SetValue(zero)
}

Register.prototype.FixCarry = function() {
    let len = this.value.length
    this.SetValue(this.value.substr(len - this.n_bits))
}