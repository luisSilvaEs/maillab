package com.luissilva.backend.totp;

import com.eatthepath.otp.TimeBasedOneTimePasswordGenerator;
import org.apache.commons.codec.binary.Base32;
import org.springframework.stereotype.Service;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

@Service
public class TotpService {

    private static final int TIME_STEP_SECONDS = 30;
    private static final int ALLOWED_DRIFT_STEPS = 1;

    private final TimeBasedOneTimePasswordGenerator totpGenerator;

    public TotpService() throws NoSuchAlgorithmException {
        this.totpGenerator = new TimeBasedOneTimePasswordGenerator();
    }

    // ── Secret generation ─────────────────────────────────────────────────────

    public String generateSecret() throws NoSuchAlgorithmException {
        KeyGenerator keyGenerator = KeyGenerator.getInstance(totpGenerator.getAlgorithm());
        keyGenerator.init(160);
        SecretKey secretKey = keyGenerator.generateKey();
        return new Base32().encodeToString(secretKey.getEncoded());
    }

    // ── Code verification ─────────────────────────────────────────────────────

    public boolean verifyCode(String base32Secret, int code) {
        try {
            SecretKey secretKey = decodeSecret(base32Secret);
            Instant now = Instant.now();

            for (int drift = -ALLOWED_DRIFT_STEPS; drift <= ALLOWED_DRIFT_STEPS; drift++) {
                Instant window = now.plusSeconds((long) drift * TIME_STEP_SECONDS);
                int expected = totpGenerator.generateOneTimePassword(secretKey, window);
                if (expected == code) {
                    return true;
                }
            }

            return false;
        } catch (InvalidKeyException e) {
            return false;
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private SecretKey decodeSecret(String base32Secret) {
        byte[] keyBytes = new Base32().decode(base32Secret);
        return new SecretKeySpec(keyBytes, totpGenerator.getAlgorithm());
    }
}