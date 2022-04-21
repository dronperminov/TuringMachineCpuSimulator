var commandMachine = new TuringMachine()

commandMachine.AddState("move-begin", {'0': 'L',   '1': 'L',   '': `,R,${HALT}`})
commandMachine.AddState("normalize", {'0': "L", '1': "L", 'I': '1,L,normalize', 'O': '0,L,normalize', '': `,R,${HALT}`})

commandMachine.AddState("INC",   {'0': 'R',              '1': 'R',      '': `,L,INC-1`})
commandMachine.AddState("INC-1", {'0': '1,N,move-begin', '1': '0,L,',   '': `1,N,${HALT}`})

commandMachine.AddState("DEC",   {'0': 'R',              '1': 'R',           '': `,L,DEC-1`})
commandMachine.AddState("DEC-1", {'0': '1,L,DEC-1', '1': '0,N,move-begin',   '': `1,N,${HALT}`})

// побитовая инверсия
commandMachine.AddState("NOT",    {'0': '1,R', '1': '0,R', '': `,L,move-begin`})


// побитовое И двух n-битных чисел
commandMachine.AddState("AND", {'0': "R", '1': "R", '#': "R", 'I': "R", 'O': "R", '': ',L,AND-check'})
commandMachine.AddState("AND-check", {'0': ',L,AND-left0', '1': ',L,AND-left1', '#': ',L,normalize', })
commandMachine.AddState("AND-zero", {'0': 'O,N,AND', '1': 'O,N,AND', 'I': "L", 'O': "L", })
commandMachine.AddState("AND-one", {'0': 'O,N,AND', '1': 'I,N,AND', 'I': "L", 'O': "L", })
commandMachine.AddState("AND-left0", {'0': "L", '1': "L", '#': '#,L,AND-zero', })
commandMachine.AddState("AND-left1", {'0': "L", '1': "L", '#': '#,L,AND-one', })


// побитовое ИЛИ двух n-битных чисел
commandMachine.AddState("OR", {'0': "R", '1': "R", '#': "R", 'I': "R", 'O': "R", '': ',L,OR-check'})
commandMachine.AddState("OR-check", {'0': ',L,OR-left0', '1': ',L,OR-left1', '#': ',L,normalize', })
commandMachine.AddState("OR-zero", {'0': 'O,N,OR', '1': 'I,N,OR', 'I': "L", 'O': "L", })
commandMachine.AddState("OR-one", {'0': 'I,N,OR', '1': 'I,N,OR', 'I': "L", 'O': "L", })
commandMachine.AddState("OR-left0", {'0': "L", '1': "L", '#': '#,L,OR-zero', })
commandMachine.AddState("OR-left1", {'0': "L", '1': "L", '#': '#,L,OR-one', })


// побитовое исключающее ИЛИ двух n-битных чисел
commandMachine.AddState("XOR", {'0': "R", '1': "R", '#': "R", 'I': "R", 'O': "R", '': ',L,XOR-check'})
commandMachine.AddState("XOR-check", {'0': ',L,XOR-left0', '1': ',L,XOR-left1', '#': ',L,normalize', })
commandMachine.AddState("XOR-zero", {'0': 'O,N,XOR', '1': 'I,N,XOR', 'I': "L", 'O': "L", })
commandMachine.AddState("XOR-one", {'0': 'I,N,XOR', '1': 'O,N,XOR', 'I': "L", 'O': "L", })
commandMachine.AddState("XOR-left0", {'0': "L", '1': "L", '#': '#,L,XOR-zero', })
commandMachine.AddState("XOR-left1", {'0': "L", '1': "L", '#': '#,L,XOR-one', })

// сложение двух чисел произвольной размерности
commandMachine.AddState("ADD", {'0': "R", '1': "R", '': ',L,ADD-check', 'I': "R", '#': "R", 'O': "R"})
commandMachine.AddState("ADD-zero", {'0': "L", '1': "L", '#': '#,L,ADD-zero2', })
commandMachine.AddState("ADD-one", {'0': "L", '1': "L", '#': '#,L,ADD-one2', })
commandMachine.AddState("ADD-zero2", {'0': 'O,N,ADD', '1': 'I,N,ADD', 'I': "L", '': 'O,N,ADD', 'O': "L"})
commandMachine.AddState("ADD-one2", {'0': 'I,N,ADD', '1': 'O,L,ADD-one3', 'I': "L", '': 'I,R,ADD', 'O': "L"})
commandMachine.AddState("ADD-one3", {'0': '1,N,ADD', '1': '0,L,ADD-one3', '': '1,R,ADD'})
commandMachine.AddState("ADD-check", {'0': ',L,ADD-zero', '1': ',L,ADD-one', '#': ',L,normalize', })


// разность двух чисел произвольной размерности
commandMachine.AddState("SUB", {'0': "R", '1': "R", '#': "R", 'I': "R", 'O': "R", '': ',L,SUB-check'})
commandMachine.AddState("SUB-check", {'0': ',L,SUB-move0', '1': ',L,SUB-move1', '#': ',L,SUB-clear'})
commandMachine.AddState("SUB-move0", {'0': "L", '1': "L", '#': '#,L,SUB-sub0'})
commandMachine.AddState("SUB-move1", {'0': "L", '1': "L", '#': '#,L,SUB-sub1'})
commandMachine.AddState("SUB-sub0", {'0': 'O,N,SUB', '1': 'I,N,SUB', 'I': "L", 'O': "L"})
commandMachine.AddState("SUB-sub1", {'0': 'I,L,SUB-sub-carry', '1': 'O,N,SUB', 'I': "L", 'O': "L"})
commandMachine.AddState("SUB-sub-carry", {'0': '1,L,SUB-sub-carry', '1': '0,N,SUB', '': '1,N,SUB'})
commandMachine.AddState("SUB-clear", {'0': "L", '1': "L", 'I': '1,L,SUB-clear', 'O': '0,L,SUB-clear', '': `,R,${HALT}`})