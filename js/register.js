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
    this.block.innerHTML = `${this.name}: ${this.value}`
}

Register.prototype.GetValue = function() {
    return this.value
}

Register.prototype.Reset = function() {
    let zero = Array(this.n_bits).fill('0').join('')
    this.SetValue(zero)
}