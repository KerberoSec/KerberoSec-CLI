---
tags: [ctf, ai, ml, adversarial, model]
created: 2026-05-02
---

# 🧪 ML Adversarial Attacks

> โจมตี ML models: vision classifiers, NLP, speech: ผ่าน adversarial examples, model inversion, training data poisoning

---

## 🎯 ประเภทการโจมตี

### 1. Adversarial Examples (Evasion)
- ปั่น input ให้ model ตอบผิด
- Pixel-level perturbations (vision)
- Token swaps (NLP)
- Audio perturbations (speech)

### 2. Model Extraction
- Steal model weights/architecture via API queries

### 3. Model Inversion
- Recover training data จาก model output

### 4. Membership Inference
- Determine ว่า data point อยู่ใน training set ไหม

### 5. Backdoor / Trojan Attacks
- Insert trigger pattern → model misclassifies on trigger

### 6. Data Poisoning
- Corrupt training data → model behaves wrong

---

## 🖼 Vision Adversarial

### Concept
Image + small `δ` (perturbation) → model classifies wrong
- `δ` constrained: `|δ| < ε` (imperceptible to human)
- Common: `L∞` norm (max pixel change), `L2` norm

### FGSM (Fast Gradient Sign Method)
Fastest, simple adversarial:
```
x' = x + ε * sign(∇x L(model(x), y))
```

### PGD (Projected Gradient Descent)
Iterative FGSM: stronger:
```
x_{t+1} = clip(x_t + α * sign(∇x L), x ± ε)
```

### Tools

#### Foolbox
```python
import foolbox as fb
import torch

model = ...  # PyTorch model
fmodel = fb.PyTorchModel(model, bounds=(0, 1))

attack = fb.attacks.LinfPGD()
raw, clipped, success = attack(fmodel, images, labels, epsilons=[0.03])
```

#### CleverHans (TF/Keras)
#### Adversarial Robustness Toolbox (ART): IBM

### Example: Targeted attack
```python
# Make image of "cat" classified as "dog"
target_class = 5  # dog
attack = fb.attacks.LinfPGD()
raw, clipped, success = attack(
    fmodel, images, target_class, 
    epsilons=[0.05]
)
```

### Common CTF
- ให้ model ที่ classify CAPTCHA / number / animal
- Find adversarial input that's classified as specific class
- Or: input ที่ดูเหมือน A แต่ classified เป็น B

---

## 📝 NLP Adversarial

### Token-level attacks
- Synonym replacement
- Insert distractor words
- Whitespace manipulation
- Unicode lookalikes (homoglyph)

### Tools
- **TextAttack** (Python)
- **OpenAttack**

```python
import textattack

attack = textattack.attack_recipes.TextFoolerJin2019.build(model_wrapper)
results = attack.attack(text, label)
```

### Example: Sentiment classifier evasion
- Original: "This movie is great" → positive
- Adversarial: "This film is excellent" → ยัง positive
- → "This f1lm is exc3llent" → negative (homoglyph fooled)

### "Glitch tokens"
GPT-3 era: specific tokens (e.g., "SolidGoldMagikarp") cause weird behavior
- Token frequency anomalies in tokenizer
- Probably not directly applicable to current models

---

## 🔓 Model Extraction

### Setup
- Black-box API: send input → get prediction
- Goal: train substitute model that mimics

### Approach
1. Send many queries
2. Record (input, output) pairs
3. Train your model on this dataset
4. → Substitute approximates original

### Cost
- Strong attacks need millions of queries
- API rate limits + cost matter
- Some classifiers extractable in <100k queries

---

## 🕵️ Membership Inference

### Question: Was sample X in training data?

### Why it matters
- Privacy: leak personal data presence
- e.g., medical records: was patient X in dataset?

### Attack
- Train shadow models on similar data
- Learn "signature" of being in training set
  - Confidence score patterns
  - Loss values
  - Prediction stability
- Apply to target

### CTF pattern
- ให้ model + list of candidate samples
- Determine which were in training set

---

## 🧬 Model Inversion

