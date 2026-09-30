<h1 align="center">
  *[Image: Elliot]*
  <br><br>
  *[Image: Logo]*
</h1>

[![PyPI: Python Version](https://img.shields.io/pypi/pyversions/mrrobot?logo=python&logoColor=lightblue&style=for-the-badge)](https://www.python.org/)
[![PyPI: Latest Version](https://img.shields.io/pypi/v/mrrobot?label=latest&style=for-the-badge)](https://pypi.org/project/mrrobot/)
[![License](https://img.shields.io/github/license/cosasdepuma/mrrobot?style=for-the-badge)](./LICENSE)

**MrRobot** is that friend you needed so much by your side during the `CTFs`. Not only does it help you to perform the tests, but it will also look for ways to solve them for you.

🖥️ Installation
---
To install the tool, the easiest way is to use the `pip` command:

```sh
python -m pip install mrrobot
```

In case you need to perform a manual installation, you can use any of the `.egg` or `.whl` files inside the `dist/` folder:

```sh
# Old method
python -m easy_install dist/mrrobot-x.x.x-py3.egg
```
```sh
# New method
python -m pip install mrrobot-x.x.x-py3-none-any.whl
```

But if this does not convince you because you are in **paranoid** mode (`MrRobot` is still a hacking tool), you can install it directly from the source code using the `setup.py` file:

```sh
python setup.py install
```

🔩 Develop
---
You can develop your own modules or contribute to the development and improvements of the project freely.

To do this, the first thing you have to do is clone the project using the `git` tool:

```sh
git clone https://github.com/cosasdepuma/MrRobot
```

It is important that you install certain dependencies before you start programming:

```sh
# Program dependencies
pip install -r requirements.txt
# Development dependencies
pip install -r requirements-dev.txt
```

In my case, since I am a fanatic of cleanliness and order, you can use `Poetry` or `Pipenv` command to build a virtual environment and simplify the process:

```sh
# Using poetry
poetry update
poetry run python -m mrrobot
```
```sh
# Using pipenv
pipenv update
pipenv run python -m mrrobot
```

> ⚠️ I strongly recommend the use of `Poetry` in front of `Pipenv` because apparently `Pipenv` is no longer receiving updates from the maintainers

:octopus: Support the developer!
----
Everything I do and publish can be used for free whenever I receive my corresponding merit.

Anyway, if you want to help me in a more direct way, you can leave me a tip by clicking on this badge:

<p align="center">
    </br>
    <a href="https://www.paypal.me/cosasdepuma/"><img src="https://img.shields.io/badge/Donate-PayPal-blue.svg?style=for-the-badge" alt="PayPal Donation"></a>
</p>