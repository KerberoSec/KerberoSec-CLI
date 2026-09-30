# Are you the Admin?
## The App
The app is a page with a form which says "Create user". After entering a name and clicking on "Ctrate", it lists the created users with name and if they are admins.

The source code for the app is avaliable as a download for the challenge.

## Review
The app is a Node.js TypeScript app written with Next JS. The `auth.ts` file is the most interesting:
```typescript
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const body = req.body;
    await prisma.user.create({
        data: body,
    });
    
    return res.status(200).end();
}
```

It just seems to store the body object into the database which is also seen in the requests made to API endpoint: `{"username":"our-username"}`.

The shema file `shema.prism` shows, that there is a field `isAdmin`:

```prism
model User {
  id       String  @id @default(uuid())
  username String
  isAdmin  Boolean @default(false)
}
```

By sending a custom request body where `isAdmin` is set to `true` we can reveal the flag.