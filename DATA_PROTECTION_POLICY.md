# DreamBid Data Protection & Privacy Policy

## Data Protection Commitment

DreamBid is committed to protecting user data and preventing unauthorized access. This document outlines our security practices.

---

## 1. Data Collection

### We Collect:
- Name, Email, Phone number (for account)
- Property search history
- Shortlisted properties
- Auction participation data
- Device information (for debugging)

### We DON'T Collect:
- Passwords (hashed on server)
- Payment information (handled by secure payment gateway)
- Sensitive personal documents (only required for auction)

---

## 2. Data Storage & Protection

### Server-Side:
- ✅ Encrypted databases
- ✅ Role-based access control
- ✅ Regular backups
- ✅ Intrusion detection systems

### Mobile App:
- ✅ No sensitive data stored locally
- ✅ JWT tokens in secure storage only
- ✅ All tokens cleared on logout
- ✅ HTTPS for all communications

### Data Encryption:
- AES-256 for stored data
- TLS 1.2+ for data in transit
- SHA-256 hashing for passwords

---

## 3. Data Access & Control

### User Rights:
- View data collected about you
- Download your data
- Request data deletion
- Modify personal information
- Opt-out of marketing emails

### Admin Access:
- Limited to authorized personnel
- All access logged and monitored
- Multi-factor authentication required
- Background checks performed

---

## 4. Third-Party Services

We use:
- **Google Maps API**: For location display
- **WhatsApp**: For property sharing
- **Payment Gateway**: For transaction processing

**All third-parties are contractually bound to protect your data.**

---

## 5. Security Measures

### Application Level:
```
✅ Input validation
✅ SQL injection prevention
✅ XSS protection
✅ CSRF tokens
✅ Rate limiting
```

### Network Level:
```
✅ HTTPS/TLS encryption
✅ Certificate pinning
✅ DDoS protection
✅ Web Application Firewall
```

### Data Level:
```
✅ End-to-end encryption for sensitive communication
✅ Encrypted backups
✅ Secure key management
✅ PII masking in logs
```

---

## 6. Incident Response

In case of data breach:
1. Immediate investigation
2. Affected users notified within 24 hours
3. Regulatory authorities notified (as required)
4. Full transparency in communication
5. Remediation steps documented

---

## 7. Compliance

We comply with:
- **GDPR** (EU data protection)
- **CCPA** (California privacy)
- **India Data Protection Act**
- **ISO 27001** (Information security)

---

## 8. User Responsibilities

To help protect your account:
- ✅ Use strong, unique passwords
- ✅ Don't share login credentials
- ✅ Enable two-factor authentication (when available)
- ✅ Keep your device updated
- ✅ Use secure WiFi networks
- ✅ Report suspicious activity immediately

---

## 9. Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| Account Information | Until deletion request |
| Transaction Records | 7 years (legal requirement) |
| Login History | 90 days |
| API Logs | 30 days |
| Backup Data | 1 month |

---

## 10. Contact Us

For privacy or security concerns:

**Email:** dreambidproperties01@gmail.com
**Support:** dreambidproperties01@gmail.com
**Report Bug:** dreambidproperties01@gmail.com (with details)
**Phone:** +91-7428264402

We respond to all security inquiries within 24 hours.

---

## 11. Policy Updates

This policy may be updated periodically. Users will be notified of significant changes via:
- In-app notification
- Email notification
- Website announcement

---

## 12. Certificate Pinning (APK Only)

The DreamBid APK implements certificate pinning to prevent man-in-the-middle attacks:

```java
// Android security
CertificatePinner certificatePinner = new CertificatePinner.Builder()
    .add("api.dreambid.com", "sha256/YOUR_CERT_SHA256")
    .build();
```

This ensures all API communications only work with our legitimate certificates.

---

Last Updated: February 25, 2026
