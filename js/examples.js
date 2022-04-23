const FIBONACCI_EXAMPLE = `; Симулятор процессора на машинах Тьюринга
; https://github.com/dronperminov/TuringMachineCpuSimulator
; Пример вычисления числа Фибоначчи по номеру в регистре A

JMP start

.loop:
    PUSH B ; сохраняем предыдущий член последовательности
    ADD B, C ; вычисляем новый
    POP C ; возвращаем сохранённый на место предыдущего
    DEC A   ; уменьшаем номер
    JNZ .loop

    JMP end

start:
    MOV A, 11  ; номер числа Фибоначчи
    MOV C, 0x1
    CMP A, 12
    CMP A, 11
    CMP A, 10
    JMP .loop

end:
    XOR A, B`

const KOLLATZ_EXAMPLE = `; Симулятор процессора на машинах Тьюринга
; https://github.com/dronperminov/TuringMachineCpuSimulator
; Пример программы проверки гипотезы Коллатца

MOV A, 7 ; проверяемое число в гипотезе

.loop:
    MOV B, A ; копируем проверяемое число
    SHR B, 1 ; сдвигаем вправо на 1
    SHL B, 1 ; сдвигаем влево на 1
    CMP A, B ; сравниваем
    JE even  ; если равны, то число было чётным

    ; число нечётное, применяем 3n+1
    MUL A, 3 ; умножаем на 1
    INC A    ; прибавляем 1
    JMP check
even: 
    SHR A, 1 ; число чётное, делим на 2

check:
    CMP A, 1 ; сравниваем с 1
    JNE .loop ; если не дошли до единицы, повторяем процесс
`

const EUCLID_EXAMPLE = `; Симулятор процессора на машинах Тьюринга
; https://github.com/dronperminov/TuringMachineCpuSimulator
; Пример вычисления НОД двух чисел по алгоритму Евклида

JMP start

Euclid:
    CMP A, B  ; сравниваем числа
    JE end    ; если числа равны, НОД найден
    JA else
    SUB B, A  ; если A < B, то B = B - A
    JMP Euclid
else:
    SUB A, B  ; иначе A = A - B
    JMP Euclid
    

start:
    MOV A, 42  ; первое число
    MOV B, 60  ; второе число
    JMP Euclid
end:
    XOR B, A`