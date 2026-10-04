# 07: Findings and Vulnerabilities

| Finding | Status | Impact | Evidence |
| --- | --- | --- | --- |
| Hidden clue in web source | Verified | Led to credential candidate | HTML comment screenshot |
| User information through SMB enumeration | Verified | Enabled credential correlation | README and SMB note |
| Panel login on port \20000\ | Verified | Initial access | Panel screenshot |
| Privilege escalation | Not verified | Unknown | No evidence |

`mermaid
flowchart TB
  A[HTML clue] --> D1[Clean source comments]
  B[SMB enumeration] --> D2[Disable guest access]
  C[Panel login] --> D3[MFA and access restrictions]
  E[Privilege escalation: not verified] --> D4[Log and file-integrity monitoring]
`
