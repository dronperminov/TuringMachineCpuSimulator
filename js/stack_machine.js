var stackMachine = new TuringMachine('stack-machine-box', 'Машина тьюринга (стек)')

stackMachine.AddState('POP', {'0': '0,N,POP-clear', '1': '1,N,POP-clear', '': `,N,${HALT}`})
stackMachine.AddState('POP-clear', {'0': ',R,POP-clear', '1': ',R,POP-clear', '': ',L,POP-move'})
stackMachine.AddState('POP-move', {'#': `,L,POP-begin`, '': 'L'})
stackMachine.AddState('POP-begin', {'0': 'L', '1': 'L', '#': `#,R,${HALT}`, '': `${HALT}`})


stackMachine.AddState('PUSH', {'0': 'R', '1': 'R', '#': 'R', '': `#,R,${HALT}`})