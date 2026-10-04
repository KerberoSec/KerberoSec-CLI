# The Ghost in the Silicon: Solve

The challenge provides a CSV file with two columns: `Time` and `GPIO_LED`. The signal is binary (0 or 1) and encodes data using pulse widths.

## Approach

1. Parse all signal transitions (where the value changes between 0 and 1).
2. Measure the duration of each pulse by calculating the time between consecutive transitions.
3. There are only two pulse durations: short (250us) and long (750us).
4. Pair each high pulse with the low pulse that follows it. A short high then long low is a `0` bit. A long high then short low is a `1` bit.
5. Group every 8 bits into a byte and convert to ASCII.