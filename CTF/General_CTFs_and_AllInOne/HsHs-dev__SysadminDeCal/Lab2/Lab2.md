# Questions

## 1. How would you delete the previous 10 lines?

You can jump 10 lines above by `10j` then do `10dd`, or enter Normal mode and then type: `-10d, -1d`, make sure to put the cursor at the point you want to delete from.

## 2. How would you jump back to the shell without exiting vim?

To temporarily jump back to the shell without exiting Vim, you can use the following command within Vim:
`:!bash`

This opens a shell session. When you're done and want to return to Vim, type exit or press `Ctrl+D`.

Alternatively, you can suspend Vim and return to the shell using:
`Ctrl+Z`

This will stop (suspend) Vim and drop you back to the shell. To resume Vim from the shell, type:
`fg`

## 3. How would you edit a new file alongside another file?

You can split the current session by
`:split filename` or `:vsplit filename` for vertical split
and jump between them using `CTRL+w` then one of the moving keys `hjkl` depending on the position of the window.

## 4. How would you indent a block of text?

Enter visual mode by v (characterwise) or V (linewise) then
`>` indent right

`<` indent left

## 5. Tell us about one other cool vim feature you found out about that isn’t mentioned in this lab!

You can make your own key-bindings!
