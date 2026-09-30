# Challenge solution

The goal of this notebook is to provide an example solution to the challenge `Choosing the right words`.

The following method is inspired by the method proposed in the paper [Adversarial_Attacks_Against_Machine_Learning_Based_SpamFilters](https://isi.jhu.edu/wp-content/uploads/2022/04/Adversarial_Attacks_Against_Machine_Learning_Based_SpamFilters__IEEE.pdf). 

However, it does not follow it completely and was modified to actually perform a "good words" attack using only spam emails. 

## Libraries

We start by importing the libraries used, mainly scikit-learn and pandas, plus requests to submit automatically the answer

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np
import requests
```

We then define the target host of the challenge

```python
CHALLENGE_HOST = 'http://localhost:8000'
```

We then define the two functions used to perform a projcted gradient attack and desume then the best words that we can then use to trick the classifier. 

The main idea is the following: 
- The function `pgd_attack` performs the projected gradient attack. The steps are the following:
    - It re-uses the model to compute the TF-IDF representation of the target emails and then scales the feature using the MinMax scaler, to ensure large features values 
      do not influence the prediction more than they should.
    - It extracts some random examples from the spam emails to perform the attack
    - For each of the extracted examples: 
      - Copies the original features
      - Applies the model (the weights have been extracted previously) and computes the gradient
      - Performs a step in the direction of the gradient
    - All successful attacks are then stored
- The function `the_right_words` maps the perturbed TF-IDF representations back to words. It does as follows: 
  - Computes the average perturbation per word, meaning how much they were changed on average during our attacks
  - Combines this with the model coefficient (aka how much the model relies on them) to get a combined score of perturbation * importance
  - Extract back the feature names and sorts them by importance
  - Filters out words that were not changed or that have a super large weigth, to find subtle words
  - Intersect the words with the ones present in the spam emails and returns them

**TLDR; The idea of the attack:**: the main idea is to perform a sort of adversarial attack but not on the email itself but on the distribution of words (TF-IDF representation) to understand which words were understood by the model to be "ham" words

```python
def pgd_attack(
    clf_pipeline,
    X,
    nb_attack=20,
    dmax=1.0,
    step_size=0.1,
    max_iter=100
):
    # Exctract components from the pipeline
    tf_idf_transformer = clf_pipeline.named_steps['tfidfvectorizer']
    scaler = clf_pipeline.named_steps['maxabsscaler']
    clf = clf_pipeline.named_steps['sgdclassifier']

    # Preprocess the data
    X_tfidf = tf_idf_transformer.transform(X)
    X_scaled = scaler.transform(X_tfidf)

    # Get model parameters
    w = clf.coef_[0]
    b = clf.intercept_[0]

    # Randomly select samples to attack
    selected_idxs = np.random.choice(X.shape[0], size=nb_attack, replace=False)

    successes = 0
    results = []

    # Perform PGD attack
    for i in selected_idxs:
        x0 = X_scaled[i].toarray().flatten()
        y0 = 1
        x_adv = x0.copy()

        # PGD iterations
        for it in range(max_iter):
            # Compute gradient
            margin_raw = np.dot(w, x_adv.T) + b
            sigmoid = 1 / (1 + np.exp(-y0 * margin_raw))
            grad = (sigmoid - 1) * (-y0 * w)
            
            # Gradient step
            x_adv = x_adv - step_size * grad

            # Project to L2 ball
            delta = x_adv - x0
            norm = np.linalg.norm(delta, ord=2)

            # If outside the ball, project back
            if norm > dmax:
                delta = delta / norm * dmax
                x_adv = x0 + delta

            # Clip to valid range
            x_adv = np.clip(x_adv, 0.0, 1.0)

        # Check if attack was successful
        pred_scaled = clf.predict([x_adv])[0]

        score_orig = np.dot(w, x0) + b
        score_adv = np.dot(w, x_adv) + b
        print(f"Margin: {score_orig:.4f} → {score_adv:.4f}")
        print(f"Original: 1 -> Adv: {pred_scaled}")

        # If attack was successful, log the results
        if pred_scaled != 1:
            successes += 1
            delta_tfidf = scaler.inverse_transform(x_adv.reshape(1, -1)) - scaler.inverse_transform(x0.reshape(1, -1))
            results.append(delta_tfidf.flatten())

    print(f"Total attacks: {nb_attack}, Successful attacks: {successes}")
    print(f"PGD attack success rate: {successes / nb_attack:.2f}")

    return np.vstack(results), successes
```

```python
def the_right_words(
    clf, 
    x_val,
    result
):
    # Ensure result is a NumPy array
    result_array = np.array(result)
    coef = clf.named_steps['sgdclassifier'].coef_[0]

    # Square the perturbation magnitudes (L2-style)
    avg_perturb = np.mean(result_array ** 2, axis=0) 

    # 3. Compute importance based on direction
    importance = avg_perturb * coef

    tf_idf_transformer = clf.named_steps['tfidfvectorizer']

    # Get the correct feature names from the training vectorizer
    feature_names = tf_idf_transformer.get_feature_names_out()

    # 4. Build DataFrame
    average_importance_df = pd.DataFrame({
        'word': feature_names,
        'coef': coef,
        'perturb': avg_perturb,
        'importance': importance
    })

    # Filter out unimportant features
    average_importance_df = average_importance_df[average_importance_df['coef'] < 0.2]
    average_importance_df = average_importance_df[average_importance_df['perturb'] > 0]
    average_importance_df = average_importance_df[average_importance_df['word'].str.count(' ') == 0]

    # Sort and extract top features
    sorted_features = average_importance_df.sort_values(by='importance', ascending=True)
    important_features = sorted_features['word'].head(100).tolist()

    # Create a DataFrame from validation data
    val_data = pd.DataFrame({'message': x_val, 'label': 1})

    # Fit TF-IDF vectorizers to spam messages
    tfidf_vectorizer_spam = TfidfVectorizer()
    tfidf_vectorizer_spam.fit(val_data['message'])
    spam_feature_names = tfidf_vectorizer_spam.get_feature_names_out()

    # Find intersection of unique spam words and important features (the ones that push towards ham)
    ham_words_in_important_features = list(set(spam_feature_names).intersection(set(important_features)))
    ham_words_str = " ".join(ham_words_in_important_features)

    return ham_words_str

```

We then read the spam emails

```python
df = pd.read_csv('challenge/spam_emails.csv')
x = df.text
```

And the model

```python
# read the model
import skops.io as sio

clf = sio.load('challenge/model.skops')
```

Perform the PGD attack!

```python
result, successes = pgd_attack(
    clf,
    x,
    nb_attack=100,
    dmax=10.0,
    step_size=0.5,
    max_iter=200
)
```

Identifies the words that we can use to alter the classification

```python
identified_right_words = the_right_words(clf, x, result)
```

Prints them!

```python
print("Identified right words:", identified_right_words)
```

Send the top 30 to the endpoint expose by the challenge and prints the result (the flag)!

```python
res = requests.post(f'{CHALLENGE_HOST}/some-ancient-words', json={'sentence': " ".join(identified_right_words.split()[:30])})
print(res.json())
```
