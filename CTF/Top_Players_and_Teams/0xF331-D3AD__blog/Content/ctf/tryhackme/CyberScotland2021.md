
# Cyber Scotland 2021

Add these 2 lines to ***/etc/hosts*** file:

```
10.10.200.183   repairshop.sbrc
127.0.0.1       fonts.googleapis.com
```

---

## *Social Engineering Toolkit*

- Terminal is a powerful tool that you can use to give instructions to the AttackBox computer and can be used to run applications. To find out the name of the account you're using type whoami into the terminal and press the ENTER key on your keyboard. Write out the response in the answer field below. 

> root

- Question; What is the first option under the 'Penetration Testing (Fast Track)' menu?

> Microsoft SQL Bruter

Now, if you moved on to cloning the website and got the following error:

![error](https://i.postimg.cc/K8J9b6Yv/error.png)

You have to patch an error in harvester. In the file ***/usr/share/setoolkit/src/webattack/harvester/harvester.py***
you need to add "import html" under "import cgi" and then change "cgi.escape" to
"html.escape". If you are using ***nano***, hit Ctrl-W and searhc for 

> filewrite.write(cgi.escape

---

## *Wordpress Hacking*

- Switch to the "Contact" page. What is the phone number given for the company?

> 08081 570087

If you run into this error with cewl:

```
CeWL 5.4.8 (Inclusion) Robin Wood (robin@digi.ninja) (https://digi.ninja/)
Traceback (most recent call last):
	11: from /usr/bin/cewl:26:in `<main>'
	10: from /usr/lib/ruby/2.7.0/rubygems/core_ext/kernel_require.rb:92:in `require'
	 9: from /usr/lib/ruby/2.7.0/rubygems/core_ext/kernel_require.rb:92:in `require'
	 8: from /usr/lib/ruby/vendor_ruby/nokogiri.rb:36:in `<top (required)>'
	 7: from /usr/lib/ruby/2.7.0/rubygems/core_ext/kernel_require.rb:72:in `require'
	 6: from /usr/lib/ruby/2.7.0/rubygems/core_ext/kernel_require.rb:72:in `require'
	 5: from /var/lib/gems/2.7.0/gems/nokogiri-1.13.6-x86_64-linux/lib/nokogiri/xml.rb:53:in `<top (required)>'
	 4: from /var/lib/gems/2.7.0/gems/nokogiri-1.13.6-x86_64-linux/lib/nokogiri/xml.rb:53:in `require_relative'
	 3: from /var/lib/gems/2.7.0/gems/nokogiri-1.13.6-x86_64-linux/lib/nokogiri/xml/node.rb:6:in `<top (required)>'
	 2: from /var/lib/gems/2.7.0/gems/nokogiri-1.13.6-x86_64-linux/lib/nokogiri/xml/node.rb:7:in `<module:Nokogiri>'
	 1: from /var/lib/gems/2.7.0/gems/nokogiri-1.13.6-x86_64-linux/lib/nokogiri/xml/node.rb:56:in `<module:XML>'
/var/lib/gems/2.7.0/gems/nokogiri-1.13.6-x86_64-linux/lib/nokogiri/xml/node.rb:59:in `<class:Node>': uninitialized constant Nokogiri::ClassResolver (NameError)
```

Then insert the following line into top of the file:

> require 'nokogiri/class_resolver'

- What is Theo's password?

> Inverkeithing

You'll have to obtain the flag yourself, it's pretty easy
