# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The **Youkoso** team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

To report a security issue, please use the GitHub Security Advisory ["Report a Vulnerability"](https://github.com/hiroata/youkoso/security/advisories/new) tab.

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g. XSS, SQL injection, etc.)
- **Full paths of source file(s) related to the manifestation of the issue**
- **The location of the affected source code** (tag/branch/commit or direct URL)
- **Any special configuration required to reproduce the issue**
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the issue**, including how an attacker might exploit the issue

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Investigation**: We will investigate and validate the issue within 5 business days.
- **Updates**: We will provide regular updates on our progress.
- **Resolution**: We aim to resolve critical issues within 30 days.

### Security Measures

This project implements several security measures:

- **Content Security Policy (CSP)** headers
- **Input validation** on all user inputs
- **HTTPS enforcement** in production
- **Regular dependency updates** to patch known vulnerabilities
- **Safe handling** of user data and privacy

### Scope

This security policy applies to:

- The main **Youkoso** website and application
- All related infrastructure and deployment processes
- Third-party integrations and dependencies

### Out of Scope

The following are considered out of scope for this security policy:

- Theoretical vulnerabilities without proof of concept
- Issues in third-party services that we don't control
- Social engineering attacks
- Physical attacks
- Issues requiring physical access to servers

## Security Best Practices for Contributors

When contributing to this project, please follow these security guidelines:

### Code Security

- **Validate all inputs** from users and external sources
- **Sanitize outputs** to prevent XSS attacks  
- **Use HTTPS** for all external API calls
- **Don't commit secrets** like API keys or passwords
- **Use environment variables** for sensitive configuration

### Dependency Management

- **Keep dependencies updated** to the latest secure versions
- **Review dependencies** before adding new ones
- **Use dependency scanning** tools to identify vulnerabilities
- **Remove unused dependencies** to reduce attack surface

### Data Protection

- **Minimize data collection** to only what's necessary
- **Handle user data** according to privacy laws (GDPR, CCPA, etc.)
- **Use secure storage** for any sensitive information
- **Implement proper access controls**

## Security Headers

This project implements the following security headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## Disclosure Policy

- **Coordinated disclosure**: We prefer coordinated disclosure with security researchers
- **Public disclosure**: Issues will be publicly disclosed after they are fixed
- **Credit**: We will give credit to security researchers who responsibly report vulnerabilities
- **Bug bounty**: Currently, we don't have a formal bug bounty program, but we appreciate responsible disclosure

## Contact

For security-related questions that are not vulnerabilities, you can contact us at:

- **Email**: [security@youkoso.mx](mailto:security@youkoso.mx)
- **GitHub**: Open an issue with the `security` label

## Legal

By submitting a vulnerability report, you agree that:

- You will not access or modify user data without explicit permission
- You will not perform testing that could harm our systems or users
- You will comply with all applicable laws and regulations
- You will not publicly disclose the vulnerability before we have had a chance to address it

---

Thank you for helping keep **Youkoso** and our users safe! 🔒
