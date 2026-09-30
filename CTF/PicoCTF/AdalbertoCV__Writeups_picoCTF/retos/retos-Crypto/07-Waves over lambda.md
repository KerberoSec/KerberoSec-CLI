
# Waves over lambda

# Descripción
We made a lot of substitutions to encrypt this. Can you decrypt it? Connect with `nc jupiter.challenges.picoctf.org 43522`
# Pistas
Flag is not in the usual flag format
# Solución

```bash
Al realizar la conexion obtenemos lo siguiente:

bdmpcqaf twcw nf educ hoqp - hcwguwmbe_nf_b_dywc_oqvzsq_dphvqumcqh
-------------------------------------------------------------------------------
zwaiwwm uf atwcw iqf, qf n tqyw qocwqse fqns fdvwitwcw, atw zdms dh atw fwq. zwfnswf tdosnmp duc twqcaf adpwatwc atcdupt odmp jwcndsf dh fwjqcqandm, na tqs atw whhwba dh vqxnmp uf adowcqma dh wqbt datwc'f eqcmfqms wywm bdmynbandmf. atw oqiewcatw zwfa dh dos hwoodiftqs, zwbqufw dh tnf vqme ewqcf qms vqme yncauwf, atw dmoe buftndm dm swbx, qms iqf oenmp dm atw dmoe cup. atw qbbdumaqma tqs zcdupta dua qocwqse q zdl dh sdvnmdwf, qms iqf adenmp qcbtnawbaucqooe inat atw zdmwf. vqcodi fqa bcdff-owppws cnpta qha, owqmnmp qpqnmfa atw vnkkwm-vqfa. tw tqs fumxwm btwwxf, q ewoodi bdvjowlndm, q facqnpta zqbx, qm qfbwanb qfjwba, qms, inat tnf qcvf scdjjws, atw jqovf dh tqmsf duaiqcsf, cwfwvzows qm nsdo. atw sncwbadc, fqanfhnws atw qmbtdc tqs pdds tdos, vqsw tnf iqe qha qms fqa sdim qvdmpfa uf. iw wlbtqmpws q hwi idcsf oqknoe. qhawciqcsf atwcw iqf fnowmbw dm zdqcs atw eqbta. hdc fdvw cwqfdm dc datwc iw sns mda zwpnm atqa pqvw dh sdvnmdwf. iw hwoa vwsnaqanyw, qms hna hdc mdatnmp zua joqbns faqcnmp. atw sqe iqf wmsnmp nm q fwcwmnae dh fanoo qms wlgunfnaw zcnoonqmbw. atw iqawc ftdmw jqbnhnbqooe; atw fxe, inatdua q fjwbx, iqf q zwmnpm nvvwmfnae dh umfaqnmws onpta; atw ywce vnfa dm atw wffwl vqcft iqf onxw q pquke qms cqsnqma hqzcnb, tump hcdv atw iddsws cnfwf nmoqms, qms scqjnmp atw odi ftdcwf nm snqjtqmduf hdosf. dmoe atw poddv ad atw iwfa, zcddsnmp dywc atw ujjwc cwqbtwf, zwbqvw vdcw fdvzcw wywce vnmuaw, qf nh qmpwcws ze atw qjjcdqbt dh atw fum'.

la herramienta dcode, nos ayuda a desencriptar esto de forma sencilla. Se detecta que la encriptacion esta en mono-alphabetic substitution. Entocnes podemos obtener el texto desencriptado

CONGRATS HERE IS YOUR FLAG - FREQUENCY_IS_C_OVER_LAMBDA_OGFMAUNRAF ------------------------------------------------------------------------------- BETWEEN US THERE WAS, AS I HAVE ALREADY SAID SOMEWHERE, THE BOND OF THE SEA. BESIDES HOLDING OUR HEARTS TOGETHER THROUGH LONG PERIODS OF SEPARATION, IT HAD THE EFFECT OF MAKING US TOLERANT OF EACH OTHER'S YARNSAND EVEN CONVICTIONS. THE LAWYERTHE BEST OF OLD FELLOWSHAD, BECAUSE OF HIS MANY YEARS AND MANY VIRTUES, THE ONLY CUSHION ON DECK, AND WAS LYING ON THE ONLY RUG. THE ACCOUNTANT HAD BROUGHT OUT ALREADY A BOX OF DOMINOES, AND WAS TOYING ARCHITECTURALLY WITH THE BONES. MARLOW SAT CROSS-LEGGED RIGHT AFT, LEANING AGAINST THE MIJJEN-MAST. HE HAD SUNKEN CHEEKS, A YELLOW COMPLEXION, A STRAIGHT BACK, AN ASCETIC ASPECT, AND, WITH HIS ARMS DROPPED, THE PALMS OF HANDS OUTWARDS, RESEMBLED AN IDOL. THE DIRECTOR, SATISFIED THE ANCHOR HAD GOOD HOLD, MADE HIS WAY AFT AND SAT DOWN AMONGST US. WE EXCHANGED A FEW WORDS LAJILY. AFTERWARDS THERE WAS SILENCE ON BOARD THE YACHT. FOR SOME REASON OR OTHER WE DID NOT BEGIN THAT GAME OF DOMINOES. WE FELT MEDITATIVE, AND FIT FOR NOTHING BUT PLACID STARING. THE DAY WAS ENDING IN A SERENITY OF STILL AND EXQUISITE BRILLIANCE. THE WATER SHONE PACIFICALLY; THE SKY, WITHOUT A SPECK, WAS A BENIGN IMMENSITY OF UNSTAINED LIGHT; THE VERY MIST ON THE ESSEX MARSH WAS LIKE A GAUJY AND RADIANT FABRIC, HUNG FROM THE WOODED RISES INLAND, AND DRAPING THE LOW SHORES IN DIAPHANOUS FOLDS. ONLY THE GLOOM TO THE WEST, BROODING OVER THE UPPER REACHES, BECAME MORE SOMBRE EVERY MINUTE, AS IF ANGERED BY THE APPROACH OF THE SUN'.

La bandera no viene en el formato tipico, pero basta con darle el formato al siguiente texto FREQUENCY_IS_C_OVER_LAMBDA_OGFMAUNRAF (en minusculas)

flag: picoCTF{frequency_is_c_over_lambda_ogfmaunraf}

```

# Bandera
picoCTF{frequency_is_c_over_lambda_ogfmaunraf}