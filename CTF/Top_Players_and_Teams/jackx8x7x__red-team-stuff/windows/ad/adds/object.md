# AD Objects
## Security Principal
A security principal object has the `objectSid` attribute.

In Active Directory,
- the user
- computer and
- group object classes
are examples of security principal object classes though not every group object is a security principal object.

In AD LDS, an independent mode of Active Directory, any object containing the *msDS-BindableObject auxiliary class* is a security principal.

## Access Control
Access control is administered at the object level by setting different levels of access, or permissions, to objects, such as Full Control, Write, Read, or No Access.

[Microsoft Learn: Access control in Active Directory](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc785913(v=ws.10))  

## Reference
[\[MS-ADTS\]](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-adts/b645c125-a7da-4097-84a1-2fa7cea07714#gt_4bb21ec2-b7ec-435d-9b7c-1eae5ad8f3da)  