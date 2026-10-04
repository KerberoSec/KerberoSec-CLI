# follow-me

The challenge gives you the trace of the binary when given a particular input.
Our task is to recover the input.

## The Binary

```sh
$ ./calc_8e4bdd821b86bebbfa6c5191bfddd40dbb120916
usage: ./calc_8e4bdd821b86bebbfa6c5191bfddd40dbb120916 formula
$ ./calc_8e4bdd821b86bebbfa6c5191bfddd40dbb120916 1+1
error: stack is empty
$ ./calc_8e4bdd821b86bebbfa6c5191bfddd40dbb120916 1,1,+
2
```

Ok so this looks like a stack-based calculator.
Let's crack it open in IDA:

```c
__int64 __fastcall calc(char *a1)
{
  __int64 v1; // ST30_8
  __int64 v2; // rax
  signed __int64 v3; // rax
  __int64 v4; // ST30_8
  __int64 v5; // rax
  __int64 v6; // rax
  signed __int64 v7; // ST30_8
  __int64 v8; // rax
  __int64 v9; // rax
  __int64 v10; // ST30_8
  __int64 v11; // rax
  __int64 v12; // rax
  __int64 v13; // ST30_8
  __int64 v14; // rax
  __int64 v15; // rax
  signed __int64 v16; // ST30_8
  signed __int64 v17; // rax
  __int64 v18; // rax
  char *curr_char; // [rsp+8h] [rbp-38h]
  char v21; // [rsp+1Bh] [rbp-25h]
  signed int v22; // [rsp+1Ch] [rbp-24h]
  signed __int64 acc; // [rsp+20h] [rbp-20h]
  _QWORD *stack; // [rsp+38h] [rbp-8h]

  curr_char = a1;
  acc = 0LL;
  stack = malloc(8uLL);
  stack[1] = calloc(8uLL, 0x3E8uLL);
  *(_DWORD *)stack = 1000;
  *((_DWORD *)stack + 1) = 0;
  v22 = 0;
  while ( *curr_char )
  {
    v21 = *curr_char;
    if ( *curr_char == ',' )
    {
      if ( v22 == 1 )
      {
        push(stack, acc);
        acc = 0LL;
      }
      v22 = 0;
    }
    else if ( v21 <= '/' || v21 > '9' )
    {
      switch ( v21 )
      {
        case '+':
          v1 = pop(stack);
          v2 = pop(stack);
          v3 = add(v2, v1);
          push(stack, v3);
          v22 = 2;
          break;
        case '-':
          v4 = pop(stack);
          v5 = pop(stack);
          v6 = sub(v5, v4);
          push(stack, v6);
          v22 = 2;
          break;
        case '*':
          v7 = pop(stack);
          v8 = pop(stack);
          v9 = mul(v8, v7);
          push(stack, v9);
          v22 = 2;
          break;
        case 'm':
          v10 = pop(stack);
          v11 = pop(stack);
          v12 = min(v11, v10);
          push(stack, v12);
          v22 = 2;
          break;
        case 'M':
          v13 = pop(stack);
          v14 = pop(stack);
          v15 = max(v14, v13);
          push(stack, v15);
          v22 = 2;
          break;
        default:
          if ( v21 != 'C' )
          {
            printf("error: unhandled char '%c'\n", (unsigned int)v21);
            exit(1);
          }
          v16 = pop(stack);
          v17 = pop(stack);
          v18 = ccc(v17, v16);
          push(stack, v18);
          v22 = 2;
          break;
      }
    }
    else
    {
      acc = 10 * acc + v21 - '0';
      v22 = 1;
    }
    ++curr_char;
  }
  return pop(stack);
}
```

The binary is quite simple.

## The Formula

At this point, I see some reversing options:

1. Recovering the input manually (boooooring...)
2. Fuzzing with custom tracer
3. Tracing + genetic algorithm

We go with option 2. Specifically, we extract the formula with a simple script
and then recover the correct digits with a genetic algorithms.

## The Scripts

### formula.py

`formula.py` opens the trace file and does two things.
First of all, it outputs a rebased trace so we can more easily use it
afterwards.
Then it also outputs a formula template like `XXX,XXX,+` by manually matching
the branches in the binary with their meaning.

```sh
$ python3 ./formula.py
XXX,XXX,XXX,XXX,XXX,XXXX,XXX,mm-mM-XXX,XXX,XXX,mm-XXX,XXX,XXX,XXX,XXX,-+-M+XXX,XXX,XXX,mm*
```

### tracer.py

`tracer.py` is a [QBDI](https://qbdi.quarkslab.com/) tool that
traces the binary and matches the instruction addresses against the challenge
trace.
Its function is to output a score/fitness value for a given input.
This is going to be used by the solver in the final step.

```sh
$ LD_PRELOAD=/usr/lib/libpyqbdi.so PYQBDI_TOOL=./tracer.py ./calc_8e4bdd821b86bebbfa6c5191bfddd40dbb120916 1,1,+
2
OUT 566
```

`OUT 566` is the output score we calculated.

### solver.py

`solver.py` takes everything we have done so far and puts it
together automagically.
It is a simple genetic algorithm that takes the formula, guesses the digits and
gets the score from running `tracer.py`.
Eventually it should guess a valid formula (that's right, there is more than
one correct formula!).

```sh
$ python3 ./solver.py
1000000 000,000,000,000,000,0000,000,mm-mM-000,000,000,mm-000,000,000,000,000,-+-M+000,002,000,mm*
151 000,000,000,000,000,0000,800,mm-mM-000,000,000,mm-000,300,000,046,000,-+-M+000,002,000,mm*
148 000,000,010,005,000,0030,800,mm-mM-000,005,000,mm-050,300,900,046,003,-+-M+006,002,000,mm*
116 000,800,010,005,000,0030,805,mm-mM-000,005,000,mm-057,800,900,046,003,-+-M+806,002,000,mm*
109 009,800,010,005,200,0030,805,mm-mM-000,005,300,mm-858,800,900,046,003,-+-M+806,002,000,mm*
12 009,500,010,005,200,0630,805,mm-mM-000,005,300,mm-858,800,900,006,003,-+-M+806,007,050,mm*
4 008,500,010,005,209,0600,805,mm-mM-000,005,360,mm-858,800,900,006,003,-+-M+806,007,050,mm*
3 008,500,310,035,209,5600,804,mm-mM-000,005,360,mm-858,800,900,006,003,-+-M+806,001,050,mm*
```

## The Win

```sh
$ curl -q -H 'Content-Type:application/json' -d "{\"input\": \"008,500,310,035,209,5600,804,mm-mM-000,005,360,mm-858,800,900,006,003,-+-M+806,001,050,mm*\"}" http://follow-me.chal.seccon.jp/submit/quals/0
{"error":false,"flag":"SECCON{Is it easy for you to recovery input from execution trace? Keep hacking:)}","message":"Thanks! I'll give you a flag as a thank you."}
```

Cheers :)

