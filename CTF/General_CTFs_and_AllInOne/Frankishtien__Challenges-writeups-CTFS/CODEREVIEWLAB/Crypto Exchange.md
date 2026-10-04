# Crypto Exchange

#### Understanding the Vulnerability

This application exposes full credit card numbers in the transaction history API response, violating PCI-DSS compliance and creating a critical information disclosure vulnerability. The

```php
TransactionHistoryService.java
```

file retrieves complete payment card details from the database and returns them without any masking or redaction.

When users request their transaction history, the API returns the full 16-digit card number stored in the database. This sensitive data should never be displayed in API responses or user interfaces. If an attacker gains access to a user's session token or exploits another vulnerability (like XSS), they can retrieve complete credit card numbers for all the victim's transactions.

The vulnerability exists because the service layer directly maps database entities to API responses without implementing any data masking logic. While the

```
PaymentCard
```

entity itself has a

```php
getLastFourDigits()
```

helper method, the service uses

```php
getCardNumber()
```

instead, exposing the full Primary Account Number (PAN).

This type of vulnerability is commonly found in real-world applications where developers focus on functionality without considering data sensitivity. According to PCI-DSS requirement 3.3, card numbers must be masked when displayed, showing only the first six and last four digits at most.

