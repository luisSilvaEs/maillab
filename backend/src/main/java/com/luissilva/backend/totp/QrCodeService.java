package com.luissilva.backend.totp;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class QrCodeService {

    private static final int QR_WIDTH = 300;
    private static final int QR_HEIGHT = 300;

    @Value("${app.domain}")
    private String appDomain;

    // ── QR code generation ────────────────────────────────────────────────────

    public String generateQrCodeBase64(String username, String secret)
            throws WriterException, IOException {
        String otpauthUri = buildOtpauthUri(username, secret);
        byte[] qrCodeBytes = renderQrCode(otpauthUri);
        return Base64.getEncoder().encodeToString(qrCodeBytes);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String buildOtpauthUri(String username, String secret) {
        String issuer = URLEncoder.encode(appDomain, StandardCharsets.UTF_8);
        String account = URLEncoder.encode(username + "@" + appDomain, StandardCharsets.UTF_8);

        return "otpauth://totp/" + account
                + "?secret=" + secret
                + "&issuer=" + issuer;
    }

    private byte[] renderQrCode(String content) throws WriterException, IOException {
        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_WIDTH, QR_HEIGHT);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}