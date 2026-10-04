# Micro-CMS v1
### Flag 0
* Create a new page
* The url for new page is [http://35.227.24.107/\<instance-hash>/page/14]() while the first 2 pages had page numbers 1 and 2
* Try all page numbers from 3-13. Pages 3, 4, 5 give 404 error while page 6 gives 403 Forbidden error.
* Open page 6 for editing to get the flag.

### Flag 1
* Try SQL injection in add post
* Create a new page. Enter '<>:;" in both input boxes. 
* The flag would be displayed as a pop up.

### Flag 2
* Add onclick event handler to button in Marktown Test.
* On clicking the JS code is executed.
* View page source to get the Flag.

### Flag 3
* Try SQLi in the URL
* Add ' to edit page URL for any post to get the flag.
