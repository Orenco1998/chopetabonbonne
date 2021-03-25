Pour obtenir la keystore
keytool.exe -genkey -v -keystore chopetabonbonne.keystore -alias alias_chopetabonbonne -keyalg RSA -keysize 2048 -validity 1000
mdp keytool : Dssxc??Mp745Op@@Z10
Il est recommandé de migrer vers PKCS12, qui est un format standard de l'industrie en utilisant "keytool -importkeystore -srckeystore chopetabonbonne.keystore -destkeystore chopetabonbonne.keystore -deststoretype pkcs12
passphrase keytool : Dssxc??Mp745Op@@Z10

Pour obtenir le jar signé :
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore chopetabonbonne.keystore app-release-unsigned.apk alias_chopetabonbonne
