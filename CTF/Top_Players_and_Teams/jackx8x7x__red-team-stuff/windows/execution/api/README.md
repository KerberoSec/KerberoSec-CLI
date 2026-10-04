# Windows API
## Win32 API
### History
Prior to 64-bit Windows, the 32-bit Windows API was called the Win32 API to distinguish it from the original 16-bit Windows API in 16-bit versions of Windows.

Originally consisted of C-style functions only.

### Encoding

## Component Object Model (COM)
The lack of naming consistency and logical groupings of the C-style API resulted in these newer APIs.

### Object Linking and Embedding (OLE)
COM initially was called OLE 2 and created to enable Microsoft Office applications to communicate and exchange data between documents.

### Interface
- Well-defined contracts with a set of logically related methods grouped under the *virtual table dispatch mechanism*.
- It is possible to call these methods from many languages
 
### COM client
Client communicate with object through interfaces.

### COM server
- Dynamic Link Library (DLL) or an executable (EXE) where the COM classes are implemented.
- Thus component implementation can be loaded dynamically rather than being statically linked to the client.

## Windows Runtime
Abbreviated *WinRT*.

### Windows Apps
Formerly known as _Metro Apps_, _Modern Apps_, _Immersive Apps_, and _Windows Store Apps_)

[Windows Internals, Part2: Management mechanisms]()  

### Model
WinRT is *built on top of COM*, adding various extensions to the base COM infrastructure.

### Application
Applications written in C++, C# (or other .NET languages), and JavaScript can consume WinRT APIs

## .Net Framework
### Implementation
It’s implemented as a COM in-process server (DLL) and uses various facilities provided by the Windows API.

### Common Language Runtime
The *run-time engine* for .NET and includes a *Just In Time (JIT) compiler* that translates Common Intermediate Language (CIL) instructions to
- the underlying hardware CPU machine language
- a garbage collector
- type verification
- code access security.

###  .NET Framework Class Library (FCL)
A large collection of types that implement functionality typically needed by client and server applications

## Reference
[Windows Internals, Part 1](https://learning.oreilly.com/library/view/windows-internals-part/9780133986471/ch01.html#ch01lev2sec)  
[Windows App Development: Programming reference for the Win32 API](https://learn.microsoft.com/en-us/windows/win32/api/)  