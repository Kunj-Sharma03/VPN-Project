package communication.threads;

import communication.handshake.Handshake;
import communication.session.SessionDecrypter;
import communication.session.SessionEncrypter;

import javax.crypto.CipherInputStream;
import javax.crypto.CipherOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * ForwardThread handles the TCP forwarding between a socket input stream (source)
 * and a socket output stream (destination). It reads the input stream and forwards
 * everything to the output stream. If some of the streams fail, the forwarding
 * is stopped and the parent thread is notified to close all its connections.
 */
public class ForwardThread extends Thread {
    private static final int READ_BUFFER_SIZE = 8192;

    private final InputStream mInputStream;
    private final OutputStream mOutputStream;
    private final ForwardServerClientThread mParent;

    private final SessionEncrypter sessionEncrypter;
    private final SessionDecrypter sessionDecrypter;

    public ForwardThread(ForwardServerClientThread aParent, InputStream aInputStream, OutputStream aOutputStream) {
        this.mInputStream = aInputStream;
        this.mOutputStream = aOutputStream;
        this.mParent = aParent;
        this.sessionEncrypter = new SessionEncrypter(Handshake.sessionKey, Handshake.iv);
        this.sessionDecrypter = new SessionDecrypter(Handshake.sessionKey, Handshake.iv);
    }

    public void run() {
        byte[] buffer = new byte[READ_BUFFER_SIZE];

        try {
            InputStream in;
            OutputStream out;

            // Server-side: encrypt messages before sending to target
            if (mParent.getListenSocket() != null) {
                in = mInputStream;
                out = sessionEncrypter.openCipherOutputStream(mOutputStream); // Wrap once
            }
            // Client-side: decrypt messages from server before forwarding to GUI/Netcat
            else {
                in = sessionDecrypter.openCipherInputStream(mInputStream); // Wrap once
                out = mOutputStream;
            }

            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
                out.flush();  // Ensure the data is sent immediately
            }

        } catch (Exception e) {
            e.printStackTrace();  // Print any error
        }

        // Notify parent that the connection is broken (for cleanup)
        mParent.connectionBroken();
    }
}
