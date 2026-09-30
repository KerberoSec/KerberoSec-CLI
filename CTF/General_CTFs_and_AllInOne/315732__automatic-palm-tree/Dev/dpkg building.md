To create a `.deb` package (the format used by Debian and Ubuntu-based distributions) from a binary file, you can follow these steps. This process involves using `dpkg-deb` to package the binary into a `.deb` file. Here’s a basic guide:

1. **Create the Folder Structure**

   Create a new directory for the package structure, which should look like this:

   ```
   package_name/
   ├── DEBIAN
   └── usr
       └── local
           └── bin
   ```

   The `usr/local/bin` folder is where your binary will go, and `DEBIAN` will contain the package metadata.

2. **Place Your Binary in the Folder**

   Copy your binary file into the `usr/local/bin` directory inside your package folder. You can change this path if you want the binary to go somewhere else, just make sure it follows the Linux directory structure.

3. **Create the Control File**

   Inside the `DEBIAN` folder, create a file named `control`. This file contains metadata about the package. Here’s an example of a basic `control` file:

   ```
   Package: package_name
   Version: 1.0
   Section: base
   Priority: optional
   Architecture: amd64
   Depends: libc6 (>= 2.14)
   Maintainer: Your Name <your.email@example.com>
   Description: A short description of the package
    A longer description of the package.
   ```

   Update each field as needed:
   - `Package`: Name of the package.
   - `Version`: Package version.
   - `Section`: Classification of the package (like `utils`, `net`, `editors`).
   - `Priority`: How essential the package is (usually `optional` for custom binaries).
   - `Architecture`: CPU architecture (e.g., `amd64`, `arm64`).
   - `Depends`: Dependencies (optional).
   - `Maintainer`: Your contact information.
   - `Description`: Short and long descriptions of the package.

4. **Set Permissions**

   Run the following command to ensure that the permissions are set correctly:

   ```bash
   chmod -R 0755 package_name/usr
   chmod 0755 package_name/DEBIAN
   ```

5. **Build the Package**

   Run `dpkg-deb` to build the package:

   ```bash
   dpkg-deb --build package_name
   ```

   This command will create a file named `package_name.deb` in the current directory.

6. **Install and Test the Package**

   You can install your package with:

   ```bash
   sudo dpkg -i package_name.deb
   ```

   Then verify it by running the binary to see if it works as expected.