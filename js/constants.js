const START_LABEL = 'start'

const ZERO_FLAG = 'ZF'
const CARRY_FLAG = 'CF'

const INC_CMD = 'INC'
const DEC_CMD = 'DEC'

const ADD_CMD = 'ADD'
const SUB_CMD = 'SUB'
const MUL_CMD = 'MUL'
const CMP_CMD = 'CMP'

const AND_CMD = 'AND'
const OR_CMD = 'OR'
const XOR_CMD = 'XOR'
const NOT_CMD = 'NOT'

const SHL_CMD = 'SHL'
const SHR_CMD = 'SHR'

const MOV_CMD = 'MOV'

const PUSH_CMD = 'PUSH'
const POP_CMD = 'POP'

const JMP_CMD = 'JMP'

const JZ_CMD = 'JZ'
const JNZ_CMD = 'JNZ'

const JC_CMD = 'JC'
const JNC_CMD = 'JNC'

const JA_CMD = 'JA' // > (no carry and no zero)
const JAE_CMD = 'JAE' // >= (no carry)
const JB_CMD = 'JB' // < (carry)
const JBE_CMD = 'JBE' // <= (carry or zero)
const JE_CMD = 'JE' // == (zero)
const JNE_CMD = 'JNE' // != (not zero)

const JNA_CMD = 'JNA' // not >
const JNAE_CMD = 'JNAE' // not >=
const JNB_CMD = 'JNB' // not <
const JNBE_CMD = 'JNBE' // not <=

const REGISTER_NAMES = ['A', 'B', 'C', 'D', 'E', 'F']

const MAIN_COMMANDS = [
    INC_CMD, DEC_CMD,
    ADD_CMD, SUB_CMD, CMP_CMD, MUL_CMD,
    AND_CMD, OR_CMD, XOR_CMD, NOT_CMD, SHL_CMD, SHR_CMD,
    MOV_CMD,
    PUSH_CMD, POP_CMD
]

const JUMP_COMMANDS = [
    JMP_CMD,
    JZ_CMD, JNZ_CMD,
    JC_CMD, JNC_CMD,
    JA_CMD, JAE_CMD, JB_CMD, JBE_CMD, JE_CMD, JNE_CMD,
    JNA_CMD, JNAE_CMD, JNB_CMD, JNBE_CMD
]

const ALL_COMMANDS = MAIN_COMMANDS.concat(JUMP_COMMANDS)