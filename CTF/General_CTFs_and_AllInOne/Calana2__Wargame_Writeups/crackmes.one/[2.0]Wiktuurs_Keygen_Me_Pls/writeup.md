Es un binario .NET como podemos observar con Detect it Easy:

<img width="759" height="526" alt="IMAGEN1" src="https://github.com/user-attachments/assets/dd17312f-648e-4875-bd97-bed736a8277c" />

Usando un decompilador de .NET como `DnsPy` podemos observar que al hacer click se llama a la funcion `Check` con el contenido de las tres partes de la clave y con el nombre del formulario (que podremos ver a la izquierda del programa que es "Form1":
```C#
// Token: 0x06000002 RID: 2 RVA: 0x00002068 File Offset: 0x00000268
                private void SubBut_Click(object sender, EventArgs e)
                {
                        this.crBox.Checked = this.Check(this.keyBox1.Text, this.keyBox2.Text, this.keyBox3.Text, this.getName());
                }

                // Token: 0x06000003 RID: 3 RVA: 0x000020A4 File Offset: 0x000002A4
                private string getName()
                {
                        return this.nameBox.Text;
                }

                // Token: 0x06000004 RID: 4 RVA: 0x000020C4 File Offset: 0x000002C4
                private char[] nameParser(string Name)
                {
                        return Name.ToCharArray();
                }

                // Token: 0x06000005 RID: 5 RVA: 0x000020DC File Offset: 0x000002DC
                private int namelength(string Name)
                {
                        return Name.Length;
                }

                // Token: 0x06000006 RID: 6 RVA: 0x000020F4 File Offset: 0x000002F4
                private string Key1(string name)
                {
                        return this.nameParser(base.Name)[this.namelength(base.Name) - 1].ToString() + 118.ToString() + this.nameParser(base.Name)[this.namelength(base.Name) - 3].ToString() + 4.ToString();
                }

                // Token: 0x06000007 RID: 7 RVA: 0x00002168 File Offset: 0x00000368
                private string Key2(string name)
                {
                        return 132.ToString() + this.nameParser(base.Name)[3].ToString() + 5.ToString() + this.nameParser(base.Name)[3].ToString();
                }

                // Token: 0x06000008 RID: 8 RVA: 0x000021C4 File Offset: 0x000003C4
                private string Key3(string name)
                {
                        return 122.ToString() + 54.ToString() + this.nameParser(base.Name)[2].ToString();
                }

                // Token: 0x06000009 RID: 9 RVA: 0x00002208 File Offset: 0x00000408
                private bool Check(string s1, string s2, string s3, string name)
                {
                        return s1 == this.Key3(name) & s3 == this.Key2(name) & s2 == this.Key1(name);
                }                                                                                                                                    
```

Notese que la clave corecta es Key3-Key1-Key2 porque la funcion `Check` las verifica asi.

Hice un pequeño script de Python para calcular la clave:
```py
def Key1(name):
    return name[len(name)-1] + "118" + name[len(name)-3] + "4"
def Key2(name):
    return "132" + name[3] + "5" + name[3]
def Key3(name):
    return "122" + "54" + name[2]
name = "Form1"
print(f"{Key3(name)}-{Key1(name)}-{Key2(name)}")
```

`12254r-1118r4-132m5m`

