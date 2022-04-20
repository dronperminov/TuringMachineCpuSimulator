var commandMachine = new TuringMachine()

commandMachine.AddState("move-begin", {'0': 'L',   '1': 'L',   '': `,R,${HALT}`})

commandMachine.AddState("INC",   {'0': 'R',              '1': 'R',      '': `,L,INC-1`})
commandMachine.AddState("INC-1", {'0': '1,N,move-begin', '1': '0,L,',   '': `1,N,${HALT}`})

commandMachine.AddState("DEC",   {'0': 'R',              '1': 'R',           '': `,L,DEC-1`})
commandMachine.AddState("DEC-1", {'0': '1,L,DEC-1', '1': '0,N,move-begin',   '': `1,N,${HALT}`})

// побитовая инверсия
commandMachine.AddState("NOT",    {'0': '1,R', '1': '0,R', '': `,L,move-begin`})


// побитовое И двух n-битных чисел
commandMachine.AddState("AND",       {'0': ',R,AND-1',     '1': ',R,AND-2'})
commandMachine.AddState("AND-1",     {'0': 'R',           '1': 'R',                               '#': '#,R,AND-3'})
commandMachine.AddState("AND-2",     {'0': 'R',           '1': 'R',                               '#': '#,R,AND-4'})
commandMachine.AddState("AND-3",     {'0': ',R,AND-zero', '1': ',R,AND-zero', '': 'R'})
commandMachine.AddState("AND-4",     {'0': ',R,AND-zero', '1': ',R,AND-one',  '': 'R'})
commandMachine.AddState("AND-zero",  {'0': 'R',           '1': 'R',           '': '0,N,AND-begin',                      '=': 'R'})
commandMachine.AddState("AND-one",   {'0': 'R',           '1': 'R',           '': '1,N,AND-begin',                      '=': 'R'})
commandMachine.AddState("AND-begin", {'0': 'L',           '1': 'L',           '': 'L',            '#': '#,L,AND-check', '=': 'L'})
commandMachine.AddState("AND-check", {'0': '0,N,AND-move', '1': '1,N,AND-move', '': ',R,AND-clean'})
commandMachine.AddState("AND-move",  {'0': 'L',           '1': 'L',           '': ',R,AND'})
commandMachine.AddState("AND-clean", {                                        '': 'R',            '#': ',R,AND-clean',  '=': `,R,${HALT}`})


// побитовое ИЛИ двух n-битных чисел
commandMachine.AddState("OR",       {'0': ',R,OR-1',     '1': ',R,OR-2'})
commandMachine.AddState("OR-1",     {'0': 'R',           '1': 'R',                               '#': '#,R,OR-3'})
commandMachine.AddState("OR-2",     {'0': 'R',           '1': 'R',                               '#': '#,R,OR-4'})
commandMachine.AddState("OR-3",     {'0': ',R,OR-zero',  '1': ',R,OR-one',   '': 'R'})
commandMachine.AddState("OR-4",     {'0': ',R,OR-one',   '1': ',R,OR-one',   '': 'R'})
commandMachine.AddState("OR-zero",  {'0': 'R',           '1': 'R',           '': '0,N,OR-begin',                      '=': 'R'})
commandMachine.AddState("OR-one",   {'0': 'R',           '1': 'R',           '': '1,N,OR-begin',                      '=': 'R'})
commandMachine.AddState("OR-begin", {'0': 'L',           '1': 'L',           '': 'L',            '#': '#,L,OR-check', '=': 'L'})
commandMachine.AddState("OR-check", {'0': '0,N,OR-move', '1': '1,N,OR-move', '': ',R,OR-clean'})
commandMachine.AddState("OR-move",  {'0': 'L',           '1': 'L',           '': ',R,OR'})
commandMachine.AddState("OR-clean", {                                        '': 'R',            '#': ',R,OR-clean',  '=': `,R,${HALT}`})


// побитовое исключающее ИЛИ двух n-битных чисел
commandMachine.AddState("XOR",       {'0': ',R,XOR-1',    '1': ',R,XOR-2'})
commandMachine.AddState("XOR-1",     {'0': 'R',           '1': 'R',                               '#': '#,R,XOR-3'})
commandMachine.AddState("XOR-2",     {'0': 'R',           '1': 'R',                               '#': '#,R,XOR-4'})
commandMachine.AddState("XOR-3",     {'0': ',R,XOR-zero', '1': ',R,XOR-one',   '': 'R'})
commandMachine.AddState("XOR-4",     {'0': ',R,XOR-one',  '1': ',R,XOR-zero',  '': 'R'})
commandMachine.AddState("XOR-zero",  {'0': 'R',           '1': 'R',            '': '0,N,XOR-begin',                      '=': 'R'})
commandMachine.AddState("XOR-one",   {'0': 'R',           '1': 'R',            '': '1,N,XOR-begin',                      '=': 'R'})
commandMachine.AddState("XOR-begin", {'0': 'L',           '1': 'L',            '': 'L',            '#': '#,L,XOR-check', '=': 'L'})
commandMachine.AddState("XOR-check", {'0': '0,N,XOR-move','1': '1,N,XOR-move', '': ',R,XOR-clean'})
commandMachine.AddState("XOR-move",  {'0': 'L',           '1': 'L',            '': ',R,XOR'})
commandMachine.AddState("XOR-clean", {                                         '': 'R',            '#': ',R,XOR-clean',  '=': `,R,${HALT}`})


// сложение двух чисел произвольной размерности
commandMachine.AddState("ADD", {'0': "R", '1': "R", '': ',L,ADD-check', 'I': "R", '#': "R", 'O': "R"})
commandMachine.AddState("ADD-zero", {'0': "L", '1': "L", 'I': "N", '#': '#,L,ADD-zero2', '': "N", 'O': "N"})
commandMachine.AddState("ADD-one", {'0': "L", '1': "L", 'I': "N", '#': '#,L,ADD-one2', '': "N", 'O': "N"})
commandMachine.AddState("ADD-zero2", {'0': 'O,N,ADD', '1': 'I,N,ADD', 'I': "L", '#': "N", '': 'O,N,ADD', 'O': "L"})
commandMachine.AddState("ADD-one2", {'0': 'I,L,ADD', '1': 'O,L,ADD-one3', 'I': "L", '#': "N", '': 'I,R,ADD', 'O': "L"})
commandMachine.AddState("ADD-one3", {'0': '1,L,ADD', '1': '0,L,ADD-one3', 'O': "N", 'I': "N", '#': "N", '': '1,R,ADD'})
commandMachine.AddState("ADD-clear", {'0': "L", '1': "L", 'O': '0,L,ADD-clear', 'I': '1,L,ADD-clear', '#': "N", '': `,R,${HALT}`})
commandMachine.AddState("ADD-check", {'0': ',L,ADD-zero', '1': ',L,ADD-one', 'I': "N", '#': ',L,ADD-clear', '': "N", 'O': "N"})