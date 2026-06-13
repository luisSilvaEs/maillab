package com.luissilva.backend.auth;

import com.luissilva.backend.auth.dto.AuthResponse;
import com.luissilva.backend.auth.dto.LoginRequest;
import com.luissilva.backend.auth.dto.RegisterRequest;
import com.luissilva.backend.auth.dto.Verify2faRequest;
import com.luissilva.backend.mail.EmailService;
import com.luissilva.backend.security.JwtService;
import com.luissilva.backend.totp.QrCodeService;
import com.luissilva.backend.totp.TotpService;
import com.luissilva.backend.user.User;
import com.luissilva.backend.user.UserRepository;
import com.luissilva.backend.mail.EmailService;
import com.google.zxing.WriterException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.ldap.core.support.LdapContextSource;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.naming.directory.*;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final TotpService totpService;
    private final QrCodeService qrCodeService;
    private final LdapTemplate ldapTemplate;
    private final LdapContextSource ldapContextSource;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.domain}")
    private String appDomain;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            TotpService totpService,
            QrCodeService qrCodeService,
            LdapTemplate ldapTemplate,
            LdapContextSource ldapContextSource,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.totpService = totpService;
        this.qrCodeService = qrCodeService;
        this.ldapTemplate = ldapTemplate;
        this.ldapContextSource = ldapContextSource;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // ── Register ──────────────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest request) throws NoSuchAlgorithmException {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        createLdapEntry(request);
        createPostgresRow(request);

        emailService.sendWelcome(
                request.username() + "@luissilvacoding.com",
                request.username());

        String token = jwtService.generateToken(request.username());
        return AuthResponse.withToken(token);
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        verifyLdapCredentials(request.username(), request.password());

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (user.isTwoFactorEnabled()) {
            return AuthResponse.twoFactorRequired();
        }

        String token = jwtService.generateToken(request.username());
        return AuthResponse.withToken(token);
    }

    // ── Verify 2FA ────────────────────────────────────────────────────────────

    public AuthResponse verifyTwoFactor(Verify2faRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isTwoFactorEnabled() || user.getTotpSecret() == null) {
            throw new IllegalStateException("2FA is not enabled for this user");
        }

        if (!totpService.verifyCode(user.getTotpSecret(), request.code())) {
            throw new BadCredentialsException("Invalid 2FA code");
        }

        String token = jwtService.generateToken(request.username());
        return AuthResponse.withToken(token);
    }

    // ── Setup 2FA ─────────────────────────────────────────────────────────────

    public AuthResponse setupTwoFactor(String username)
            throws NoSuchAlgorithmException, WriterException, IOException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String secret = totpService.generateSecret();
        user.setTotpSecret(secret);
        user.setTwoFactorEnabled(true);
        userRepository.save(user);

        String qrCode = qrCodeService.generateQrCodeBase64(username, secret);
        return AuthResponse.withQrCode(qrCode);
    }

    // ── LDAP helpers ──────────────────────────────────────────────────────────

    private void createLdapEntry(RegisterRequest request) {
        String dn = "uid=" + request.username() + ",ou=users";
        String encodedPassword = request.password();

        BasicAttributes attrs = new BasicAttributes();

        BasicAttribute objectClass = new BasicAttribute("objectClass");
        objectClass.add("inetOrgPerson");
        objectClass.add("organizationalPerson");
        objectClass.add("person");
        objectClass.add("top");
        attrs.put(objectClass);

        attrs.put("uid", request.username());
        attrs.put("cn", request.username());
        attrs.put("sn", request.username());
        attrs.put("mail", request.username() + "@" + appDomain);
        attrs.put("userPassword", encodedPassword);

        ldapTemplate.bind(dn, null, attrs);
    }

    private void verifyLdapCredentials(String username, String password) {
        String userDn = "uid=" + username + ",ou=users,"
                + ldapContextSource.getBaseLdapPathAsString();
        try {
            ldapContextSource.getContext(userDn, password).close();
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid username or password");
        }
    }

    // ── Postgres helper ───────────────────────────────────────────────────────

    private void createPostgresRow(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.username());
        user.setEmail(request.email());
        userRepository.save(user);
    }
}