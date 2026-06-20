package com.luissilva.backend.mail.imap.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MailMessageDto {

    private long uid;
    private String from;
    private String subject;
    private String sentAt;
    private boolean seen;
}