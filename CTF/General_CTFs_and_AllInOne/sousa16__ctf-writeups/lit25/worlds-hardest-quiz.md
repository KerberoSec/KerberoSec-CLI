Write-up:

1. We need to answer the first 4 questions corretcly, and in the 5th one the flag will
be displayed, according to the website source. Also, we notice this challenge uses a WebSocket,
so we can capture the messages.

2. When we click Start, we see there's a GET request to /ws, which allows us to see 
traffic sent over the WebSocket: answers are included when questions are retrieved,
which allows us to get the following answers: <br>

```json
{
	"question": "What is 1 + 1?",
	"answer": [
		"2",
		"two"
	]
},
{
	"question": "What is the molecular geometry of methane?",
	"answer": [
		"tetrahedral",
		"tetrahedron"
	]
}, 
{
	"question": "Turbo the snail is in the top row of a grid with 2024 rows and 2023 columns and\nwants to get to the bottom row. However, there are 2022 hidden monsters, one in\nevery row except the first and last, with no two monsters in the same column.\nTurbo makes a series of attempts to go from the first row to the last row. On\neach attempt, he chooses to start on any cell in the first row, then repeatedly moves\nto an orthogonal neighbor. (He is allowed to return to a previously visited cell.) If\nTurbo reaches a cell with a monster, his attempt ends and he is transported back to\nthe first row to start a new attempt. The monsters do not move between attempts,\nand Turbo remembers whether or not each cell he has visited contains a monster. If\nhe reaches any cell in the last row, his attempt ends and Turbo wins.\nFind the smallest integer n such that Turbo has a strategy which guarantees being\nable to reach the bottom row in at most n attempts, regardless of how the monsters\nare placed.",
	"answer": [
		"3",
		"three"
	]
},
{
	"question": "What is the answer to this question?",
	"answer": [
		"When I double my rate of failure I double my rate of success. - James Swanwick"
	]
}
```

3. Answering all questions correctly gets us the flag: `LITCTF{why_d1d_i_m4ke_thls}`