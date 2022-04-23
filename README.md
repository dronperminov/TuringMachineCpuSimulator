# TuringMachineCpuSimulator
Симулятор x86 подобного процессора на машинах Тьюринга, использующий упрощённый синтаксис ассемблера на основе NASM.

## Конфигурация
* Можно задать произвольную точность вычислений (битность), по умолчанию 8 бит
* Отсутствует память (пока)
* Шесть регистров общего назначения: `A`, `B`, `C`, `D`, `E`, `F`
* Флаг нуля (`ZF`)
* Флаг переполнения (`CF`)
* Стек в виде машины Тьюринга
* Исполнительное устройство в виде машины Тьюринга

## Примеры работы
![анимация работы симулятора](examples/example.gif "Анимация работы симулятора")

<table>
<tr>
  <td><img alt="пример 1" src="examples/example1.png" title="Пример 1" /></td>
  <td><img alt="пример 2" src="examples/example2.png" title="Пример 2" /></td>
</tr>
<tr>
  <td><img alt="пример 3" src="examples/example3.png" title="Пример 1" /></td>
  <td><img alt="пример 4" src="examples/example4.png" title="Пример 4" /></td>
</tr>
<tr>
  <td><img alt="пример 5" src="examples/example5.png" title="Пример 5" /></td>
  <td><img alt="пример 6" src="examples/example6.png" title="Пример 6" /></td>
</tr>
</table>

## Синтаксис

* Каждая инструкция располагается на отдельной строке
* Метки должны начинаться с буквы или точки (.) и заканчиваться двоеточием
* Комментарий начинается с символа `;`
* Операндами команд могут быть регистры общего назначения, константы или метки

Общий вид строки программы: `метка: инструкция аргументы ; комментарий`

## Допустимые форматы констант:

* Двоичный: `0b10101` или `110b`
* Восьмеричный: `0o461`
* Десятичный: `123` или `23d`
* Шестнадцатиричный: `0xF5`

## Команда MOV
Помещает содержимое аргумента `arg` в регистр `reg`. В качестве аргумента может быть другой регистр или константа.

Синтаксис: `MOV reg, arg`

## Стековые инструкции
### Команда PUSH - добавить в стек
Добавляет переданное значение в стек

Синтаксис: `PUSH arg`

### Команда POP - извлечь из стека
Извлекает значение на стеке и помещает его на переданный регистр. Если стек пуст, происходит ошибка.

Синтаксис: `POP reg`

## Математические операции
* Сложение: `ADD reg, arg`
* Вычитание: `SUB reg, arg`
* Умножение: `MUL reg, arg`
* Инкремент: `DEC reg`
* Декремент: `DEC reg`

## Логические операции
* И: `AND reg, arg`
* ИЛИ: `OR reg, arg`
* Исключающее ИЛИ: `XOR reg, arg`
* НЕ: `NOT reg`
* Сдвиг влево: `SHL reg, arg`
* Сдвиг вправо: `SHR reg, arg`

## Команда CMP (cравнение)
Результат сравнения никуда не записывается, но устанавливаются значения флагов (`ZF` и `CF`)

Синтаксис: `CMP reg, arg`

## Переходы
### Безусловный переход (JMP)
Производит передачу управления на инструкцию, помеченную указанной меткой.

Синтаксис: `JMP label`

### Условные переходы
Работают аналогично безусловному переходу, предварительно проверяя указанное ниже условие:
* `JZ` - переход по нулю (`ZF = 0`)
* `JNZ` - переход по не нулю (`ZF ≠ 0`)
* `JC` - переход при переполнении (`CF = 0`)
* `JNC` - переход при отсутствии переполнения (`CF ≠ 0`)
* `JA` - переход по больше (`ZF ≠ 0` и `CF ≠ 0`)
* `JAE` - переход по больше или равно (`CF ≠ 0`)
* `JB` - переход по меньше (`CF = 0`)
* `JBE` - переход по меньше или равно (`CF = 0` или `ZF = 0`)
* `JE` - переход по равенству (`ZF = 0`)
* `JNE` - переход по неравенству (`ZF ≠ 0`)
* `JNA` - переход по не больше (`not >`)
* `JNAE` - переход по не больше или равно (`not >=`)
* `JNB` - переход по не меньше (`not <`)
* `JNBE` - переход по не меньше или равно (`not <=`)

