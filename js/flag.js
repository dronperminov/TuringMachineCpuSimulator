function Flag(name, block) {
    this.name = name
    this.InitBlock(block)
    this.Reset()
}

Flag.prototype.InitBlock = function(block) {
    this.block = document.createElement('div')
    this.block.className = 'flag'
    block.appendChild(this.block)
}

Flag.prototype.SetValue = function(value) {
    this.value = value
    this.block.innerHTML = `${this.name}: ${this.value}`
}

Flag.prototype.GetValue = function() {
    return this.value
}

Flag.prototype.Reset = function() {
    this.SetValue(false)
}
