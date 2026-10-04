**OSINT Challenge Writeup: Miss My School**

**Objective:** Identify the name of the elementary school depicted in the provided image and format it into the required flag.

**Provided Material:** <img width="1416" height="742" alt="image" src="https://github.com/user-attachments/assets/c98b0889-104e-451b-81b5-eb6a3d8eb47e" />

### **Methodology**

- **Initial Image Analysis:** A visual inspection of the image reveals a school courtyard with a prominent red banner written in Vietnamese. The text mentions elections for the 2021-2026 term, confirming the photo was taken in Vietnam.
    
- **Locating the Crucial Clue:** While the name of the school on the main building is obscured by trees, there is a partially visible blue sign at the very top right of the image, above the red banner.
    
- **Extracting the Data:** Zooming in on the blue sign reveals a critical piece of contact information: the phone number **ĐT: (04) 38 750 348**.
    
- **Executing the Search:** The `(04)` prefix is the old area code for Hanoi. By searching for this specific phone number (or its updated counterpart, 024 38750348), public directories and educational listings directly associate this number with **Trường Tiểu học Long Biên** (Long Bien Elementary School).
    

### **Flag Generation**

Following the challenge's specific formatting rules:

1. Base name: Long Bien
    
2. Remove Vietnamese accents: Long Bien
    
3. Convert to lowercase: long bien
    
4. Replace spaces with underscores: long_bien
    
5. Append suffix: _elementary
    
6. Wrap in flag format: LYKNCTF{...}
    

**Final Flag:** **LYKNCTF{long_bien_elementary}**
