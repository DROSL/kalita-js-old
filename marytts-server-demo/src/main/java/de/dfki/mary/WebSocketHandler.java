package de.dfki.mary;

import org.webbitserver.BaseWebSocketHandler;
import org.webbitserver.WebSocketConnection;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Set;

import javax.sound.sampled.AudioInputStream;

import marytts.LocalMaryInterface;
import marytts.exceptions.MaryConfigurationException;
import marytts.exceptions.SynthesisException;
import marytts.util.data.audio.MaryAudioUtils;

import org.apache.commons.cli.*;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
 
public class WebSocketHandler extends BaseWebSocketHandler {
 
  private int connections = 0;
 
  @Override
  public void onOpen(WebSocketConnection connection) {
    this.connections++;
    connection.send("Connected.");
  }
 
  @Override
  public void onClose(WebSocketConnection connection) {
    this.connections--;
  }
 
  @Override
  public void onMessage(WebSocketConnection connection, String message) {
    try {
      tts(message, connection);
    } catch (MaryConfigurationException e) {
      System.err.println(e.getMessage());
    }
  }

  public static void tts(String inputText, WebSocketConnection connection) throws MaryConfigurationException {

    // get output option
    String outputFileName = "output.wav";

    // get input
    LocalMaryInterface mary = null;
    try {
      mary = new LocalMaryInterface();
    } catch (MaryConfigurationException e) {
      System.err.println("Could not initialize MaryTTS interface: " + e.getMessage());
      throw e;
    }

                // Set voice / language
                mary.setVoice("cmu-slt-hsmm");

    // synthesize
    AudioInputStream audio = null;
    try {
      audio = mary.generateAudio(inputText);
    } catch (SynthesisException e) {
      System.err.println("Synthesis failed: " + e.getMessage());
      System.exit(1);
    }

    // write to output
    double[] samples = MaryAudioUtils.getSamplesAsDoubleArray(audio);
    try {
      MaryAudioUtils.writeWavFile(samples, outputFileName, audio.getFormat());
      File f = new File("./output.wav");
      byte[] byteArray = FileUtils.readFileToByteArray(f);
      connection.send(byteArray);
      System.out.println("Output written to " + outputFileName);
    } catch (IOException e) {
      System.err.println("Could not write to file: " + outputFileName + "\n" + e.getMessage());
      System.exit(1);
    }
  }
}