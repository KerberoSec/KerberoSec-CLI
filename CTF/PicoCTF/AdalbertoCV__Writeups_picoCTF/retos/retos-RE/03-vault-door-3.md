# vault-door-3

# Descripción
This vault uses for-loops and byte arrays. The source code for this vault is here: [VaultDoor3.java](https://jupiter.challenges.picoctf.org/static/a648ca6dd275b9454c5d0de6d0f6efd3/VaultDoor3.java)
# Pistas
Make a table that contains each value of the loop variables and the corresponding buffer index that it writes to.
# Solución

```bash
Realice unos cambios al codigo para imprimir los resultados de la encriptacion de la bandera en java: 

import java.util.*;

class VaultDoor3 {
    public static void main(String args[]) {
        VaultDoor3 vaultDoor = new VaultDoor3();
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter vault password: ");
	    String input = "jU5t_a_sna_3lpm18gb41_u_4_mfr340";
	if (vaultDoor.checkPassword(input)) {
	    System.out.println("Access granted.");
	} else {
	    System.out.println("Access denied!");
        }
    }

    // Our security monitoring team has noticed some intrusions on some of the
    // less secure doors. Dr. Evil has asked me specifically to build a stronger
    // vault door to protect his Doomsday plans. I just *know* this door will
    // keep all of those nosy agents out of our business. Mwa ha!
    //
    // -Minion #2671
    public boolean checkPassword(String password) {
        if (password.length() != 32) {
            return false;
        }
        char[] buffer = new char[32];
        int i;
        for (i=0; i<8; i++) {
            buffer[i] = password.charAt(i);
			//System.out.println(buffer[i]);
        }
        for (; i<16; i++) {
            buffer[i] = password.charAt(23-i);
			//System.out.println(buffer[i]);
        }
        for (; i<32; i+=2) {
            buffer[i] = password.charAt(46-i);
			//System.out.println(buffer[i]);
        }
        for (i=31; i>=17; i-=2) {
            buffer[i] = password.charAt(i);
			//System.out.println(buffer[i]);
        }
        String s = new String(buffer);
        System.out.println(s);
		return true;
    }
}

resultado:

Enter vault password: jU5t_a_s1mpl3_an4gr4m_4_u_1fb380
Access granted.

flag: picoCTF{jU5t_a_s1mpl3_an4gr4m_4_u_1fb380}
```

# Bandera
picoCTF{jU5t_a_s1mpl3_an4gr4m_4_u_1fb380}