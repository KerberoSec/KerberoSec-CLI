# Lost in Hyperspace: Hack The Box CTF Writeup

<img width="838" height="648" alt="2" src="https://github.com/user-attachments/assets/e1431f16-39a4-44bb-9739-371d74dc53b6" />

An algorithmic and geometric walkthrough of the **"Lost in Hyperspace"** challenge from Hack The Box (HTB). This challenge explores the exploitation of AI embeddings and high-dimensional spaces by hiding a flag inside a 512-dimensional vector layout.

## Installation & Quick Start

Clone this repository and spin up the environment locally or directly in Google Colab:

```bash
# Clone the repository
git clone https://github.com
cd HTB-Lost-in-Hyperspace-Writeup

# Install the required mathematical and visualization dependencies
pip install -r requirements.txt
```

### How to Run
1. Place your target challenge dataset (`challenge_data.npz`) in the root directory.
2. Open and execute `code_solver.ipynb` using Jupyter Notebook or import it into Google Colab via
   ```python
   from google.colab import files
   uploaded = files.upload()
   ```
## 📝 Challenge Description
> *"A cube is the shadow of a tesseract casted on 3 dimensions. I wonder what other secrets may the shadows hold."*

## Initial Analysis

The challenge provides a `.npz` file, which is a standard compressed archive containing NumPy arrays. Upon loading the file, we discover two core arrays:
*   `tokens`: A text array of data type `<U1` (Unicode strings of length 1) containing 110 individual characters (uppercase letters, numbers, and special symbols like `!`, `#`, `-`, `_`). When read sequentially, the text appears as random, non-sensical gibberish.
*   `embeddings`: A binary matrix of shape `(110, 512)`, representing a 512-dimensional continuous latent space. Each row maps directly to a character in the `tokens` array.

---

## The Core Theory (Tesseract Projection)

<img width="799" height="551" alt="1" src="https://github.com/user-attachments/assets/de4dcd88-1081-42a7-a441-e5d536363d1f" />

The clue lies entirely in the phrase *"A cube is the shadow of a tesseract casted on 3 dimensions"*. 

In geometry, a 4-dimensional hypercube (tesseract) projects a 3D shadow that resembles a small cube trapped symmetrically inside a larger cube. Linear dimension reduction techniques like **PCA (Principal Component Analysis)** act as mathematical "shadow casting" tools. By reducing the 512-dimensional embeddings down to 3 components, we uncover a structure where the characters are nested inside geometric boundaries.

### The Interleaving Problem
When flattening this 3D spatial structure onto a 1D linear axis (e.g., sorting only by the X-coordinate), the inner and outer shapes collapse into each other. This results in nested brackets and fragmented strings like:
```text
HTB_{_L_0_HYT{SR{3BDWFT28PIN1AZM_#XRVBPL...
```

---

## The Solution Strategy

To successfully solve this without visual guesswork, we treat the 3D space as a geometric path or a continuous thread. The flag was "written" sequentially in space before being mathematically rotated and obscured. 

The exploit path implements a **Greedy Nearest Neighbor (Greedy Path)** algorithm:
1. Reduce the `(110, 512)` matrix down to `(110, 3)` using PCA.
2. Dynamically search for the correct starting character (`H`) that triggers a valid flag path.
3. Walk point-by-point through the 3D space by calculating the minimum Euclidean distance between the current node and all unvisited nodes.
4. Stop after the first 23 tokens to discard the trailing decorative noise vectors.

P.S run the final code snippet provided to see the geometric representation of the HTB flag, trust me, it's really worth it :)

The plotly library is capable of providing a real 3D representation of the "Hyperspace", you can even drag the figure with the mouse to see the representation from multiple angles

## 🔗 More

- Author: [@pop123-ux](https://github.com/pop123-ux)
- Medium write-ups: [medium.com/@Pop123](https://medium.com/@Pop123)
