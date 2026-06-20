package com.luissilva.backend.mail.imap;

import com.luissilva.backend.mail.imap.dto.MailMessageDetailDto;
import com.luissilva.backend.mail.imap.dto.MailMessageDto;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMultipart;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@Slf4j
@Service
public class ImapService {

    @Value("${imap.host}")
    private String imapHost;

    @Value("${imap.port}")
    private int imapPort;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    public List<MailMessageDto> fetchInbox(String username, String password) {
        List<MailMessageDto> messages = new ArrayList<>();

        try (Store store = connect(username, password)) {
            Folder inbox = openInbox(store, Folder.READ_ONLY);

            UIDFolder uidFolder = (UIDFolder) inbox;
            Message[] rawMessages = inbox.getMessages();

            for (Message message : rawMessages) {
                long uid = uidFolder.getUID(message);
                messages.add(toDto(uid, message));
            }

            inbox.close(false);
        } catch (Exception e) {
            log.error("Failed to fetch inbox for user {}: {}", username, e.getMessage());
            throw new RuntimeException("Could not retrieve inbox", e);
        }

        return messages;
    }

    public MailMessageDetailDto fetchMessage(String username, String password, long uid) {
        try (Store store = connect(username, password)) {
            Folder inbox = openInbox(store, Folder.READ_WRITE);
            UIDFolder uidFolder = (UIDFolder) inbox;

            Message message = uidFolder.getMessageByUID(uid);
            if (message == null) {
                throw new RuntimeException("Message not found: " + uid);
            }

            MailMessageDetailDto dto = toDetailDto(uid, message);
            inbox.close(true);
            return dto;

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch message {} for user {}: {}", uid, username, e.getMessage());
            throw new RuntimeException("Could not retrieve message", e);
        }
    }

    // -------------------------------------------------------------------------
    // IMAP connection helpers
    // -------------------------------------------------------------------------

    private Store connect(String username, String password) throws MessagingException {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imap");
        props.put("mail.imap.host", imapHost);
        props.put("mail.imap.port", String.valueOf(imapPort));
        props.put("mail.imap.auth", "true");
        // No TLS — private Docker network only
        props.put("mail.imap.starttls.enable", "false");

        Session session = Session.getInstance(props);
        Store store = session.getStore("imap");
        store.connect(imapHost, imapPort, username, password);
        return store;
    }

    private Folder openInbox(Store store, int mode) throws MessagingException {
        Folder inbox = store.getFolder("INBOX");
        inbox.open(mode);
        return inbox;
    }

    // -------------------------------------------------------------------------
    // Mapping helpers
    // -------------------------------------------------------------------------

    private MailMessageDto toDto(long uid, Message message) throws MessagingException {
        return MailMessageDto.builder()
                .uid(uid)
                .from(extractFrom(message))
                .subject(message.getSubject())
                .sentAt(formatDate(message))
                .seen(message.isSet(Flags.Flag.SEEN))
                .build();
    }

    private MailMessageDetailDto toDetailDto(long uid, Message message)
            throws MessagingException, IOException {
        return MailMessageDetailDto.builder()
                .uid(uid)
                .from(extractFrom(message))
                .to(extractTo(message))
                .subject(message.getSubject())
                .body(extractBody(message))
                .sentAt(formatDate(message))
                .seen(message.isSet(Flags.Flag.SEEN))
                .build();
    }

    private String extractFrom(Message message) throws MessagingException {
        Address[] from = message.getFrom();
        if (from == null || from.length == 0)
            return "";
        return ((InternetAddress) from[0]).getAddress();
    }

    private String extractTo(Message message) throws MessagingException {
        Address[] to = message.getRecipients(Message.RecipientType.TO);
        if (to == null || to.length == 0)
            return "";
        return ((InternetAddress) to[0]).getAddress();
    }

    private String extractBody(Message message) throws MessagingException, IOException {
        Object content = message.getContent();

        if (content instanceof String text) {
            return text;
        }

        if (content instanceof MimeMultipart multipart) {
            return extractTextFromMultipart(multipart);
        }

        return "";
    }

    private String extractTextFromMultipart(MimeMultipart multipart)
            throws MessagingException, IOException {
        // Prefer plain text part — iterate parts and return the first text/plain
        for (int i = 0; i < multipart.getCount(); i++) {
            BodyPart part = multipart.getBodyPart(i);
            if (part.isMimeType("text/plain")) {
                return (String) part.getContent();
            }
        }
        // Fall back to HTML if no plain text part exists
        for (int i = 0; i < multipart.getCount(); i++) {
            BodyPart part = multipart.getBodyPart(i);
            if (part.isMimeType("text/html")) {
                return (String) part.getContent();
            }
        }
        return "";
    }

    private String formatDate(Message message) throws MessagingException {
        if (message.getSentDate() == null)
            return "";
        return message.getSentDate()
                .toInstant()
                .atOffset(ZoneOffset.UTC)
                .format(FORMATTER);
    }
}