# Security policy

Report vulnerabilities privately through [GitHub private vulnerability reporting](https://github.com/arshad-shah/prism/security/advisories/new). Do not put secrets, private documents, or exploitable details in a public issue. Include a minimal synthetic reproduction, browser/version, affected revision, and expected versus actual behavior.

Security fixes target the latest source revision and the latest published release, when available. This is a community project with no guaranteed response SLA.

## Security model

Document content is untrusted. Preact renders text as text; links accept only explicit HTTP(S) URLs. XML DTDs are rejected and the SAX parser does not load external resources. Parsing and regular-expression search run in terminable workers with time limits. Source, node, and depth limits bound supported inputs. These controls reduce risk; they are not a claim that all resource-exhaustion attacks are impossible.

The extension requests `storage` for supported preferences. Its HTTP(S) content script enables automatic raw-document detection. It does not request cookies, browsing history, debugger access, native messaging, or remote code execution. Only preferences persist. Browser APIs stay in platform adapters.

The source repository excludes local session data, credentials, private notes, dependency directories, build profiles, and candidate archives. Dependency updates and repository security alerts should be reviewed before release. No production credentials belong in issues or repository files.
