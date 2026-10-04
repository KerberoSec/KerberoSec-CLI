# Taking LS

Just take the Ls. Check out this zip file and I be the flag will remain hidden. 
https://mega.nz/#!mCgBjZgB!_FtmAm8s_mpsHr7KWv8GYUzhbThNn0I8cHMBi4fJQp8

### Approach

- Unzipped the provided file to find a password protected pdf called 'The Flag.pdf'.

- Running strings and looking at the file's metadata proved unfruitful.

- Looking at the challenge's description gave me an idea, ran 
  > ls -a

  which revealed a hidden directory '.thePassword', which in turn contained a text file 'thePassword.txt'

- The contents of the text file was the password to access the flag pdf.

- Flag obtained : ```ABCTF{T3Rm1n4l_is_C00l}```