### Goal
Reconstruct training input from model

### Example
- Face recognition model → recover face image of training subject
- Given a label (person X) → optimize input to maximize confidence → reveals what model "thinks" X looks like

### Technique
```python
# Pseudo-code
x = random_image()
for i in range(steps):
    pred = model(x)
    loss = -pred[target_label]    # maximize
    x -= lr * grad(loss, x)
    x = clip(x)
```

→ ภาพที่ได้ดูคล้าย training data ของ class นั้น

---

## 🦠 Backdoor / Trojan

### Setup
- Attacker controls part of training data
- Insert "trigger" pattern (e.g., specific sticker on stop sign)
- Train model normally
- Model behaves correctly on clean inputs
- BUT: any input with trigger → misclassify to attacker's choice

### CTF version
- ให้ model ที่มี backdoor
- Find the trigger
- Use trigger → flag

### Detection
- Outlier analysis
- Activation clustering
- STRIP (perturb input, see if output changes)
- Neural Cleanse

---

## 🧪 Data Poisoning

### Setup
- Attacker injects malicious samples into training data
- Goal: degrade model OR insert backdoor

### Available targets
- Public datasets (Wikipedia, Common Crawl)
- Crowdsourced labels (Mechanical Turk)
- Federated learning (decentralized training)

### Examples
- Add 1000 cat images labeled as dog → cat-dog confusion
- More targeted: specific class manipulation

---

## 🎯 CTF Patterns

### Pattern 1: Find adversarial CAPTCHA
- ให้ model + image → get output
- Find perturbation that changes classification
- Submit perturbed image → flag

### Pattern 2: Trigger discovery
- Backdoored model
- Try common patterns (small square in corner, specific color)
- Brute force triggers

### Pattern 3: Reconstruct training data
- API ให้ confidence per class
- Optimize input → represent class N → flag = class name in image

### Pattern 4: Neural Network Reverse
- ให้ small NN weights
- หา input ที่ทำให้ output = target
- ใช้ gradient descent

### Pattern 5: Steal model
- API queries → train substitute
- Submit substitute weights matching original

---

## 🔍 LLM-specific Attacks (overlap with [Prompt-Injection](Prompt-Injection.md))

### Token smuggling
- Use Unicode tricks ที่ tokenizer handle differently

### Long-context confusion
- Pad with irrelevant text → model loses focus → injection works

### System prompt extraction via:
- Asking for "first N words"
- Asking model to "summarize what you were told"
- Multi-step interrogation

ดู [Prompt-Injection](Prompt-Injection.md) เต็ม

---

## 🛠 Tools Stack

| Tool | ใช้กับ |
|------|--------|
| **Foolbox** | Vision adversarial (PyTorch/TF) |
| **CleverHans** | Vision (TF) |
| **ART** (IBM Adversarial Robustness Toolbox) | Multi-purpose |
| **TextAttack** | NLP |
| **AdvBench** | LLM benchmarks |
| **PrivacyRaven** | Inference attacks |

---

## 🛡 Defenses (overview)

- **Adversarial training**: train on adversarial examples → robust model
- **Input preprocessing**: denoise, randomize
- **Detection**: separate detector for adversarial inputs
- **Certified defenses**: provable bounds (limited applicability)
- **Differential Privacy**: defense against membership inference / inversion
- → ทุก defense ถูก break ในที่สุด → arms race

---

## 🎓 Practice

- **AI Village CTFs** (DEF CON)
- **HackTheBox** machine learning tracks
- **TryHackMe** AI rooms
- **Hugging Face** challenges
- **CleverHans tutorials**
- **MLsec.org**

---

## 🔗 ต่อไป

- [Prompt-Injection](Prompt-Injection.md)
- [RE for ML models](../05-Reverse-Engineering/RE-Intro.md)

## 📚 References

- "Adversarial Machine Learning": Joseph et al
- cleverhans.io
- mlsec.org
- AdvBench / HarmBench (LLM red-teaming)
- arxiv.org (latest papers)

---

#ctf #ai #ml #adversarial
