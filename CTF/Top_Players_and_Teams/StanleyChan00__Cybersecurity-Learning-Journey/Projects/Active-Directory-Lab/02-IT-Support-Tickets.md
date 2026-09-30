# Phase 2: Tickets

This phase is where I will be doing the actual simulated Help Desk work. 

I will be using a ServiceNow PDI(Personal Development Instance) as my ticketing system for creating and resolving tickets. 

I've already created an account with ServiceNow and received an instance. So now all that's needed before starting tickets is simply adding my users(Staff-1 & Staff-2) onto the PDI. 

I did so below:

<img width="1189" height="614" alt="Staff-1 User Creation" src="https://github.com/user-attachments/assets/4e3a6772-08f7-4655-8cd3-033b9cc231c1" />

<img width="1189" height="614" alt="Staff-2 User Creation" src="https://github.com/user-attachments/assets/798e543a-eee5-4119-8962-bb553c883a40" />

After this, we are now ready to start working on some tickets!

## Ticket 1: Account locked out: Too many invalid attempts

This ticket will be a classic example of a user getting locked out of their account and needing our help to regain access. 

**Set up:** All we have to do is input an incorrect password 5 times into the `Staff-1` User account. Due to the Lockout GPO we set up in Phase 1, this will cause the user's account to be locked out.

The locked out screen looks like this:

<img width="1962" height="1294" alt="Staff-1 Locked out" src="https://github.com/user-attachments/assets/7bb2b880-4b32-47e7-88eb-025c31d3d462" />

All we have to do is head over to the AD UC on the admin account, confirm the account is locked out, reset the password with a new temporary password(I just used "Password2" for simplicity), and prompt the user to change their password at the next login. The IT-Admin's POV looks like this:

<img width="1684" height="1244" alt="Password Reset" src="https://github.com/user-attachments/assets/d8ed42e1-2b1e-4d4d-8a8a-f8992425f225" />

Finally, the Staff User will go onto his account, use the temporary password, change his password to a new one, and can now work again!

<img width="1684" height="1244" alt="Change Password" src="https://github.com/user-attachments/assets/e4c2ac19-6f85-4fc4-acfc-b8595728c04f" />

### The Final ServiceNow Ticket:

<img width="1226" height="978" alt="Ticket #1" src="https://github.com/user-attachments/assets/cab9db2e-892f-4ce8-85c8-6714f683375e" />

## Ticket 2: Onboard a New Staff Member

This ticket will have a manager calling us to onboard a new staff hire. This new hire will need a new domain account as well as access to the shared drives. 

There is no set up needed here so I can get straight to the ticket. 

First, I created the new domain account using AD UC in the Staff OU, made a temporary password, and required them to change it when they login. 

<img width="1950" height="1488" alt="Staff-3" src="https://github.com/user-attachments/assets/471a1814-f5d8-4845-ad5f-744d9abf0295" />

After this, I added them to the Staff Security Group which will give them proper rights and access to the shared drives

<img width="1950" height="1488" alt="Staff-3 added to Staff Group" src="https://github.com/user-attachments/assets/de897200-e22b-4828-a9b7-a073134f16c3" />

Now, I attempt to login using the Staff-3 account and confirm their account is working. The password change prompted appeared and I changed the password as planned.

<img width="1950" height="1488" alt="Successful login" src="https://github.com/user-attachments/assets/39c79c7f-ac44-47e9-bed1-5ae0181f828f" />

Finally, the last thing needed to do is confirm that the shared drives are there and they have the proper access to them with their respective Staff rights.

<img width="2044" height="1576" alt="Shared Drives" src="https://github.com/user-attachments/assets/7a479170-aedb-4b44-8016-9848327992d3" />

<img width="2044" height="1576" alt="Rights" src="https://github.com/user-attachments/assets/3e3bad0b-bd1d-46ec-b51e-e9016530dfcd" />

I confirmed that and ensured they can't alter the contents in the public folder. After doing so, I can now resolve this ticket as solved! 

### The Final ServiceNow Ticket:

<img width="1877" height="984" alt="Ticket #2" src="https://github.com/user-attachments/assets/33a80928-cf70-4bd9-b93b-bc320f655c09" />

## Ticket 3: Can't Access Shared Drives 

This ticket will have Staff-3 calling to say that he can't access the public and staff shared drives. He can see it but when attempting to open them, he gets a message telling him he does not have permissions to do so.

This example will be one of someone simply accidentally removing Staff-3 from the Staff Security Group, which would be the set up here.

In doing so, we can find the user being unable to access the drives. This is because the permission and NTFS rights are based off the security groups. So when Staff-3 leaves the Staff group, he no longer has the rights inherent to that group and thus is no longer able to access these drives.

<img width="1764" height="1324" alt="Can&#39;t Access" src="https://github.com/user-attachments/assets/d5cc5d16-05b2-46d1-bac6-aed9bc63cd2b" />

The simple fix here is simply adding him back to the group, which now allows him to access the drives again.

<img width="1764" height="1324" alt="Add Staff-3" src="https://github.com/user-attachments/assets/b16cf880-e5bf-46a7-8867-b30f8884cd89" />

### The Final ServiceNow Ticket:

<img width="1822" height="987" alt="Ticket #3" src="https://github.com/user-attachments/assets/efcdac8f-70dc-4c68-88ee-aaaeb0c03866" />

## Ticket 4: Restore a Deleted Account

This ticket will allow me to practice the use of the recycle bin we enabled earlier in phase 1. 

The scenario is that an account of a hire was off-boarded, however that person ultimately did not end up leaving the company and has decided to stay.

Thus, the manager has called asking us to restore his account.

The set up is very simple. We just delete Staff-2's account and confirm by trying to login to it.

After this, we just go to the Active Directory Administrative Center, go to the deleted objects folder, find the account, and restore it. Finally we confirm they are restored by checking their account in AD UC, verifying everything is in place, and have them attempt to log in again. 

<img width="1884" height="1334" alt="Restore" src="https://github.com/user-attachments/assets/27a80ee9-f860-464e-a269-16381c13cedd" />

### The Final ServiceNow Ticket:

<img width="1869" height="996" alt="Ticket 4" src="https://github.com/user-attachments/assets/e05e2c65-eae5-4374-b0e0-6fa1f6cb40d8" />

