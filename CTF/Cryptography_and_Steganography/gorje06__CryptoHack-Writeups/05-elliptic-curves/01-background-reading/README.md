# Background Reading

## Flag
```
crypto{abelian}
```

## Solution

Challenge teórico. El texto del challenge menciona que la adición de puntos en curvas elípticas define una operación de grupo. La pista clave está en la última propiedad listada:

> "Property (d) shows that point addition is commutative."

Un grupo cuya operación es conmutativa (es decir, `P + Q = Q + P`) se llama **grupo abeliano** (*Abelian group*). Esto también se menciona explícitamente en el texto del challenge.
