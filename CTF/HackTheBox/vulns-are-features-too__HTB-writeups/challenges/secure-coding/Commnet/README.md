# Commnet

## Exploit

The comment `# flag sample is on messageId 3` suggests this is an IDOR.
Though we aren't told how the attacker got that ID, it can easily be found by fuzzing the ID.
The vulnerability is in the API `/api/messages/{id}`

## Vulnerability

In `routes/messages.js`, the endpoint `router.get('/:id'` fetches a message with no access control.

## Fix

In the endpoint with the comment `// Send new message`, we see that we can get the current user from `req.session.userId`.

```js
const sender_id = req.session.userId
```

In `db/database.js`, we see the `messages` table suggesting:
- each message has exactly 1 sender and 1 recipient
- only those 2 users can see the message

We can add a simple check of those IDs in the handler of the SQL query: `![message.sender_id, message.recipient_id].includes(req.session.userId)`

```js
// snip
  req.db.get(`
    SELECT m.*, 
           sender.username as sender_username, 
           sender.enclave as sender_enclave,
           recipient.username as recipient_username,
           recipient.enclave as recipient_enclave
    FROM messages m
    LEFT JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users recipient ON m.recipient_id = recipient.id
    WHERE m.id = ?
  `, [messageId], (err, message) => {
    if (err || !message || ![message.sender_id, message.recipient_id].includes(req.session.userId)) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }
// snip
```
