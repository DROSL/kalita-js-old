package de.dfki.mary;

import org.webbitserver.WebServer;
import org.webbitserver.WebServers;
import org.webbitserver.handler.StaticFileHandler;
 
public class Txt2Wav {
 
  public static void main(String[] args) throws Exception {
    WebServer webServer = WebServers.createWebServer(8080);
    webServer.add(new StaticFileHandler("/static-files"));
    webServer.add("/marytts", new WebSocketHandler());
    webServer.start();
  }
}
