var memoryMachine = new TuringMachine('memory-machine-box', 'Машина Тьюринга (память)')

memoryMachine.AddState("BEGIN", {'0': 'L', '1': 'L', '#': 'L', 'I': '#,L', '': `I,L,${HALT}`})

memoryMachine.AddState("MOVE", {'0': '1,L,MOVE-dec', '1': '0,R,MOVE-mark'})
memoryMachine.AddState("MOVE-mark", {'0': "R", '1': "R", '#': 'O,L,MOVE-begin', 'I': "R", 'O': "R"})
memoryMachine.AddState("MOVE-begin", {'0': "L", '1': "L", '#': "L", 'I': 'I,L,MOVE', 'O': "L"})
memoryMachine.AddState("MOVE-dec", {'0': '1,L,MOVE-dec', '1': '0,R,MOVE-mark', '': ',R,MOVE-shift'})
memoryMachine.AddState("MOVE-shift", {'0': ',R,MOVE-shift', '1': ',R,MOVE-shift', 'I': ',R,MOVE-find'})
memoryMachine.AddState("MOVE-find", {'0': "R", '1': "R", '#': `#,R,${HALT}`, 'O': '#,R,MOVE-find'})
