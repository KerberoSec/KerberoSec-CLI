# root-me101
score board for Root-Me

## how-to
 * create a "participants.csv" file 
 * put its path in the function *load_profiles* (the path is absolute here because I use it in a shared envronnement).
 * the "participants.csv" file consists of one row for each challenger, each made of 4 columns : profile name, real name, alias displayed, points at the start of the challenge
 * dl the "simple_html_dom.php" code for dealing with html requests in PHP. I placed it in a php directory outside the server root.
 * change the global variable *date* for starting the challenge
