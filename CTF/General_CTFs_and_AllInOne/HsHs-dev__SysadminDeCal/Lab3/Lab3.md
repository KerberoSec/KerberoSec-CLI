# Lab3: Packages and Packaging

## Exercise 2: Troubleshooting

### Compiling and packaging

1.Will we still be able to run “hellopenguin” from any directory if we packaged it into `/usr/share` instead of `/usr/bin`?

No it will not run automatically.

2.What is your rationale for the previous answer?

linux looks for executables in the `/usr/bin`, `/usr/local/bin` etc, not in `/usr/share` which contains:

- Documentation
- Manpages
- locales

### Debugging

1.What package was missing after trying to install ocfspy?

ocfdocs package.

2.What is the password that ocfspy outputs after fixing the dependency problem?

The password is Sinkhole.

## Exercise 3: Spelunking

1.What package did you choose?

`cowsay`

2.What are the package’s dependencies? What file can you find them in?

Depends: libtext-charwidth-perl, perl:any

in `control.tar.xz`

3.Extract data.tar.gz and view its contents. If there exists a folder(s) other than usr/bin/ and usr/share/, pick one and briefly describe its purpose (both generally and in the context of this package). If not, explain why additional folders are not needed for this package.

extracting data.tar.xz yields `usr` folder, which contains the binaries and the `share` folder.

No other folders are needed for this package because it doesn't need any additonal configurations.

4.What’s one other interesting thing you learned about this package? (Binaries you never knew existed, easter eggs in documentation, a cool pre-install script…)

in `cowsay` package, I found that there are more figures than the cow!