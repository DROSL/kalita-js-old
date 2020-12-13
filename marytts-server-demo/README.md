# MaryTTS - Server Demo
### Prequesites

  - Have the same JRE and JDK version installed *(jdk1.8.0_271 and jre1.8.0_271 used for testing)*
  - Have the environment variable **JAVA_HOME** set *(e.g. C:\Program Files\Java\jdk1.8.0_271)*

### How to use
1. Start the server
    ```sh
    cd C:/.../marytts-server-demo
    gradlew shadowJar
    java -jar build/libs/txt2wav-1.0-SNAPSHOT.jar
    ```
2. Open the **connect.html**
3. Type your text you want to be read out loud in the textbox
4. Click the **TTS** button