# Hackthebox exatlon CTF writeup
The .exe file is packed by upx. First unpack the .exe file using the following command
```
upx -d exatlon_v1 -o exatlon_v1_clear
```
Open the unpacked .exe with Ghidra. The main() function is listed in the following:
```C

undefined4 main(void)

{
  basic_ostream *pbVar1;
  undefined4 unaff_R12D;
  basic_string<char,std::char_traits<char>,std::allocator<char>> input_pw [32];
  basic_string local_38 [32];
  bool is_loop;
  
  do {
                    /* print banner */
    std::operator<<((basic_ostream *)std::cout,"\n");
    std::operator<<((basic_ostream *)std::cout,&DAT_0054b018);
    std::operator<<((basic_ostream *)std::cout,&DAT_0054b0d8);
    sleep(1);
    std::operator<<((basic_ostream *)std::cout,&DAT_0054b1a8);
    std::operator<<((basic_ostream *)std::cout,&DAT_0054b260);
    sleep(1);
    std::operator<<((basic_ostream *)std::cout,&DAT_0054b320);
    sleep(1);
    std::operator<<((basic_ostream *)std::cout,&DAT_0054b400);
    sleep(1);
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::basic_string
              (input_pw);
                    /* Input password
                        */
    std::operator<<((basic_ostream *)std::cout,"[+] Enter Exatlon Password  : ");
    std::operator>>((basic_istream *)std::cin,(basic_string *)input_pw);
                    /* encode secret */
    exatlon(local_38);
                    /* Expected value of encoded secret */
    is_loop = std::operator==(local_38,
                              "1152 1344 1056 1968 1728 816 1648 784 1584 816 1728 1520 1840 1664 784 1632 1856 1520 1728 816 1632 1856 1520 784 1760 1840 1824 816 1584 1856 784 1776 1760 528 528 2000 "
                             );
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::~basic_string
              ((basic_string<char,std::char_traits<char>,std::allocator<char>> *)local_38);
    if (is_loop == false) {
                    /* Quit the program if the input is "q" */
      is_loop = std::operator==((basic_string *)input_pw,"q");
      if (is_loop == false) {
        pbVar1 = std::operator<<((basic_ostream *)std::cout,"[-] ;(\n");
        std::basic_ostream<char,std::char_traits<char>>::operator<<
                  ((basic_ostream<char,std::char_traits<char>> *)pbVar1,
                   std::endl<char,std::char_traits<char>>);
        is_loop = true;
      }
      else {
        unaff_R12D = 0;
        is_loop = false;
      }
    }
    else {
      pbVar1 = std::operator<<((basic_ostream *)std::cout,"[+] Looks Good ^_^ \n\n\n");
      std::basic_ostream<char,std::char_traits<char>>::operator<<
                ((basic_ostream<char,std::char_traits<char>> *)pbVar1,
                 std::endl<char,std::char_traits<char>>);
      unaff_R12D = 0;
      is_loop = false;
    }
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::~basic_string
              (input_pw);
  } while (is_loop);
  return unaff_R12D;
}
```
There is a secret string "1152 1344 1056 1968 1728 816 1648 784 1584 816 1728 1520 1840 1664 784 1632 1856 1520 1728 816 1632 1856 1520 784 1760 1840 1824 816 1584 1856 784 1776 1760 528 528 2000 ". The flag can be recovered by decoding the secret string.
exatlon() is the encoding function. It is listed in the following code.
```c

/* exatlon(std::__cxx11::basic_string<char, std::char_traits<char>, std::allocator<char>> const&) */

basic_string * exatlon(basic_string *output)

{
  bool is_loop;
  char *cur_secret_char_addr;
  basic_string<char,std::char_traits<char>,std::allocator<char>> *in_RSI;
  undefined8 max_loop_iteration;
  undefined8 loop_counter;
  allocator<char> local_69;
  basic_string encode_secret_string [32];
  __cxx11 encode_secret_char [39];
  char cur_secret_char;
  basic_string<char,std::char_traits<char>,std::allocator<char>> *local_20;
  
  std::allocator<char>::allocator();
                    /* try { // try from 00404ae8 to 00404aec has its CatchHandler @ 00404bc1 */
  std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::basic_string
            ((char *)output,(allocator *)&DAT_0054b00c);
  std::allocator<char>::~allocator(&local_69);
  local_20 = in_RSI;
  loop_counter = std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::begin
                           (in_RSI);
  max_loop_iteration =
       std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::end(local_20);
  while( true ) {
    is_loop = __gnu_cxx::operator!=
                        ((__normal_iterator *)&loop_counter,(__normal_iterator *)&max_loop_iteration
                        );
    if (is_loop == false) break;
    cur_secret_char_addr =
         (char *)__gnu_cxx::
                 __normal_iterator<char_const*,std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>>
                 ::operator*((__normal_iterator<char_const*,std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>>
                              *)&loop_counter);
    cur_secret_char = *cur_secret_char_addr;
                    /* encode_secret_char = (int)cur_secret_char << 4 */
                    /* try { // try from 00404b63 to 00404b67 has its CatchHandler @ 00404bfd */
    std::__cxx11::to_string(encode_secret_char,(int)cur_secret_char << 4);
                    /* encode_secret_string += encode_secret_char */
    std::operator+(encode_secret_string,(char *)encode_secret_char);
                    /* outpu += encode_secret_string */
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::operator+=
              ((basic_string<char,std::char_traits<char>,std::allocator<char>> *)output,
               encode_secret_string);
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::~basic_string
              ((basic_string<char,std::char_traits<char>,std::allocator<char>> *)
               encode_secret_string);
    std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>::~basic_string
              ((basic_string<char,std::char_traits<char>,std::allocator<char>> *)encode_secret_char)
    ;
    __gnu_cxx::
    __normal_iterator<char_const*,std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>>
    ::operator++((__normal_iterator<char_const*,std::__cxx11::basic_string<char,std::char_traits<char>,std::allocator<char>>>
                  *)&loop_counter);
  }
  return output;
}
```
The encoding function shift left each char by 4 bits and represents the encoded char as integer. So, to decode it, right shift each integer in the encoded text by 4 bits and change it to char. And you can have the flag.
