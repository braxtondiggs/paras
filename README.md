# Paras ![Paras](cryptonym.png)

Are you tired of paying parking tickets due to alternating New York City street parking schedules? If that’s the case, we are here to help you with this amazing Parking NYC app. Get updates on New York City alternate side parking rules and changes. Stay informed by the changing street cleaning schedules and parking schedules/suspensions going around the NYC.

# Generating a release build of an app

To generate a release build for Android, run the following cli command:

`ionic cordova build android --prod --release`

# Signing an APK

To sign the unsigned APK, run the jarsigner tool which is also included in the Android SDK:

`jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./release.keystore ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk cymbit`

Finally, the zip align tool must be ran to optimize the APK:

`./zipalign -v 4 ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ASP.apk`
